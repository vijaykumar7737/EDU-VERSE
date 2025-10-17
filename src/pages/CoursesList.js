import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { courseAPI } from '../api';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseAPI.getCourses();
        setCourses(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getCategoryBadgeVariant = (category) => {
    switch (category.toLowerCase()) {
      case 'programming':
        return 'primary';
      case 'mathematics':
        return 'success';
      case 'science':
        return 'info';
      case 'language':
        return 'warning';
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
        <h2 className="mb-4">All Courses</h2>
        <Row>
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <Col md={4} key={course._id} className="mb-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <Card.Title>{course.title}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {course.instructor && course.instructor.name ? course.instructor.name : 'Unknown Instructor'}
                      </Card.Subtitle>
                      <Badge bg={getCategoryBadgeVariant(course.category)} className="mt-2">
                        {course.category}
                      </Badge>
                      <Card.Text className="mt-3">
                        {course.description.length > 100
                          ? `${course.description.substring(0, 100)}...`
                          : course.description}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">
                          {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                        </small>
                        <Link to={`/courses/${course._id}`}>
                          <Button variant="outline-primary" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))
          ) : (
            <Col className="text-center">
              <p>No courses available at the moment.</p>
            </Col>
          )}
        </Row>
      </motion.div>
    </Container>
  );
};

export default CoursesList;