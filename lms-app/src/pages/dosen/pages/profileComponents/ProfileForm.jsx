import React from 'react';
import { TextField, Button, Grid, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const ProfileForm = ({ profileData, setProfileData, token }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const { role, documentId, imageUrl, ...updateData } = profileData;
      let endpoint = '';

      if (role === 'dosen') {
        endpoint = `http://localhost:1337/api/dosens/${documentId}`;
        updateData.nip = updateData.nip || '';
        updateData.nidn = updateData.nidn || '';
        updateData.namaLengkap = updateData.namaLengkap || '';
        updateData.imageUrl = imageUrl || null;
        // Remove mahasiswa-specific fields
        delete updateData.nim;
        delete updateData.semester;
        delete updateData.status_class;
      } else if (role === 'mahasiswa') {
        endpoint = `http://localhost:1337/api/mahasiswas/${documentId}`;
        updateData.nim = updateData.nim || '';
        updateData.semester = parseInt(updateData.semester) || 1;
        updateData.status_class = updateData.status_class || 'aktif';
        updateData.namaLengkap = updateData.namaLengkap || '';
        updateData.imageUrl = imageUrl || null;
        // Remove dosen-specific fields
        delete updateData.nip;
        delete updateData.nidn;
      }

      // Remove fields that shouldn't be sent
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.publishedAt;
      delete updateData.peran;
      delete updateData.provider;
      delete updateData.blocked;
      delete updateData.confirmed;
      delete updateData.email; // Email is not updatable

      const response = await axios.put(
        endpoint,
        { data: updateData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      enqueueSnackbar('Profil berhasil diperbarui!', { variant: 'success' });
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.message || 'Gagal memperbarui profil.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nama Lengkap"
          name="namaLengkap"
          value={profileData.namaLengkap || ''}
          onChange={handleChange}
          margin="normal"
          sx={{
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
        />
      </Grid>
      {profileData.role === 'dosen' ? (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="NIP"
              name="nip"
              value={profileData.nip || ''}
              onChange={handleChange}
              margin="normal"
              sx={{
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="NIDN"
              name="nidn"
              value={profileData.nidn || ''}
              onChange={handleChange}
              margin="normal"
              sx={{
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
            />
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="NIM"
              name="nim"
              value={profileData.nim || ''}
              onChange={handleChange}
              margin="normal"
              sx={{
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Semester"
              name="semester"
              type="number"
              value={profileData.semester || ''}
              onChange={handleChange}
              margin="normal"
              sx={{
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
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Status"
              name="status_class"
              value={profileData.status_class || 'aktif'}
              onChange={handleChange}
              margin="normal"
              sx={{
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
            >
              <MenuItem value="aktif">Aktif</MenuItem>
              <MenuItem value="nonaktif">Nonaktif</MenuItem>
            </TextField>
          </Grid>
        </>
      )}
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 2, py: 1.5, fontWeight: 600 }}
          onClick={handleSubmit}
          fullWidth
        >
          Simpan Perubahan
        </Button>
      </Grid>
    </Grid>
  );
};

export default ProfileForm;