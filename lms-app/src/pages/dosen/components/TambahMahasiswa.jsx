import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

const TambahMahasiswaModal = ({ open, onClose, matakuliahId }) => {
  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Placeholder API call to invite student
      console.log('Inviting student:', { nim, nama, matakuliahId });
      // Reset form
      setNim('');
      setNama('');
      onClose();
    } catch (error) {
      console.error('Error inviting student:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 w-96 mx-auto mt-20"
        sx={{
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <Typography variant="h6" className="text-blue-400 mb-4">
          Undang Mahasiswa
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="NIM"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ className: 'text-gray-300' }}
            InputProps={{ className: 'text-gray-200 bg-gray-700/50' }}
            className="mb-4"
          />
          <TextField
            label="Nama Mahasiswa"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ className: 'text-gray-300' }}
            InputProps={{ className: 'text-gray-200 bg-gray-700/50' }}
            className="mb-4"
          />
          <Box className="flex justify-end gap-2">
            <Button
              onClick={onClose}
              className="bg-gray-600 text-gray-200 hover:bg-gray-500"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              Undang
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default TambahMahasiswaModal;