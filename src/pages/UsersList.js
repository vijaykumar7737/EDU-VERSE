import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { userAPI } from '../api';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userAPI.getUsers();
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'teacher':
        return 'warning';
      case 'student':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4">All Users</h2>
        <Row>
          {users.map((user, index) => (
            <Col md={4} key={user._id} className="mb-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{user.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{user.email}</Card.Subtitle>
                    <Badge bg={getRoleBadgeVariant(user.role)} className="mt-2">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <Card.Text className="mt-3">
                      <small className="text-muted">Joined: {new Date(user.date).toLocaleDateString()}</small>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>
    </Container>
  );
};

export default UsersList;