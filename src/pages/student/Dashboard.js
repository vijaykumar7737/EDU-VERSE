import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../../components/Sidebar';
import StudentHome from './Home';
import MyCourses from './MyCourses';
import BrowseCourses from './BrowseCourses';
import Assignments from './Assignments';
import Discussions from './Discussions';
import Profile from './Profile';

const StudentDashboard = () => {
  
  return (
    <Container fluid className="p-0 vh-100">
      <Row className="g-0 h-100">
        <Col md={3} lg={2} className="d-none d-md-block">
          <Sidebar role="student" />
        </Col>
        <Col md={9} lg={10} className="bg-light">
          <Routes>
            <Route path="/" element={<StudentHome />} />
            <Route path="/dashboard" element={<StudentHome />} />
            <Route path="/courses" element={<MyCourses />} />
            <Route path="/browse-courses" element={<BrowseCourses />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/discussions" element={<Discussions />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDashboard;