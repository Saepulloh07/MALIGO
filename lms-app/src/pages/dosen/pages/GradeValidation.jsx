import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  InputAdornment,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../../../context/AuthContext';
import { fetchCourses, fetchQuizzes, fetchQuizAnswers, updateQuizAnswerGrade } from '../utils/gradeService';
import GradeModalStudent from '../components/GradeModalStudent';
import { debounce } from 'lodash';

const GradeValidation = () => {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [filters, setFilters] = useState({
    matakuliahIds: [],
    pertemuanId: '',
    searchNama: '',
  });
  const [editGrades, setEditGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounced search handler
  const debouncedSearch = debounce((value) => {
    setFilters((prev) => ({ ...prev, searchNama: value }));
    setPage(0);
  }, 300);

  // Fetch data when token is available
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      if (!token || !user || user.peran?.toLowerCase() !== 'dosen') {
        setError('Please log in as a dosen to access this page.');
        return;
      }
      setLoading(true);
      try {
        const [coursesDataResponse, quizzesDataResponse, answersDataResponse] = await Promise.all([
          fetchCourses(token),
          fetchQuizzes(token),
          fetchQuizAnswers(token),
        ]);

        const coursesData = Array.isArray(coursesDataResponse?.data) ? coursesDataResponse.data : [];
        const quizzesData = Array.isArray(quizzesDataResponse?.data) ? quizzesDataResponse.data : [];
        const answersData = Array.isArray(answersDataResponse?.data) ? answersDataResponse.data : [];

        console.log('Raw Data:', { coursesData, quizzesData, answersData });

        // Filter courses by dosen, handling both data structures
        const filteredCourses = coursesData.filter((course) => {
          const dosens = course.attributes?.dosens?.data || course.dosens || [];
          if (!Array.isArray(dosens)) {
            console.warn('Invalid dosens data:', course);
            return false;
          }
          return dosens.some((dosen) => {
            const nip = dosen.attributes?.nip || dosen.nip;
            return nip === user.username;
          });
        });

        setCourses(filteredCourses);
        setQuizzes(quizzesData);
        setQuizAnswers(answersData);
        setError(null);
      } catch (err) {
        setError(
          err.message.includes('Invalid key')
            ? 'Failed to load data due to incorrect database relations. Please contact the administrator.'
            : `Failed to load data: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [authLoading, token, user]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      // Reset pertemuanId when matakuliahIds changes
      if (key === 'matakuliahIds') {
        newFilters.pertemuanId = '';
      }
      return newFilters;
    });
    setPage(0);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      matakuliahIds: [],
      pertemuanId: '',
      searchNama: '',
    });
    setPage(0);
  };

  // Get unique meetings based on selected matakuliahIds
  const meetings = useMemo(() => {
    const meetingMap = new Map();
    quizzes
      .filter((quiz) => {
        if (!quiz?.pertemuan) return false;
        // If no matakuliahIds selected, include all quizzes
        if (filters.matakuliahIds.length === 0) return true;
        // Check if quiz belongs to a selected course
        const course = courses.find((c) => {
          const pertemuans = c.attributes?.pertemuans?.data || c.pertemuans || [];
          return pertemuans.some((p) => p.id === quiz.pertemuan.id);
        });
        return course && filters.matakuliahIds.includes(String(course.id));
      })
      .forEach((quiz) => {
        const meeting = {
          id: quiz.pertemuan.id,
          pertemuanKe: quiz.pertemuan.pertemuanKe,
          topik: quiz.pertemuan.topik,
          tanggal: quiz.pertemuan.tanggal,
        };
        meetingMap.set(meeting.id, meeting);
      });
    return Array.from(meetingMap.values()).sort((a, b) => a.pertemuanKe - b.pertemuanKe);
  }, [quizzes, courses, filters.matakuliahIds]);

  // Modularized filtering logic
  const filterAnswers = (answers, filters, courses, quizzes) => {
    return answers.filter((answer) => {
      if (!answer?.soal_kui || !answer?.mahasiswa) {
        console.warn('Invalid answer data:', answer);
        return false;
      }

      const soalKuis = answer.soal_kui;
      const quiz = soalKuis?.kuis ? quizzes.find((q) => q.id === soalKuis.kuis.id) : null;
      const pertemuan = quiz?.pertemuan;
      const course = pertemuan
        ? courses.find((c) => {
            const pertemuans = c.attributes?.pertemuans?.data || c.pertemuans || [];
            return pertemuans.some((p) => p.id === pertemuan.id);
          })
        : null;
      const mahasiswa = answer.mahasiswa;

      // Multi-select matakuliah filter
      const matchesMatakuliah =
        filters.matakuliahIds.length === 0 ||
        (course && filters.matakuliahIds.includes(String(course.id)));

      // Single-select pertemuan filter
      const matchesPertemuan =
        filters.pertemuanId === '' || (pertemuan && String(pertemuan.id) === filters.pertemuanId);

      // Search filter (case-insensitive)
      const matchesSearchNama =
        filters.searchNama === '' ||
        (mahasiswa?.namaLengkap?.toLowerCase().includes(filters.searchNama.toLowerCase()) ||
          mahasiswa?.nim?.toLowerCase().includes(filters.searchNama.toLowerCase()));

      return matchesMatakuliah && matchesPertemuan && matchesSearchNama;
    });
  };

  // Filtered answers
  const filteredAnswers = useMemo(
    () => filterAnswers(quizAnswers, filters, courses, quizzes),
    [quizAnswers, filters, courses, quizzes]
  );

  // Group answers by student
  const uniqueStudents = useMemo(() => {
    return Array.from(
      new Map(
        filteredAnswers
          .filter((answer) => answer.mahasiswa?.nim)
          .map((answer) => [
            answer.mahasiswa.nim,
            {
              nim: answer.mahasiswa.nim || 'N/A',
              namaLengkap: answer.mahasiswa.namaLengkap || 'N/A',
              answers: filteredAnswers.filter((a) => a.mahasiswa?.nim === answer.mahasiswa.nim),
            },
          ])
      ).values()
    );
  }, [filteredAnswers]);

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedStudents = uniqueStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleGradeChange = (answerId, value) => {
    const numValue = parseFloat(value);
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      setEditGrades((prev) => ({
        ...prev,
        [answerId]: value,
      }));
    }
  };

  const handleSaveGrade = async (documentId, answerId) => {
    const grade = editGrades[answerId];
    if (grade === undefined || grade === '' || isNaN(grade) || grade < 0 || grade > 100) {
      setError('Please enter a valid grade (0-100).');
      return;
    }
    setLoading(true);
    try {
      await updateQuizAnswerGrade(documentId, parseFloat(grade), token);
      setQuizAnswers((prev) =>
        prev.map((answer) =>
          answer.id === answerId ? { ...answer, nilai: parseFloat(grade) } : answer
        )
      );
      setEditGrades((prev) => {
        const newGrades = { ...prev };
        delete newGrades[answerId];
        return newGrades;
      });
      setError(null);
    } catch (err) {
      setError(`Failed to update grade: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student) => {
    console.log('Opening modal for student:', student);
    if (!student || !student.nim) {
      console.error('Invalid student data for modal:', student);
      setError('Cannot open modal: Invalid student data.');
      return;
    }
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="dosen" />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? { xs: 0, md: '0px' } : { xs: 0, md: '0px' },
          transition: 'margin-left 0.3s ease-in-out',
          width: '100%',
        }}
      >
        {/* Header */}
        <Header title="Validucha" />

        {/* Content */}
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            mt: '64px',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Validasi Nilai
          </Typography>

          {/* Auth Loading State */}
          {authLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error Alert */}
          {!authLoading && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          {!authLoading && !error && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <InputLabel id="course-select-label">Mata Kuliah</InputLabel>
                  <Select
                    labelId="course-select-label"
                    multiple
                    value={filters.matakuliahIds}
                    label="Mata Kuliah"
                    onChange={(e) => handleFilterChange('matakuliahIds', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={courses.find((c) => c.id === Number(value))?.attributes?.nama || value}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={String(course.id)}>
                        {course.attributes?.nama || course.nama || 'N/A'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <InputLabel id="pertemuan-select-label">Pertemuan</InputLabel>
                  <Select
                    labelId="pertemuan-select-label"
                    value={filters.pertemuanId}
                    label="Pertemuan"
                    onChange={(e) => handleFilterChange('pertemuanId', e.target.value)}
                  >
                    <MenuItem value="">Semua Pertemuan</MenuItem>
                    {meetings.map((meeting) => (
                      <MenuItem key={meeting.id} value={String(meeting.id)}>
                        Pertemuan {meeting.pertemuanKe} - {meeting.topik}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Cari Mahasiswa atau NIM"
                  defaultValue={filters.searchNama}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 250 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{ height: 'fit-content', alignSelf: 'center' }}
                >
                  Reset Filters
                </Button>
              </Box>

              {/* Data Loading State */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {/* Students Table */}
              {!loading && (
                <Paper sx={{ p: 3, mt: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(5, 13, 49, 0.2)' }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Nama Mahasiswa</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>NIM</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Aksi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedStudents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan="3" align="center">
                              Tidak ada data untuk ditampilkan. Coba sesuaikan filter.
                            </TableCell>
                          </TableRow>
                        )}
                        {paginatedStudents.map((student) => (
                          <TableRow
                            key={student.nim}
                            sx={{
                              '&:hover': { bgcolor: 'rgba(134, 102, 0, 0.05)' },
                              transition: 'background-color 0.2s',
                            }}
                          >
                            <TableCell sx={{ color: 'text.primary' }}>{student.namaLengkap}</TableCell>
                            <TableCell sx={{ color: 'text.primary' }}>{student.nim}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleOpenModal(student)}
                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1 }}
                              >
                                Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={uniqueStudents.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Baris per halaman:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
                  />
                </Paper>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Detail Modal */}
      {selectedStudent && (
        <GradeModalStudent
          open={modalOpen}
          onClose={handleCloseModal}
          student={selectedStudent}
          quizzes={quizzes}
          meetings={meetings}
          editGrades={editGrades}
          onGradeChange={handleGradeChange}
          onSaveGrade={handleSaveGrade}
          loading={loading}
        />
      )}
    </Box>
  );
};

export default GradeValidation;