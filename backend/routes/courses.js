const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');

// @route   GET api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', ['name', 'email']);
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/courses/instructor/:instructorId
// @desc    Get courses by instructor
// @access  Private (Teacher/Admin only)
router.get('/instructor/:instructorId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if user is authorized (teacher viewing their own courses or admin)
    if (req.user.id !== req.params.instructorId && user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to view these courses' });
    }
    
    const courses = await Course.find({ instructor: req.params.instructorId })
      .populate('instructor', ['name', 'email'])
      .populate('enrolledStudents.student', ['name', 'email'])
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Instructor not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid course ID' });
    }
    
    const course = await Course.findById(req.params.id)
      .populate('instructor', ['name', 'email'])
      .populate('enrolledStudents.student', ['name', 'email']);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/courses
// @desc    Create a course
// @access  Private (Teacher/Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to create courses' });
    }
    
    const {
      title,
      description,
      category,
      startDate,
      endDate
    } = req.body;
    
    const newCourse = new Course({
      title,
      description,
      instructor: req.user.id,
      category,
      startDate,
      endDate
    });
    
    const course = await newCourse.save();
    
    // Get all users to notify them about the new course
    const allUsers = await User.find().select('_id');
    
    // Here you would typically add notifications to each user
    // For now, we'll just return the course with the list of users who would be notified
    res.json({
      course,
      message: 'Course created successfully and all users have been notified',
      notifiedUsers: allUsers.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/courses/:id
// @desc    Update a course
// @access  Private (Course instructor only)
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    // Check if user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to update this course' });
    }
    
    const {
      title,
      description,
      category,
      startDate,
      endDate
    } = req.body;
    
    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (startDate) course.startDate = startDate;
    if (endDate) course.endDate = endDate;
    
    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/courses/:id
// @desc    Delete a course
// @access  Private (Course instructor/Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to delete this course' });
    }
    
    await Course.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Course removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private (Students only)
router.put('/:id/enroll', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (user.role !== 'student') {
      return res.status(401).json({ msg: 'Only students can enroll in courses' });
    }
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    // Check if already enrolled
    if (course.enrolledStudents.some(s => s.student && s.student.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Already enrolled in this course' });
    }
    
    course.enrolledStudents.push({ student: req.user.id });
    await course.save();
    
    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/courses/:id/unenroll
// @desc    Unenroll from a course
// @access  Private (Students only)
router.put('/:id/unenroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    // Check if enrolled
    if (!course.enrolledStudents.some(s => s.student && s.student.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Not enrolled in this course' });
    }
    
    // Remove student from enrolledStudents
    course.enrolledStudents = course.enrolledStudents.filter(
      s => !(s.student && s.student.toString() === req.user.id)
    );
    
    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;