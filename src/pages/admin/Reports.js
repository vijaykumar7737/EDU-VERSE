import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  // Mock data for charts
  const courseEnrollmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Course Enrollments',
        data: [65, 59, 80, 81, 56, 90],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const userRolesData = {
    labels: ['Students', 'Teachers', 'Admins'],
    datasets: [
      {
        label: 'User Roles',
        data: [300, 50, 5],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Analytics & Reports</h2>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="display-4">355</h3>
              <Card.Title>Total Users</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="display-4">12</h3>
              <Card.Title>Active Courses</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="display-4">87%</h3>
              <Card.Title>Completion Rate</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="display-4">4.2</h3>
              <Card.Title>Avg. Rating</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>Course Enrollments (Last 6 Months)</Card.Header>
            <Card.Body>
              <Bar data={courseEnrollmentData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>User Distribution</Card.Header>
            <Card.Body>
              <Pie data={userRolesData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;