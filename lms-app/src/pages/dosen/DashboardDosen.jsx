import React, { useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button, Divider } from '@mui/material';
import { School, Assignment, People, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(134, 102, 0, 0.3)' }}
    transition={{ duration: 0.2 }}
  >
    <Card
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(5, 13, 49, 0.1)',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color, fontSize: '2rem' }}>{icon}</Box>
        <Box>
          <Typography variant="body2" sx={{ color: '#050D31', opacity: 0.8 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ color: '#866600', fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const CourseCard = ({ courseName, students, progress }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(134, 102, 0, 0.3)' }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(5, 13, 49, 0.1)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: '#050D31', mb: 1.5 }}>
            {courseName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#866600', mb: 1 }}>
            Mahasiswa: {students}
          </Typography>
          <Typography variant="body2" sx={{ color: '#866600', mb: 2 }}>
            Kemajuan: {progress}%
          </Typography>
          <Button
            variant="outlined"
            sx={{
              width: '100%',
              color: '#866600',
              borderColor: '#866600',
              '&:hover': { bgcolor: 'rgba(134, 102, 0, 0.1)', borderColor: '#FFD700' },
            }}
            onClick={() => navigate(`/dosen/courses/${courseName.toLowerCase().replace(' ', '-')}`)}
          >
            Lihat Detail
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DashboardDosen = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const stats = [
    { title: 'Total Mata Kuliah', value: '8', icon: <School />, color: '#866600' },
    { title: 'Tugas Aktif', value: '12', icon: <Assignment />, color: '#866600' },
    { title: 'Mahasiswa', value: '120', icon: <People />, color: '#866600' },
    { title: 'Rata-rata Nilai', value: '85', icon: <TrendingUp />, color: '#866600' },
  ];

  const courses = [
    { courseName: 'Pemrograman Web', students: 40, progress: 75 },
    { courseName: 'Basis Data', students: 35, progress: 60 },
    { courseName: 'Sistem Operasi', students: 45, progress: 80 },
  ];

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <Header title="Dashboard Dosen" />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar open={open} handleDrawerToggle={handleDrawerToggle} role="dosen" />
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 4 },
            transition: 'margin 0.3s ease-in-out',
            width: open ? 'calc(100% - 260px)' : 'calc(100% - 70px)',
            mt: 8, // Adjust for header height
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              sx={{ color: '#050D31', fontWeight: 700, mb: 2, fontFamily: '"Orbitron", sans-serif' }}
            >
              Selamat Datang, Dosen
            </Typography>
            <Typography variant="body1" sx={{ color: '#050D31', mb: 4, maxWidth: '600px' }}>
              Kelola mata kuliah, pantau kemajuan mahasiswa, dan tingkatkan pengalaman belajar dengan platform MALIGO.
            </Typography>
          </motion.div>

          <Grid container spacing={3} sx={{ mb: 5 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>

          <Typography
            variant="h4"
            sx={{ color: '#050D31', fontWeight: 600, mb: 2, fontFamily: '"Orbitron", sans-serif' }}
          >
            Mata Kuliah Saya
          </Typography>
          <Divider sx={{ mb: 3, borderColor: '#050D31' }} />
          <Grid container spacing={3}>
            {courses.map((course, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <CourseCard {...course} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 5 }}>
            <Typography
              variant="h4"
              sx={{ color: '#050D31', fontWeight: 600, mb: 2, fontFamily: '"Orbitron", sans-serif' }}
            >
              Akses Cepat
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#050D31' }} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#efbf04',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#0A1A5C' },
                  flex: 1,
                  minWidth: '150px',
                }}
                onClick={() => navigate('/dosen/courses')}
              >
                Kelola Mata Kuliah
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#866600',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#FFD700' },
                  flex: 1,
                  minWidth: '150px',
                }}
                onClick={() => navigate('/dosen/progress')}
              >
                Lihat Kemajuan
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#050D31',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#0A1A5C' },
                  flex: 1,
                  minWidth: '150px',
                }}
                onClick={() => navigate('/dosen/profile')}
              >
                Profil Saya
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardDosen;