import React, { useEffect, useState } from 'react';
import { Table, Card, Badge } from 'react-bootstrap';
import { assignmentAPI } from '../../api';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await assignmentAPI.getAssignments();
        setAssignments(res.data || []);
      } catch (err) {
        console.error('Failed to load assignments', err);
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const due = new Date(assignment.dueDate);
    if (now > due) return <Badge bg="danger">Past Due</Badge>;
    return <Badge bg="success">Open</Badge>;
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Assignments</h2>
      {loading ? (
        <div className="text-center p-5">Loading assignments...</div>
      ) : error ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4 text-danger">{error}</Card.Body>
        </Card>
      ) : assignments.length > 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Due Date</th>
                  <th>Total Points</th>
                  <th>Status</th>
                  <th>Submissions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.title}</td>
                    <td>{a.course?.title || 'N/A'}</td>
                    <td>{new Date(a.dueDate).toLocaleDateString()}</td>
                    <td>{a.totalPoints}</td>
                    <td>{getStatusBadge(a)}</td>
                    <td>{Array.isArray(a.submissions) ? a.submissions.length : 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4 text-center text-muted">No assignments found</Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Assignments;