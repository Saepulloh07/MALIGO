import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Grid,
  IconButton,
  Collapse,
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import TambahMahasiswa from './TambahMahasiswa';
import AddPertemuanModal from './AddPertemuanModal';
import AddMateriModal from './AddMateriModal';
import EditMatakuliahModal from './EditMatakuliahModal';

const CourseAccordion = ({ matakuliahList, setSelectedMatakuliah, refreshMatakuliah }) => {
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openPertemuanModal, setOpenPertemuanModal] = useState(false);
  const [openMateriModal, setOpenMateriModal] = useState(false);
  const [openEditMatakuliahModal, setOpenEditMatakuliahModal] = useState(false);
  const [selectedMatakuliahId, setSelectedMatakuliahId] = useState(null);
  const [selectedMatakuliah, setSelectedMatakuliahForModal] = useState(null);
  const [selectedPertemuan, setSelectedPertemuan] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userNip = user?.username || null;

  const filteredMatakuliah = matakuliahList.filter((matakuliah) =>
    matakuliah.dosens?.some((dosen) => dosen.nip === userNip)
  );

  const handleOpenInviteModal = (matakuliahId) => {
    setSelectedMatakuliahId(matakuliahId);
    setOpenInviteModal(true);
  };

  const handleCloseInviteModal = () => {
    setOpenInviteModal(false);
    setSelectedMatakuliahId(null);
  };

  const handleOpenPertemuanModal = (matakuliah) => {
    if (!matakuliah || !matakuliah.id) {
      console.error('Invalid matakuliah:', matakuliah);
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setOpenPertemuanModal(true);
  };

  const handleOpenMateriModal = (matakuliah, pertemuan) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.id) {
      console.error('Invalid matakuliah or pertemuan:', { matakuliah, pertemuan });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setOpenMateriModal(true);
  };

  const handleOpenEditMatakuliahModal = (matakuliah) => {
    if (!matakuliah || !matakuliah.documentId) {
      console.error('Invalid matakuliah:', matakuliah);
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setOpenEditMatakuliahModal(true);
  };

  const handleExpandCard = (matakuliahId) => {
    setExpandedCard(expandedCard === matakuliahId ? null : matakuliahId);
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', mt: 4 }}>
      {filteredMatakuliah.length === 0 ? (
        <Typography
          sx={{
            textAlign: 'center',
            color: '#0288d1',
            fontWeight: 500,
            fontSize: '1.5rem',
            py: 4,
            bgcolor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          Tidak ada mata kuliah yang tersedia saat ini.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredMatakuliah.map((matakuliah) => (
            <Grid item xs={12} key={matakuliah.id}>
              <Card
                onClick={() => setSelectedMatakuliah(matakuliah)}
                sx={{
                  bgcolor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '16px',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-6px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          color: '#1a237e',
                          fontWeight: 700,
                          mb: 1,
                        }}
                      >
                        {matakuliah.nama}
                      </Typography>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditMatakuliahModal(matakuliah);
                        }}
                        sx={{
                          color: '#0288d1',
                          '&:hover': { bgcolor: 'rgba(2, 136, 209, 0.1)' },
                        }}
                        title="Edit Mata Kuliah"
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#0288d1', fontWeight: 500 }}
                      >
                        Mahasiswa: {matakuliah.undangan_mahasiswas?.length || 0}
                      </Typography>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInviteModal(matakuliah.id);
                        }}
                        sx={{
                          color: '#0288d1',
                          '&:hover': { bgcolor: 'rgba(2, 136, 209, 0.1)' },
                        }}
                      >
                        <GroupAddIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: '#616161', mb: 2 }}
                  >
                    Semester {matakuliah.semester} | {matakuliah.sks} SKS
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#0288d1', fontWeight: 500, mb: 2 }}
                  >
                    Jumlah Pertemuan: {matakuliah.pertemuans?.length || 0}
                  </Typography>
                  <Collapse in={expandedCard === matakuliah.id}>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: '#1a237e', fontWeight: 500, mb: 2 }}
                    >
                      Daftar Pertemuan dan Materi
                    </Typography>
                    {matakuliah.pertemuans?.length === 0 ? (
                      <Typography sx={{ color: '#757575' }}>
                        Belum ada pertemuan yang ditambahkan.
                      </Typography>
                    ) : (
                      <List>
                        {matakuliah.pertemuans.map((pertemuan) => (
                          <ListItem
                            key={pertemuan.id}
                            sx={{
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              bgcolor: '#fafafa',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              mb: 2,
                              p: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: '#f5f5f5',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <ListItemText
                                primary={`Pertemuan ${pertemuan.pertemuanKe}: ${pertemuan.topik}`}
                                secondary={
                                  pertemuan.tanggal
                                    ? `Tanggal: ${new Date(pertemuan.tanggal).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                      })}`
                                    : 'Tanggal: Belum ditentukan'
                                }
                                primaryTypographyProps={{
                                  color: '#1a237e',
                                  fontWeight: 500,
                                }}
                                secondaryTypographyProps={{
                                  color: '#757575',
                                }}
                              />
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenMateriModal(matakuliah, pertemuan);
                                }}
                                sx={{
                                  color: '#0288d1',
                                  '&:hover': { bgcolor: 'rgba(2, 136, 209, 0.1)' },
                                }}
                                title="Tambah Materi"
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ color: '#0288d1', mt: 2, mb: 1 }}
                            >
                              Materi:
                            </Typography>
                            {!pertemuan.materis || pertemuan.materis.length === 0 ? (
                              <Typography sx={{ color: '#757575' }}>
                                Belum ada materi yang ditambahkan.
                              </Typography>
                            ) : (
                              pertemuan.materis.map((materi) => (
                                <Box
                                  key={materi.id}
                                  sx={{
                                    width: '90%',
                                    mb: 2,
                                    bgcolor: '#ffffff',
                                    p: 3,
                                    borderRadius: '8px',
                                    border: '1px solid #e0e0e0',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                  }}
                                >
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <Typography
                                        variant="body1"
                                        sx={{ color: '#1a237e', fontWeight: 600, mb: 1 }}
                                      >
                                        {materi.judul}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ color: '#616161', mb: 1 }}
                                      >
                                        {materi.deskripsi?.[0]?.children?.[0]?.text || 'Tidak ada deskripsi'}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ color: '#616161', mb: 1 }}
                                      >
                                        {materi.isiTeks?.[0]?.children?.[0]?.text || 'Tidak ada isi teks'}
                                      </Typography>
                                      {materi.fileUrl && (
                                        <Typography variant="body2" sx={{ color: '#0288d1' }}>
                                          File:{' '}
                                          <a
                                            href={materi.fileUrl.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#0288d1', textDecoration: 'underline' }}
                                          >
                                            Unduh File
                                          </a>
                                        </Typography>
                                      )}
                                    </Grid>
                                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                      {materi.videoYoutubeUrl ? (
                                        <iframe
                                          width="250"
                                          height="140"
                                          src={materi.videoYoutubeUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0]}
                                          title={materi.judul}
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          style={{
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                          }}
                                        />
                                      ) : (
                                        <Typography sx={{ color: '#757575', textAlign: 'center' }}>
                                          Tidak ada video tersedia.
                                        </Typography>
                                      )}
                                    </Grid>
                                  </Grid>
                                </Box>
                              ))
                            )}
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Collapse>
                </CardContent>
                <CardActions sx={{ p: 3, bgcolor: '#f5f5f5', justifyContent: 'space-between', borderRadius: '0 0 16px 16px' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpandCard(matakuliah.id);
                    }}
                    endIcon={<ExpandMoreIcon sx={{ transform: expandedCard === matakuliah.id ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: '#0288d1',
                      color: '#0288d1',
                      '&:hover': {
                        bgcolor: 'rgba(2, 136, 209, 0.05)',
                        borderColor: '#0277bd',
                      },
                    }}
                  >
                    {expandedCard === matakuliah.id ? 'Sembunyikan Detail' : 'Lihat Selengkapnya'}
                  </Button>
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPertemuanModal(matakuliah);
                      }}
                      sx={{
                        bgcolor: '#0288d1',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { bgcolor: '#0277bd', boxShadow: '0 4px 12px rgba(2, 136, 209, 0.3)' },
                      }}
                    >
                      Tambah Pertemuan
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <TambahMahasiswa
        open={openInviteModal}
        handleClose={handleCloseInviteModal}
        matakuliahId={selectedMatakuliahId}
        refreshMatakuliah={refreshMatakuliah}
      />
      <AddPertemuanModal
        open={openPertemuanModal}
        onClose={() => {
          setOpenPertemuanModal(false);
          setSelectedMatakuliahForModal(null);
        }}
        matakuliah={selectedMatakuliah}
        refreshMatakuliah={refreshMatakuliah}
      />
      <AddMateriModal
        open={openMateriModal}
        onClose={() => {
          setOpenMateriModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
        }}
        matakuliah={selectedMatakuliah}
        pertemuan={selectedPertemuan}
        refreshMatakuliah={refreshMatakuliah}
      />
      <EditMatakuliahModal
        open={openEditMatakuliahModal}
        onClose={() => {
          setOpenEditMatakuliahModal(false);
          setSelectedMatakuliahForModal(null);
        }}
        matakuliah={selectedMatakuliah}
        refreshMatakuliah={refreshMatakuliah}
      />
    </Box>
  );
};

export default CourseAccordion;