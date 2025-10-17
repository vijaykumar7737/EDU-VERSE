import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Card, Badge, Row, Col } from 'react-bootstrap';
import { FaDownload, FaUser, FaClock, FaFileAlt } from 'react-icons/fa';
import { assignmentAPI } from '../api';
import StarRating from './StarRating';

const AssignmentReview = ({ show, onHide, assignment, onReviewComplete }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState('');
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: '',
    rating: 0
  });

  useEffect(() => {
    if (assignment && show) {
      setSubmissions(assignment.submissions || []);
      setSelectedSubmission(null);
      setGradeForm({ grade: '', feedback: '', rating: 0 });
      setError('');
    }
  }, [assignment, show]);

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade || '',
      feedback: submission.feedback || '',
      rating: submission.rating || 0
    });
  };

  const handleGradeSubmit = async () => {
    if (!selectedSubmission) return;
    
    try {
      setGrading(true);
      setError('');
      
      await assignmentAPI.gradeSubmission(
        assignment._id,
        selectedSubmission.student._id || selectedSubmission.student,
        gradeForm
      );
      
      // Update the submission in the local state
      const updatedSubmissions = submissions.map(sub => 
        sub.student._id === selectedSubmission.student._id
          ? { ...sub, ...gradeForm, status: 'graded' }
          : sub
      );
      setSubmissions(updatedSubmissions);
      
      // Clear selection
      setSelectedSubmission(null);
      setGradeForm({ grade: '', feedback: '', rating: 0 });
      
      if (onReviewComplete) {
        onReviewComplete();
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { bg: 'primary', text: 'Submitted' },
      graded: { bg: 'success', text: 'Graded' },
      late: { bg: 'warning', text: 'Late' }
    };
    const config = statusConfig[status] || statusConfig.submitted;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!assignment) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Review Assignment: {assignment.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Row>
          {/* Submissions List */}
          <Col md={6}>
            <h5 className="mb-3">
              Student Submissions ({submissions.length})
            </h5>
            
            {submissions.length === 0 ? (
              <Card className="text-center p-4">
                <Card.Body>
                  <FaFileAlt size={48} className="text-muted mb-3" />
                  <h6>No Submissions Yet</h6>
                  <p className="text-muted">Students haven't submitted their work yet.</p>
                </Card.Body>
              </Card>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {submissions.map((submission, index) => (
                  <Card 
                    key={index}
                    className={`mb-2 ${selectedSubmission === submission ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSubmissionSelect(submission)}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            <FaUser className="me-2" />
                            {submission.student?.name || 'Unknown Student'}
                          </h6>
                          <small className="text-muted">
                            <FaClock className="me-1" />
                            {formatDate(submission.submissionDate)}
                          </small>
                        </div>
                        <div className="text-end">
                          {getStatusBadge(submission.status)}
                          {submission.rating > 0 && (
                            <div className="mt-1">
                              <StarRating rating={submission.rating} readonly size="0.9rem" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {submission.grade && (
                        <div className="mt-2">
                          <strong>Grade: {submission.grade}/{assignment.totalPoints}</strong>
                        </div>
                      )}
                      
                      {submission.fileUrl && (
                        <div className="mt-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaDownload className="me-1" />
                            View Submission
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Col>
          
          {/* Grading Panel */}
          <Col md={6}>
            {selectedSubmission ? (
              <div>
                <h5 className="mb-3">
                  Grade Submission
                </h5>
                
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">
                      {selectedSubmission.student?.name || 'Unknown Student'}
                    </h6>
                    <small className="text-muted">
                      Submitted: {formatDate(selectedSubmission.submissionDate)}
                    </small>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Grade (out of {assignment.totalPoints})</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max={assignment.totalPoints}
                          value={gradeForm.grade}
                          onChange={(e) => setGradeForm({
                            ...gradeForm,
                            grade: e.target.value
                          })}
                          placeholder="Enter grade"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Star Rating</Form.Label>
                        <div>
                          <StarRating
                            rating={gradeForm.rating}
                            onRatingChange={(rating) => setGradeForm({
                              ...gradeForm,
                              rating
                            })}
                            size="1.5rem"
                          />
                        </div>
                        <Form.Text className="text-muted">
                          Rate the quality of the submission (1-5 stars)
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Feedback</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={gradeForm.feedback}
                          onChange={(e) => setGradeForm({
                            ...gradeForm,
                            feedback: e.target.value
                          })}
                          placeholder="Provide feedback to the student..."
                        />
                      </Form.Group>
                      
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          onClick={handleGradeSubmit}
                          disabled={grading || !gradeForm.grade}
                        >
                          {grading ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Grading...
                            </>
                          ) : (
                            'Submit Grade'
                          )}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => setSelectedSubmission(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </div>
            ) : (
              <Card className="text-center p-4">
                <Card.Body>
                  <FaUser size={48} className="text-muted mb-3" />
                  <h6>Select a Submission</h6>
                  <p className="text-muted">
                    Click on a student submission from the left to start grading.
                  </p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignmentReview;