import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api';

// Fetch students filtered by program_studi and semester
export const fetchStudents = async (programStudi, semester) => {
  try {
    let programStudiId;
    if (typeof programStudi === 'object' && programStudi?.id) {
      programStudiId = programStudi.id;
    } else if (typeof programStudi === 'number' || (typeof programStudi === 'string' && !isNaN(programStudi))) {
      programStudiId = parseInt(programStudi, 10);
    } else {
      throw new Error('Invalid program_studi: ID is missing or invalid');
    }

    const response = await axios.get(`${API_URL}/mahasiswas`, {
      params: {
        'filters[program_studi][id][$eq]': programStudiId,
        'filters[semester][$eq]': semester,
        'populate': 'program_studi',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching students:', error.response?.data || error.message);
    throw new Error(error.message || 'Gagal memuat daftar mahasiswa');
  }
};

// Search students by name or NIM
export const searchStudents = async (programStudi, semester, query) => {
  try {
    let programStudiId;
    if (typeof programStudi === 'object' && programStudi?.id) {
      programStudiId = programStudi.id;
    } else if (typeof programStudi === 'number' || (typeof programStudi === 'string' && !isNaN(programStudi))) {
      programStudiId = parseInt(programStudi, 10);
    } else {
      throw new Error('Invalid program_studi: ID is missing or invalid');
    }

    const response = await axios.get(`${API_URL}/mahasiswas`, {
      params: {
        'filters[program_studi][id][$eq]': programStudiId,
        'filters[semester][$eq]': semester,
        'filters[$or][0][namaLengkap][$containsi]': query,
        'filters[$or][1][nim][$containsi]': query,
        'populate': 'program_studi',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error searching students:', error.response?.data || error.message);
    throw new Error(error.message || 'Gagal mencari mahasiswa');
  }
};

// Fetch invited students for a matakuliah
export const fetchInvitedStudents = async (matakuliahId) => {
  try {
    const response = await axios.get(`${API_URL}/undangan-mahasiswas`, {
      params: {
        'filters[matakuliah][id][$eq]': matakuliahId,
        'populate[mahasiswa][fields][0]': 'nim',
        'populate[mahasiswa][fields][1]': 'namaLengkap',
        'populate[mahasiswa][fields][2]': 'semester',
      },
    });
    console.log('Invited students response:', JSON.stringify(response.data, null, 2));
    return response.data.data.filter((invited) => invited.attributes.mahasiswa?.data);
  } catch (error) {
    console.error('Error fetching invited students:', error.response?.data || error.message);
    throw new Error('Gagal memuat daftar mahasiswa yang diundang');
  }
};

// Invite students to a matakuliah
export const inviteStudents = async (matakuliahId, studentIds, diundangOleh) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const diundangOlehId = user?.id;

    const promises = studentIds.map((studentId) =>
      axios.post(`${API_URL}/undangan-mahasiswas`, {
        data: {
          matakuliah: matakuliahId,
          mahasiswa: studentId,
          status_class: 'pending',
          diundang_oleh: diundangOlehId,
          tanggalUndangan: new Date().toISOString(),
        },
      })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Error inviting students:', error.response?.data || error.message);
    throw new Error('Gagal mengundang mahasiswa');
  }
};