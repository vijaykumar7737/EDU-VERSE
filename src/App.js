import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import UsersList from './pages/admin/Users';
import CoursesList from './pages/admin/Courses';
import CourseDetails from './pages/CourseDetails';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Register />} />
        
        {/* Protected Routes */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/*" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <UsersList />
          </ProtectedRoute>
        } />
        
        <Route path="/courses" element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <CoursesList />
          </ProtectedRoute>
        } />
        
        <Route path="/course/:id" element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <CourseDetails />
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;