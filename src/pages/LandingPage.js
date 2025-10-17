import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Navbar, Nav } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaBook, FaClipboardList, FaChartLine, FaUsers, FaFileAlt, FaComments } from 'react-icons/fa';
import logo from '../assets/logo.svg';

const LandingPage = () => {
  const features = [
    {
      icon: <FaBook />,
      title: "Course Management",
      description: "Create, organize, and manage courses with ease",
      color: "#e879f9"
    },
    {
      icon: <FaClipboardList />,
      title: "Assignment System", 
      description: "Digital submission and grading workflow",
      color: "#3b82f6"
    },
    {
      icon: <FaChartLine />,
      title: "Performance Tracking",
      description: "Real-time analytics and grade management",
      color: "#10b981"
    },
    {
      icon: <FaUsers />,
      title: "Student Enrollment",
      description: "Seamless course enrollment and management",
      color: "#f97316"
    },
    {
      icon: <FaFileAlt />,
      title: "Study Materials",
      description: "Upload PDFs, videos, and presentations",
      color: "#8b5cf6"
    },
    {
      icon: <FaComments />,
      title: "Discussion Forum",
      description: "Interactive learning community",
      color: "#ec4899"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Create your account as a teacher or student"
    },
    {
      number: "02", 
      title: "Create or Enroll",
      description: "Teachers create courses, students enroll in them"
    },
    {
      number: "03",
      title: "Learn & Grow",
      description: "Submit assignments, receive grades, track progress"
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <Navbar expand="lg" className="py-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <Container>
          <Navbar.Brand className="d-flex align-items-center">
            <img src={logo} alt="EDUVERSE" height="40" className="me-2" />
            <span className="fw-bold fs-4" style={{ 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              EDUVERSE
            </span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link href="#features" className="mx-2">Features</Nav.Link>
              <Nav.Link href="#how-it-works" className="mx-2">How It Works</Nav.Link>
              <Nav.Link href="#levels" className="mx-2">Levels</Nav.Link>
              <Nav.Link as={Link} to="/login" className="mx-2">Login</Nav.Link>
              <Button 
                as={Link} 
                to="/login" 
                className="ms-2 px-4"
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                  border: 'none',
                  borderRadius: '25px'
                }}
              >
                Get Started
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="hero-section py-5" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="display-4 fw-bold mb-4">
                  Welcome to{' '}
                  <span style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent' 
                  }}>
                    EDUVERSE
                  </span>
                </h1>
                <p className="lead text-muted mb-4">
                  A next-generation Learning Management System bridging teachers and students through seamless digital learning
                </p>
                <div className="d-flex gap-3">
                  <Button 
                    as={Link} 
                    to="/login" 
                    size="lg"
                    className="px-4 py-2"
                    style={{ 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                      border: 'none',
                      borderRadius: '25px'
                    }}
                  >
                    Get Started Free →
                  </Button>
                  <Button 
                    as={Link} 
                    to="/login" 
                    variant="outline-primary" 
                    size="lg"
                    className="px-4 py-2"
                    style={{ borderRadius: '25px' }}
                  >
                    Sign In
                  </Button>
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center"
              >
                <div 
                  className="hero-image p-4 rounded-4 shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <img 
                    src={`${process.env.PUBLIC_URL}/students-outdoors.jpg`} 
                    alt="Students studying outdoors" 
                    className="img-fluid rounded-3"
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x800/CCE9FF/1F2937?text=Eduverse+Learning'; }}
                  />
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5" style={{ backgroundColor: '#ffffff' }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold mb-3">
              Powerful <span style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>Features</span>
            </h2>
            <p className="lead text-muted">Everything you need for modern digital education in one platform</p>
          </motion.div>
          
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <Card.Body className="p-4 text-center">
                      <div 
                        className="feature-icon mb-3 mx-auto d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: feature.color + '20',
                          color: feature.color,
                          borderRadius: '15px',
                          fontSize: '24px'
                        }}
                      >
                        {feature.icon}
                      </div>
                      <h5 className="fw-bold mb-3">{feature.title}</h5>
                      <p className="text-muted">{feature.description}</p>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold mb-3">
              How It <span style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>Works</span>
            </h2>
            <p className="lead text-muted">Get started in three simple steps</p>
          </motion.div>
          
          <Row className="g-5">
            {steps.map((step, index) => (
              <Col md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div 
                    className="step-number mb-4 mx-auto d-flex align-items-center justify-content-center fw-bold"
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '24px'
                    }}
                  >
                    {step.number}
                  </div>
                  <h4 className="fw-bold mb-3">{step.title}</h4>
                  <p className="text-muted">{step.description}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ 
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
      }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div 
              className="cta-icon mb-3 mx-auto d-flex align-items-center justify-content-center"
              style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                borderRadius: '20px',
                fontSize: '32px',
                color: 'white'
              }}
            >
              🎓
            </div>
            <h2 className="display-6 fw-bold mb-3">
              Welcome <span style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>Back</span>
            </h2>
            <p className="lead text-muted mb-4">Sign in to continue your learning journey</p>
            <Button 
              as={Link} 
              to="/login" 
              size="lg"
              className="px-5 py-3"
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                border: 'none',
                borderRadius: '25px',
                fontSize: '18px'
              }}
            >
              Sign In →
            </Button>
            <div className="mt-3">
              <small className="text-muted">
                Don't have an account? <Link to="/register" className="text-decoration-none">Sign up</Link>
              </small>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;