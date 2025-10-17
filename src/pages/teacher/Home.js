import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, Alert, Table, Badge, ProgressBar } from 'react-bootstrap';
import { FaBook, FaClipboardList, FaUserGraduate, FaBell, FaPlus, FaEye, FaEdit, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { courseAPI, assignmentAPI } from '../../api';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    activeCourses: 0,
    pendingAssignments: 0,
    totalStudents: 0,
    averageRating: 0,
    totalAssignments: 0,
    gradedAssignments: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) {
        setLoading(false);
        setError('Please sign in to view your dashboard');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch teacher's courses
        const coursesResponse = await courseAPI.getCoursesByInstructor(user._id);
        const courses = coursesResponse.data;
        
        // Fetch assignments
        let assignments = [];
        try {
          const assignmentsResponse = await assignmentAPI.getAllAssignments();
          assignments = assignmentsResponse.data.filter(assignment => 
            courses.some(course => course._id === assignment.course?._id || course._id === assignment.course)
          );
        } catch (assignmentError) {
          console.log('Assignments not available yet');
        }
        
        // Calculate comprehensive stats
        const totalStudents = courses.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0);
        const totalAssignments = assignments.length;
        const gradedAssignments = assignments.filter(assignment => 
          assignment.submissions?.some(sub => sub.status === 'graded')
        ).length;
        
        // Get upcoming deadlines (next 7 days)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = assignments.filter(assignment => {
          const dueDate = new Date(assignment.dueDate);
          return dueDate >= now && dueDate <= nextWeek;
        }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        setStats({
          activeCourses: courses.length,
          pendingAssignments: assignments.filter(assignment => 
            assignment.submissions?.some(sub => sub.status === 'submitted')
          ).length,
          totalStudents: totalStudents,
          averageRating: 4.2, // Mock rating for now
          totalAssignments,
          gradedAssignments
        });
        
        setRecentCourses(courses.slice(0, 3));
        setRecentAssignments(assignments.slice(0, 5));
        setUpcomingDeadlines(upcoming.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
        
        // Set default stats on error
        setStats({
          activeCourses: 0,
          pendingAssignments: 0,
          totalStudents: 0,
          averageRating: 0,
          totalAssignments: 0,
          gradedAssignments: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?._id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDeadline = (dateString) => {
    const now = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGradingProgress = () => {
    if (stats.totalAssignments === 0) return 0;
    return Math.round((stats.gradedAssignments / stats.totalAssignments) * 100);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Welcome back, {user?.name}!</h2>
          <p className="text-muted mb-0">Here's what's happening with your courses today.</p>
        </div>
        <div>
          <Button as={Link} to="/teacher/create-course" variant="primary" className="me-2">
            <FaPlus className="me-1" />
            Create Course
          </Button>
          <Button as={Link} to="/teacher/assignments" variant="outline-primary">
            <FaClipboardList className="me-1" />
            Assignments
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading dashboard...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Row className="g-4 mb-4">
            <Col md={6} lg={3}>
              <Card className="dashboard-card border-0 h-100 bg-primary text-center">
                <Card.Body className="p-4">
                  <div className="display-4 text-white mb-2">
                    <FaBook />
                  </div>
                  <h3 className="text-white">{stats.activeCourses}</h3>
                  <Card.Text className="text-white opacity-75">Active Courses</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="dashboard-card border-0 h-100 text-center" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                <Card.Body className="p-4">
                  <div className="display-4 text-white mb-2">
                    <FaClipboardList />
                  </div>
                  <h3 className="text-white">{stats.pendingAssignments}</h3>
                  <Card.Text className="text-white opacity-75">Pending Reviews</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="dashboard-card border-0 h-100 text-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <Card.Body className="p-4">
                  <div className="display-4 text-white mb-2">
                    <FaUserGraduate />
                  </div>
                  <h3 className="text-white">{stats.totalStudents}</h3>
                  <Card.Text className="text-white opacity-75">Total Students</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="dashboard-card border-0 h-100 text-center" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <Card.Body className="p-4">
                  <div className="display-4 text-white mb-2">
                    <FaChartLine />
                  </div>
                  <h3 className="text-white">{getGradingProgress()}%</h3>
                  <Card.Text className="text-white opacity-75">Grading Progress</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Main Content Row */}
          <Row className="g-4 mb-4">
            {/* Recent Courses */}
            <Col lg={6}>
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Courses</h5>
                  <Button as={Link} to="/teacher/my-courses" variant="link" size="sm">
                    View All
                  </Button>
                </Card.Header>
                <Card.Body>
                  {recentCourses.length > 0 ? (
                    <div className="space-y-3">
                      {recentCourses.map(course => (
                        <div key={course._id} className="d-flex justify-content-between align-items-center p-3 border rounded">
                          <div>
                            <h6 className="mb-1">{course.title}</h6>
                            <small className="text-muted">
                              {course.enrolledStudents?.length || 0} students • {course.category}
                            </small>
                          </div>
                          <div>
                            <Button as={Link} to={`/course/${course._id}`} variant="outline-primary" size="sm">
                              <FaEye />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FaBook className="text-muted mb-3" size={48} />
                      <p className="text-muted mb-0">No courses yet</p>
                      <Button as={Link} to="/teacher/create-course" variant="primary" size="sm" className="mt-2">
                        Create Your First Course
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Upcoming Deadlines */}
            <Col lg={6}>
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Upcoming Deadlines</h5>
                  <Button as={Link} to="/teacher/assignments" variant="link" size="sm">
                    View All
                  </Button>
                </Card.Header>
                <Card.Body>
                  {upcomingDeadlines.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingDeadlines.map(assignment => {
                        const daysLeft = getDaysUntilDeadline(assignment.dueDate);
                        return (
                          <div key={assignment._id} className="d-flex justify-content-between align-items-center p-3 border rounded">
                            <div>
                              <h6 className="mb-1">{assignment.title}</h6>
                              <small className="text-muted">
                                {assignment.course?.title || 'Unknown Course'}
                              </small>
                            </div>
                            <div className="text-end">
                              <Badge bg={daysLeft <= 1 ? 'danger' : daysLeft <= 3 ? 'warning' : 'info'}>
                                {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day' : `${daysLeft} days`}
                              </Badge>
                              <br />
                              <small className="text-muted">{formatDate(assignment.dueDate)}</small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FaCalendarAlt className="text-muted mb-3" size={48} />
                      <p className="text-muted mb-0">No upcoming deadlines</p>
                      <small className="text-muted">Create assignments to track deadlines</small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Assignments */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Assignments</h5>
              <Button as={Link} to="/teacher/assignments" variant="link">
                Manage All Assignments
              </Button>
            </Card.Header>
            <Card.Body>
              {recentAssignments.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Course</th>
                        <th>Due Date</th>
                        <th>Submissions</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAssignments.map(assignment => {
                        const submissionCount = assignment.submissions?.length || 0;
                        const gradedCount = assignment.submissions?.filter(sub => sub.status === 'graded').length || 0;
                        return (
                          <tr key={assignment._id}>
                            <td>
                              <strong>{assignment.title}</strong>
                              <br />
                              <small className="text-muted">{assignment.totalPoints} points</small>
                            </td>
                            <td>{assignment.course?.title || 'N/A'}</td>
                            <td>{formatDate(assignment.dueDate)}</td>
                            <td>
                              <span>{submissionCount} submitted</span>
                              {submissionCount > 0 && (
                                <div className="mt-1">
                                  <ProgressBar 
                                    now={gradedCount} 
                                    max={submissionCount} 
                                    size="sm"
                                    label={`${gradedCount}/${submissionCount} graded`}
                                  />
                                </div>
                              )}
                            </td>
                            <td>
                              <Badge bg={submissionCount > gradedCount ? 'warning' : 'success'}>
                                {submissionCount > gradedCount ? 'Pending Review' : 'Complete'}
                              </Badge>
                            </td>
                            <td>
                              <Button variant="outline-primary" size="sm">
                                Review
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaClipboardList className="text-muted mb-3" size={48} />
                  <p className="text-muted mb-0">No assignments yet</p>
                  <Button as={Link} to="/teacher/assignments" variant="primary" size="sm" className="mt-2">
                    Create Your First Assignment
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button as={Link} to="/teacher/create-course" variant="outline-primary" className="w-100 py-3">
                    <div className="d-flex flex-column align-items-center">
                      <FaBook className="mb-2" size={24} />
                      <span>Create Course</span>
                    </div>
                  </Button>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button as={Link} to="/teacher/assignments" variant="outline-primary" className="w-100 py-3">
                    <div className="d-flex flex-column align-items-center">
                      <FaClipboardList className="mb-2" size={24} />
                      <span>Create Assignment</span>
                    </div>
                  </Button>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button as={Link} to="/teacher/students" variant="outline-primary" className="w-100 py-3">
                    <div className="d-flex flex-column align-items-center">
                      <FaUserGraduate className="mb-2" size={24} />
                      <span>View Students</span>
                    </div>
                  </Button>
                </Col>
                <Col md={3}>
                  <Button as={Link} to="/teacher/my-courses" variant="outline-primary" className="w-100 py-3">
                    <div className="d-flex flex-column align-items-center">
                      <FaEdit className="mb-2" size={24} />
                      <span>Manage Courses</span>
                    </div>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default Home;