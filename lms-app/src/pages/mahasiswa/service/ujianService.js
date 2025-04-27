const API_BASE_URL = 'http://localhost:1337/api';

export const fetchUjians = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ujians?populate=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ujians:', error);
    throw error;
  }
};