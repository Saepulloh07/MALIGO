import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  keyframes,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Assignment } from '@mui/icons-material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import theme from '../styles/theme';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

const Assignments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const assignments = [
    {
      id: 'A001',
      course: 'Algoritma dan Pemrograman',
      title: 'Tugas 1: Implementasi Bubble Sort',
      dueDate: '2025-05-01',
      status: 'Belum Dikumpul',
    },
    {
      id: 'A002',
      course: 'Struktur Data',
      title: 'Tugas 2: Linked List Implementation',
      dueDate: '2025-04-28',
      status: 'Terkumpul',
    },
    {
      id: 'A003',
      course: 'Sistem Basis Data',
      title: 'Tugas 3: Normalisasi Database',
      dueDate: '2025-04-25',
      status: 'Terkumpul',
    },
    {
      id: 'A004',
      course: 'Pemrograman Web',
      title: 'Tugas 4: Membuat Landing Page',
      dueDate: '2025-05-10',
      status: 'Belum Dikumpul',
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e2b' }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="mahasiswa" />

        {/* Main Content */}
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
          {/* Header */}
          <Header title="Tugas & Penilaian" />

          {/* Assignments Content */}
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 2,
                bgcolor: '#050D31',
                color: '#FFFFFF',
                animation: `${neonGlow} 2s infinite`,
                border: '1px solid #efbf04',
              }}
            >
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, fontFamily: '"Orbitron", sans-serif' }}
              >
                Daftar Tugas
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                Pantau tugas Anda dan kirimkan sebelum tenggat waktu.
              </Typography>
            </Box>

            {/* Assignments Table */}
            <TableContainer
              sx={{
                borderRadius: 2,
                bgcolor: '#050D31',
                border: '1px solid #efbf04',
                animation: `${neonGlow} 2s infinite`,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#efbf04', fontWeight: 600 }}>Mata Kuliah</TableCell>
                    <TableCell sx={{ color: '#efbf04', fontWeight: 600 }}>Judul Tugas</TableCell>
                    <TableCell sx={{ color: '#efbf04', fontWeight: 600 }}>Tenggat</TableCell>
                    <TableCell sx={{ color: '#efbf04', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: '#efbf04', fontWeight: 600 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow
                      key={assignment.id}
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(239, 191, 4, 0.1)',
                          transition: 'background-color 0.3s',
                        },
                      }}
                    >
                      <TableCell sx={{ color: '#FFFFFF' }}>{assignment.course}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{assignment.title}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{assignment.dueDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.status}
                          sx={{
                            bgcolor:
                              assignment.status === 'Belum Dikumpul' ? '#efbf04' : '#666',
                            color:
                              assignment.status === 'Belum Dikumpul' ? '#050D31' : '#FFFFFF',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          sx={{
                            color: '#efbf04',
                            borderColor: '#efbf04',
                            borderRadius: 20,
                            '&:hover': {
                              bgcolor: '#efbf04',
                              color: '#050D31',
                            },
                          }}
                          onClick={() =>
                            window.location.href = `/mahasiswa/assignments/${assignment.id}`
                          }
                        >
                          {assignment.status === 'Belum Dikumpul' ? 'Kumpul' : 'Lihat'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Assignments;