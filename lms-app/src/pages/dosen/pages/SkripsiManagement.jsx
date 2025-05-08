import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Alert,
  Chip,
  Modal,
  Fade,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
} from '@mui/material';
import { Add, CheckCircle, Cancel } from '@mui/icons-material';
import { createTopic, getAllProposals, getTopicsByDosenNip, updateProposalStatus } from '../utils/skripsiService';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SkripsiSearch from '../components/SkripsiSearch';

const SkripsiManagement = () => {
  const [topicForm, setTopicForm] = useState({ title: '', description: '' });
  const [proposals, setProposals] = useState([]);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, proposalId: null, status: '' });
  const [tabValue, setTabValue] = useState(0);
  const cache = useRef({ proposals: null, topics: null });
  const isFetching = useRef(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = useCallback(async (force = false) => {
    if (isFetching.current || !user?.username) return;
    if (!force && cache.current.proposals && cache.current.topics) {
      setProposals(cache.current.proposals);
      setTopics(cache.current.topics);
      return;
    }

    isFetching.current = true;
    setLoading(true);
    try {
      const [proposalsResponse, topicsResponse] = await Promise.all([
        getAllProposals(),
        getTopicsByDosenNip(user.username),
      ]);
      cache.current = {
        proposals: proposalsResponse.data,
        topics: topicsResponse.data,
      };
      setProposals(proposalsResponse.data);
      setTopics(topicsResponse.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [user?.username]);

  useEffect(() => {
    if (tabValue === 0) {
      fetchData();
    }
  }, [fetchData, tabValue]);

  const handleInputChange = (e) => {
    setTopicForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.title.trim() || !topicForm.description.trim()) {
      setError('Judul dan deskripsi harus diisi');
      return;
    }
    setLoading(true);
    try {
      await createTopic({ ...topicForm, dosenNip: user.username });
      setSuccess('Topik berhasil ditambahkan');
      setTopicForm({ title: '', description: '' });
      setModalOpen(false);
      cache.current.topics = null;
      fetchData(true);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal menambahkan topik');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await updateProposalStatus(confirmDialog.proposalId, confirmDialog.status);
      setSuccess(`Proposal berhasil ${confirmDialog.status === 'approved' ? 'disetujui' : 'ditolak'}`);
      cache.current.proposals = null;
      fetchData(true);
      setError(null);
    } catch (err) {
      setError(err.message || `Gagal ${confirmDialog.status === 'approved' ? 'menyetujui' : 'menolak'} proposal`);
      setSuccess(null);
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, proposalId: null, status: '' });
    }
  };

  const handleOpenConfirmDialog = (proposalId, status) => {
    setConfirmDialog({ open: true, proposalId, status });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, proposalId: null, status: '' });
  };

  const handleDrawerToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTopicForm({ title: '', description: '' });
    setError(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="dosen" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          ml: sidebarOpen ? '0px' : '0px',
          transition: 'margin-left 0.3s ease-in-out',
          width: sidebarOpen ? 'calc(100% - 260px)' : 'calc(100% - 70px)',
        }}
      >
        <Header title="Manajemen Skripsi" />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                color: '#1a237e',
                fontWeight: 600,
                fontFamily: '"Inter", sans-serif',
                textTransform: 'none',
              },
              '& .Mui-selected': {
                color: '#1976d2',
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#1976d2',
              },
            }}
          >
            <Tab label="Manajemen Skripsi" />
            <Tab label="Pencarian Skripsi" />
          </Tabs>

          {tabValue === 0 && (
            <>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ color: '#1a237e', fontWeight: 700, fontFamily: '"Inter", sans-serif' }}
              >
                Manajemen Skripsi
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              {/* Topics Section */}
              <Paper
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e0e0e0',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, bgcolor: '#1a237e', p: 2, borderRadius: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}
                  >
                    Daftar Topik
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenModal}
                    disabled={loading}
                    sx={{
                      bgcolor: '#1976d2',
                      color: '#ffffff',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      '&:hover': { bgcolor: '#1565c0' },
                      '&:disabled': { bgcolor: '#b0bec5' },
                    }}
                  >
                    Tambah Topik
                  </Button>
                </Box>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#1a237e' }}>
                          <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                            Judul Topik
                          </TableCell>
                          <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                            Deskripsi
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topics.length > 0 ? (
                          topics.map((topic) => (
                            <TableRow
                              key={topic.documentId}
                              sx={{
                                '&:hover': { bgcolor: '#f5f7fa' },
                                transition: 'background-color 0.2s',
                                bgcolor: '#2e3b55',
                              }}
                            >
                              <TableCell sx={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#1a237e' } }}>
                                {topic.title}
                              </TableCell>
                              <TableCell sx={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#1a237e' } }}>
                                {topic.description}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              sx={{
                                textAlign: 'center',
                                color: '#ffffff',
                                py: 4,
                                fontFamily: '"Inter", sans-serif',
                                bgcolor: '#2e3b55',
                              }}
                            >
                              Tidak ada topik yang tersedia
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              {/* Modal for Adding Topic */}
              <Modal open={modalOpen} onClose={handleCloseModal}>
                <Fade in={modalOpen}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      bgcolor: '#ffffff',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      p: 4,
                      borderRadius: 3,
                      width: { xs: '90%', sm: 600 },
                      maxWidth: '90vw',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#1a237e',
                        mb: 3,
                        fontWeight: 600,
                        fontFamily: '"Inter", sans-serif',
                      }}
                    >
                      Tambah Topik Baru
                    </Typography>
                    <Box component="form" onSubmit={handleAddTopic}>
                      <TextField
                        fullWidth
                        label="Judul Topik"
                        name="title"
                        value={topicForm.title}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                        disabled={loading}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#0d47a1', fontFamily: '"Inter", sans-serif' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#0d47a1' },
                            '&:hover fieldset': { borderColor: '#1976d2' },
                            '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                            '& input': { color: '#0d47a1' },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Deskripsi"
                        name="description"
                        value={topicForm.description}
                        onChange={handleInputChange}
                        margin="normal"
                        multiline
                        rows={4}
                        required
                        disabled={loading}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#0d47a1', fontFamily: '"Inter", sans-serif' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#0d47a1' },
                            '&:hover fieldset': { borderColor: '#1976d2' },
                            '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                            '& textarea': { color: '#0d47a1' },
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          onClick={handleCloseModal}
                          disabled={loading}
                          sx={{
                            borderColor: '#0d47a1',
                            color: '#0d47a1',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            '&:hover': { borderColor: '#1976d2', bgcolor: '#f5f7fa' },
                          }}
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          sx={{
                            bgcolor: '#1976d2',
                            color: '#ffffff',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#1565c0' },
                            '&:disabled': { bgcolor: '#b0bec5' },
                          }}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : 'Simpan'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              </Modal>

              {/* Proposals Section */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif', bgcolor: '#1a237e', p: 2, borderRadius: 1 }}
                >
                  Daftar Proposal
                </Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#1a237e' }}>
                          <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                            Topik
                          </TableCell>
                          <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                            Mahasiswa
                          </TableCell>
                          <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                            Judul Skripsi
                          </TableCell>
                          <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                            Aksi
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {proposals.map((proposal) => (
                          <TableRow
                            key={proposal.documentId}
                            sx={{
                              '&:hover': { bgcolor: '#f5f7fa' },
                              transition: 'background-color 0.2s',
                              bgcolor: '#2e3b55',
                            }}
                          >
                            <TableCell sx={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#1a237e' } }}>
                              {proposal.topic?.title || '-'}
                            </TableCell>
                            <TableCell sx={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#1a237e' } }}>
                              {proposal.mahasiswa?.namaLengkap || '-'}
                            </TableCell>
                            <TableCell sx={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#1a237e' } }}>
                              {proposal.skripsi?.title || '-'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={
                                  proposal.status_class === 'approved' ? (
                                    <CheckCircle />
                                  ) : proposal.status_class === 'rejected' ? (
                                    <Cancel />
                                  ) : null
                                }
                                label={
                                  proposal.status_class === 'approved'
                                    ? 'Disetujui'
                                    : proposal.status_class === 'rejected'
                                    ? 'Ditolak'
                                    : 'Menunggu'
                                }
                                sx={{
                                  bgcolor:
                                    proposal.status_class === 'approved'
                                      ? '#2e7d32'
                                      : proposal.status_class === 'rejected'
                                      ? '#d32f2f'
                                      : '#0288d1',
                                  color: '#ffffff',
                                  fontWeight: 500,
                                  fontFamily: '"Inter", sans-serif',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {!proposal.status_class && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    startIcon={<CheckCircle />}
                                    onClick={() => handleOpenConfirmDialog(proposal.documentId, 'approved')}
                                    disabled={loading}
                                    sx={{
                                      bgcolor: '#2e7d32',
                                      color: '#ffffff',
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      borderRadius: 2,
                                      '&:hover': { bgcolor: '#27632a' },
                                      '&:disabled': { bgcolor: '#b0bec5' },
                                    }}
                                  >
                                    Setujui
                                  </Button>
                                  <Button
                                    variant="contained"
                                    startIcon={<Cancel />}
                                    onClick={() => handleOpenConfirmDialog(proposal.documentId, 'rejected')}
                                    disabled={loading}
                                    sx={{
                                      bgcolor: '#d32f2f',
                                      color: '#ffffff',
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      borderRadius: 2,
                                      '&:hover': { bgcolor: '#b71c1c' },
                                      '&:disabled': { bgcolor: '#b0bec5' },
                                    }}
                                  >
                                    Tolak
                                  </Button>
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              {/* Confirmation Dialog */}
              <Dialog
                open={confirmDialog.open}
                onClose={handleCloseConfirmDialog}
                aria-labelledby="confirm-dialog-title"
              >
                <DialogTitle id="confirm-dialog-title">
                  Konfirmasi {confirmDialog.status === 'approved' ? 'Persetujuan' : 'Penolakan'}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Apakah Anda yakin ingin {confirmDialog.status === 'approved' ? 'menyetujui' : 'menolak'} proposal ini?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleCloseConfirmDialog}
                    sx={{
                      color: '#0d47a1',
                      textTransform: 'none',
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    variant="contained"
                    disabled={loading}
                    sx={{
                      bgcolor: confirmDialog.status === 'approved' ? '#2e7d32' : '#d32f2f',
                      color: '#ffffff',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: confirmDialog.status === 'approved' ? '#27632a' : '#b71c1c',
                      },
                      '&:disabled': { bgcolor: '#b0bec5' },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Konfirmasi'}
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}

          {tabValue === 1 && <SkripsiSearch />}
        </Container>
      </Box>
    </Box>
  );
};

export default SkripsiManagement;