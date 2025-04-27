const API_BASE_URL = 'http://localhost:1337/api';

const getAuthHeaders = (token) => {
  if (!token) {
    console.warn('No authentication token provided. API requests may fail.');
  }
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

export const fetchCourses = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/matakuliahs?populate[pertemuans]=true&populate[dosens]=true&populate[program_studi]=true`,
    {
      headers: getAuthHeaders(token),
    }
  );
  const data = await handleResponse(response);
  console.log('Courses Response:', data);
  return data;
};

export const fetchQuizzes = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/kuises?populate[pertemuan][populate][matakuliah]=true&populate[soal_kuis]=true`,
    {
      headers: getAuthHeaders(token),
    }
  );
  const data = await handleResponse(response);
  console.log('Quizzes Response:', data);
  return data;
};

export const fetchQuizAnswers = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/jawaban-kuises?populate[soal_kui][populate][kuis][populate][pertemuan][populate][matakuliah]=true&populate[mahasiswa]=true`,
    {
      headers: getAuthHeaders(token),
    }
  );
  const data = await handleResponse(response);
  console.log('Quiz Answers Response:', data);
  return data;
};

export const updateQuizAnswerGrade = async (documentId, grade, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jawaban-kuises/${documentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        data: { nilai: grade },
      }),
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error updating quiz answer grade:', error);
    throw error;
  }
};

const handleResponse = async (response) => {
  console.log('API Response Status:', response.status, response.statusText);
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    throw new Error(`API error: ${error.error?.message || 'Unknown error'}`);
  }
  const data = await response.json();
  console.log('API Response Data:', data);
  return data;
};