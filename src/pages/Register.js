import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.svg';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'student'
  });
  const [validated, setValidated] = useState(false);
  const { register, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password, password2, role } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userData = { name, email, password, role };
      await register(userData);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' }}>
      <Row className="justify-content-center w-100">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <img src={logo} alt="EDUVERSE Logo" height="60" className="mb-3" />
                <h2 className="fw-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EDUVERSE</h2>
                <p className="text-muted">Create Your Account</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form noValidate validated={validated} onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    placeholder="Enter your full name"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide your name.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Enter your email"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid email.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter your password"
                    required
                    minLength="6"
                  />
                  <Form.Control.Feedback type="invalid">
                    Password must be at least 6 characters.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password2"
                    value={password2}
                    onChange={onChange}
                    placeholder="Confirm your password"
                    required
                    minLength="6"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please confirm your password.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Register as</Form.Label>
                  <Form.Select 
                    name="role"
                    value={role}
                    onChange={onChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2 mb-3">
                  Register
                </Button>
                
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account? <Link to="/login" className="text-decoration-none">Login</Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;