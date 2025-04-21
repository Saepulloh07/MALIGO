import React, { useState } from 'react';
import { Avatar, Box, Typography, Button, IconButton } from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const defaultAvatar = 'https://via.placeholder.com/150?text=User';

const ProfileAvatar = ({ imageUrl, name, profileData, setProfileData, token }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('File harus berupa gambar.', { variant: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Ukuran gambar maksimum 5MB.', { variant: 'error' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const uploadResponse = await axios.post('http://localhost:1337/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const newImageUrl = uploadResponse.data[0].url;
      setProfileData({ ...profileData, imageUrl: newImageUrl });

      // Update imageUrl in Strapi
      const endpoint =
        profileData.role === 'dosen'
          ? `http://localhost:1337/api/dosens/${profileData.documentId}`
          : `http://localhost:1337/api/mahasiswas/${profileData.documentId}`;

      await axios.put(
        endpoint,
        { data: { imageUrl: newImageUrl } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      enqueueSnackbar('Gambar profil berhasil diperbarui!', { variant: 'success' });
    } catch (error) {
      console.error('Error uploading image:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.message || 'Gagal mengunggah gambar.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      const endpoint =
        profileData.role === 'dosen'
          ? `http://localhost:1337/api/dosens/${profileData.documentId}`
          : `http://localhost:1337/api/mahasiswas/${profileData.documentId}`;

      await axios.put(
        endpoint,
        { data: { imageUrl: null } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfileData({ ...profileData, imageUrl: null });
      enqueueSnackbar('Gambar profil berhasil dihapus!', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting image:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.message || 'Gagal menghapus gambar.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Avatar
        src={imageUrl || defaultAvatar}
        alt={name}
        sx={{
          width: 150,
          height: 150,
          border: '3px solid #866600',
          boxShadow: '0 2px 8px rgba(5, 13, 49, 0.2)',
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: '#050D31',
          fontWeight: 600,
          fontFamily: '"Orbitron", sans-serif',
          mb: 2,
        }}
      >
        {name}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCamera />}
          disabled={uploading}
          sx={{
            color: '#866600',
            borderColor: '#866600',
            '&:hover': { borderColor: '#FFD700', backgroundColor: 'rgba(134, 102, 0, 0.1)' },
          }}
        >
          {uploading ? 'Mengunggah...' : 'Ubah Gambar'}
          <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
        </Button>
        {imageUrl && (
          <IconButton
            color="error"
            onClick={handleImageDelete}
            disabled={uploading}
            sx={{ border: '1px solid #B00020', '&:hover': { backgroundColor: 'rgba(176, 0, 32, 0.1)' } }}
          >
            <Delete />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default ProfileAvatar;