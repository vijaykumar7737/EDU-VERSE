import React, { useState, useContext, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col, ProgressBar, Badge, InputGroup } from 'react-bootstrap';
import { FaBook, FaUsers, FaCalendarAlt, FaDollarSign, FaGlobe, FaLock, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { courseAPI } from '../../api';

const CreateCourse = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    maxStudents: '',
    price: '',
    difficulty: 'beginner',
    language: 'english',
    prerequisites: '',
    learningObjectives: '',
    isPublished: false,
    allowDiscussions: true,
    allowDownloads: true,
    certificateEnabled: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  const totalSteps = 4;

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) errors.title = 'Course title is required';
        if (formData.title.length < 5) errors.title = 'Title must be at least 5 characters';
        if (!formData.description.trim()) errors.description = 'Description is required';
        if (formData.description.length < 20) errors.description = 'Description must be at least 20 characters';
        if (!formData.category) errors.category = 'Category is required';
        break;
      
      case 2:
        if (!formData.startDate) errors.startDate = 'Start date is required';
        if (!formData.endDate) errors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
          errors.endDate = 'End date must be after start date';
        }
        if (formData.maxStudents && (formData.maxStudents < 1 || formData.maxStudents > 1000)) {
          errors.maxStudents = 'Max students must be between 1 and 1000';
        }
        break;
      
      case 3:
        if (formData.price && formData.price < 0) errors.price = 'Price cannot be negative';
        if (!formData.difficulty) errors.difficulty = 'Difficulty level is required';
        if (!formData.language) errors.language = 'Language is required';
        break;
      
      case 4:
        // Final validation - all previous steps
        const step1Errors = validateStep(1);
        const step2Errors = validateStep(2);
        const step3Errors = validateStep(3);
        Object.assign(errors, step1Errors, step2Errors, step3Errors);
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const courseData = {
        ...formData,
        instructor: user._id,
        maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : undefined,
        price: formData.price ? parseFloat(formData.price) : 0,
        prerequisites: formData.prerequisites.split('\n').filter(p => p.trim()),
        learningObjectives: formData.learningObjectives.split('\n').filter(o => o.trim())
      };

      const response = await courseAPI.createCourse(courseData);
      setSuccess('Course created successfully!');
      
      setTimeout(() => {
        navigate('/teacher/my-courses');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create course');
      console.error('Error creating course:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Schedule & Capacity';
      case 3: return 'Course Details';
      case 4: return 'Settings & Review';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Row className="g-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <FaBook className="me-2" />
                  Course Title *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter an engaging course title"
                  isInvalid={!!validationErrors.title}
                  maxLength={100}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.title}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  {formData.title.length}/100 characters
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-bold">Course Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn in this course..."
                  isInvalid={!!validationErrors.description}
                  maxLength={500}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.description}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  {formData.description.length}/500 characters
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-bold">Category *</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.category}
                >
                  <option value="">Select a category</option>
                  <option value="Programming">Programming & Development</option>
                  <option value="Design">Design & Creative</option>
                  <option value="Business">Business & Entrepreneurship</option>
                  <option value="Marketing">Marketing & Sales</option>
                  <option value="Science">Science & Technology</option>
                  <option value="Mathematics">Mathematics & Statistics</option>
                  <option value="Language">Language & Communication</option>
                  <option value="Health">Health & Wellness</option>
                  <option value="Arts">Arts & Humanities</option>
                  <option value="Other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.category}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        );

      case 2:
        return (
          <Row className="g-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <FaCalendarAlt className="me-2" />
                  Start Date *
                </Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  isInvalid={!!validationErrors.startDate}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.startDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">End Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  isInvalid={!!validationErrors.endDate}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.endDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <FaUsers className="me-2" />
                  Maximum Students
                </Form.Label>
                <Form.Control
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                  min="1"
                  max="1000"
                  isInvalid={!!validationErrors.maxStudents}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.maxStudents}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Optional: Set a limit on enrollment
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <FaDollarSign className="me-2" />
                  Course Price
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    isInvalid={!!validationErrors.price}
                  />
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.price}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Set to 0 for free course
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        );

      case 3:
        return (
          <Row className="g-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Difficulty Level *</Form.Label>
                <Form.Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.difficulty}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.difficulty}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <FaGlobe className="me-2" />
                  Language *
                </Form.Label>
                <Form.Select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.language}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="chinese">Chinese</option>
                  <option value="japanese">Japanese</option>
                  <option value="other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.language}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-bold">Prerequisites</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleChange}
                  placeholder="Enter each prerequisite on a new line..."
                />
                <Form.Text className="text-muted">
                  List any skills or knowledge students should have before taking this course
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-bold">Learning Objectives</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="learningObjectives"
                  value={formData.learningObjectives}
                  onChange={handleChange}
                  placeholder="Enter each learning objective on a new line..."
                />
                <Form.Text className="text-muted">
                  What will students be able to do after completing this course?
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        );

      case 4:
        return (
          <Row className="g-4">
            <Col md={12}>
              <h5 className="mb-3">Course Settings</h5>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    label={
                      <span>
                        {formData.isPublished ? <FaGlobe className="me-2 text-success" /> : <FaLock className="me-2 text-warning" />}
                        Publish course immediately
                      </span>
                    }
                  />
                  <Form.Text className="text-muted">
                    Published courses are visible to students
                  </Form.Text>
                </Col>
                
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    name="allowDiscussions"
                    checked={formData.allowDiscussions}
                    onChange={handleChange}
                    label="Enable course discussions"
                  />
                  <Form.Text className="text-muted">
                    Allow students to discuss course content
                  </Form.Text>
                </Col>
                
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    name="allowDownloads"
                    checked={formData.allowDownloads}
                    onChange={handleChange}
                    label="Allow material downloads"
                  />
                  <Form.Text className="text-muted">
                    Students can download course materials
                  </Form.Text>
                </Col>
                
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    name="certificateEnabled"
                    checked={formData.certificateEnabled}
                    onChange={handleChange}
                    label="Issue completion certificates"
                  />
                  <Form.Text className="text-muted">
                    Generate certificates for course completion
                  </Form.Text>
                </Col>
              </Row>
            </Col>
            
            <Col md={12}>
              <Card className="bg-light">
                <Card.Body>
                  <h6 className="mb-3">Course Summary</h6>
                  <Row>
                    <Col md={6}>
                      <p><strong>Title:</strong> {formData.title || 'Not set'}</p>
                      <p><strong>Category:</strong> {formData.category || 'Not set'}</p>
                      <p><strong>Difficulty:</strong> <Badge bg="info">{formData.difficulty}</Badge></p>
                      <p><strong>Language:</strong> {formData.language}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Start Date:</strong> {formData.startDate || 'Not set'}</p>
                      <p><strong>End Date:</strong> {formData.endDate || 'Not set'}</p>
                      <p><strong>Max Students:</strong> {formData.maxStudents || 'Unlimited'}</p>
                      <p><strong>Price:</strong> ${formData.price || '0.00'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    if (!user?._id) { setLoading(false); setError('Please login to create a course'); return; }
  }, [user]);

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>Create New Course</h2>
        <p className="text-muted">Follow the steps below to create your course</p>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          <FaTimes className="me-2" />
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <FaCheck className="me-2" />
          {success}
        </Alert>
      )}

      {/* Progress Bar */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}</h6>
            <Badge bg="primary">{Math.round((currentStep / totalSteps) * 100)}% Complete</Badge>
          </div>
          <ProgressBar 
            now={(currentStep / totalSteps) * 100} 
            variant="primary"
            style={{ height: '8px' }}
          />
        </Card.Body>
      </Card>

      {/* Form Content */}
      <Card>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between mt-4 pt-4 border-top">
              <Button 
                variant="outline-secondary" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <div>
                {currentStep < totalSteps ? (
                  <Button 
                    variant="primary" 
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button 
                    variant="success" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating Course...' : 'Create Course'}
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Help Section */}
      <Card className="mt-4 border-info">
        <Card.Body className="bg-light">
          <div className="d-flex align-items-start">
            <FaInfoCircle className="text-info me-3 mt-1" />
            <div>
              <h6 className="text-info mb-2">Tips for Creating a Great Course</h6>
              <ul className="mb-0 small text-muted">
                <li>Choose a clear, descriptive title that tells students what they'll learn</li>
                <li>Write a detailed description that explains the course value and outcomes</li>
                <li>Set realistic start and end dates with enough time for content delivery</li>
                <li>Consider your target audience when setting the difficulty level</li>
                <li>List clear learning objectives so students know what to expect</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateCourse;