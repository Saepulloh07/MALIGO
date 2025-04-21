import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Grid } from '@mui/material';
import { useSnackbar } from 'notistack';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AddMatakuliahModal from '../components/AddMatakuliahModal';
import CourseAccordion from '../components/CourseAccordion';
import LoadingScreen from '../../../routes/LoadingScreen';
import { getMatakuliahList, getMaterisList } from '../utils/CourseService';

const CourseManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [openMatakuliahModal, setOpenMatakuliahModal] = useState(false);
  const [matakuliahList, setMatakuliahList] = useState([]);
  const [selectedMatakuliah, setSelectedMatakuliah] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matakuliahResponse, materisResponse] = await Promise.all([
        getMatakuliahList(),
        getMaterisList(),
      ]);

      const materis = materisResponse.data || [];
      const matakuliahs = matakuliahResponse.data || [];

      const updatedMatakuliahs = matakuliahs.map((matakuliah) => ({
        ...matakuliah,
        pertemuans: matakuliah.pertemuans.map((pertemuan) => ({
          ...pertemuan,
          materis: materis.filter((materi) => materi.pertemuan?.id === pertemuan.id) || [],
        })),
      }));

      setMatakuliahList(updatedMatakuliahs);
      setLoading(false);
    } catch (error) {
      enqueueSnackbar('Gagal mengambil data mata kuliah', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header title="Manajemen Mata Kuliah" />
      <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="dosen" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          ml: sidebarOpen ? '50px' : '-100px',
          transition: 'margin-left 0.3s ease-in-out',
          bgcolor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Container maxWidth="xl">
          {loading ? (
            <LoadingScreen />
          ) : (
            <>
              <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#1a237e',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                    }}
                  >
                    Manajemen Mata Kuliah
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#616161',
                      mt: 1,
                    }}
                  >
                    Kelola mata kuliah, pertemuan, dan materi dengan mudah dan efisien.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenMatakuliahModal(true)}
                    sx={{
                      bgcolor: '#0288d1',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 3,
                      py: 1,
                      '&:hover': {
                        bgcolor: '#0277bd',
                        boxShadow: '0 4px 12px rgba(2, 136, 209, 0.3)',
                      },
                    }}
                  >
                    Tambah Mata Kuliah
                  </Button>
                </Grid>
              </Grid>
              <CourseAccordion
                matakuliahList={matakuliahList}
                setSelectedMatakuliah={setSelectedMatakuliah}
                refreshMatakuliah={fetchData}
              />
              <AddMatakuliahModal
                open={openMatakuliahModal}
                onClose={() => setOpenMatakuliahModal(false)}
                refreshMatakuliah={fetchData}
              />
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default CourseManagement;