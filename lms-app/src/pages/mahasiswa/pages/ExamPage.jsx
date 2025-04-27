import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  keyframes,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { School } from '@mui/icons-material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import theme from '../styles/theme';
import { fetchUjians } from '../service/ujianService';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

const ExamPage = ({ role }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const response = await fetchUjians();
        setExams(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleExamClick = (examId) => {
    navigate(`/mahasiswa/exams/${examId}`);
  };

  const groupExamsByCourse = () => {
    const grouped = {};
    exams.forEach((exam) => {
      const course = exam.matakuliah;
      const courseKey = course.kode;
      if (!grouped[courseKey]) {
        grouped[courseKey] = {
          course: course,
          exams: [],
        };
      }
      grouped[courseKey].exams.push(exam);
    });
    return Object.values(grouped);
  };

  const isExamActive = (exam) => {
    const now = new Date();
    const start = new Date(exam.waktuMulai);
    const end = new Date(exam.waktuSelesai);
    return now >= start && now <= end && exam.soal_ujians.length > 0;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e2b' }}>
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role={role} />
        <Box
          sx={{
            flexGrow: 1,
            p: 4,
            mt: 8,
            ml: { xs: 0, sm: sidebarOpen ? '260px' : '70px' },
            transition: 'margin-left 0.3s ease-in-out',
            width: { xs: '100%', sm: `calc(100% - ${sidebarOpen ? '260px' : '70px'})` },
          }}
        >
          <Header title="Daftar Ujian" />
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress sx={{ color: '#efbf04' }} />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          {!loading && !error && (
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h3"
                sx={{ mb: 4, color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif', fontWeight: 700 }}
              >
                Ujian Mata Kuliah
              </Typography>
              <Grid container spacing={3}>
                {groupExamsByCourse().map((courseGroup) => (
                  <Grid item xs={12} sm={6} md={4} key={courseGroup.course.kode}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#050D31',
                        color: '#FFFFFF',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          animation: `${neonGlow} 1.5s infinite`,
                        },
                        border: '1px solid #efbf04',
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <School sx={{ fontSize: 30, color: '#efbf04', mr: 2 }} />
                          <Typography
                            variant="h6"
                            sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 500 }}
                          >
                            {courseGroup.course.nama}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                          Kode: {courseGroup.course.kode} | Semester: {courseGroup.course.semester}
                        </Typography>
                        {courseGroup.exams.length > 0 ? (
                          courseGroup.exams.map((exam) => (
                            <Box key={exam.id} sx={{ mb: 2 }}>
                              <Typography
                                variant="body1"
                                sx={{ color: '#FFFFFF', fontWeight: 500 }}
                              >
                                {exam.judul}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: isExamActive(exam) ? '#efbf04' : 'rgba(255, 255, 255, 0.7)' }}
                              >
                                Status: {isExamActive(exam) ? 'Aktif' : 'Tidak Aktif'}
                              </Typography>
                              {isExamActive(exam) && (
                                <Button
                                  variant="outlined"
                                  sx={{
                                    mt: 1,
                                    color: '#efbf04',
                                    borderColor: '#efbf04',
                                    borderRadius: 20,
                                    '&:hover': {
                                      bgcolor: '#efbf04',
                                      color: '#050D31',
                                    },
                                  }}
                                  onClick={() => handleExamClick(exam.id)}
                                >
                                  Kerjakan Ujian
                                </Button>
                              )}
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            Tidak ada ujian tersedia
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="outlined"
                sx={{
                  mt: 4,
                  color: '#efbf04',
                  borderColor: '#efbf04',
                  borderRadius: 20,
                  '&:hover': {
                    bgcolor: '#efbf04',
                    color: '#050D31',
                  },
                }}
                onClick={() => navigate('/mahasiswa/courses')}
              >
                Kembali ke Daftar Mata Kuliah
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ExamPage;