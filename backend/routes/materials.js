const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Material = require('../models/Material');
const Course = require('../models/Course');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/materials');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|txt|mp4|avi|mov|mp3|wav/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, videos, and audio files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: fileFilter
});

// @route   GET api/materials/course/:courseId
// @desc    Get all materials for a course
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const materials = await Material.find({ course: req.params.courseId });
    res.json(materials);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/materials/:id
// @desc    Get material by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid material ID' });
    }
    
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ msg: 'Material not found' });
    }
    
    res.json(material);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Material not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/materials/upload
// @desc    Upload a file and create a material
// @access  Private (Teacher only)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Not authorized to upload materials' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const { title, description, course } = req.body;

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Check if user is the teacher of the course
    if (courseExists.teacher.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to add materials to this course' });
    }

    // Determine file type based on extension
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let fileType = 'other';
    
    if (['.pdf'].includes(fileExtension)) {
      fileType = 'pdf';
    } else if (['.mp4', '.avi', '.mov', '.wmv'].includes(fileExtension)) {
      fileType = 'video';
    } else if (['.doc', '.docx', '.txt', '.rtf'].includes(fileExtension)) {
      fileType = 'document';
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(fileExtension)) {
      fileType = 'image';
    }

    const newMaterial = new Material({
      title: title || req.file.originalname,
      description: description || '',
      fileUrl: `/uploads/materials/${req.file.filename}`,
      fileType: fileType,
      course: course,
      createdBy: req.user.id
    });

    const material = await newMaterial.save();

    // Add material to course
    await Course.findByIdAndUpdate(course, {
      $push: { materials: material._id }
    });

    res.json(material);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/materials
// @desc    Create a material
// @access  Private (Teacher only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Not authorized to create materials' });
    }
    
    const { title, description, content, fileUrl, type, course } = req.body;
    
    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    // Check if user is the teacher of the course
    if (courseExists.teacher.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to add materials to this course' });
    }
    
    const newMaterial = new Material({
      title,
      description,
      content,
      fileUrl,
      type,
      course,
      createdBy: req.user.id
    });
    
    const material = await newMaterial.save();
    
    res.json(material);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/materials/:id
// @desc    Update a material
// @access  Private (Teacher only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Not authorized to update materials' });
    }
    
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ msg: 'Material not found' });
    }
    
    // Check if user is the creator of the material
    if (material.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this material' });
    }
    
    const { title, description, content, fileUrl, type } = req.body;
    
    if (title) material.title = title;
    if (description) material.description = description;
    if (content) material.content = content;
    if (fileUrl) material.fileUrl = fileUrl;
    if (type) material.type = type;
    
    await material.save();
    
    res.json(material);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/materials/:id
// @desc    Delete a material
// @access  Private (Teacher only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Not authorized to delete materials' });
    }
    
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ msg: 'Material not found' });
    }
    
    // Check if user is the creator of the material
    if (material.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this material' });
    }
    
    await material.deleteOne();
    
    res.json({ msg: 'Material removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;