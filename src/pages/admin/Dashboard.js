import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Home from './Home';
import Users from './Users';
import Courses from './Courses';
import Assignments from './Assignments';
import Reports from './Reports';
import Settings from './Settings';

const Dashboard = () => {
  return (
    <div className="d-flex">
      <Sidebar role="admin" />
      <div className="flex-grow-1 content-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;