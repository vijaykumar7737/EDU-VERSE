import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'EDUVERSE',
    siteDescription: 'Learning Management System',
    allowRegistration: true,
    emailNotifications: true,
    maintenanceMode: false
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock API call to save settings
    console.log('Settings saved:', settings);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">System Settings</h2>
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
          Settings saved successfully!
        </Alert>
      )}
      
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Site Name</Form.Label>
              <Form.Control
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Site Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Allow Public Registration"
                name="allowRegistration"
                checked={settings.allowRegistration}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Enable Email Notifications"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Maintenance Mode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Button variant="primary" type="submit">
              Save Settings
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings;