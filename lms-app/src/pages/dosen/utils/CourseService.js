import axios from 'axios';

// Use Vite environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api';

const api = axios.create({
  baseURL: API_URL,
});

export const createMatakuliah = async (data) => {
  try {
    const response = await api.post('/matakuliahs', { data });
    return response.data;
  } catch (error) {
    console.error('Error creating matakuliah:', error.response?.data || error.message);
    throw error;
  }
};

export const getMatakuliahList = async () => {
  try {
    const response = await api.get('/matakuliahs?populate=*');
    return response.data;
  } catch (error) {
    console.error('Error fetching matakuliah list:', error.response?.data || error.message);
    throw error;
  }
};

export const updateMatakuliah = async (documentId, data) => {
  try {
    // Step 1: Fetch the current matakuliah data with all relationships
    console.log(`Fetching matakuliah with URL: ${API_URL}/matakuliahs/${documentId}?populate=*`);
    const currentMatakuliahResponse = await api.get(`/matakuliahs/${documentId}?populate=*`);
    console.log('API response:', JSON.stringify(currentMatakuliahResponse.data, null, 2));

    const currentMatakuliah = currentMatakuliahResponse.data?.data;
    if (!currentMatakuliah) {
      throw new Error(`Invalid matakuliah data received from server: ${JSON.stringify(currentMatakuliahResponse.data)}`);
    }

    // Step 2: Check if kode is unique (excluding the current matakuliah)
    const kodeCheckResponse = await api.get(`/matakuliahs?filters[kode][$eq]=${data.kode}&filters[documentId][$ne]=${documentId}`);
    if (kodeCheckResponse.data.data.length > 0) {
      throw new Error(`Kode ${data.kode} sudah digunakan oleh mata kuliah lain`);
    }

    // Step 3: Prepare the new data, merging updated fields with existing data
    const newData = {
      nama: data.nama,
      kode: data.kode,
      semester: data.semester,
      sks: data.sks,
      dosens: currentMatakuliah.dosens?.map(dosen => dosen.id) || [],
      program_studi: currentMatakuliah.program_studi?.id || null,
      pertemuans: currentMatakuliah.pertemuans?.map(pertemuan => pertemuan.id) || [],
      ujians: currentMatakuliah.ujians?.map(ujian => ujian.id) || [],
      undangan_mahasiswas: currentMatakuliah.undangan_mahasiswas?.map(undangan => undangan.id) || [],
      rekap_nilais: currentMatakuliah.rekap_nilais?.map(rekap => rekap.id) || [],
    };
    // Step 4: Delete the existing matakuliah
    await api.delete(`/matakuliahs/${documentId}`);
    // Step 5: Create a new matakuliah with the merged data
    const response = await api.post('/matakuliahs', { data: newData });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProgramStudiList = async () => {
  try {
    const response = await api.get('/program-studis');
    return response.data;
  } catch (error) {
    console.error('Error fetching program studi list:', error.response?.data || error.message);
    throw error;
  }
};

export const getDosenList = async (programStudiId = '') => {
  try {
    let url = '/dosens?populate[users_permissions_user][fields][0]=username&populate[program_studi][fields][0]=nama';
    if (programStudiId && !isNaN(programStudiId)) {
      url += `&filters[program_studi][id][$eq]=${programStudiId}`;
    }
    console.log('Fetching dosen list with URL:', `${API_URL}${url}`);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching dosen list:', error.response?.data || error.message);
    throw error;
  }
};

export const getMaterisList = async () => {
  try {
    const response = await api.get('/materis?populate=*');
    return response.data;
  } catch (error) {
    console.error('Error fetching materis list:', error.response?.data || error.message);
    throw error;
  }
};

export const createPertemuan = async (data) => {
  try {
    const response = await api.post('/pertemuans', { data });
    return response.data;
  } catch (error) {
    console.error('Error creating pertemuan:', error.response?.data || error.message);
    throw error;
  }
};

export const getPertemuanList = async (matakuliahId = '') => {
  try {
    let url = '/pertemuans?populate[matakuliah][fields][0]=nama';
    if (matakuliahId && !isNaN(matakuliahId)) {
      url += `&filters[matakuliah][id][$eq]=${matakuliahId}`;
    }
    console.log('Fetching pertemuan list with URL:', `${API_URL}${url}`);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching pertemuan list:', error.response?.data || error.message);
    throw error;
  }
};

export const createMateri = async (data) => {
  try {
    console.log('Creating materi with payload:', JSON.stringify(data, null, 2));
    const response = await api.post('/materis', { data });
    return response.data;
  } catch (error) {
    console.error('Error creating materi:', error.response?.data || error.message);
    throw error;
  }
};

export const getMateriList = async (matakuliahId = '') => {
  try {
    let url = '/materis?populate[pertemuan][fields][0]=topik&populate[pertemuan][populate][matakuliah][fields][0]=nama';
    if (matakuliahId && !isNaN(matakuliahId)) {
      url += `&filters[pertemuan][matakuliah][id][$eq]=${matakuliahId}`;
    }
    console.log('Fetching materi list with URL:', `${API_URL}${url}`);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching materi list:', error.response?.data || error.message);
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('files', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error.response?.data || error.message);
    throw error;
  }
};