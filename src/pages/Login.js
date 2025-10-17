import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import WaveAnimation from '../components/WaveAnimation';
import logo from '../assets/logo.svg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [validated, setValidated] = useState(false);
  const { login, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password, role } = formData;

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

    try {
      // Only send email and password; server returns the user's role
      const loggedInUser = await login({ email, password });
      navigate(`/${loggedInUser.role}/dashboard`);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center py-5 position-relative" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' }}>
      <WaveAnimation />
      <Row className="justify-content-center w-100">
        <Col md={8} lg={6} xl={5}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-lg border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
              <Card.Body className="p-5">
                <motion.div 
                  className="text-center mb-4"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.img 
                    src={logo} 
                    alt="EDUVERSE Logo" 
                    height="60" 
                    className="mb-3"
                    whileHover={{ rotate: 10 }}
                  />
                  <h2 className="fw-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EDUVERSE</h2>
                  <p className="text-muted">Learning Management System</p>
                </motion.div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form noValidate validated={validated} onSubmit={onSubmit}>
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

                <Form.Group className="mb-4">
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
                  <Form.Label>Login as</Form.Label>
                  <Form.Select 
                    name="role"
                    value={role}
                    onChange={onChange}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                  </Form.Select>
                </Form.Group>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="primary" type="submit" className="w-100 py-2">
                  Login
                </Button>
              </motion.div>
                
                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account? <Link to="/register" className="text-decoration-none">Register</Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;