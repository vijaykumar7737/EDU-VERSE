import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaBook, FaUser, FaCalendarAlt, FaEye } from 'react-icons/fa';
import { courseAPI } from '../../api';

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    setFilteredCourses(
      courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourses();
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(courseId);
      await courseAPI.enrollInCourse(courseId);
      // Refresh courses to get updated enrollment status
      await fetchCourses();
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError(err.response?.data?.msg || 'Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (course) => {
    const currentUserId = localStorage.getItem('userId'); // Assuming user ID is stored in localStorage
    return course.enrolledStudents?.some(student => 
      student.student === currentUserId || student === currentUserId
    );
  };

  return (
    <Container fluid className="py-4 px-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-2">Browse Courses</h1>
          <p className="text-muted">Discover new courses and expand your knowledge</p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col md={8} lg={6} xl={4}>
          <InputGroup>
            <Form.Control
              placeholder="Search courses by title, instructor, or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="primary">
              <FaSearch />
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading courses...</span>
          </Spinner>
        </div>
      ) : (
        <Row className="g-4">
          {filteredCourses.length === 0 ? (
            <Col>
              <div className="text-center py-5">
                <h4>No courses found</h4>
                <p className="text-muted">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No courses are available at the moment.'}
                </p>
              </div>
            </Col>
          ) : (
            filteredCourses.map(course => (
              <Col md={6} lg={4} key={course._id}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary rounded p-2 me-3">
                        <FaBook className="text-white" />
                      </div>
                      <h5 className="mb-0">{course.title}</h5>
                    </div>
                    
                    <Badge bg="light" text="dark" className="mb-3 text-capitalize">{course.category}</Badge>
                    
                    <p className="text-muted small mb-3">{course.description}</p>
                    
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaUser className="text-muted me-2" size={14} />
                        <small className="text-muted">{course.instructor?.name || 'Unknown Instructor'}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <FaCalendarAlt className="text-muted me-2" size={14} />
                        <small className="text-muted">
                          {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    
                    <div className="d-flex gap-2 mb-2">
                      <Button 
                        as={Link}
                        to={`/course/${course._id}`}
                        variant="outline-info" 
                        size="sm"
                        className="flex-grow-1"
                      >
                        <FaEye className="me-1" />
                        View Details
                      </Button>
                    </div>
                    
                    {isEnrolled(course) ? (
                      <Button variant="success" disabled className="w-100">
                        Enrolled
                      </Button>
                    ) : (
                      <Button 
                        variant="outline-primary" 
                        className="w-100"
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrolling === course._id}
                      >
                        {enrolling === course._id ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
    </Container>
  );
};

export default BrowseCourses;