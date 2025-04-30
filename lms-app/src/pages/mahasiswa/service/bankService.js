/**
 * Service functions for interacting with the thesis bank API
 */
const API_BASE_URL = 'http://localhost:1337/api'; // Sesuaikan jika backend di host lain

/**
 * Fetch all theses with pagination and filters
 * @param {number} page - Current page number
 * @param {number} itemsPerPage - Number of items per page
 * @param {Object} filters - Filter parameters (keyword, program, year, category, sortBy)
 * @returns {Promise<Object>} - Object containing theses data, totalPages, and totalItems
 */
export const fetchAllTheses = async (page = 1, itemsPerPage = 10, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      'pagination[page]': page,
      'pagination[pageSize]': itemsPerPage,
      'filters[title][$containsi]': filters.keyword || '',
      'filters[program_studi][nama][$eq]': filters.program || '', // Filter pada nama program_studi
      'filters[year][$eq]': filters.year || '',
      'filters[category][$eq]': filters.category || '',
      'sort': filters.sortBy === 'newest' ? 'createdAt:desc' : 'createdAt:asc',
      'populate': '*' // Populate semua relasi (file, program_studi)
    });

    const url = `${API_BASE_URL}/theses?${queryParams}`;
    console.log('Fetching theses from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Aktifkan jika autentikasi diperlukan
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch theses: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const theses = data.data.map(item => ({
      id: item.id,
      title: item.title,
      author: item.author,
      year: item.year,
      program: item.program_studi?.nama || '', // Ambil nama dari program_studi
      category: item.category,
      file: item.file?.url ? `http://localhost:1337${item.file.url}` : null, // Tambahkan base URL untuk file
      abstract: item.abstract ? JSON.stringify(item.abstract) : '' // Konversi ke string jika digunakan
    }));

    return {
      data: theses,
      totalPages: data.meta?.pagination?.pageCount || 1,
      totalItems: data.meta?.pagination?.total || 0,
    };
  } catch (error) {
    console.error('Error in fetchAllTheses:', error);
    throw error;
  }
};

/**
 * Search theses based on filters
 * @param {Object} filters - Filter parameters (keyword, program, year, category, sortBy)
 * @returns {Promise<Object>} - Object containing theses data
 */
export const searchTheses = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      'filters[title][$containsi]': filters.keyword || '',
      'filters[program_studi][nama][$eq]': filters.program || '',
      'filters[year][$eq]': filters.year || '',
      'filters[category][$eq]': filters.category || '',
      'sort': filters.sortBy === 'newest' ? 'createdAt:desc' : 'createdAt:asc',
      'populate': '*'
    });

    const url = `${API_BASE_URL}/theses/search?${queryParams}`;
    console.log('Searching theses from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to search theses: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const theses = data.data.map(item => ({
      id: item.id,
      title: item.title,
      author: item.author,
      year: item.year,
      program: item.program_studi?.nama || '',
      category: item.category,
      file: item.file?.url ? `http://localhost:1337${item.file.url}` : null,
      abstract: item.abstract ? JSON.stringify(item.abstract) : ''
    }));

    return {
      data: theses,
    };
  } catch (error) {
    console.error('Error in searchTheses:', error);
    throw error;
  }
};

/**
 * Download a thesis by its ID
 * @param {string} thesisId - ID of the thesis to download
 * @returns {Promise<void>}
 */
export const downloadThesis = async (thesisId) => {
  try {
    const url = `${API_BASE_URL}/theses/${thesisId}?populate=*`;
    console.log('Fetching thesis for download:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch thesis: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const fileUrl = data.data.file?.url;
    if (!fileUrl) {
      throw new Error('No file found for this thesis');
    }

    // Download file
    const fileResponse = await fetch(`http://localhost:1337${fileUrl}`);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await fileResponse.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = `thesis_${thesisId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlBlob);
  } catch (error) {
    console.error('Error in downloadThesis:', error);
    throw error;
  }
};