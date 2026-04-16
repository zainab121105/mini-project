const Chat = require('../models/Chat');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const SupportAgent = require('../models/SupportAgent');
const { sendEmail } = require('../utils/sendEmail');

// Send Chat Message
exports.sendMessage = async (req, res) => {
  try {
    const { ticketId, message } = req.body;
    const senderId = req.user.id;

    if (!ticketId || !message) {
      return res.status(400).json({ success: false, message: 'Please provide ticketId and message' });
    }

    // Verify ticket exists
    const ticket = await Ticket.findById(ticketId)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Verify user has access to ticket (user owns it or is an agent)
    const isOwner = String(ticket.userId._id) === String(senderId);
    const isAgent = req.user.role === 'agent';

    if (!isOwner && !isAgent) {
      return res.status(403).json({ success: false, message: 'Not authorized to chat on this ticket' });
    }

    // Create message
    const chat = await Chat.create({
      ticketId,
      senderId,
      senderRole: req.user.role,
      message,
      isRead: false,
    });

    // Populate sender details
    const populatedChat = await Chat.findById(chat._id)
      .populate('senderId', 'name email')
      .populate('ticketId', 'title');

    // Send notification email to the other party
    if (isAgent && ticket.userId && ticket.userId.email) {
      // Agent sent message - notify ticket owner
      const sender = await User.findById(senderId);
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">📬 New Message from Support Agent</h2>
          <p>Hello <strong>${ticket.userId.name}</strong>,</p>
          <p>Your support agent <strong>${sender.name}</strong> has sent you a new message regarding your ticket.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3498db;">
            <p><strong>Ticket ID:</strong> ${ticket._id}</p>
            <p><strong>Subject:</strong> ${ticket.title}</p>
            <p><strong>Message Preview:</strong></p>
            <p style="font-style: italic; margin: 10px 0; color: #555;">"${message.substring(0, 150)}${message.length > 150 ? '...' : ''}"</p>
          </div>
          
          <p>Please log in to your dashboard to view the complete message and respond if needed.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      `;
      
      try {
        await sendEmail({
          to: ticket.userId.email,
          subject: `📬 New Message on Ticket #${ticket._id}`,
          html: emailContent
        });
      } catch (emailError) {
        console.error('Error sending ticket owner notification:', emailError.message);
      }
    } else if (isOwner && ticket.assignedTo && ticket.assignedTo.email) {
      // Owner sent message - notify assigned agent
      const sender = await User.findById(senderId);
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">📬 New Message from Ticket Owner</h2>
          <p>Hello <strong>${ticket.assignedTo.name}</strong>,</p>
          <p>The ticket owner <strong>${sender.name}</strong> has sent you a new response on their support ticket.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3498db;">
            <p><strong>Ticket ID:</strong> ${ticket._id}</p>
            <p><strong>Subject:</strong> ${ticket.title}</p>
            <p><strong>Message Preview:</strong></p>
            <p style="font-style: italic; margin: 10px 0; color: #555;">"${message.substring(0, 150)}${message.length > 150 ? '...' : ''}"</p>
          </div>
          
          <p>Please log in to your dashboard to view the complete message and provide your response.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      `;
      
      try {
        await sendEmail({
          to: ticket.assignedTo.email,
          subject: `📬 New Message on Ticket #${ticket._id}`,
          html: emailContent
        });
      } catch (emailError) {
        console.error('Error sending agent notification:', emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      chat: populatedChat,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Ticket Chat Messages
exports.getTicketChat = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    // Verify ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Verify user has access (owner or assigned agent or agent who has sent message)
    const user = await User.findById(userId);
    const isOwner = String(ticket.userId) === String(userId);
    const isAgent = user && user.role === 'agent';
    
    // For agents, check if they are assigned to this ticket via SupportAgent email match
    let isAssignedAgent = false;
    if (isAgent && ticket.assignedTo) {
      const supportAgent = await SupportAgent.findOne({ email: user.email });
      isAssignedAgent = supportAgent ? String(ticket.assignedTo) === String(supportAgent._id) : false;
    }
    
    // Check if agent has sent a message on this ticket
    const agentMessage = isAgent ? await Chat.findOne({ ticketId, senderId: userId }) : null;
    const hasParticipated = agentMessage ? true : false;

    if (!isOwner && !isAssignedAgent && !hasParticipated) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this chat' });
    }

    // Get all messages for this ticket
    const messages = await Chat.find({ ticketId })
      .populate('senderId', 'name email role')
      .sort({ createdAt: 1 });

    // Mark messages as read if viewing own chat
    await Chat.updateMany(
      { ticketId, isRead: false, senderId: { $ne: userId } },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      ticketId,
      messages,
      messageCount: messages.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Unread Message Count for User
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all unread messages where user is the recipient
    const unreadCount = await Chat.countDocuments({
      isRead: false,
      senderId: { $ne: userId },
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All User Chats (for user viewing their ticket conversations)
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all tickets for this user
    const tickets = await Ticket.find({ userId }).select('_id');
    const ticketIds = tickets.map(t => t._id);

    // Get latest message for each ticket
    const chats = await Chat.aggregate([
      { $match: { ticketId: { $in: ticketIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$ticketId',
          latestMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
          },
        },
      },
      { $sort: { 'latestMessage.createdAt': -1 } },
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: '_id',
          as: 'ticketDetails',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Agent's Active Chats
exports.getAgentChats = async (req, res) => {
  try {
    const agentId = req.user.id;

    // Get agent user record
    const agent = await User.findById(agentId);
    
    if (!agent || agent.role !== 'agent') {
      return res.status(403).json({ success: false, message: 'Not an agent' });
    }

    // Find the SupportAgent record by matching email
    const supportAgent = await SupportAgent.findOne({ email: agent.email });

    if (!supportAgent) {
      // No support agent record found, return empty chats
      return res.status(200).json({
        success: true,
        chats: [],
      });
    }

    // Get all tickets assigned to this support agent
    const assignedTickets = await Ticket.find({ assignedTo: supportAgent._id }).select('_id');
    const ticketIds = assignedTickets.map(t => t._id);

    if (ticketIds.length === 0) {
      // No assigned tickets, return empty chats
      return res.status(200).json({
        success: true,
        chats: [],
      });
    }

    // Get latest message for each assigned ticket
    const chats = await Chat.aggregate([
      { $match: { ticketId: { $in: ticketIds } } },  // Only conversations from assigned tickets
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$ticketId',
          latestMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
          },
        },
      },
      { $sort: { 'latestMessage.createdAt': -1 } },
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: '_id',
          as: 'ticketDetails',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ticketDetails.userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
