import React, { useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const mockStudents = [
  { id: 1, name: 'Budi Santoso', course: 'Pengantar AI', progress: 85, grade: 'A' },
  { id: 2, name: 'Ani Wijaya', course: 'Pemrograman Python', progress: 70, grade: 'B' },
  { id: 3, name: 'Citra Lestari', course: 'Basis Data', progress: 90, grade: 'A' },
  { id: 4, name: 'Dewi Sartika', course: 'Sistem Operasi', progress: 65, grade: 'B-' },
];

const StudentProgress = () => {
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.course.toLowerCase().includes(search.toLowerCase())
  );

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <Header title="Progress Mahasiswa" />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="dosen" />
        <Box
          sx={{
            flexGrow: 1,
            p: 4,
            transition: 'margin 0.3s ease-in-out',
            width: sidebarOpen ? 'calc(100% - 260px)' : 'calc(100% - 70px)',
            mt: 8,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              sx={{
                color: '#050D31',
                mb: 3,
                fontWeight: 700,
                fontFamily: '"Orbitron", sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              Progress Mahasiswa
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <TextField
                variant="outlined"
                placeholder="Cari nama atau mata kuliah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: '300px' },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#050D31',
                    '& fieldset': { borderColor: '#866600' },
                    '&:hover fieldset': { borderColor: '#FFD700' },
                    '&.Mui-focused fieldset': { borderColor: '#866600' },
                  },
                  '& .MuiInputLabel-root': { color: '#050D31' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#866600' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#866600' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: '0 4px 12px rgba(5, 13, 49, 0.2)',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #E0E7FF 100%)',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: 'linear-gradient(90deg, #050D31 0%, #0A1A5C 100%)',
                    }}
                  >
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 700, py: 3 }}>Nama</TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 700, py: 3 }}>Mata Kuliah</TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 700, py: 3 }}>Progress</TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 700, py: 3 }}>Nilai</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(134, 102, 0, 0.1)',
                          boxShadow: '0 2px 8px rgba(134, 102, 0, 0.3)',
                          transition: 'all 0.2s ease-in-out',
                        },
                      }}
                    >
                      <TableCell sx={{ color: '#866600', py: 2.5 }}>{student.name}</TableCell>
                      <TableCell sx={{ color: '#866600', py: 2.5 }}>{student.course}</TableCell>
                      <TableCell sx={{ color: '#866600', py: 2.5 }}>{student.progress}%</TableCell>
                      <TableCell sx={{ color: '#866600', py: 2.5 }}>{student.grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default StudentProgress;