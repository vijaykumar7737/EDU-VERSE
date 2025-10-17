const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  submissions: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      submissionDate: {
        type: Date,
        default: Date.now
      },
      fileUrl: {
        type: String
      },
      grade: {
        type: Number,
        default: null
      },
      feedback: {
        type: String,
        default: ''
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      status: {
        type: String,
        enum: ['submitted', 'graded', 'late'],
        default: 'submitted'
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);