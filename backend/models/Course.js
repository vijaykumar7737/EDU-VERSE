const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  enrolledStudents: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      enrollmentDate: {
        type: Date,
        default: Date.now
      },
      progress: {
        type: Number,
        default: 0
      }
    }
  ],
  materials: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    }
  ],
  assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', CourseSchema);