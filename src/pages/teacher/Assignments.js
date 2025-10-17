import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Alert, 
  Badge, 
  ProgressBar,
  Dropdown,
  InputGroup,
  Tabs,
  Tab,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaDownload, 
  FaCalendarAlt, 
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaSort,
  FaGraduationCap,
  FaFileAlt,
  FaChartBar,
  FaStar
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { assignmentAPI, courseAPI } from '../../api';

const Assignments = () => {
  const { user } = useContext(AuthContext);
  
  // State management
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  
  // Current items
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [currentSubmissions, setCurrentSubmissions] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    totalPoints: '',
    instructions: '',
    allowLateSubmissions: true,
    latePenalty: 10,
    submissionTypes: ['file'],
    rubric: ''
  });

  // Grade form data
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: '',
    rating: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, coursesRes] = await Promise.all([
        assignmentAPI.getAssignments(),
        courseAPI.getCoursesByInstructor(user._id)
      ]);
      
      setAssignments(assignmentsRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const assignmentData = {
        ...formData,
        instructor: user._id,
        totalPoints: parseInt(formData.totalPoints, 10),
        latePenalty: parseInt(formData.latePenalty, 10)
      };

      if (currentAssignment) {
        await assignmentAPI.updateAssignment(currentAssignment._id, assignmentData);
        setSuccess('Assignment updated successfully!');
      } else {
        await assignmentAPI.createAssignment(assignmentData);
        setSuccess('Assignment created successfully!');
      }
      
      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await assignmentAPI.deleteAssignment(currentAssignment._id);
      setSuccess('Assignment deleted successfully!');
      await fetchData();
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        grade: parseInt(gradeData.grade, 10),
        feedback: gradeData.feedback,
      };
      if (Number.isFinite(gradeData.rating) && gradeData.rating >= 1 && gradeData.rating <= 5) {
        payload.rating = gradeData.rating;
      }
      await assignmentAPI.gradeSubmission(
        currentAssignment._id,
        currentSubmission.student?._id,
        payload
      );
      setSuccess('Submission graded successfully!');
      await fetchSubmissions(currentAssignment._id);
      setShowGradingModal(false);
    } catch (err) {
      setError('Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await assignmentAPI.getAssignment(assignmentId);
      setCurrentSubmissions(response.data?.submissions || []);
    } catch (err) {
      setError('Failed to fetch submissions');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentAssignment(null);
    setFormData({
      title: '',
      description: '',
      course: '',
      dueDate: '',
      totalPoints: '',
      instructions: '',
      allowLateSubmissions: true,
      latePenalty: 10,
      submissionTypes: ['file'],
      rubric: ''
    });
  };

  const handleEdit = (assignment) => {
    setCurrentAssignment(assignment);
    setFormData({
      title: assignment.title || '',
      description: assignment.description || '',
      course: assignment.course?._id || assignment.course || '',
      dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : '',
      totalPoints: assignment.totalPoints || '',
      instructions: assignment.instructions || '',
      allowLateSubmissions: assignment.allowLateSubmissions ?? true,
      latePenalty: assignment.latePenalty || 10,
      submissionTypes: assignment.submissionTypes || ['file'],
      rubric: assignment.rubric || ''
    });
    setShowModal(true);
  };

  const handleViewSubmissions = async (assignment) => {
    setCurrentAssignment(assignment);
    await fetchSubmissions(assignment._id);
    setShowSubmissionsModal(true);
  };

  const handleGradeClick = (submission) => {
    setCurrentSubmission(submission);
    setGradeData({
      grade: submission.grade ?? '',
      feedback: submission.feedback || '',
      rating: submission.rating || 0,
    });
    setShowGradingModal(true);
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (now > dueDate) {
      return <Badge bg="danger">Overdue</Badge>;
    } else if (dueDate - now < 24 * 60 * 60 * 1000) {
      return <Badge bg="warning">Due Soon</Badge>;
    } else {
      return <Badge bg="success">Active</Badge>;
    }
  };

  const getSubmissionStats = (assignment) => {
    const total = assignment.submissions?.length || 0;
    const graded = assignment.submissions?.filter(s => s.status === 'graded').length || 0;
    const pending = total - graded;
    
    return { total, graded, pending };
  };

  const filteredAndSortedAssignments = assignments
    .filter(assignment => {
      const matchesSearch = assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = !filterCourse || assignment.course?._id === filterCourse;
      const matchesStatus = !filterStatus || 
        (filterStatus === 'active' && new Date(assignment.dueDate) > new Date()) ||
        (filterStatus === 'overdue' && new Date(assignment.dueDate) <= new Date());
      
      return matchesSearch && matchesCourse && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'points':
          aValue = a.totalPoints || 0;
          bValue = b.totalPoints || 0;
          break;
        case 'submissions':
          aValue = a.submissions?.length || 0;
          bValue = b.submissions?.length || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getOverallStats = () => {
    const total = assignments.length;
    const active = assignments.filter(a => new Date(a.dueDate) > new Date()).length;
    const overdue = assignments.filter(a => new Date(a.dueDate) <= new Date()).length;
    const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);
    const pendingGrading = assignments.reduce((sum, a) => 
      sum + (a.submissions?.filter(s => s.status !== 'graded').length || 0), 0);
    
    return { total, active, overdue, totalSubmissions, pendingGrading };
  };

  const stats = getOverallStats();

  if (loading && assignments.length === 0) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Assignment Management</h2>
          <p className="text-muted mb-0">Create and manage course assignments</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />
          Create Assignment
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

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center border-primary">
            <Card.Body>
              <FaFileAlt className="text-primary mb-2" size={24} />
              <h4 className="mb-1">{stats.total}</h4>
              <small className="text-muted">Total Assignments</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-success">
            <Card.Body>
              <FaCheckCircle className="text-success mb-2" size={24} />
              <h4 className="mb-1">{stats.active}</h4>
              <small className="text-muted">Active</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-danger">
            <Card.Body>
              <FaExclamationTriangle className="text-danger mb-2" size={24} />
              <h4 className="mb-1">{stats.overdue}</h4>
              <small className="text-muted">Overdue</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-info">
            <Card.Body>
              <FaUsers className="text-info mb-2" size={24} />
              <h4 className="mb-1">{stats.totalSubmissions}</h4>
              <small className="text-muted">Total Submissions</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-warning">
            <Card.Body>
              <FaClock className="text-warning mb-2" size={24} />
              <h4 className="mb-1">{stats.pendingGrading}</h4>
              <small className="text-muted">Pending Grading</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="title">Sort by Title</option>
                <option value="points">Sort by Points</option>
                <option value="submissions">Sort by Submissions</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-100"
              >
                <FaSort className="me-2" />
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Assignments Table */}
      <Card>
        <Card.Body>
          {filteredAndSortedAssignments.length === 0 ? (
            <div className="text-center py-5">
              <FaFileAlt size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No assignments found</h5>
              <p className="text-muted">Create your first assignment to get started</p>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <FaPlus className="me-2" />
                Create Assignment
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>Assignment</th>
                    <th>Course</th>
                    <th>Due Date</th>
                    <th>Total Points</th>
                    <th>Status</th>
                    <th>Submissions</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedAssignments.map(assignment => {
                    const stats = getSubmissionStats(assignment);
                    const progressPercent = stats.total > 0 ? (stats.graded / stats.total) * 100 : 0;
                    
                    return (
                      <tr key={assignment._id}>
                        <td>
                          <div>
                            <strong>{assignment.title}</strong>
                            {assignment.description && (
                              <div className="text-muted small">
                                {assignment.description.substring(0, 50)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">
                            {assignment.course?.title || 'Unknown Course'}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaCalendarAlt className="me-2 text-muted" />
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <Badge bg="info">{assignment.totalPoints} pts</Badge>
                        </td>
                        <td>{getStatusBadge(assignment)}</td>
                        <td>
                          <div className="text-center">
                            <strong>{stats.total}</strong>
                            <div className="small text-muted">
                              {stats.graded} graded, {stats.pending} pending
                            </div>
                          </div>
                        </td>
                        <td style={{ width: '120px' }}>
                          <ProgressBar 
                            now={progressPercent} 
                            variant={progressPercent === 100 ? 'success' : 'primary'}
                            size="sm"
                          />
                          <small className="text-muted">{Math.round(progressPercent)}% graded</small>
                        </td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleEdit(assignment)}>
                                <FaEdit className="me-2" />
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleViewSubmissions(assignment)}>
                                <FaEye className="me-2" />
                                View Submissions ({stats.total})
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                onClick={() => {
                                  setCurrentAssignment(assignment);
                                  setShowDeleteModal(true);
                                }}
                                className="text-danger"
                              >
                                <FaTrash className="me-2" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create/Edit Assignment Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs defaultActiveKey="basic" className="mb-3">
              <Tab eventKey="basic" title="Basic Info">
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Assignment Title *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                        placeholder="Enter assignment title"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Course *</Form.Label>
                      <Form.Select
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map(course => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Due Date *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Points *</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.totalPoints}
                        onChange={(e) => setFormData({...formData, totalPoints: e.target.value})}
                        required
                        min="1"
                        placeholder="100"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Brief description of the assignment"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>
              
              <Tab eventKey="details" title="Instructions & Settings">
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Detailed Instructions</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        value={formData.instructions}
                        onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                        placeholder="Provide detailed instructions for students..."
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Allow late submissions"
                      checked={formData.allowLateSubmissions}
                      onChange={(e) => setFormData({...formData, allowLateSubmissions: e.target.checked})}
                    />
                  </Col>
                  
                  {formData.allowLateSubmissions && (
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Late Penalty (%)</Form.Label>
                        <Form.Control
                          type="number"
                          value={formData.latePenalty}
                          onChange={(e) => setFormData({...formData, latePenalty: e.target.value})}
                          min="0"
                          max="100"
                          placeholder="10"
                        />
                      </Form.Group>
                    </Col>
                  )}
                  
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Grading Rubric</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={formData.rubric}
                        onChange={(e) => setFormData({...formData, rubric: e.target.value})}
                        placeholder="Define grading criteria and expectations..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (currentAssignment ? 'Update Assignment' : 'Create Assignment')}
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
          Are you sure you want to delete "{currentAssignment?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Assignment'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Submissions Modal */}
      <Modal show={showSubmissionsModal} onHide={() => setShowSubmissionsModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Submissions for "{currentAssignment?.title}"
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSubmissions.length === 0 ? (
            <div className="text-center py-4">
              <FaUsers size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No submissions yet</h5>
              <p className="text-muted">Students haven't submitted their work for this assignment</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>Student</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSubmissions.map(submission => (
                    <tr key={submission._id}>
                      <td>
                        <div>
                          <strong>{submission.student?.name || 'Unknown Student'}</strong>
                          <div className="text-muted small">{submission.student?.email}</div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaClock className="me-2 text-muted" />
                          {new Date(submission.submissionDate).toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <Badge bg={submission.status === 'graded' ? 'success' : 'warning'}>
                          {submission.status}
                        </Badge>
                      </td>
                      <td>
                        {submission.score !== undefined ? (
                          <div className="d-flex align-items-center">
                            <strong>{submission.grade}/{currentAssignment?.totalPoints}</strong>
                            <div className="ms-2">
                              {Array.from({length: 5}, (_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={i < (submission.rating || 0) ? 'text-warning' : 'text-muted'} 
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">Not graded</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <OverlayTrigger overlay={<Tooltip>Grade Submission</Tooltip>}>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleGradeClick(submission)}
                            >
                              <FaGraduationCap />
                            </Button>
                          </OverlayTrigger>
                          {submission.fileUrl && (
                            <OverlayTrigger overlay={<Tooltip>Download File</Tooltip>}>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => window.open(submission.fileUrl, '_blank')}
                              >
                                <FaDownload />
                              </Button>
                            </OverlayTrigger>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmissionsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Grading Modal */}
      <Modal show={showGradingModal} onHide={() => setShowGradingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Grade Submission</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGradeSubmission}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <div className="mb-3">
                  <strong>Student:</strong> {currentSubmission?.student?.name}
                  <br />
                  <strong>Assignment:</strong> {currentAssignment?.title}
                  <br />
                  <strong>Total Points:</strong> {currentAssignment?.totalPoints}
                </div>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Score *</Form.Label>
                  <Form.Control
                    type="number"
                    value={gradeData.score}
                    onChange={(e) => setGradeData({...gradeData, score: e.target.value})}
                    required
                    min="0"
                    max={currentAssignment?.points}
                    placeholder={`0 - ${currentAssignment?.points}`}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={gradeData.status}
                    onChange={(e) => setGradeData({...gradeData, status: e.target.value})}
                  >
                    <option value="graded">Graded</option>
                    <option value="needs_revision">Needs Revision</option>
                    <option value="incomplete">Incomplete</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Feedback</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                    placeholder="Provide feedback to the student..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowGradingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving Grade...' : 'Save Grade'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Assignments;