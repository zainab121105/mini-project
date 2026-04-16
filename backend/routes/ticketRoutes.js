const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createTicket,
  getUserTickets,
  getAllTickets,
  updateTicket,
  assignTicket,
  getSupportAgents,
  getAssignedTickets,
  reopenTicket,
} = require('../controllers/ticketController');

const router = express.Router();

// Protected routes
router.post('/create', protect, createTicket);
router.get('/user', protect, getUserTickets);
router.put('/reopen/:id', protect, reopenTicket);

// Agent routes - get only assigned tickets
router.get('/assigned', protect, authorize(['agent']), getAssignedTickets);

// Agent and Manager routes
router.get('/all', protect, authorize(['agent', 'manager']), getAllTickets);
router.put('/update/:id', protect, authorize(['agent', 'manager']), updateTicket);

// Manager only - assign tickets
router.put('/assign/:id', protect, authorize(['manager']), assignTicket);

// Get all support agents (for manager assignment interface)
router.get('/agents/list', protect, authorize(['manager']), getSupportAgents);

module.exports = router;
