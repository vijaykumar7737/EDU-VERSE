import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, ListGroup } from 'react-bootstrap';

const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [newPost, setNewPost] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    setDiscussions([
      {
        id: '1',
        title: 'Introduction to Programming',
        author: 'John Doe',
        date: '2023-05-15',
        content: 'Has anyone completed the final project yet? I need some guidance on the requirements.',
        replies: [
          { id: '1-1', author: 'Jane Smith', date: '2023-05-15', content: 'Yes, I finished it last week. The key is to focus on the algorithm efficiency.' },
          { id: '1-2', author: 'Mike Johnson', date: '2023-05-16', content: 'I\'m still working on it. The requirements are on page 42 of the course materials.' }
        ]
      },
      {
        id: '2',
        title: 'Web Development Basics',
        author: 'Sarah Williams',
        date: '2023-05-14',
        content: 'What\'s the best way to approach the responsive design assignment?',
        replies: [
          { id: '2-1', author: 'David Brown', date: '2023-05-14', content: 'I recommend using Bootstrap or Flexbox for responsive layouts.' }
        ]
      }
    ]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    // Add new discussion (mock)
    const newDiscussion = {
      id: Date.now().toString(),
      title: 'Current Course',
      author: 'Current User',
      date: new Date().toISOString().split('T')[0],
      content: newPost,
      replies: []
    };
    
    setDiscussions([newDiscussion, ...discussions]);
    setNewPost('');
  };

  const handleReply = (discussionId, replyContent) => {
    if (!replyContent.trim()) return;
    
    // Add reply to discussion (mock)
    setDiscussions(discussions.map(discussion => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          replies: [
            ...discussion.replies,
            {
              id: `${discussionId}-${discussion.replies.length + 1}`,
              author: 'Current User',
              date: new Date().toISOString().split('T')[0],
              content: replyContent
            }
          ]
        };
      }
      return discussion;
    }));
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Course Discussions</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Start a New Discussion</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What would you like to discuss?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Post Discussion
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      {discussions.map(discussion => (
        <Card key={discussion.id} className="mb-3">
          <Card.Header>
            <div className="d-flex justify-content-between">
              <span>{discussion.title}</span>
              <small className="text-muted">{discussion.date}</small>
            </div>
          </Card.Header>
          <Card.Body>
            <Card.Subtitle className="mb-2 text-muted">Posted by {discussion.author}</Card.Subtitle>
            <Card.Text>{discussion.content}</Card.Text>
            
            <ListGroup variant="flush" className="mt-3">
              {discussion.replies.map(reply => (
                <ListGroup.Item key={reply.id}>
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">{reply.author}</small>
                    <small className="text-muted">{reply.date}</small>
                  </div>
                  <p className="mb-0 mt-1">{reply.content}</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
            
            <Form className="mt-3" onSubmit={(e) => {
              e.preventDefault();
              const replyContent = e.target.elements.reply.value;
              handleReply(discussion.id, replyContent);
              e.target.elements.reply.value = '';
            }}>
              <Form.Group className="mb-2">
                <Form.Control
                  name="reply"
                  placeholder="Write a reply..."
                  size="sm"
                />
              </Form.Group>
              <Button variant="outline-primary" size="sm" type="submit">
                Reply
              </Button>
            </Form>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default Discussions;