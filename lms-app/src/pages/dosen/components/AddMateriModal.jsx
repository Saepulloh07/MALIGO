import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  YouTube as YouTubeIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Link as LinkIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import LoadingScreen from '../../../routes/LoadingScreen';
import { createMateri, getPertemuanList, getMateriList, uploadFile } from '../utils/CourseService';

// Professional color palette
const theme = {
  primary: '#1976d2',
  secondary: '#f5f5f5',
  accent: '#ffd700',
  text: '#1a202c',
  border: '#e0e0e0',
  error: '#d32f2f',
};

// Transform Tiptap JSON to Strapi-compatible format
const transformTiptapToStrapi = (tiptapJson) => {
  const transformNode = (node) => {
    const transformed = { ...node };
    if (node.content) {
      transformed.children = node.content.map(transformNode);
      delete transformed.content;
    }
    if (node.attrs?.level) {
      transformed.level = node.attrs.level;
      delete transformed.attrs;
    }
    if (node.marks) {
      node.marks.forEach((mark) => {
        if (mark.type === 'bold') transformed.bold = true;
        if (mark.type === 'italic') transformed.italic = true;
        if (mark.type === 'link') {
          transformed.type = 'link';
          transformed.url = mark.attrs.href;
        }
      });
      delete transformed.marks;
    }
    if (node.type === 'bulletList') transformed.type = 'list-unordered';
    if (node.type === 'orderedList') transformed.type = 'list-ordered';
    if (node.type === 'listItem') transformed.type = 'list-item';
    return transformed;
  };

  return tiptapJson.content
    ? tiptapJson.content.map(transformNode)
    : [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
};

// Convert plain text to Strapi rich text JSON
const textToStrapiJson = (text) => {
  if (!text) {
    return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  }
  return [
    {
      type: 'paragraph',
      children: [{ type: 'text', text }],
    },
  ];
};

// Updated modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  maxWidth: '95vw',
  bgcolor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  p: 4,
  borderRadius: 3,
  border: `1px solid ${theme.border}`,
  maxHeight: '90vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const AddMateriModal = ({ open, onClose, matakuliah, pertemuan, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    matakuliah: matakuliah?.id || '',
    pertemuan: pertemuan?.id || '',
    judul: '',
    deskripsi: '',
    videoYoutubeUrl: '',
    isiTeks: { type: 'doc', content: [] },
    image: null,
    document: null, // New field for document file
  });
  const [pertemuanList, setPertemuanList] = useState([]);
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({
        ...prev,
        isiTeks: editor.getJSON(),
      }));
    },
  });

  useEffect(() => {
    const fetchPertemuanAndMateri = async () => {
      if (matakuliah?.id) {
        setLoading(true);
        try {
          const [pertemuanRes, materiRes] = await Promise.all([
            getPertemuanList(matakuliah.id),
            getMateriList(matakuliah.id),
          ]);
          setPertemuanList(pertemuanRes.data || []);
          setMateriList(materiRes.data || []);
          setFormData((prev) => ({
            ...prev,
            matakuliah: matakuliah.id,
            pertemuan: pertemuan?.id || '',
          }));
        } catch (error) {
          enqueueSnackbar('Gagal mengambil data pertemuan atau materi', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      } else {
        setPertemuanList([]);
        setMateriList([]);
        setFormData((prev) => ({ ...prev, pertemuan: '' }));
      }
    };
    fetchPertemuanAndMateri();
  }, [matakuliah, pertemuan, enqueueSnackbar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image') {
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setErrors((prev) => ({ ...prev, image: 'Hanya file JPEG, PNG, atau GIF yang diizinkan' }));
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: '' }));
    } else if (type === 'document') {
      if (
        ![
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ].includes(file.type)
      ) {
        setErrors((prev) => ({
          ...prev,
          document: 'Hanya file PDF, DOCX, XLSX yang diizinkan',
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, document: file }));
      setErrors((prev) => ({ ...prev, document: '' }));
    }
  };

  const handleHeadingChange = (event, newHeading) => {
    if (!editor) return;
    if (newHeading) {
      editor.chain().focus().toggleHeading({ level: parseInt(newHeading) }).run();
    } else {
      editor.chain().focus().setParagraph().run();
    }
  };

  const handleLink = () => {
    if (!editor) return;
    const url = window.prompt('Masukkan URL:');
    if (url) {
      editor.chain().focus().toggleLink({ href: url }).run();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.matakuliah) newErrors.matakuliah = 'Mata kuliah wajib dipilih';
    if (!formData.pertemuan) newErrors.pertemuan = 'Pertemuan wajib dipilih';
    if (!formData.judul) newErrors.judul = 'Judul wajib diisi';
    if (formData.judul.length > 255) newErrors.judul = 'Judul tidak boleh lebih dari 255 karakter';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      enqueueSnackbar('Harap lengkapi semua field wajib', { variant: 'warning' });
      return;
    }
    try {
      let imageId = null;
      let documentId = null;

      if (formData.image) {
        const uploadResponse = await uploadFile(formData.image);
        imageId = uploadResponse[0]?.id;
      }

      if (formData.document) {
        const uploadResponse = await uploadFile(formData.document);
        documentId = uploadResponse[0]?.id;
      }

      const submitData = {
        judul: formData.judul,
        deskripsi: textToStrapiJson(formData.deskripsi),
        videoYoutubeUrl: formData.videoYoutubeUrl || null,
        isiTeks: transformTiptapToStrapi(formData.isiTeks),
        pertemuan: parseInt(formData.pertemuan),
        fileUrl: imageId || null,
        documentUrl: documentId || null, // New field for document URL
      };
      await createMateri(submitData);
      enqueueSnackbar('Materi berhasil ditambahkan', { variant: 'success' });
      refreshMatakuliah();
      onClose();
      setFormData({
        matakuliah: matakuliah?.id || '',
        pertemuan: pertemuan?.id || '',
        judul: '',
        deskripsi: '',
        videoYoutubeUrl: '',
        isiTeks: { type: 'doc', content: [] },
        image: null,
        document: null,
      });
      setPertemuanList([]);
      setMateriList([]);
      editor?.commands.clearContent();
    } catch (error) {
      console.error('Submission error:', error.response?.data);
      enqueueSnackbar(
        `Gagal menambahkan materi: ${error.response?.data?.error?.message || 'Unknown error'}`,
        { variant: 'error' }
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="add-materi-modal">
      <Box sx={modalStyle}>
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <Typography
              variant="h5"
              id="add-materi-modal"
              sx={{ color: theme.text, fontWeight: 600, mb: 1 }}
            >
              Tambah Materi Baru
            </Typography>
            {!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.id ? (
              <Typography sx={{ color: theme.error, opacity: 0.7 }}>
                Mata kuliah atau pertemuan tidak valid. Silakan pilih dari daftar.
              </Typography>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControl fullWidth error={!!errors.matakuliah}>
                        <InputLabel sx={{ color: theme.text }}>Mata Kuliah</InputLabel>
                        <Select
                          name="matakuliah"
                          value={formData.matakuliah}
                          onChange={handleChange}
                          disabled
                          required
                          sx={{
                            color: theme.text,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <SchoolIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value={matakuliah.id}>
                            {matakuliah.attributes?.nama || matakuliah.nama}
                          </MenuItem>
                        </Select>
                        {errors.matakuliah && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            {errors.matakuliah}
                          </Typography>
                        )}
                      </FormControl>

                      <FormControl fullWidth error={!!errors.pertemuan}>
                        <InputLabel sx={{ color: theme.text }}>Pertemuan</InputLabel>
                        <Select
                          name="pertemuan"
                          value={formData.pertemuan}
                          onChange={handleChange}
                          disabled
                          required
                          sx={{
                            color: theme.text,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <EventIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value={pertemuan.id}>
                            {pertemuan.attributes?.topik || pertemuan.topik} (Pertemuan{' '}
                            {pertemuan.attributes?.pertemuanKe || pertemuan.pertemuanKe})
                          </MenuItem>
                        </Select>
                        {errors.pertemuan && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            {errors.pertemuan}
                          </Typography>
                        )}
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Judul"
                        name="judul"
                        value={formData.judul}
                        onChange={handleChange}
                        required
                        error={!!errors.judul}
                        helperText={errors.judul || 'Masukkan judul materi (misal: Pengenalan AI)'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TitleIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: theme.primary },
                            '&.Mui-focused fieldset': { borderColor: theme.primary },
                          },
                          input: { color: theme.text },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Deskripsi"
                        name="deskripsi"
                        multiline
                        rows={3}
                        value={formData.deskripsi}
                        onChange={handleChange}
                        helperText="Masukkan deskripsi singkat materi"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: theme.primary },
                            '&.Mui-focused fieldset': { borderColor: theme.primary },
                          },
                          textarea: { color: theme.text },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="URL Video YouTube"
                        name="videoYoutubeUrl"
                        value={formData.videoYoutubeUrl}
                        onChange={handleChange}
                        helperText="Masukkan URL video YouTube (opsional)"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <YouTubeIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: theme.primary },
                            '&.Mui-focused fieldset': { borderColor: theme.primary },
                          },
                          input: { color: theme.text },
                        }}
                      />

                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: theme.text, fontWeight: 500 }}>
                          Isi Teks
                        </Typography>
                        <Box
                          sx={{
                            border: `1px solid ${theme.border}`,
                            borderRadius: 2,
                            bgcolor: '#fff',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              borderBottom: `1px solid ${theme.border}`,
                              p: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              bgcolor: theme.secondary,
                            }}
                          >
                            <ToggleButtonGroup
                              value={
                                editor?.isActive('heading')
                                  ? editor.getAttributes('heading').level?.toString()
                                  : editor?.isActive('paragraph')
                                  ? ''
                                  : ''
                              }
                              exclusive
                              onChange={handleHeadingChange}
                              size="small"
                              sx={{ bgcolor: '#fff', borderRadius: 1 }}
                            >
                              <ToggleButton value="" sx={{ color: theme.text, '&.Mui-selected': { bgcolor: theme.primary, color: '#fff' } }}>
                                P
                              </ToggleButton>
                              <ToggleButton value="1" sx={{ color: theme.text, '&.Mui-selected': { bgcolor: theme.primary, color: '#fff' } }}>
                                H1
                              </ToggleButton>
                              <ToggleButton value="2" sx={{ color: theme.text, '&.Mui-selected': { bgcolor: theme.primary, color: '#fff' } }}>
                                H2
                              </ToggleButton>
                              <ToggleButton value="3" sx={{ color: theme.text, '&.Mui-selected': { bgcolor: theme.primary, color: '#fff' } }}>
                                H3
                              </ToggleButton>
                            </ToggleButtonGroup>
                            <IconButton
                              onClick={() => editor?.chain().focus().toggleBold().run()}
                              sx={{ color: editor?.isActive('bold') ? theme.primary : theme.text }}
                            >
                              <FormatBoldIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => editor?.chain().focus().toggleItalic().run()}
                              sx={{ color: editor?.isActive('italic') ? theme.primary : theme.text }}
                            >
                              <FormatItalicIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => editor?.chain().focus().toggleBulletList().run()}
                              sx={{ color: editor?.isActive('bulletList') ? theme.primary : theme.text }}
                            >
                              <FormatListBulletedIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                              sx={{ color: editor?.isActive('orderedList') ? theme.primary : theme.text }}
                            >
                              <FormatListNumberedIcon />
                            </IconButton>
                            <IconButton
                              onClick={handleLink}
                              sx={{ color: editor?.isActive('link') ? theme.primary : theme.text }}
                            >
                              <LinkIcon />
                            </IconButton>
                          </Box>
                          <EditorContent
                            editor={editor}
                            style={{
                              padding: '16px',
                              minHeight: '150px',
                              color: theme.text,
                              backgroundColor: '#fff',
                              borderRadius: '0 0 8px 8px',
                              '& .ProseMirror': {
                                outline: 'none',
                              },
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ mt: 1, color: theme.text, opacity: 0.7 }}>
                          Gunakan toolbar untuk memformat teks (bold, italic, heading, dll)
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<ImageIcon />}
                        sx={{
                          borderColor: theme.border,
                          color: theme.primary,
                          '&:hover': {
                            borderColor: theme.primary,
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                          },
                        }}
                      >
                        Unggah Gambar (Opsional)
                        <input
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/gif"
                          onChange={(e) => handleFileChange(e, 'image')}
                        />
                      </Button>
                      {formData.image && (
                        <Typography variant="caption" sx={{ color: theme.text }}>
                          File gambar terpilih: {formData.image.name}
                        </Typography>
                      )}
                      {errors.image && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors.image}
                        </Typography>
                      )}

                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AttachFileIcon />}
                        sx={{
                          borderColor: theme.border,
                          color: theme.primary,
                          '&:hover': {
                            borderColor: theme.primary,
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                          },
                        }}
                      >
                        Unggah Dokumen (PDF, DOCX, XLSX) (Opsional)
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          onChange={(e) => handleFileChange(e, 'document')}
                        />
                      </Button>
                      {formData.document && (
                        <Typography variant="caption" sx={{ color: theme.text }}>
                          File dokumen terpilih: {formData.document.name}
                        </Typography>
                      )}
                      {errors.document && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors.document}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: theme.text, fontWeight: 500 }}>
                      Daftar Materi
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 2, color: theme.text, opacity: 0.7, display: 'block' }}>
                      Materi yang telah ditambahkan untuk mata kuliah ini
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 400,
                        overflowY: 'auto',
                        border: `1px solid ${theme.border}`,
                        borderRadius: 2,
                        p: 2,
                        bgcolor: theme.secondary,
                      }}
                    >
                      {materiList.length === 0 ? (
                        <Typography sx={{ color: theme.text, opacity: 0.7 }}>
                          Belum ada materi untuk mata kuliah ini
                        </Typography>
                      ) : (
                        materiList.map((materi) => (
                          <Box
                            key={materi.id}
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: '#fff',
                              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' },
                            }}
                          >
                            <Typography variant="body2" sx={{ color: theme.text }}>
                              {materi.attributes?.judul || materi.judul} (
                              {materi.attributes?.pertemuan?.data?.attributes?.topik || materi.pertemuan?.topik})
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    onClick={onClose}
                    startIcon={<CancelIcon />}
                    variant="outlined"
                    sx={{
                      color: theme.text,
                      borderColor: theme.border,
                      '&:hover': { bgcolor: theme.secondary },
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={
                      !formData.matakuliah ||
                      !formData.pertemuan ||
                      !formData.judul ||
                      !!errors.judul
                    }
                    sx={{
                      bgcolor: theme.primary,
                      '&:hover': { bgcolor: '#1565c0' },
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                      '&.Mui-disabled': { bgcolor: '#bdbdbd', color: '#fff' },
                    }}
                  >
                    Simpan
                  </Button>
                </Box>
              </form>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

export default AddMateriModal;