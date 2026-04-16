const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  sendMessage,
  getTicketChat,
  getUnreadCount,
  getUserChats,
  getAgentChats,
} = require('../controllers/chatController');

const router = express.Router();

// Protected routes - both user and agent can send messages
router.post('/send', protect, sendMessage);

// Get chat for specific ticket (user or assigned agent)
router.get('/ticket/:ticketId', protect, getTicketChat);

// Get unread count
router.get('/unread-count', protect, getUnreadCount);

// Get all user chats
router.get('/user-chats', protect, authorize(['user']), getUserChats);

// Get agent's active chats
router.get('/agent-chats', protect, authorize(['agent']), getAgentChats);

module.exports = router;
