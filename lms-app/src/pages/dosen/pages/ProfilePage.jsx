import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ProfileAvatar from './profileComponents/ProfileAvatar';
import ProfileForm from './profileComponents/ProfileForm';
import axios from 'axios';
import LoadingScreen from '../../../routes/LoadingScreen';

const ProfilePage = () => {
  const { user, token } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get user from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user')) || user;
        if (!storedUser) {
          enqueueSnackbar('Data pengguna tidak ditemukan.', { variant: 'error' });
          setLoading(false);
          return;
        }

        const role = storedUser.peran.toLowerCase();
        const username = storedUser.username;
        let endpoint = '';
        let filters = '';

        if (role === 'dosen') {
          endpoint = 'http://localhost:1337/api/dosens';
          filters = `filters[nip][$eq]=${username}`;
        } else if (role === 'mahasiswa') {
          endpoint = 'http://localhost:1337/api/mahasiswas';
          filters = `filters[nim][$eq]=${username}`;
        } else {
          enqueueSnackbar('Role pengguna tidak valid.', { variant: 'error' });
          setLoading(false);
          return;
        }

        // Fetch role-specific data
        const response = await axios.get(`${endpoint}?${filters}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data.data[0];
        if (!data) {
          enqueueSnackbar('Data profil tidak ditemukan.', { variant: 'error' });
          setLoading(false);
          return;
        }

        // Merge user and role-specific data
        setProfileData({
          ...storedUser,
          ...data,
          role,
          documentId: data.documentId,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error?.message || 'Gagal memuat data profil.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, token, enqueueSnackbar]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!profileData) {
    return <Box sx={{ p: 4, textAlign: 'center', color: '#050D31' }}>Data tidak tersedia.</Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <Header title="Profil Pengguna" />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role={profileData.role} />
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
                mb: 4,
                fontWeight: 700,
                fontFamily: '"Orbitron", sans-serif',
              }}
            >
              Profil {profileData.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
            </Typography>
            <Card
              sx={{
                maxWidth: 800,
                mx: 'auto',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(5, 13, 49, 0.2)',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #E0E7FF 100%)',
              }}
            >
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ProfileAvatar
                      imageUrl={profileData.imageUrl}
                      name={profileData.namaLengkap}
                      profileData={profileData}
                      setProfileData={setProfileData}
                      token={token}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <ProfileForm
                      profileData={profileData}
                      setProfileData={setProfileData}
                      token={token}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;