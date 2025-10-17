import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { courseAPI } from '../../api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseAPI.getCourses();
        setCourses(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatus = (course) => {
    const now = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'active';
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Course Management</h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading courses...</span>
          </Spinner>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Instructor</th>
              <th>Category</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Enrolled Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No courses found. Teachers can create courses to get started.
                </td>
              </tr>
            ) : (
              courses.map(course => {
                const status = getStatus(course);
                return (
                  <tr key={course._id}>
                    <td>{course.title}</td>
                    <td>{course.instructor?.name || 'Unknown'}</td>
                    <td>
                      <Badge bg="info" className="text-capitalize">
                        {course.category}
                      </Badge>
                    </td>
                    <td>{formatDate(course.startDate)}</td>
                    <td>{formatDate(course.endDate)}</td>
                    <td>{course.enrolledStudents?.length || 0}</td>
                    <td>
                      <Badge bg={
                        status === 'active' ? 'success' : 
                        status === 'upcoming' ? 'warning' : 'secondary'
                      }>
                        {status}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2">
                        View Details
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Courses;