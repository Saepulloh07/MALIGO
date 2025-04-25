import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ConfirmEmailPage from '../pages/auth/ConfirmEmailPage';
import RegisterSuccessPage from '../pages/auth/RegisterSuccessPage';
import LandingPage from '../pages/landing/LandingPage';
import DashboardDosen from '../pages/dosen/DashboardDosen';
import CourseManagement from '../pages/dosen/pages/CourseManagement';
import StudentProgress from '../pages/dosen/pages/StudentProgress';
import ProfilePage from '../pages/dosen/pages/ProfilePage';
import DashboardMahasiswa from '../pages/mahasiswa/DashboardMahasiswa';
import EnrolledCourses from '../pages/mahasiswa/pages/EnrolledCourses';
import CourseDetail from '../pages/mahasiswa/pages/CourseDetail';
import MeetingDetail from '../pages/mahasiswa/components/MeetingDetail';
import Assignments from '../pages/mahasiswa/pages/Assignments';
import DosenLayout from '../layouts/DosenLayout';
import MahasiswaLayout from '../layouts/MahasiswaLayout';
import NotFound from '../pages/NotFound';

console.log('Rendering AppRoutes'); // Debug

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register-success" element={<RegisterSuccessPage />} />
      <Route path="/email-confirmation" element={<ConfirmEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Role-Based Redirect Route */}
      <Route path="/dashboard" element={<PrivateRoute />} />

      {/* Dosen Routes */}
      <Route
        path="/dosen/*"
        element={
          <PrivateRoute requiredRole="dosen">
            <DosenLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardDosen />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Mahasiswa Routes */}
      <Route
        path="/mahasiswa/*"
        element={
          <PrivateRoute requiredRole="mahasiswa">
            <MahasiswaLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardMahasiswa />} />
        <Route path="courses" element={<EnrolledCourses />} />
        <Route path="courses/:code" element={<CourseDetail />}>
          <Route path="pertemuan/:meetingNumber" element={<MeetingDetail />} />
        </Route>
        <Route path="assignments" element={<Assignments />} />
      </Route>

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <PrivateRoute requiredRole="admin">
            <NotFound /> {/* Replace with AdminDashboard if needed */}
          </PrivateRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;