import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert, Spinner, Card, Badge, Row, Col } from 'react-bootstrap';
import { FaUpload, FaDownload, FaTrash, FaFile, FaFilePdf, FaFileVideo, FaFileImage, FaFileAlt } from 'react-icons/fa';
import { materialAPI } from '../api';

const FileManager = ({ show, onHide, courseId, courseName }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileDescription, setFileDescription] = useState('');

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await materialAPI.getMaterialsByCourse(courseId);
      setMaterials(response.data);
    } catch (err) {
      setError('Failed to fetch materials');
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (show && courseId) {
      fetchMaterials();
    }
  }, [show, courseId, fetchMaterials]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file && !fileTitle) {
      setFileTitle(file.name);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', fileTitle);
      formData.append('description', fileDescription);
      formData.append('course', courseId);

      await materialAPI.uploadMaterial(formData);
      
      setSuccess('File uploaded successfully!');
      setSelectedFile(null);
      setFileTitle('');
      setFileDescription('');
      document.getElementById('fileInput').value = '';
      
      // Refresh materials list
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to upload file');
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setError('');
      await materialAPI.deleteMaterial(materialId);
      setSuccess('File deleted successfully!');
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete file');
      console.error('Error deleting material:', err);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="text-danger" />;
      case 'video':
        return <FaFileVideo className="text-primary" />;
      case 'image':
        return <FaFileImage className="text-success" />;
      case 'document':
        return <FaFileAlt className="text-info" />;
      default:
        return <FaFile className="text-secondary" />;
    }
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return 'danger';
      case 'video':
        return 'primary';
      case 'image':
        return 'success';
      case 'document':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaFile className="me-2" />
          Manage Files - {courseName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Upload Form */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <FaUpload className="me-2" />
              Upload New File
            </h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleUpload}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select File</Form.Label>
                    <Form.Control
                      id="fileInput"
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav"
                      required
                    />
                    <Form.Text className="text-muted">
                      Max file size: 50MB. Supported formats: PDF, Documents, Images, Videos, Audio
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>File Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      placeholder="Enter file title"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Enter file description"
                />
              </Form.Group>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={uploading || !selectedFile}
              >
                {uploading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload className="me-2" />
                    Upload File
                  </>
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* Materials List */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">Course Materials ({materials.length})</h5>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
                <p className="mt-2">Loading materials...</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <FaFile size={48} className="mb-3" />
                <p>No materials uploaded yet</p>
              </div>
            ) : (
              <div className="materials-list">
                {materials.map((material) => (
                  <Card key={material._id} className="mb-3">
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col md={1} className="text-center">
                          {getFileIcon(material.fileType)}
                        </Col>
                        <Col md={6}>
                          <h6 className="mb-1">{material.title}</h6>
                          {material.description && (
                            <p className="text-muted small mb-1">{material.description}</p>
                          )}
                          <small className="text-muted">
                            Uploaded: {formatDate(material.uploadDate)}
                          </small>
                        </Col>
                        <Col md={2}>
                          <Badge bg={getFileTypeColor(material.fileType)}>
                            {material.fileType.toUpperCase()}
                          </Badge>
                        </Col>
                        <Col md={3} className="text-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => window.open(`http://localhost:5000${material.fileUrl}`, '_blank')}
                          >
                            <FaDownload />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(material._id)}
                          >
                            <FaTrash />
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileManager;