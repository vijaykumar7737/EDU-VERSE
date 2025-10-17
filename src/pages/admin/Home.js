import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Spinner } from 'react-bootstrap';
import { FaUsers, FaBook, FaServer } from 'react-icons/fa';
import { userAPI, courseAPI } from '../../api';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeUsers: 0,
    systemLoad: '0%'
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch real data from APIs
        const [usersResponse, coursesResponse] = await Promise.all([
          userAPI.getAllUsers(),
          courseAPI.getAllCourses()
        ]);

        setStats({
          totalUsers: usersResponse.data.length || 0,
          totalCourses: coursesResponse.data.length || 0,
          activeUsers: usersResponse.data.filter(user => user.isActive !== false).length || 0,
          systemLoad: '0%' // This would be calculated based on server metrics
        });

        // For now, set empty activities array
        setRecentActivities([]);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 text-primary mb-2">
                <FaUsers />
              </div>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <h3>{stats.totalUsers}</h3>
              )}
              <Card.Text>Total Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 text-success mb-2">
                <FaBook />
              </div>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <h3>{stats.totalCourses}</h3>
              )}
              <Card.Text>Total Courses</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 text-info mb-2">
                <FaUsers />
              </div>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <h3>{stats.activeUsers}</h3>
              )}
              <Card.Text>Active Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 text-warning mb-2">
                <FaServer />
              </div>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <h3>{stats.systemLoad}</h3>
              )}
              <Card.Text>System Load</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Activities */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Recent Activities</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading recent activities...</p>
            </div>
          ) : recentActivities.length > 0 ? (
            <Table responsive>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map(activity => (
                  <tr key={activity.id}>
                    <td>{activity.user}</td>
                    <td>{activity.action}</td>
                    <td>{activity.time}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <FaUsers className="text-muted mb-3" size={48} />
              <p className="text-muted mb-0">No recent activities</p>
              <small className="text-muted">User activities will appear here when they occur</small>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* System Overview */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">System Overview</h5>
        </Card.Header>
        <Card.Body>
          <p>Welcome to the admin dashboard. From here you can manage users, courses, and system settings.</p>
          <p>Use the sidebar navigation to access different administrative functions.</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Home;