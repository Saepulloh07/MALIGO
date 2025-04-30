import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';

const ThesisDetail = ({ thesis, onDownload }) => {
  return (
    <Card sx={{ bgcolor: 'grey.100', borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {thesis.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Penulis: {thesis.author}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Tahun: {thesis.year}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Program Studi: {thesis.program}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Kategori: {thesis.category}
        </Typography>
        <Typography variant="body2" paragraph>
          {thesis.abstract}
        </Typography>
        <Button
          variant="contained"
          onClick={() => onDownload(thesis.id)}
          fullWidth
        >
          Unduh Skripsi
        </Button>
      </CardContent>
    </Card>
  );
};

export default ThesisDetail;