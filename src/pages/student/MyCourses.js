import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBook, FaUser, FaCalendarAlt, FaEye } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { courseAPI } from '../../api';

const MyCourses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const res = await courseAPI.getCourses();
        const allCourses = res.data || [];
        const userId = user?._id || user?.id;
        const myCourses = allCourses.filter((course) =>
          Array.isArray(course.enrolledStudents) &&
          course.enrolledStudents.some((s) => {
            const sid = typeof s.student === 'string' ? s.student : s.student?._id;
            return sid === userId;
          })
        );
        setCourses(myCourses);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setError('Failed to load enrolled courses');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const getInstructorName = (course) => {
    if (!course?.instructor) return 'N/A';
    if (typeof course.instructor === 'string') return 'Instructor';
    return course.instructor.name || course.instructor.email || 'Instructor';
  };

  const getMyProgress = (course) => {
    const userId = user?._id || user?.id;
    const enr = (course.enrolledStudents || []).find((s) => {
      const sid = typeof s.student === 'string' ? s.student : s.student?._id;
      return sid === userId;
    });
    return enr?.progress ?? 0;
  };

  return (
    <Container fluid className="py-4 px-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-2">My Courses</h1>
          <p className="text-muted">Courses you are currently enrolled in</p>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading your courses...</p>
        </div>
      ) : error ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-5 text-center">
            <div className="mb-3">
              <FaBook size={40} className="text-danger opacity-50" />
            </div>
            <h5 className="text-danger">{error}</h5>
            <Button variant="outline-primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Card.Body>
        </Card>
      ) : courses.length > 0 ? (
        <Row className="g-4">
          {courses.map((course) => (
            <Col md={6} lg={4} key={course._id}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded p-2 me-3">
                      <FaBook className="text-white" />
                    </div>
                    <h5 className="mb-0">{course.title}</h5>
                  </div>

                  <p className="text-muted small mb-3">{course.description}</p>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FaUser className="text-muted me-2" size={14} />
                      <small className="text-muted">{getInstructorName(course)}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="text-muted me-2" size={14} />
                      <small className="text-muted">
                        {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                      </small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Progress</small>
                      <small>{getMyProgress(course)}%</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${getMyProgress(course)}%` }}
                        aria-valuenow={getMyProgress(course)}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button as={Link} to={`/course/${course._id}`} variant="outline-info" size="sm" className="flex-grow-1">
                      <FaEye className="me-1" />
                      View Details
                    </Button>
                    <Button variant="outline-primary" className="flex-grow-1">
                      Continue Learning
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-5 text-center">
            <div className="mb-3">
              <FaBook size={40} className="text-muted opacity-50" />
            </div>
            <h5 className="text-muted">You haven't enrolled in any courses yet</h5>
            <p className="text-muted mb-4">Browse available courses and start your learning journey</p>
            <Button variant="primary" href="/student/browse-courses">
              Browse Courses
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MyCourses;