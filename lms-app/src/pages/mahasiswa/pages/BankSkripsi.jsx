import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchAllTheses,
  searchTheses,
  downloadThesis
}  from '../service/bankService';
import SearchFilter from '../components/SearchFilter';
import ThesisList from '../components/ThesisList';
import ThesisDetail from '../components/ThesisDetail';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../../../routes/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  keyframes 
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

const BankSkripsi = () => {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [filters, setFilters] = useState({
    keyword: '',
    program: '',
    year: '',
    category: '',
    sortBy: 'newest'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();

  // Fetch theses on component mount and when filters change
  useEffect(() => {
    const loadTheses = async () => {
      try {
        setLoading(true);
        const response = await fetchAllTheses(
          pagination.currentPage,
          pagination.itemsPerPage,
          filters
        );
        setTheses(response.data);
        setPagination({
          ...pagination,
          totalPages: response.totalPages,
          totalItems: response.totalItems
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching theses:', err);
        setError(`Gagal memuat data skripsi: ${err.message}. Silakan coba lagi atau hubungi admin.`);
        setTheses([]);
      } finally {
        setLoading(false);
      }
    };

    loadTheses();
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  // Handle search and filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({...filters, ...newFilters});
    setPagination({...pagination, currentPage: 1});
  };

  // Handle thesis selection
  const handleThesisSelect = (thesis) => {
    setSelectedThesis(thesis);
  };

  // Handle thesis download
  const handleDownload = async (thesisId) => {
    try {
      setLoading(true);
      await downloadThesis(thesisId);
      setError(null);
    } catch (err) {
      console.error('Error downloading thesis:', err);
      setError(`Gagal mengunduh skripsi: ${err.message}. Silakan coba lagi.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination change
  const handlePageChange = (pageNumber) => {
    setPagination({...pagination, currentPage: pageNumber});
  };

  // Handle sidebar toggle
  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e2b' }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="mahasiswa" />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            mt: 8,
            ml: { xs: 0, sm: sidebarOpen ? '260px' : '0px' },
            transition: 'margin-left 0.3s ease-in-out',
            width: { xs: '100%', sm: `calc(100% - ${sidebarOpen ? '260px' : '70px'})` },
          }}
        >
          <Header title="Bank Skripsi" />
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            {/* Header Section */}
            <Card
              sx={{
                borderRadius: 2,
                bgcolor: '#050D31',
                color: '#FFFFFF',
                animation: `${neonGlow} 2s infinite`,
                border: '1px solid #efbf04',
                mb: 4,
              }}
            >
              <CardContent>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, fontFamily: '"Orbitron", sans-serif', mb: 1 }}
                >
                  Bank Skripsi
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.7 }}>
                  Akses dan jelajahi koleksi skripsi mahasiswa dari berbagai program studi
                </Typography>
              </CardContent>
            </Card>

            {/* Search Filter */}
            <SearchFilter 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />

            {/* Error Alert */}
            {error && <ErrorAlert message={error} />}

            {/* Loading Spinner or Content */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <LoadingSpinner />
              </Box>
            ) : theses.length === 0 ? (
              <Card
                sx={{
                  borderRadius: 2,
                  bgcolor: '#050D31',
                  color: '#FFFFFF',
                  border: '1px solid #efbf04',
                  textAlign: 'center',
                  p: 4,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}
                  >
                    Tidak ada data
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: '#FFFFFF', opacity: 0.7, mt: 1 }}
                  >
                    Tidak ada skripsi yang ditemukan dengan filter saat ini.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {/* Thesis List */}
                <Grid item xs={12} lg={8}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      bgcolor: '#050D31',
                      color: '#FFFFFF',
                      border: '1px solid #efbf04',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        animation: `${neonGlow} 1.5s infinite`,
                      },
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h4"
                        sx={{ mb: 2, fontFamily: '"Orbitron", sans-serif', color: '#FFFFFF' }}
                      >
                        Daftar Skripsi
                      </Typography>
                      <ThesisList 
                        theses={theses}
                        onThesisSelect={handleThesisSelect}
                        selectedThesisId={selectedThesis?.id}
                      />
                      <Pagination 
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Thesis Detail */}
                <Grid item xs={12} lg={4}>
                  {selectedThesis ? (
                    <Card
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#050D31',
                        color: '#FFFFFF',
                        border: '1px solid #efbf04',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          animation: `${neonGlow} 1.5s infinite`,
                        },
                      }}
                    >
                      <CardContent>
                        <ThesisDetail 
                          thesis={selectedThesis} 
                          onDownload={handleDownload} 
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <Card
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#050D31',
                        color: '#FFFFFF',
                        border: '1px solid #efbf04',
                        textAlign: 'center',
                        p: 2,
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="body1"
                          sx={{ color: '#FFFFFF', opacity: 0.7 }}
                        >
                          Pilih skripsi untuk melihat detail
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Grid>
              </Grid>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default BankSkripsi;