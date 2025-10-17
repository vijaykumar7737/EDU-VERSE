const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Since we don't have a Discussion model yet, let's create a simple schema
const DiscussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  replies: [
    {
      content: {
        type: String,
        required: true
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Discussion = mongoose.model('Discussion', DiscussionSchema);

// @route   GET api/discussions/course/:courseId
// @desc    Get all discussions for a course
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const discussions = await Discussion.find({ course: req.params.courseId })
      .populate('author', 'name')
      .populate('replies.author', 'name');
    res.json(discussions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/discussions
// @desc    Create a discussion
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, course } = req.body;
    
    const newDiscussion = new Discussion({
      title,
      content,
      course,
      author: req.user.id
    });
    
    const discussion = await newDiscussion.save();
    
    res.json(discussion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/discussions/:id/reply
// @desc    Add a reply to a discussion
// @access  Private
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    
    discussion.replies.unshift({
      content,
      author: req.user.id
    });
    
    await discussion.save();
    
    res.json(discussion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/discussions/:id
// @desc    Delete a discussion
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    
    // Check if user is the author or an admin
    if (discussion.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to delete this discussion' });
    }
    
    await discussion.deleteOne();
    
    res.json({ msg: 'Discussion removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;