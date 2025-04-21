import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme/theme';

const EnrolledCourses = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Enrolled Courses
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6">Your Courses</Typography>
          <Typography>Access materials for your enrolled courses.</Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default EnrolledCourses;