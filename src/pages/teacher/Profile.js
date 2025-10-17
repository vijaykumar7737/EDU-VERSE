import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    specialization: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update profile state when user data is available
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || 'Experienced teacher with 5+ years in web development education.',
        specialization: user.specialization || 'Web Development'
      }));
    }
  }, [user]);
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Mock API call to update profile
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    // Validation
    if (profile.newPassword !== profile.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (profile.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // Mock API call to change password
    setSuccess('Password changed successfully!');
    setError('');
    setProfile({
      ...profile,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Teacher Profile</h2>
      
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Profile Information</Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Teacher'}
                    disabled
                  />
                  <Form.Text className="text-muted">
                    Your account role
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Specialization</Form.Label>
                  <Form.Control
                    type="text"
                    name="specialization"
                    value={profile.specialization}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit">
                  Update Profile
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>Change Password</Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={profile.currentPassword}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={profile.newPassword}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={profile.confirmPassword}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit">
                  Change Password
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;