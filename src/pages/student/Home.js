import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { FaBook, FaClipboardList, FaChartLine, FaArrowRight, FaBell } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
// import { courseAPI, assignmentAPI } from '../../api'; // Commented out unused imports

const StudentHome = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingTasks: 0,
    averageGrade: 0,
    progress: 0
  });
  
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch enrolled courses for the student
        // Note: This would need to be implemented in the backend
        // For now, we'll set default values
        setStats({
          enrolledCourses: 0,
          pendingTasks: 0,
          averageGrade: 0,
          progress: 0
        });
        
        setUpcomingAssignments([]);
        setNotifications([]);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <Container fluid className="py-4 px-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-1">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="text-muted">Here's what's happening with your learning journey</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="dashboard-card border-0 h-100 bg-primary">
            <Card.Body className="p-4">
              <div className="d-flex flex-column">
                <div className="mb-2">
                  <FaBook className="text-white opacity-75" size={24} />
                </div>
                {loading ? (
                  <Spinner animation="border" variant="light" size="sm" />
                ) : (
                  <h2 className="text-white">{stats.enrolledCourses}</h2>
                )}
                <p className="text-white mb-0">Enrolled Courses</p>
                <small className="text-white opacity-75">Active enrollments</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="dashboard-card border-0 h-100" style={{ background: 'var(--gradient-secondary)' }}>
            <Card.Body className="p-4">
              <div className="d-flex flex-column">
                <div className="mb-2">
                  <FaClipboardList className="text-white opacity-75" size={24} />
                </div>
                {loading ? (
                  <Spinner animation="border" variant="light" size="sm" />
                ) : (
                  <h2 className="text-white">{stats.pendingTasks}</h2>
                )}
                <p className="text-white mb-0">Pending Tasks</p>
                <small className="text-white opacity-75">Assignments due</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="dashboard-card border-0 h-100" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <Card.Body className="p-4">
              <div className="d-flex flex-column">
                <div className="mb-2">
                  <FaChartLine className="text-white opacity-75" size={24} />
                </div>
                {loading ? (
                  <Spinner animation="border" variant="light" size="sm" />
                ) : (
                  <h2 className="text-white">{stats.averageGrade}%</h2>
                )}
                <p className="text-white mb-0">Average Grade</p>
                <small className="text-white opacity-75">Overall performance</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="dashboard-card border-0 h-100" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <Card.Body className="p-4">
              <div className="d-flex flex-column">
                <div className="mb-2">
                  <FaChartLine className="text-white opacity-75" size={24} />
                </div>
                {loading ? (
                  <Spinner animation="border" variant="light" size="sm" />
                ) : (
                  <h2 className="text-white">{stats.progress}%</h2>
                )}
                <p className="text-white mb-0">Progress</p>
                <small className="text-white opacity-75">Course completion</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Assignments & Notifications */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <FaClipboardList className="text-primary me-2" />
                  <h5 className="mb-0">Upcoming Assignments</h5>
                </div>
                <Link to="/student/assignments" className="text-decoration-none">
                  View All <FaArrowRight className="ms-1" size={12} />
                </Link>
              </div>
              
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((assignment, index) => (
                  <div key={index} className="border-bottom pb-3 mb-3">
                    <h6>{assignment.title}</h6>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">Due: {assignment.dueDate}</small>
                      <Badge bg={assignment.status === 'Pending' ? 'warning' : 'success'}>
                        {assignment.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <FaClipboardList size={40} className="text-muted opacity-50" />
                  </div>
                  <h6 className="text-muted">No pending assignments</h6>
                  <p className="text-muted small">You're all caught up!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <FaBell className="text-primary me-2" />
                <h5 className="mb-0">Notifications</h5>
              </div>
              
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={index} className="border-bottom pb-3 mb-3">
                    <p className="mb-1">{notification.message}</p>
                    <small className="text-muted">{notification.time}</small>
                  </div>
                ))
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <FaBell size={40} className="text-muted opacity-50" />
                  </div>
                  <h6 className="text-muted">No new notifications</h6>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-4">Quick Actions</h5>
              <Row>
                <Col>
                  <Link to="/student/browse-courses" className="btn btn-primary w-100">
                    Browse New Courses
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentHome;