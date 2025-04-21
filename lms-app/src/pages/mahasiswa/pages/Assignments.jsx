import React from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme/theme';

const Assignments = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Assignments
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6">Submit Assignments</Typography>
          <Typography>View and submit your assignments.</Typography>
          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            Submit Assignment
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Assignments;