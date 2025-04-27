import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Modal,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Add, Edit, Delete, QuestionAnswer } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getExams, createExam, updateExam, deleteExam, validateMatakuliah, createSoalUjian, getSoalByUjian } from '../utils/ujianService';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import UjianModal from '../components/UjianModal';
import SoalUjianModal from '../components/SoalUjianModal';
import SoalListModal from '../components/SoalListModal';

// Fungsi untuk mengonversi HH:MM:SS ke menit
const convertTimerToMinutes = (timer) => {
  if (!timer || typeof timer !== 'string') return 0;
  const [hours, minutes, seconds] = timer.split(':').map(Number);
  return hours * 60 + minutes + Math.round(seconds / 60);
};

const ExamManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [exams, setExams] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openSoalModal, setOpenSoalModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openSoalListModal, setOpenSoalListModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedSoalList, setSelectedSoalList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [matakuliahOptions, setMatakuliahOptions] = useState([]);

  useEffect(() => {
    fetchExams();
    fetchMatakuliah();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await getExams();
      setExams(response.data || []);
    } catch (error) {
      enqueueSnackbar('Gagal memuat data ujian', { variant: 'error' });
    }
  };

  const fetchMatakuliah = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await validateMatakuliah(user.username);
      setMatakuliahOptions(response.data || []);
    } catch (error) {
      enqueueSnackbar('Gagal memuat data mata kuliah', { variant: 'error' });
    }
  };

  const handleOpenModal = (exam = null) => {
    setSelectedExam(exam);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedExam(null);
  };

  const handleOpenSoalModal = (examId) => {
    setSelectedExamId(examId);
    setOpenSoalModal(true);
  };

  const handleCloseSoalModal = () => {
    setOpenSoalModal(false);
    setSelectedExamId(null);
  };

  const handleOpenDeleteModal = (examId) => {
    setSelectedExamId(examId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedExamId(null);
  };

  const handleOpenSoalListModal = async (examId) => {
    try {
      const response = await getSoalByUjian(examId);
      setSelectedSoalList(response.data || []);
      setOpenSoalListModal(true);
    } catch (error) {
      enqueueSnackbar('Gagal memuat daftar soal', { variant: 'error' });
    }
  };

  const handleCloseSoalListModal = () => {
    setOpenSoalListModal(false);
    setSelectedSoalList([]);
  };

  const handleSaveExam = async (examData) => {
    try {
      if (selectedExam) {
        await updateExam(selectedExam.documentId, examData);
        enqueueSnackbar('Ujian berhasil diperbarui', { variant: 'success' });
      } else {
        await createExam(examData);
        enqueueSnackbar('Ujian berhasil ditambahkan', { variant: 'success' });
      }
      fetchExams();
      handleCloseModal();
    } catch (error) {
      enqueueSnackbar('Gagal menyimpan ujian', { variant: 'error' });
    }
  };

  const handleSaveSoal = async (soalList) => {
    try {
      for (const soal of soalList) {
        await createSoalUjian({ ...soal, ujian: selectedExamId });
      }
      enqueueSnackbar('Semua soal berhasil ditambahkan', { variant: 'success' });
      handleCloseSoalModal();
    } catch (error) {
      enqueueSnackbar('Gagal menambahkan soal', { variant: 'error' });
    }
  };

  const handleDeleteExam = async () => {
    try {
      await deleteExam(selectedExamId);
      enqueueSnackbar('Ujian berhasil dihapus', { variant: 'success' });
      fetchExams();
      handleCloseDeleteModal();
    } catch (error) {
      enqueueSnackbar('Gagal menghapus ujian', { variant: 'error' });
    }
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="dosen" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: sidebarOpen ? '0px' : '0px',
          transition: 'margin 0.3s ease-in-out',
          mt: '64px',
        }}
      >
        <Header title="Manajemen Ujian" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#050D31' }}>
              Daftar Ujian
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
              sx={{
                bgcolor: '#050D31',
                color: '#efbf04',
                '&:hover': { bgcolor: '#1a237e' },
              }}
            >
              Tambah Ujian
            </Button>
          </Box>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#050D31' }}>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Judul</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Mata Kuliah</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Waktu Mulai</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Waktu Selesai</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Durasi (Menit)</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow
                    key={exam.documentId}
                    onClick={() => handleOpenSoalListModal(exam.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{exam.judul}</TableCell>
                    <TableCell>{exam.matakuliah?.nama}</TableCell>
                    <TableCell>
                      {new Date(exam.waktuMulai).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      {new Date(exam.waktuSelesai).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>{convertTimerToMinutes(exam.timer)}</TableCell>
                    <TableCell
                      onClick={(e) => e.stopPropagation()} // Prevent row click when clicking buttons
                    >
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenModal(exam)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenSoalModal(exam.id)}
                      >
                        <QuestionAnswer />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteModal(exam.documentId)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
        <UjianModal
          open={openModal}
          onClose={handleCloseModal}
          onSave={handleSaveExam}
          exam={selectedExam}
          matakuliahOptions={matakuliahOptions}
        />
        <SoalUjianModal
          open={openSoalModal}
          onClose={handleCloseSoalModal}
          onSave={handleSaveSoal}
        />
        <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <DialogTitle>Hapus Ujian</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Apakah Anda yakin ingin menghapus ujian ini? Tindakan ini tidak dapat dibatalkan.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseDeleteModal}
                sx={{ color: '#050D31' }}
              >
                Batal
              </Button>
              <Button
                onClick={handleDeleteExam}
                color="error"
                variant="contained"
              >
                Hapus
              </Button>
            </DialogActions>
          </Box>
        </Modal>
        <SoalListModal
          open={openSoalListModal}
          onClose={handleCloseSoalListModal}
          soalList={selectedSoalList}
        />
      </Box>
    </Box>
  );
};

export default ExamManagement;