import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, Spinner, Dropdown, ProgressBar } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye, FaUsers, FaTasks, FaFolder, FaPlus, FaSearch, FaFilter, FaDownload, FaUpload, FaCopy, FaEllipsisV } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { courseAPI } from '../../api';

const MyCourses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  // Selected course for operations
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Edit form data
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    maxStudents: '',
    isPublished: false
  });

  const fetchCourses = useCallback(async () => {
    if (!user?._id) { setLoading(false); return; }
    
    try {
      setLoading(true);
      setError('');
      const response = await courseAPI.getCoursesByInstructor(user._id);
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      await courseAPI.deleteCourse(selectedCourse._id);
      setCourses(courses.filter(course => course._id !== selectedCourse._id));
      setSuccess('Course deleted successfully');
      setShowDeleteModal(false);
      setSelectedCourse(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete course');
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    
    try {
      const response = await courseAPI.updateCourse(selectedCourse._id, editForm);
      setCourses(courses.map(course => 
        course._id === selectedCourse._id ? response.data : course
      ));
      setSuccess('Course updated successfully');
      setShowEditModal(false);
      setSelectedCourse(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update course');
    }
  };

  const handleDuplicateCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      const duplicateData = {
        title: `${selectedCourse.title} (Copy)`,
        description: selectedCourse.description,
        category: selectedCourse.category,
        startDate: new Date().toISOString().split('T')[0],
        endDate: selectedCourse.endDate,
        maxStudents: selectedCourse.maxStudents,
        isPublished: false
      };
      
      const response = await courseAPI.createCourse(duplicateData);
      setCourses([response.data, ...courses]);
      setSuccess('Course duplicated successfully');
      setShowDuplicateModal(false);
      setSelectedCourse(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to duplicate course');
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      category: course.category,
      startDate: course.startDate ? course.startDate.split('T')[0] : '',
      endDate: course.endDate ? course.endDate.split('T')[0] : '',
      maxStudents: course.maxStudents || '',
      isPublished: course.isPublished || false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const openDuplicateModal = (course) => {
    setSelectedCourse(course);
    setShowDuplicateModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (course) => {
    const now = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    
    if (!course.isPublished) return { variant: 'secondary', text: 'Draft' };
    if (now < startDate) return { variant: 'warning', text: 'Upcoming' };
    if (now > endDate) return { variant: 'danger', text: 'Ended' };
    return { variant: 'success', text: 'Active' };
  };

  const getCourseProgress = (course) => {
    const now = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    
    if (now < startDate) return 0;
    if (now > endDate) return 100;
    
    const total = endDate - startDate;
    const elapsed = now - startDate;
    return Math.round((elapsed / total) * 100);
  };

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'students':
          return (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0);
        default:
          return 0;
      }
    });

  const categories = [...new Set(courses.map(course => course.category))];

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading courses...</span>
        </Spinner>
        <p className="mt-2">Loading your courses...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>My Courses</h2>
          <p className="text-muted mb-0">Manage and track your courses</p>
        </div>
        <Button variant="primary" href="/teacher/create-course">
          <FaPlus className="me-2" />
          Create New Course
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="text-center border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="text-white">
              <h4>{courses.length}</h4>
              <small>Total Courses</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Card.Body className="text-white">
              <h4>{courses.filter(c => c.isPublished).length}</h4>
              <small>Published</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Card.Body className="text-white">
              <h4>{courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0)}</h4>
              <small>Total Students</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Card.Body className="text-white">
              <h4>{courses.filter(c => {
                const status = getStatusBadge(c);
                return status.text === 'Active';
              }).length}</h4>
              <small>Active Courses</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search Courses</Form.Label>
                <div className="position-relative">
                  <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <Form.Control
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-5"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Category</Form.Label>
                <div className="position-relative">
                  <FaFilter className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <Form.Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="ps-5"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="students">Most Students</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <Row className="g-4">
          {filteredCourses.map(course => {
            const status = getStatusBadge(course);
            const progress = getCourseProgress(course);
            
            return (
              <Col key={course._id} lg={6} xl={4}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Header className="bg-white border-0 pb-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <Badge bg={status.variant}>{status.text}</Badge>
                      <Dropdown>
                        <Dropdown.Toggle variant="link" className="text-muted p-0 border-0">
                          <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => openEditModal(course)}>
                            <FaEdit className="me-2" />Edit Course
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => openDuplicateModal(course)}>
                            <FaCopy className="me-2" />Duplicate
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            onClick={() => openDeleteModal(course)}
                            className="text-danger"
                          >
                            <FaTrash className="me-2" />Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </Card.Header>
                  
                  <Card.Body>
                    <h5 className="card-title mb-2">{course.title}</h5>
                    <p className="text-muted small mb-3">
                      {course.description?.substring(0, 100)}
                      {course.description?.length > 100 && '...'}
                    </p>
                    
                    <div className="mb-3">
                      <small className="text-muted">Category: </small>
                      <Badge bg="light" text="dark">{course.category}</Badge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Course Progress</small>
                        <small className="text-muted">{progress}%</small>
                      </div>
                      <ProgressBar now={progress} variant={status.variant} style={{ height: '6px' }} />
                    </div>
                    
                    <Row className="text-center mb-3">
                      <Col>
                        <div className="text-primary fw-bold">{course.enrolledStudents?.length || 0}</div>
                        <small className="text-muted">Students</small>
                      </Col>
                      <Col>
                        <div className="text-success fw-bold">{course.assignments?.length || 0}</div>
                        <small className="text-muted">Assignments</small>
                      </Col>
                      <Col>
                        <div className="text-info fw-bold">{course.materials?.length || 0}</div>
                        <small className="text-muted">Materials</small>
                      </Col>
                    </Row>
                    
                    <div className="mb-3">
                      <small className="text-muted d-block">Start: {formatDate(course.startDate)}</small>
                      <small className="text-muted d-block">End: {formatDate(course.endDate)}</small>
                    </div>
                  </Card.Body>
                  
                  <Card.Footer className="bg-white border-0">
                    <Row className="g-2">
                      <Col>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="w-100"
                          href={`/course/${course._id}`}
                        >
                          <FaEye className="me-1" />View
                        </Button>
                      </Col>
                      <Col>
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          className="w-100"
                          href={`/teacher/courses/${course._id}/students`}
                        >
                          <FaUsers className="me-1" />Students
                        </Button>
                      </Col>
                      <Col>
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          className="w-100"
                          href={`/teacher/courses/${course._id}/assignments`}
                        >
                          <FaTasks className="me-1" />Tasks
                        </Button>
                      </Col>
                    </Row>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <FaFolder size={64} className="text-muted mb-3" />
            <h4>No Courses Found</h4>
            <p className="text-muted">
              {courses.length === 0 
                ? "You haven't created any courses yet." 
                : "No courses match your current filters."}
            </p>
            {courses.length === 0 && (
              <Button variant="primary" href="/teacher/create-course">
                <FaPlus className="me-2" />
                Create Your First Course
              </Button>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Edit Course Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditCourse}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Course Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Language">Language</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Max Students</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={editForm.maxStudents}
                    onChange={(e) => setEditForm({...editForm, maxStudents: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Check
                  type="checkbox"
                  label="Publish this course (make it visible to students)"
                  checked={editForm.isPublished}
                  onChange={(e) => setEditForm({...editForm, isPublished: e.target.checked})}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Course
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the course <strong>"{selectedCourse?.title}"</strong>?</p>
          <p className="text-danger">This action cannot be undone and will remove all associated data.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCourse}>
            Delete Course
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Duplicate Course Modal */}
      <Modal show={showDuplicateModal} onHide={() => setShowDuplicateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Duplicate Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Create a copy of <strong>"{selectedCourse?.title}"</strong>?</p>
          <p className="text-muted">The duplicated course will be created as a draft with today's start date.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDuplicateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDuplicateCourse}>
            Duplicate Course
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyCourses;