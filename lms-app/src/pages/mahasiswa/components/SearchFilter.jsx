import React, { useState } from 'react';
import { Box, TextField, MenuItem, Select, InputLabel, FormControl, Button } from '@mui/material';

const SearchFilter = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
  };

  const handleSearch = () => {
    onFilterChange(localFilters);
  };

  return (
    <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      <TextField
        name="keyword"
        label="Cari Skripsi"
        value={localFilters.keyword}
        onChange={handleChange}
        sx={{ minWidth: 200 }}
      />
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Program Studi</InputLabel>
        <Select
          name="program"
          value={localFilters.program}
          onChange={handleChange}
          label="Program Studi"
        >
          <MenuItem value="">Semua</MenuItem>
          <MenuItem value="teknik_informatika">Teknik Informatika</MenuItem>
          <MenuItem value="sistem_informasi">Sistem Informasi</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Tahun</InputLabel>
        <Select
          name="year"
          value={localFilters.year}
          onChange={handleChange}
          label="Tahun"
        >
          <MenuItem value="">Semua</MenuItem>
          <MenuItem value="2023">2023</MenuItem>
          <MenuItem value="2024">2024</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Kategori</InputLabel>
        <Select
          name="category"
          value={localFilters.category}
          onChange={handleChange}
          label="Kategori"
        >
          <MenuItem value="">Semua</MenuItem>
          <MenuItem value="ai">Kecerdasan Buatan</MenuItem>
          <MenuItem value="web">Pengembangan Web</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" onClick={handleSearch}>
        Cari
      </Button>
    </Box>
  );
};

export default SearchFilter;