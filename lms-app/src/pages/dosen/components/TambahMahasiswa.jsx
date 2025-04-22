import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';
import {
  fetchStudents,
  searchStudents,
  fetchInvitedStudents,
  inviteStudents,
} from '../utils/ApiStudent';

const theme = {
  primary: '#005a6f',
  secondary: '#f8fafc',
  accent: '#4db6ac',
  text: '#1a202c',
  border: '#e2e8f0',
  error: '#d32f2f',
  muted: '#64748b',
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600, md: 800 },
  maxHeight: '80vh',
  bgcolor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  p: 4,
  borderRadius: '12px',
  border: `1px solid ${theme.border}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  overflowY: 'auto',
};

const TambahMahasiswaModal = ({ open, handleClose, matakuliah, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [invitedStudents, setInvitedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const diundangOleh = user?.username || null;

  useEffect(() => {
    if (open && matakuliah) {
      const fetchData = async () => {
        setFetching(true);
        setError(null);
        try {
          if (!matakuliah.program_studi?.id) {
            throw new Error('Program studi tidak valid');
          }
          
          // Fetch data secara paralel
          const [studentResponse, invitedResponse] = await Promise.all([
            fetchStudents(matakuliah.program_studi.id, matakuliah.semester),
            fetchInvitedStudents(matakuliah.id)
          ]);

          // Format data mahasiswa sesuai response API baru
          const formattedStudents = studentResponse.data?.map(student => ({
            id: student.id,
            nim: student.attributes?.nim,
            namaLengkap: student.attributes?.namaLengkap,
            semester: student.attributes?.semester,
            program_studi: student.attributes?.program_studi?.data
          })) || [];

          setStudents(formattedStudents);
          setInvitedStudents(invitedResponse.data || []);
        } catch (error) {
          console.error('Error in fetchData:', error);
          setError(error.message || 'Gagal memuat data mahasiswa');
          enqueueSnackbar(error.message || 'Gagal memuat data mahasiswa', { variant: 'error' });
        } finally {
          setFetching(false);
        }
      };
      fetchData();
    } else {
      // Reset state ketika modal ditutup
      setStudents([]);
      setInvitedStudents([]);
      setSelectedStudents([]);
      setSelectAll(false);
      setSearchQuery('');
      setError(null);
    }
  }, [open, matakuliah, enqueueSnackbar]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      try {
        const response = await fetchStudents(matakuliah.program_studi.id, matakuliah.semester);
        const formattedStudents = response.data?.map(student => ({
          id: student.id,
          nim: student.attributes?.nim,
          namaLengkap: student.attributes?.namaLengkap,
          semester: student.attributes?.semester,
          program_studi: student.attributes?.program_studi?.data
        })) || [];
        setStudents(formattedStudents);
      } catch (error) {
        enqueueSnackbar(error.message || 'Gagal memuat data mahasiswa', { variant: 'error' });
      }
      return;
    }

    try {
      const response = await searchStudents(matakuliah.program_studi.id, matakuliah.semester, searchQuery);
      const formattedStudents = response.data?.map(student => ({
        id: student.id,
        nim: student.attributes?.nim,
        namaLengkap: student.attributes?.namaLengkap,
        semester: student.attributes?.semester,
        program_studi: student.attributes?.program_studi?.data
      })) || [];
      setStudents(formattedStudents);
    } catch (error) {
      enqueueSnackbar(error.message || 'Gagal mencari mahasiswa', { variant: 'error' });
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      const availableStudentIds = students
        .filter(
          (student) =>
            !invitedStudents.some(
              (invited) => invited.attributes?.mahasiswa?.data?.id === student.id
            )
        )
        .map((student) => student.id);
      setSelectedStudents(availableStudentIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      enqueueSnackbar('Pilih setidaknya satu mahasiswa', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await inviteStudents(matakuliah.id, selectedStudents, diundangOleh);
      enqueueSnackbar('Mahasiswa berhasil diundang', { variant: 'success' });
      
      // Refresh data setelah berhasil mengundang
      const [studentResponse, invitedResponse] = await Promise.all([
        fetchStudents(matakuliah.program_studi.id, matakuliah.semester),
        fetchInvitedStudents(matakuliah.id)
      ]);

      const formattedStudents = studentResponse.data?.map(student => ({
        id: student.id,
        nim: student.attributes?.nim,
        namaLengkap: student.attributes?.namaLengkap,
        semester: student.attributes?.semester,
        program_studi: student.attributes?.program_studi?.data
      })) || [];

      setStudents(formattedStudents);
      setInvitedStudents(invitedResponse.data || []);
      setSelectedStudents([]);
      setSelectAll(false);
      setSearchQuery('');
      refreshMatakuliah();
    } catch (error) {
      enqueueSnackbar(error.message || 'Gagal mengundang mahasiswa', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filter mahasiswa yang belum diundang
  const availableStudents = students.filter(
    (student) =>
      !invitedStudents.some(
        (invited) => invited.attributes?.mahasiswa?.data?.id === student.id
      )
  );

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="tambah-mahasiswa-modal">
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ color: theme.text, fontWeight: 600, mb: 2 }}>
          Undang Mahasiswa ke {matakuliah?.nama}
        </Typography>

        {error && (
          <Typography sx={{ color: theme.error, mb: 2, fontStyle: 'italic' }}>
            {error}
          </Typography>
        )}

        {/* Search Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            label="Cari Nama atau NIM"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} disabled={fetching || error}>
                    <SearchIcon sx={{ color: theme.accent }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: theme.accent },
                '&.Mui-focused fieldset': { borderColor: theme.accent },
              },
              '& .MuiInputLabel-root': { color: theme.muted },
              '& .MuiInputLabel-root.Mui-focused': { color: theme.accent },
              input: { color: theme.text },
            }}
            disabled={fetching || error}
          />
        </Box>

        {/* Available Students Table */}
        <Typography variant="subtitle1" sx={{ color: theme.text, fontWeight: 500, mb: 1 }}>
          Pilih Mahasiswa
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 300, mb: 3 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    disabled={fetching || error || availableStudents.length === 0}
                    sx={{ color: theme.accent, '&.Mui-checked': { color: theme.accent } }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text }}>NIM</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text }}>Nama Lengkap</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text }}>Semester</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fetching ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} sx={{ color: theme.accent }} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography sx={{ color: theme.error, fontStyle: 'italic' }}>
                      Gagal memuat data mahasiswa
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : availableStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography sx={{ color: theme.muted, fontStyle: 'italic' }}>
                      Tidak ada mahasiswa yang tersedia
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                availableStudents.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        disabled={fetching || error}
                        sx={{ color: theme.accent, '&.Mui-checked': { color: theme.accent } }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: theme.text }}>{student.nim || 'N/A'}</TableCell>
                    <TableCell sx={{ color: theme.text }}>{student.namaLengkap || 'N/A'}</TableCell>
                    <TableCell sx={{ color: theme.text }}>{student.semester || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Invited Students Table */}
        <Typography variant="subtitle1" sx={{ color: theme.text, fontWeight: 500, mb: 1 }}>
          Mahasiswa yang Telah Diundang
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 200, mb: 3 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.text }}>NIM</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text }}>Nama Lengkap</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text }}>Tanggal Undangan</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fetching ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} sx={{ color: theme.accent }} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography sx={{ color: theme.error, fontStyle: 'italic' }}>
                      Gagal memuat data mahasiswa yang diundang
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : invitedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography sx={{ color: theme.muted, fontStyle: 'italic' }}>
                      Belum ada mahasiswa yang diundang
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invitedStudents.map((invited) => {
                  const mahasiswa = invited.attributes?.mahasiswa?.data?.attributes;
                  return (
                    <TableRow key={invited.id}>
                      <TableCell sx={{ color: theme.text }}>
                        {mahasiswa?.nim || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: theme.text }}>
                        {mahasiswa?.namaLengkap || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: theme.text }}>
                        {invited.attributes?.tanggalUndangan
                          ? new Date(invited.attributes.tanggalUndangan).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'Tidak ditentukan'}
                      </TableCell>
                      <TableCell sx={{ color: theme.text }}>
                        {invited.attributes?.status_class || 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={loading || fetching}
            sx={{
              color: theme.text,
              borderColor: theme.border,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1,
              '&:hover': {
                bgcolor: theme.secondary,
                borderColor: theme.accent,
              },
              '&:disabled': {
                bgcolor: theme.secondary,
                color: theme.muted,
              },
            }}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || fetching || error || selectedStudents.length === 0}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              bgcolor: theme.primary,
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1,
              '&:hover': {
                bgcolor: '#004a5a',
                boxShadow: '0 4px 12px rgba(0, 90, 111, 0.3)',
              },
              '&:disabled': {
                bgcolor: theme.muted,
                color: '#ffffff',
              },
            }}
          >
            Undang
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default TambahMahasiswaModal;