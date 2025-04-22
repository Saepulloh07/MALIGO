import React, { useState, useEffect } from 'react';
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
  Tooltip,
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TambahMahasiswa from './TambahMahasiswa';
import AddPertemuanModal from './AddPertemuanModal';
import AddMateriModal from './AddMateriModal';
import EditMatakuliahModal from './EditMatakuliahModal';
import EditPertemuanModal from './EditPertemuanModal';
import HapusPertemuanModal from './HapusPertemuanModal';
import HapusMateriModal from './HapusMateriModal';
import { useSnackbar } from 'notistack';

// Professional color palette
const theme = {
  primary: '#005a6f',
  secondary: '#f8fafc',
  accent: '#4db6ac',
  text: '#1a202c',
  border: '#e2e8f0',
  error: '#d32f2f',
  muted: '#64748b',
};

// Utility function to truncate deskripsi
const truncateDeskripsi = (text, maxLength = 100) => {
  if (!text) return 'Tidak ada deskripsi';
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

// Utility function to render Tiptap JSON as paragraphs with formatting
const renderTiptapContent = (content) => {
  if (!content || !Array.isArray(content)) return <Typography sx={{ color: theme.muted, fontStyle: 'italic' }}>Tidak ada isi teks</Typography>;

  return content.map((node, index) => {
    if (node.type !== 'paragraph') return null;

    const renderText = (textNode) => {
      if (!textNode.text) return null;

      let style = {};
      let element = 'span';
      const props = {};

      if (textNode.marks) {
        textNode.marks.forEach((mark) => {
          if (mark.type === 'bold') {
            style.fontWeight = 600;
          }
          if (mark.type === 'italic') {
            style.fontStyle = 'italic';
          }
          if (mark.type === 'link') {
            element = 'a';
            props.href = mark.attrs.href;
            props.target = mark.attrs.target;
            props.rel = mark.attrs.rel;
            style.color = theme.accent;
            style.textDecoration = 'underline';
          }
        });
      }

      return React.createElement(element, { ...props, style }, textNode.text);
    };

    return (
      <Typography
        key={index}
        variant="body2"
        sx={{ color: theme.muted, mb: 1, fontSize: '0.85rem', lineHeight: 1.6 }}
      >
        {node.content ? node.content.map((child, childIndex) => (
          <React.Fragment key={childIndex}>{renderText(child)}</React.Fragment>
        )) : 'Tidak ada isi teks'}
      </Typography>
    );
  });
};

const CourseAccordion = ({ matakuliahList, setSelectedMatakuliah, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openPertemuanModal, setOpenPertemuanModal] = useState(false);
  const [openMateriModal, setOpenMateriModal] = useState(false);
  const [openEditMatakuliahModal, setOpenEditMatakuliahModal] = useState(false);
  const [openEditPertemuanModal, setOpenEditPertemuanModal] = useState(false);
  const [openHapusPertemuanModal, setOpenHapusPertemuanModal] = useState(false);
  const [openHapusMateriModal, setOpenHapusMateriModal] = useState(false);
  const [selectedMatakuliahForModal, setSelectedMatakuliahForModal] = useState(null);
  const [selectedPertemuan, setSelectedPertemuan] = useState(null);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [pendingMatakuliah, setPendingMatakuliah] = useState(null);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userNip = user?.username || null;

  const filteredMatakuliah = matakuliahList.filter((matakuliah) =>
    matakuliah.dosens?.some((dosen) => dosen.nip === userNip)
  );

  // Handle opening the invite modal with matakuliah validation
  const handleOpenInviteModal = (matakuliah) => {
    if (!matakuliah || !matakuliah.id || !matakuliah.program_studi?.id || !matakuliah.semester) {
      console.error('Invalid matakuliah:', matakuliah);
      enqueueSnackbar('Data mata kuliah tidak valid', { variant: 'error' });
      return;
    }
    console.log('Opening invite modal with matakuliah:', matakuliah);
    setPendingMatakuliah({
      id: matakuliah.id,
      nama: matakuliah.nama,
      program_studi: {
        id: matakuliah.program_studi.id,
        nama: matakuliah.program_studi.nama,
      },
      semester: matakuliah.semester,
    });
  };

  // Effect to open modal after setting matakuliah
  useEffect(() => {
    if (pendingMatakuliah) {
      setSelectedMatakuliahForModal(pendingMatakuliah);
      setOpenInviteModal(true);
      setPendingMatakuliah(null);
    }
  }, [pendingMatakuliah]);

  const handleCloseInviteModal = () => {
    setOpenInviteModal(false);
    setSelectedMatakuliahForModal(null);
  };

  const handleOpenPertemuanModal = (matakuliah) => {
    if (!matakuliah || !matakuliah.id) {
      console.error('Invalid matakuliah:', matakuliah);
      enqueueSnackbar('Data mata kuliah tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setOpenPertemuanModal(true);
  };

  const handleOpenMateriModal = (matakuliah, pertemuan) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.id) {
      console.error('Invalid matakuliah or pertemuan:', { matakuliah, pertemuan });
      enqueueSnackbar('Data mata kuliah atau pertemuan tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setOpenMateriModal(true);
  };

  const handleOpenEditMatakuliahModal = (matakuliah) => {
    if (!matakuliah || !matakuliah.documentId) {
      console.error('Invalid matakuliah:', matakuliah);
      enqueueSnackbar('Data mata kuliah tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setOpenEditMatakuliahModal(true);
  };

  const handleOpenEditPertemuanModal = (matakuliah, pertemuan) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.documentId) {
      console.error('Invalid matakuliah or pertemuan:', { matakuliah, pertemuan });
      enqueueSnackbar('Data mata kuliah atau pertemuan tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setOpenEditPertemuanModal(true);
  };

  const handleOpenHapusPertemuanModal = (matakuliah, pertemuan) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.documentId) {
      console.error('Invalid matakuliah or pertemuan:', { matakuliah, pertemuan });
      enqueueSnackbar('Data mata kuliah atau pertemuan tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setOpenHapusPertemuanModal(true);
  };

  const handleOpenHapusMateriModal = (matakuliah, pertemuan, materi) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.id || !materi || !materi.documentId) {
      console.error('Invalid matakuliah, pertemuan, or materi:', { matakuliah, pertemuan, materi });
      enqueueSnackbar('Data mata kuliah, pertemuan, atau materi tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setSelectedMateri(materi);
    setOpenHapusMateriModal(true);
  };

  const handleExpandCard = (matakuliahId) => {
    setExpandedCard(expandedCard === matakuliahId ? null : matakuliahId);
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', mt: 4, px: { xs: 2, sm: 0 } }}>
      {filteredMatakuliah.length === 0 ? (
        <Typography
          sx={{
            textAlign: 'center',
            color: theme.text,
            fontWeight: 500,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            py: 4,
            bgcolor: theme.secondary,
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
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
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    transform: 'translateY(-4px)',
                  },
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          color: theme.text,
                          fontWeight: 600,
                          fontSize: { xs: '1.5rem', md: '1.75rem' },
                        }}
                      >
                        {matakuliah.nama}
                      </Typography>
                      <Tooltip title="Edit Mata Kuliah">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditMatakuliahModal(matakuliah);
                          }}
                          sx={{
                            color: theme.accent,
                            '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.1)' },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.muted, fontWeight: 500 }}
                      >
                        Mahasiswa: {matakuliah.undangan_mahasiswas?.length || 0}
                      </Typography>
                      <Tooltip title="Undang Mahasiswa">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInviteModal(matakuliah);
                          }}
                          sx={{
                            color: theme.accent,
                            '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.1)' },
                          }}
                        >
                          <GroupAddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.muted, mb: 2, fontSize: '0.9rem' }}
                  >
                    Semester {matakuliah.semester} | {matakuliah.sks} SKS
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.accent, fontWeight: 500, mb: 3 }}
                  >
                    Jumlah Pertemuan: {matakuliah.pertemuans?.length || 0}
                  </Typography>
                  <Collapse in={expandedCard === matakuliah.id} timeout={300}>
                    <Typography
                      variant="h6"
                      sx={{ color: theme.text, fontWeight: 500, mb: 2 }}
                    >
                      Daftar Pertemuan dan Materi
                    </Typography>
                    {matakuliah.pertemuans?.length === 0 ? (
                      <Typography sx={{ color: theme.muted, fontStyle: 'italic' }}>
                        Belum ada pertemuan yang ditambahkan.
                      </Typography>
                    ) : (
                      <List sx={{ mt: 1 }}>
                        {matakuliah.pertemuans.map((pertemuan) => (
                          <ListItem
                            key={pertemuan.id}
                            sx={{
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              bgcolor: theme.secondary,
                              border: `1px solid ${theme.border}`,
                              borderRadius: '8px',
                              mb: 2,
                              p: 3,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: '#f1f5f9',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
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
                                  color: theme.text,
                                  fontWeight: 500,
                                  fontSize: '1.1rem',
                                }}
                                secondaryTypographyProps={{
                                  color: theme.muted,
                                  fontSize: '0.85rem',
                                }}
                              />
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit Pertemuan">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditPertemuanModal(matakuliah, pertemuan);
                                    }}
                                    sx={{
                                      color: theme.accent,
                                      '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.1)' },
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Tambah Materi">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenMateriModal(matakuliah, pertemuan);
                                    }}
                                    sx={{
                                      color: theme.accent,
                                      '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.1)' },
                                    }}
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Hapus Pertemuan">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenHapusPertemuanModal(matakuliah, pertemuan);
                                    }}
                                    sx={{
                                      color: theme.error,
                                      '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' },
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ color: theme.text, mt: 1, mb: 2, fontWeight: 500 }}
                            >
                              Materi:
                            </Typography>
                            {!pertemuan.materis || pertemuan.materis.length === 0 ? (
                              <Typography sx={{ color: theme.muted, fontStyle: 'italic', ml: 2 }}>
                                Belum ada materi yang ditambahkan.
                              </Typography>
                            ) : (
                              pertemuan.materis.map((materi) => (
                                <Box
                                  key={materi.id}
                                  sx={{
                                    width: '95%',
                                    mb: 2,
                                    bgcolor: '#ffffff',
                                    p: 3,
                                    borderRadius: '8px',
                                    border: `1px solid ${theme.border}`,
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                  }}
                                >
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography
                                          variant="body1"
                                          sx={{ color: theme.text, fontWeight: 600, fontSize: '1rem' }}
                                        >
                                          {materi.judul}
                                        </Typography>
                                        <Tooltip title="Hapus Materi">
                                          <IconButton
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenHapusMateriModal(matakuliah, pertemuan, materi);
                                            }}
                                            sx={{
                                              color: theme.error,
                                              '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' },
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                      <Typography
                                        variant="body2"
                                        sx={{ color: theme.muted, mb: 1, fontSize: '0.85rem' }}
                                      >
                                        {truncateDeskripsi(materi.deskripsi?.[0]?.children?.[0]?.text)}
                                      </Typography>
                                      {renderTiptapContent(materi.isiTeks?.content)}
                                      {materi.fileUrl && (
                                        <Typography variant="body2" sx={{ color: theme.accent, fontSize: '0.85rem', mt: 1 }}>
                                          File:{' '}
                                          <a
                                            href={materi.fileUrl.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: theme.accent, textDecoration: 'underline' }}
                                          >
                                            Unduh File
                                          </a>
                                        </Typography>
                                      )}
                                    </Grid>
                                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      {materi.videoYoutubeUrl ? (
                                        <iframe
                                          width="100%"
                                          height="140"
                                          src={materi.videoYoutubeUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0]}
                                          title={materi.judul}
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          style={{
                                            borderRadius: '8px',
                                            maxWidth: '250px',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                          }}
                                        />
                                      ) : (
                                        <Typography sx={{ color: theme.muted, textAlign: 'center', fontStyle: 'italic' }}>
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
                <CardActions sx={{ p: 3, bgcolor: theme.secondary, justifyContent: 'space-between', borderRadius: '0 0 12px 12px' }}>
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpandCard(matakuliah.id);
                    }}
                    endIcon={<ExpandMoreIcon sx={{ transform: expandedCard === matakuliah.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: theme.accent,
                      color: theme.accent,
                      px: 3,
                      py: 1,
                      '&:hover': {
                        bgcolor: 'rgba(77, 182, 172, 0.1)',
                        borderColor: theme.accent,
                      },
                      '&:focus': {
                        boxShadow: `0 0 0 3px rgba(77, 182, 172, 0.2)`,
                      },
                    }}
                  >
                    {expandedCard === matakuliah.id ? 'Sembunyikan Detail' : 'Lihat Selengkapnya'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPertemuanModal(matakuliah);
                    }}
                    sx={{
                      bgcolor: theme.primary,
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 3,
                      py: 1,
                      '&:hover': {
                        bgcolor: '#004a5a',
                        boxShadow: '0 4px 12px rgba(0, 90, 111, 0.3)',
                      },
                      '&:focus': {
                        boxShadow: `0 0 0 3px rgba(0, 90, 111, 0.2)`,
                      },
                    }}
                  >
                    Tambah Pertemuan
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedMatakuliahForModal && (
        <TambahMahasiswa
          open={openInviteModal}
          handleClose={handleCloseInviteModal}
          matakuliah={selectedMatakuliahForModal}
          refreshMatakuliah={refreshMatakuliah}
        />
      )}
      <AddPertemuanModal
        open={openPertemuanModal}
        onClose={() => {
          setOpenPertemuanModal(false);
          setSelectedMatakuliahForModal(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        refreshMatakuliah={refreshMatakuliah}
      />
      <AddMateriModal
        open={openMateriModal}
        onClose={() => {
          setOpenMateriModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        pertemuan={selectedPertemuan}
        refreshMatakuliah={refreshMatakuliah}
      />
      <EditMatakuliahModal
        open={openEditMatakuliahModal}
        onClose={() => {
          setOpenEditMatakuliahModal(false);
          setSelectedMatakuliahForModal(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        refreshMatakuliah={refreshMatakuliah}
      />
      <EditPertemuanModal
        open={openEditPertemuanModal}
        onClose={() => {
          setOpenEditPertemuanModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        pertemuan={selectedPertemuan}
        refreshMatakuliah={refreshMatakuliah}
      />
      <HapusPertemuanModal
        open={openHapusPertemuanModal}
        onClose={() => {
          setOpenHapusPertemuanModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        pertemuan={selectedPertemuan}
        refreshMatakuliah={refreshMatakuliah}
      />
      <HapusMateriModal
        open={openHapusMateriModal}
        onClose={() => {
          setOpenHapusMateriModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
          setSelectedMateri(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        pertemuan={selectedPertemuan}
        materi={selectedMateri}
        refreshMatakuliah={refreshMatakuliah}
      />
    </Box>
  );
};

export default CourseAccordion;