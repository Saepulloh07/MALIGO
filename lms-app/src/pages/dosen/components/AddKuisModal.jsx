import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Fade,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Divider,
  FormHelperText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { createKuis, createSoalKuis } from '../utils/CourseService';

// Convert minutes to HH:mm:ss format (e.g., 30 → "00:30:00")
const minutesToHHMMSS = (minutes) => {
  if (!minutes || isNaN(minutes)) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
};

const AddKuisModal = ({ open, onClose, matakuliah, pertemuan, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    jenis: 'multiple_choice',
    instruksi: '',
    waktuMulai: '',
    waktuSelesai: '',
    timer: '',
    bobot: '',
    soal: {
      pertanyaan: '',
      pilihan: ['', '', '', ''],
      jawabanBenar: '',
    },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.instruksi) newErrors.instruksi = 'Instruksi wajib diisi';
    if (!formData.waktuMulai) newErrors.waktuMulai = 'Waktu mulai wajib diisi';
    if (!formData.waktuSelesai) newErrors.waktuSelesai = 'Waktu selesai wajib diisi';
    if (!formData.bobot) newErrors.bobot = 'Bobot wajib diisi';
    if (formData.jenis === 'multiple_choice' && !formData.timer) newErrors.timer = 'Timer wajib diisi';
    if (formData.jenis === 'multiple_choice' && formData.timer && (!/^\d+$/.test(formData.timer) || parseInt(formData.timer, 10) <= 0)) {
      newErrors.timer = 'Timer harus berupa angka positif (dalam menit)';
    }
    if (!formData.soal.pertanyaan) newErrors.pertanyaan = 'Pertanyaan wajib diisi';
    if (formData.jenis === 'multiple_choice') {
      if (formData.soal.pilihan.some((p) => !p.trim())) newErrors.pilihan = 'Semua pilihan harus diisi';
      if (!formData.soal.jawabanBenar) newErrors.jawabanBenar = 'Jawaban benar wajib dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSoalChange = (e, index = null) => {
    const { name, value } = e.target;
    if (name === 'pertanyaan') {
      setFormData((prev) => ({
        ...prev,
        soal: { ...prev.soal, pertanyaan: value },
      }));
      setErrors((prev) => ({ ...prev, pertanyaan: '' }));
    } else if (name === 'pilihan' && index !== null) {
      const newPilihan = [...formData.soal.pilihan];
      newPilihan[index] = value;
      setFormData((prev) => ({
        ...prev,
        soal: { ...prev.soal, pilihan: newPilihan },
      }));
      setErrors((prev) => ({ ...prev, pilihan: '' }));
    } else if (name === 'jawabanBenar') {
      setFormData((prev) => ({
        ...prev,
        soal: { ...prev.soal, jawabanBenar: value },
      }));
      setErrors((prev) => ({ ...prev, jawabanBenar: '' }));
    }
  };

  const addPilihan = () => {
    setFormData((prev) => ({
      ...prev,
      soal: { ...prev.soal, pilihan: [...prev.soal.pilihan, ''] },
    }));
  };

  const removePilihan = (index) => {
    if (formData.soal.pilihan.length <= 2) {
      enqueueSnackbar('Minimal harus ada 2 pilihan jawaban', { variant: 'warning' });
      return;
    }
    const newPilihan = formData.soal.pilihan.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      soal: { ...prev.soal, pilihan: newPilihan },
    }));
  };

  const handleSubmit = async () => {
    if (!matakuliah || !pertemuan) {
      enqueueSnackbar('Data mata kuliah atau pertemuan tidak valid', { variant: 'error' });
      return;
    }

    if (!validateForm()) {
      enqueueSnackbar('Harap lengkapi semua kolom yang wajib diisi', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Create kuis first
      const kuisData = {
        data: {
          jenis: formData.jenis,
          instruksi: [
            {
              type: 'paragraph',
              children: [{ text: formData.instruksi.trim(), type: 'text' }],
            },
          ],
          waktuMulai: new Date(formData.waktuMulai).toISOString(),
          waktuSelesai: new Date(formData.waktuSelesai).toISOString(),
          timer: formData.jenis === 'multiple_choice' ? minutesToHHMMSS(parseInt(formData.timer, 10)) : null,
          pertemuan: { connect: [{ id: pertemuan.id }] },
        },
      };

      const kuisResponse = await createKuis(kuisData);
      const kuisId = kuisResponse.data.id;

      // Create soal_kuis separately
      const soalKuisData = {
        data: {
          pertanyaan: formData.soal.pertanyaan.trim(),
          jenis: formData.jenis,
          pilihan:
            formData.jenis === 'multiple_choice'
              ? formData.soal.pilihan.map((text) => ({
                  type: 'paragraph',
                  children: [{ text: text.trim(), type: 'text' }],
                }))
              : null,
          jawabanBenar: formData.jenis === 'multiple_choice' ? formData.soal.jawabanBenar : null,
          bobot: parseInt(formData.bobot, 10),
          kuis: { connect: [{ id: kuisId }] },
        },
      };

      await createSoalKuis(soalKuisData);

      enqueueSnackbar('Kuis berhasil ditambahkan', { variant: 'success' });
      refreshMatakuliah();
      onClose();
      setFormData({
        jenis: 'multiple_choice',
        instruksi: '',
        waktuMulai: '',
        waktuSelesai: '',
        timer: '',
        bobot: '',
        soal: {
          pertanyaan: '',
          pilihan: ['', '', '', ''],
          jawabanBenar: '',
        },
      });
      setErrors({});
    } catch (error) {
      enqueueSnackbar(`Gagal menambahkan kuis: ${error.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Define dark input styles
  const darkInputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: '#2d3748', // Dark gray background
      color: '#e2e8f0', // Light text for contrast
      '&:hover': {
        bgcolor: '#4a5568', // Slightly lighter on hover
      },
      '&.Mui-focused': {
        bgcolor: '#2d3748',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4a5568', // Darker border
      },
    },
    '& .MuiInputLabel-root': {
      color: '#a0aec0', // Lighter label color
      '&.Mui-focused': {
        color: '#e2e8f0', // Focused label color
      },
    },
    '& .MuiFormHelperText-root': {
      color: '#a0aec0', // Helper text color
    },
  };

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open} timeout={400}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: '#1a202c', // Dark background for modal
            borderRadius: 3,
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.3)',
            p: { xs: 3, sm: 5 },
            width: { xs: '95%', sm: 900 },
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #2d3748',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                color: '#e2e8f0',
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.25rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Tambah Kuis Baru
            </Typography>
            <Tooltip title="Tutup">
              <IconButton
                onClick={onClose}
                sx={{
                  color: '#a0aec0',
                  '&:hover': { bgcolor: 'rgba(160, 174, 192, 0.1)' },
                }}
              >
                <CloseIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: '#a0aec0',
              mb: 3,
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            Lengkapi detail kuis untuk {matakuliah?.nama} - Pertemuan {pertemuan?.pertemuanKe}: {pertemuan?.topik}
          </Typography>

          <Divider sx={{ mb: 3, borderColor: '#4a5568' }} />

          <Typography
            variant="h6"
            sx={{
              color: '#e2e8f0',
              fontWeight: 600,
              mb: 2,
              fontSize: '1.25rem',
            }}
          >
            Informasi Kuis
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" error={!!errors.jenis}>
                <InputLabel>Jenis Kuis</InputLabel>
                <Select
                  name="jenis"
                  value={formData.jenis}
                  onChange={handleChange}
                  label="Jenis Kuis"
                  sx={{
                    ...darkInputStyles,
                    '& .MuiSelect-icon': {
                      color: '#e2e8f0', // Arrow icon color
                    },
                  }}
                >
                  <MenuItem value="multiple_choice">Pilihan Ganda</MenuItem>
                  <MenuItem value="esai">Esai</MenuItem>
                  <MenuItem value="tugas">Tugas</MenuItem>
                </Select>
                {errors.jenis && <FormHelperText>{errors.jenis}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Instruksi Kuis"
                name="instruksi"
                value={formData.instruksi}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                error={!!errors.instruksi}
                helperText={errors.instruksi}
                sx={darkInputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Waktu Mulai"
                name="waktuMulai"
                type="datetime-local"
                value={formData.waktuMulai}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                error={!!errors.waktuMulai}
                helperText={errors.waktuMulai}
                sx={darkInputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Waktu Selesai"
                name="waktuSelesai"
                type="datetime-local"
                value={formData.waktuSelesai}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                error={!!errors.waktuSelesai}
                helperText={errors.waktuSelesai}
                sx={darkInputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              {formData.jenis === 'multiple_choice' && (
                <TextField
                  label="Timer (Menit)"
                  name="timer"
                  type="number"
                  value={formData.timer}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors.timer}
                  helperText={errors.timer || 'Masukkan durasi dalam menit (contoh: 30)'}
                  sx={darkInputStyles}
                  InputProps={{ inputProps: { min: 1, max: 999 } }}
                />
              )}
              {formData.jenis !== 'multiple_choice' && (
                <TextField
                  label="Bobot Penilaian"
                  name="bobot"
                  type="number"
                  value={formData.bobot}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors.bobot}
                  helperText={errors.bobot}
                  sx={darkInputStyles}
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                />
              )}
            </Grid>
            {formData.jenis === 'multiple_choice' && (
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Bobot Penilaian"
                  name="bobot"
                  type="number"
                  value={formData.bobot}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors.bobot}
                  helperText={errors.bobot}
                  sx={darkInputStyles}
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3, borderColor: '#4a5568' }} />

          <Typography
            variant="h6"
            sx={{
              color: '#e2e8f0',
              fontWeight: 600,
              mb: 2,
              fontSize: '1.25rem',
            }}
          >
            Soal Kuis
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Pertanyaan"
                name="pertanyaan"
                value={formData.soal.pertanyaan}
                onChange={handleSoalChange}
                fullWidth
                variant="outlined"
                error={!!errors.pertanyaan}
                helperText={errors.pertanyaan}
                sx={darkInputStyles}
              />
            </Grid>
            {formData.jenis === 'multiple_choice' && (
              <>
                {formData.soal.pilihan.map((pilihan, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TextField
                        label={`Pilihan ${index + 1}`}
                        name="pilihan"
                        value={pilihan}
                        onChange={(e) => handleSoalChange(e, index)}
                        fullWidth
                        variant="outlined"
                        error={!!errors.pilihan}
                        helperText={errors.pilihan}
                        sx={darkInputStyles}
                      />
                      <Tooltip title="Hapus Pilihan">
                        <IconButton
                          onClick={() => removePilihan(index)}
                          sx={{
                            color: '#fc8181',
                            '&:hover': { bgcolor: 'rgba(252, 129, 129, 0.1)' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    onClick={addPilihan}
                    startIcon={<AddIcon />}
                    sx={{
                      textTransform: 'none',
                      color: '#81e6d9',
                      fontWeight: 500,
                      mb: 2,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'rgba(129, 230, 217, 0.1)',
                        color: '#4fd1c5',
                      },
                    }}
                  >
                    Tambah Pilihan
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" error={!!errors.jawabanBenar}>
                    <InputLabel>Jawaban Benar</InputLabel>
                    <Select
                      name="jawabanBenar"
                      value={formData.soal.jawabanBenar}
                      onChange={handleSoalChange}
                      label="Jawaban Benar"
                      sx={{
                        ...darkInputStyles,
                        '& .MuiSelect-icon': {
                          color: '#e2e8f0',
                        },
                      }}
                    >
                      {formData.soal.pilihan.map((pilihan, index) => (
                        <MenuItem key={index} value={pilihan} disabled={!pilihan}>
                          {pilihan || `Pilihan ${index + 1} (kosong)`}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.jawabanBenar && <FormHelperText>{errors.jawabanBenar}</FormHelperText>}
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                textTransform: 'none',
                color: '#a0aec0',
                borderColor: '#a0aec0',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(160, 174, 192, 0.1)',
                  borderColor: '#a0aec0',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#2b6cb0',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(43, 108, 176, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#2c5282',
                  boxShadow: '0 6px 16px rgba(43, 108, 176, 0.3)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  bgcolor: '#4a5568',
                  color: '#ffffff',
                  boxShadow: 'none',
                },
              }}
            >
              {loading ? 'Menyimpan...' : 'Simpan Kuis'}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AddKuisModal;