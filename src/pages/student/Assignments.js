import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { assignmentAPI } from '../../api';
import StarRating from '../../components/StarRating';

const Assignments = () => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await assignmentAPI.getAssignments();
        setAssignments(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load assignments');
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleSubmitClick = (assignment) => {
    setCurrentAssignment(assignment);
    setShowSubmitModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignmentAPI.submitAssignment(currentAssignment._id, { fileUrl });
      
      // Update the assignments list
      const updatedAssignments = assignments.map(assignment => 
        assignment._id === currentAssignment._id 
          ? { ...assignment, submitted: true } 
          : assignment
      );
      
      setAssignments(updatedAssignments);
      setShowSubmitModal(false);
      setFileUrl('');
    } catch (err) {
      setError('Failed to submit assignment');
    }
  };

  const userId = user?._id || user?.id;
  const isOwnSubmission = (sub) => {
    if (!sub) return false;
    if (typeof sub.student === 'string') return sub.student === userId;
    return sub.student?._id === userId;
  };

  const getStatusBadge = (assignment) => {
    const submission = assignment.submissions?.find((sub) => isOwnSubmission(sub));
    
    if (!submission) {
      const dueDate = new Date(assignment.dueDate);
      const now = new Date();
      
      if (now > dueDate) {
        return <Badge bg="danger">Overdue</Badge>;
      } else {
        return <Badge bg="warning">Pending</Badge>;
      }
    }
    
    switch (submission.status) {
      case 'graded':
        return <Badge bg="success">Graded</Badge>;
      case 'late':
        return <Badge bg="warning">Late</Badge>;
      default:
        return <Badge bg="primary">Submitted</Badge>;
    }
  };

  const getSubmissionDetails = (assignment) => {
    return assignment.submissions?.find((sub) => isOwnSubmission(sub));
  };

  if (loading) return <div className="text-center p-5">Loading assignments...</div>;
  
  if (error) return <div className="alert alert-danger m-5">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">My Assignments</h2>
      
      {assignments.length > 0 ? (
        <Row>
          {assignments.map(assignment => (
            <Col md={6} lg={4} className="mb-4" key={assignment._id}>
              <Card className="h-100 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  {getStatusBadge(assignment)}
                  <span className="text-muted small">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </Card.Header>
                <Card.Body>
                  <Card.Title>{assignment.title}</Card.Title>
                  <Card.Text className="text-muted mb-3">
                    {assignment.description}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>
                      <strong>Course:</strong> {assignment.course?.title || 'N/A'}
                    </span>
                    <span>
                      <strong>Points:</strong> {assignment.totalPoints}
                    </span>
                  </div>
                  {(() => {
                    const submission = getSubmissionDetails(assignment);
                    if (submission && submission.status === 'graded') {
                      return (
                        <div className="mt-3 p-3 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span><strong>Grade:</strong> {submission.grade}/{assignment.totalPoints}</span>
                            {submission.rating && (
                              <div className="d-flex align-items-center">
                                <span className="me-2"><strong>Rating:</strong></span>
                                <StarRating rating={submission.rating} readonly size="sm" />
                              </div>
                            )}
                          </div>
                          {submission.feedback && (
                            <div>
                              <strong>Feedback:</strong>
                              <p className="mb-0 mt-1 text-muted">{submission.feedback}</p>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => handleSubmitClick(assignment)}
                      disabled={assignment.submissions?.some((sub) => isOwnSubmission(sub))}
                    >
                      {assignment.submissions?.some((sub) => isOwnSubmission(sub)) 
                        ? 'Submitted' 
                        : 'Submit Assignment'}
                    </Button>
                    <Button variant="link">View Details</Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="text-center p-5">
          <Card.Body>
            <h4>No assignments found</h4>
            <p className="text-muted">You don't have any assignments yet</p>
          </Card.Body>
        </Card>
      )}

      {/* Submit Assignment Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Assignment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <p><strong>Assignment:</strong> {currentAssignment?.title}</p>
            <p><strong>Due Date:</strong> {currentAssignment?.dueDate && new Date(currentAssignment.dueDate).toLocaleDateString()}</p>
            
            <Form.Group className="mb-3">
              <Form.Label>Submission URL</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter link to your submission (Google Drive, GitHub, etc.)" 
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Please provide a link to your assignment submission file
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Assignment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Assignments;