import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Table, Button, Badge, Form, Row, Col, Card, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaUserGraduate, FaEnvelope, FaCalendarAlt, FaSearch, FaFilter, FaEye, FaDownload } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { courseAPI, userAPI } from '../../api';

const Students = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudentsData = useCallback(async () => {
    if (!user?._id) { setLoading(false); setError('Please login to view students'); return; }
    
    try {
      setLoading(true);
      setError('');
      
      // Fetch teacher's courses
      const coursesResponse = await courseAPI.getCoursesByInstructor(user._id);
      const teacherCourses = coursesResponse.data;
      setCourses(teacherCourses);
      
      // Collect all unique students from all courses
      const allStudents = [];
      const studentMap = new Map();
      
      for (const course of teacherCourses) {
        if (course.enrolledStudents && course.enrolledStudents.length > 0) {
          for (const studentId of course.enrolledStudents) {
            if (!studentMap.has(studentId)) {
              try {
                // Fetch student details
                const studentResponse = await userAPI.getUserById(studentId);
                const studentData = studentResponse.data;
                
                const studentInfo = {
                  _id: studentData._id,
                  name: studentData.name,
                  email: studentData.email,
                  enrollmentDate: studentData.createdAt,
                  courses: [course],
                  totalCourses: 1,
                  progress: Math.floor(Math.random() * 100) // Mock progress for now
                };
                
                studentMap.set(studentId, studentInfo);
                allStudents.push(studentInfo);
              } catch (studentError) {
                console.error(`Failed to fetch student ${studentId}:`, studentError);
              }
            } else {
              // Student already exists, add this course to their list
              const existingStudent = studentMap.get(studentId);
              existingStudent.courses.push(course);
              existingStudent.totalCourses += 1;
            }
          }
        }
      }
      
      setStudents(allStudents);
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch students data');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressBadge = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 60) return 'info';
    if (progress >= 40) return 'warning';
    return 'danger';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourse === 'all' || 
                         student.courses.some(course => course._id === selectedCourse);
    
    return matchesSearch && matchesCourse;
  });

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const exportStudentData = () => {
    const csvContent = [
      ['Name', 'Email', 'Enrollment Date', 'Courses', 'Progress'],
      ...filteredStudents.map(student => [
        student.name,
        student.email,
        formatDate(student.enrollmentDate),
        student.courses.map(c => c.title).join('; '),
        `${student.progress}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading students...</span>
        </Spinner>
        <p className="mt-2">Loading students data...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Enrolled Students</h2>
          <p className="text-muted mb-0">Manage students across all your courses</p>
        </div>
        <Button variant="outline-primary" onClick={exportStudentData} disabled={filteredStudents.length === 0}>
          <FaDownload className="me-2" />
          Export Data
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="text-center border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="text-white">
              <FaUserGraduate size={32} className="mb-2" />
              <h4>{students.length}</h4>
              <small>Total Students</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Card.Body className="text-white">
              <FaCalendarAlt size={32} className="mb-2" />
              <h4>{courses.length}</h4>
              <small>Active Courses</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Card.Body className="text-white">
              <FaUserGraduate size={32} className="mb-2" />
              <h4>{Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) || 0}%</h4>
              <small>Avg Progress</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Card.Body className="text-white">
              <FaEnvelope size={32} className="mb-2" />
              <h4>{students.filter(s => s.progress >= 80).length}</h4>
              <small>High Performers</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search Students</Form.Label>
                <div className="position-relative">
                  <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <Form.Control
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-5"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Course</Form.Label>
                <div className="position-relative">
                  <FaFilter className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <Form.Select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="ps-5"
                  >
                    <option value="all">All Courses</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Students Table */}
      {filteredStudents.length > 0 ? (
        <Card>
          <Card.Body className="p-0">
            <Table striped hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Enrollment Date</th>
                  <th>Courses</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '40px', height: '40px' }}>
                          <span className="text-white fw-bold">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <strong>{student.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>{formatDate(student.enrollmentDate)}</td>
                    <td>
                      <Badge bg="info" className="me-1">
                        {student.totalCourses} course{student.totalCourses !== 1 ? 's' : ''}
                      </Badge>
                      <div className="mt-1">
                        <small className="text-muted">
                          {student.courses.slice(0, 2).map(c => c.title).join(', ')}
                          {student.courses.length > 2 && ` +${student.courses.length - 2} more`}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1 me-2" style={{ height: '8px', width: '80px' }}>
                          <div 
                            className={`progress-bar bg-${getProgressBadge(student.progress)}`} 
                            role="progressbar" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <Badge bg={getProgressBadge(student.progress)}>
                          {student.progress}%
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleViewStudent(student)}
                      >
                        <FaEye className="me-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        href={`mailto:${student.email}`}
                      >
                        <FaEnvelope className="me-1" />
                        Email
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <FaUserGraduate size={64} className="text-muted mb-3" />
            <h4>No Students Found</h4>
            <p className="text-muted">
              {students.length === 0 
                ? "No students are enrolled in your courses yet." 
                : "No students match your current filters."}
            </p>
            {students.length === 0 && (
              <p className="text-muted">
                Students will appear here when they enroll in your courses.
              </p>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Student Details Modal */}
      <Modal show={showStudentModal} onHide={() => setShowStudentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>{selectedStudent.name}</h5>
                  <p className="text-muted">{selectedStudent.email}</p>
                  <p><strong>Enrolled:</strong> {formatDate(selectedStudent.enrollmentDate)}</p>
                  <p><strong>Overall Progress:</strong> 
                    <Badge bg={getProgressBadge(selectedStudent.progress)} className="ms-2">
                      {selectedStudent.progress}%
                    </Badge>
                  </p>
                </Col>
              </Row>
              
              <h6>Enrolled Courses</h6>
              <div className="row">
                {selectedStudent.courses.map(course => (
                  <div key={course._id} className="col-md-6 mb-3">
                    <Card className="border">
                      <Card.Body className="p-3">
                        <h6 className="mb-1">{course.title}</h6>
                        <small className="text-muted">{course.category}</small>
                        <div className="mt-2">
                          <Badge bg="primary">{course.enrolledStudents?.length || 0} students</Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStudentModal(false)}>
            Close
          </Button>
          <Button variant="primary" href={`mailto:${selectedStudent?.email}`}>
            Send Email
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Students;