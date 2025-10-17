const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const User = require('../models/User');

// @route   GET api/assignments
// @desc    Get all assignments (filtered by course if provided)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { course } = req.query;
    const filter = course ? { course } : {};
    
    // If student, only get assignments from enrolled courses
    if (req.user.role === 'student') {
      const enrolledCourses = await Course.find({
        'enrolledStudents.student': req.user.id
      }).select('_id');
      const courseIds = enrolledCourses.map(c => c._id);
      filter.course = { $in: courseIds };
    }
    
    // If teacher, only get assignments from courses they teach
    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ 
        instructor: req.user.id 
      }).select('_id');
      
      const courseIds = teacherCourses.map(course => course._id);
      filter.course = { $in: courseIds };
    }
    
    const assignments = await Assignment.find(filter)
      .populate('course', 'title category')
      .sort({ dueDate: 1 });
      
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/assignments/:id
// @desc    Get assignment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid assignment ID' });
    }
    
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title category instructor')
      .populate('submissions.student', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    
    // Check if user has access to this assignment
    const course = await Course.findById(assignment.course);
    
    if (req.user.role === 'student' && 
        !course.enrolledStudents.includes(req.user.id)) {
      return res.status(401).json({ msg: 'Not authorized to view this assignment' });
    }
    
    if (req.user.role === 'teacher' && 
        course.instructor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to view this assignment' });
    }
    
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/assignments
// @desc    Create an assignment
// @access  Private (Teacher/Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to create assignments' });
    }
    
    const {
      title,
      description,
      course,
      dueDate,
      totalPoints
    } = req.body;
    
    // Check if course exists and user is instructor
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    if (req.user.role === 'teacher' && 
        courseDoc.instructor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to create assignments for this course' });
    }
    
    const newAssignment = new Assignment({
      title,
      description,
      course,
      dueDate,
      totalPoints
    });
    
    const assignment = await newAssignment.save();
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/assignments/:id
// @desc    Update an assignment
// @access  Private (Teacher/Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to update assignments' });
    }
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    
    // Check if user is instructor of the course
    const course = await Course.findById(assignment.course);
    if (req.user.role === 'teacher' && 
        course.instructor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this assignment' });
    }
    
    const {
      title,
      description,
      dueDate,
      totalPoints
    } = req.body;
    
    // Update fields
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;
    if (totalPoints) assignment.totalPoints = totalPoints;
    
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/assignments/:id
// @desc    Delete an assignment
// @access  Private (Teacher/Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to delete assignments' });
    }
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    
    // Check if user is instructor of the course
    const course = await Course.findById(assignment.course);
    if (req.user.role === 'teacher' && 
        course.instructor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this assignment' });
    }
    
    await assignment.deleteOne();
    res.json({ msg: 'Assignment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/assignments/:id/submit
// @desc    Submit an assignment
// @access  Private (Students only)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(401).json({ msg: 'Only students can submit assignments' });
    }
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    
    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.course);
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(401).json({ msg: 'Not enrolled in this course' });
    }
    
    const { fileUrl } = req.body;
    
    // Check if already submitted
    const submissionIndex = assignment.submissions.findIndex(
      submission => submission.student.toString() === req.user.id
    );
    
    if (submissionIndex !== -1) {
      // Update existing submission
      assignment.submissions[submissionIndex].fileUrl = fileUrl;
      assignment.submissions[submissionIndex].submissionDate = Date.now();
      
      // Check if submission is late
      if (new Date() > new Date(assignment.dueDate)) {
        assignment.submissions[submissionIndex].status = 'late';
      }
    } else {
      // Create new submission
      const newSubmission = {
        student: req.user.id,
        fileUrl,
        status: new Date() > new Date(assignment.dueDate) ? 'late' : 'submitted'
      };
      
      assignment.submissions.push(newSubmission);
    }
    
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/assignments/:id/grade/:studentId
// @desc    Grade a student's submission
// @access  Private (Teacher/Admin only)
router.put('/:id/grade/:studentId', auth, async (req, res) => {
  try {
    // Check if user is teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to grade assignments' });
    }
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    
    // Check if user is instructor of the course
    const course = await Course.findById(assignment.course);
    if (req.user.role === 'teacher' && 
        course.instructor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to grade this assignment' });
    }
    
    const { grade, feedback, rating } = req.body;
    
    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ msg: 'Rating must be between 1 and 5 stars' });
    }
    
    // Find submission
    const submissionIndex = assignment.submissions.findIndex(
      submission => submission.student.toString() === req.params.studentId
    );
    
    if (submissionIndex === -1) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    
    // Update grade, feedback, and rating
    assignment.submissions[submissionIndex].grade = grade;
    assignment.submissions[submissionIndex].feedback = feedback;
    if (rating !== undefined) {
      assignment.submissions[submissionIndex].rating = rating;
    }
    assignment.submissions[submissionIndex].status = 'graded';
    
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Assignment or submission not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;