const express = require('express');
const router = express.Router();
const { getMessages, getPrivateMessages, getOnlineUsers, getAllUsers } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Messages routes
router.get('/messages/:room', protect, getMessages);
router.get('/messages/private/:userId', protect, getPrivateMessages);

// Users routes
router.get('/users', protect, getAllUsers);
router.get('/users/online', protect, getOnlineUsers);

module.exports = router;
