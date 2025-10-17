import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Home from './Home';
import MyCourses from './MyCourses';
import CreateCourse from './CreateCourse';
import Assignments from './Assignments';
import Students from './Students';
import Profile from './Profile';

const Dashboard = () => {
  return (
    <div className="d-flex">
      <Sidebar role="teacher" />
      <div className="flex-grow-1 content-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<MyCourses />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/students" element={<Students />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/teacher" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;