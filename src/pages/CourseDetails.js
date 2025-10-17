import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Tab, Tabs } from 'react-bootstrap';
import { FaArrowLeft, FaBook, FaUser, FaCalendarAlt, FaUsers, FaClipboardList, FaFileAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { courseAPI, materialAPI, assignmentAPI } from '../api';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch course details
      const courseResponse = await courseAPI.getCourse(id);
      setCourse(courseResponse.data);
      
      // Fetch course materials
      try {
        const materialsResponse = await materialAPI.getMaterials(id);
        setMaterials(materialsResponse.data);
      } catch (err) {
        console.log('No materials found for this course');
        setMaterials([]);
      }
      
      // Fetch course assignments
      try {
        const assignmentsResponse = await assignmentAPI.getAssignments(id);
        setAssignments(assignmentsResponse.data);
      } catch (err) {
        console.log('No assignments found for this course');
        setAssignments([]);
      }
      
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError(err.response?.data?.msg || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await courseAPI.enrollInCourse(id);
      // Refresh course details to get updated enrollment status
      await fetchCourseDetails();
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError(err.response?.data?.msg || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = () => {
    if (!course || !user) return false;
    return course.enrolledStudents?.some(student => 
      student.student === user._id || student === user._id
    );
  };

  const isInstructor = () => {
    if (!course || !user) return false;
    return course.instructor === user._id || course.instructor?._id === user._id;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading course details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h5>Error Loading Course</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h5>Course Not Found</h5>
          <p>The course you're looking for doesn't exist or has been removed.</p>
          <Button variant="outline-warning" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Button variant="link" className="p-0 mb-3" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" />
            Back
          </Button>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="mb-2">{course.title}</h1>
              <Badge bg="primary" className="mb-3 text-capitalize">{course.category}</Badge>
            </div>
            {user?.role === 'student' && !isInstructor() && (
              <div>
                {isEnrolled() ? (
                  <Button variant="success" disabled>
                    <FaBook className="me-2" />
                    Enrolled
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Course Info Cards */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">Course Description</h5>
              <p className="text-muted">{course.description}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Course Information</h6>
              
              <div className="d-flex align-items-center mb-3">
                <FaUser className="text-primary me-2" />
                <div>
                  <small className="text-muted d-block">Instructor</small>
                  <span>{course.instructor?.name || 'Unknown Instructor'}</span>
                </div>
              </div>
              
              <div className="d-flex align-items-center mb-3">
                <FaCalendarAlt className="text-primary me-2" />
                <div>
                  <small className="text-muted d-block">Duration</small>
                  <span>{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                </div>
              </div>
              
              <div className="d-flex align-items-center mb-3">
                <FaUsers className="text-primary me-2" />
                <div>
                  <small className="text-muted d-block">Enrolled Students</small>
                  <span>{course.enrolledStudents?.length || 0} students</span>
                </div>
              </div>
              
              <div className="d-flex align-items-center mb-3">
                <FaClipboardList className="text-primary me-2" />
                <div>
                  <small className="text-muted d-block">Assignments</small>
                  <span>{assignments.length} assignments</span>
                </div>
              </div>
              
              <div className="d-flex align-items-center">
                <FaFileAlt className="text-primary me-2" />
                <div>
                  <small className="text-muted d-block">Materials</small>
                  <span>{materials.length} files</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for detailed content */}
      <Row>
        <Col>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="overview" title="Overview">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Course Overview</h5>
                  <p className="text-muted mb-4">{course.description}</p>
                  
                  <h6 className="mb-3">What you'll learn:</h6>
                  <ul className="text-muted">
                    <li>Comprehensive understanding of {course.title}</li>
                    <li>Practical skills through assignments and projects</li>
                    <li>Access to course materials and resources</li>
                    <li>Interaction with instructor and fellow students</li>
                  </ul>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="materials" title={`Materials (${materials.length})`}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Course Materials</h5>
                  {materials.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {materials.map((material, index) => (
                        <div key={material._id || index} className="list-group-item border-0 px-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{material.title || `Material ${index + 1}`}</h6>
                              <small className="text-muted">{material.description || 'No description available'}</small>
                            </div>
                            <Button
                              as="a"
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="outline-primary"
                              size="sm"
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No materials available for this course yet.</p>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="assignments" title={`Assignments (${assignments.length})`}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Course Assignments</h5>
                  {assignments.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {assignments.map((assignment, index) => (
                        <div key={assignment._id || index} className="list-group-item border-0 px-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{assignment.title || `Assignment ${index + 1}`}</h6>
                              <p className="mb-1 text-muted">{assignment.description || 'No description available'}</p>
                              {assignment.dueDate && (
                                <small className="text-muted">
                                  Due: {formatDate(assignment.dueDate)}
                                </small>
                              )}
                            </div>
                            {isEnrolled() && (
                              <Button variant="outline-primary" size="sm">
                                View Assignment
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No assignments available for this course yet.</p>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetails;