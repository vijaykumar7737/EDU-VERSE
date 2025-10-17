import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    setUsers([
      { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'student' },
      { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'teacher' },
      { _id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    ]);
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: ''
      });
    } else {
      setCurrentUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'student',
        password: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.role) {
      setError('Please fill all required fields');
      return;
    }
    
    if (!currentUser && !formData.password) {
      setError('Password is required for new users');
      return;
    }
    
    // Mock API call
    if (currentUser) {
      // Update existing user
      setUsers(users.map(user => 
        user._id === currentUser._id ? { ...user, ...formData } : user
      ));
      setSuccess('User updated successfully');
    } else {
      // Create new user
      const newUser = {
        _id: Date.now().toString(),
        ...formData
      };
      setUsers([...users, newUser]);
      setSuccess('User created successfully');
    }
    
    setTimeout(() => {
      handleCloseModal();
    }, 1500);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user._id !== userId));
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FaUserPlus className="me-2" /> Add New User
        </Button>
      </div>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'teacher' ? 'success' : 'primary'}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(user)}>
                  <FaEdit />
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(user._id)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            
            {!currentUser && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required={!currentUser}
                />
              </Form.Group>
            )}
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {currentUser ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Users;