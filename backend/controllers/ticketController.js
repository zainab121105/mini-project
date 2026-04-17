const Ticket = require('../models/Ticket');
const SupportAgent = require('../models/SupportAgent');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');

// Create Ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, and category' });
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || 'Medium',
      category,
      userId: req.user.id,
    });

    // Get user details to send email
    const user = await User.findById(req.user.id);
    
    // Send email to user (async - don't block the response)
    if (user && user.email) {
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">Ticket Created Successfully ✅</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your support ticket has been created and is now waiting for a support agent to review it.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> ${ticket._id}</p>
            <p><strong>Status:</strong> <span style="color: #e74c3c; font-weight: bold;">Open</span></p>
            <p><strong>Category:</strong> ${ticket.category}</p>
            <p><strong>Priority:</strong> ${ticket.priority}</p>
            <p><strong>Title:</strong> ${ticket.title}</p>
            <p><strong>Description:</strong> ${ticket.description}</p>
          </div>
          
          <p>We will assign a support agent to your ticket soon. Thank you for contacting us!</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      `;
      
      await sendEmail({ to: user.email, subject: `Ticket #${ticket._id} - Created Successfully`, html: emailContent });
    }

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket,
      emailSent: user && user.email ? true : false,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Tickets
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id })
      .populate('assignedTo', 'name role expertise')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Tickets (Agent and Manager)
exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority, sortBy } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    let query = Ticket.find(filter)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name role expertise');

    if (sortBy === 'recent') {
      query = query.sort({ createdAt: -1 });
    } else if (sortBy === 'oldest') {
      query = query.sort({ createdAt: 1 });
    }

    const tickets = await query;

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Ticket Status
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status' });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    // Populate user details for email
    const populatedTicket = await Ticket.findById(id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name role');

    // Send email to user when status changes
    if (populatedTicket.userId && populatedTicket.userId.email) {
      const user = populatedTicket.userId;
      
      let emailContent;
      let emailSubject;
      
      if (status === 'Resolved') {
        // Special email for resolved tickets with confirmation request
        emailSubject = `Ticket #${populatedTicket._id} - Resolved ✅`;
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #27ae60;">Your Ticket Has Been Resolved ✅</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Great news! Your support ticket has been marked as resolved. We have completed the work requested and hope we could help you resolve your issue.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Ticket ID:</strong> ${populatedTicket._id}</p>
              <p><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">Resolved</span></p>
              <p><strong>Category:</strong> ${populatedTicket.category}</p>
              <p><strong>Title:</strong> ${populatedTicket.title}</p>
              <p><strong>Description:</strong> ${populatedTicket.description}</p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 5px;">
              <p><strong>📋 Please Confirm:</strong></p>
              <p>Could you please confirm that your issue has been resolved satisfactorily? Your feedback helps us improve our support services.</p>
              <p>If you still have any concerns or the issue is not fully resolved, please don't hesitate to reopen this ticket or create a new one.</p>
            </div>
            
            <p style="color: #666; margin-top: 20px;">Thank you for using our support system!</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
          </div>
        `;
      } else {
        // Standard email for other status changes
        emailSubject = `Ticket #${populatedTicket._id} - Status: ${status}`;
        const statusMessage = status === 'In Progress' 
          ? 'Your support ticket is now being worked on by our support team.' 
          : 'Your support ticket status has been updated.';
        
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #333;">Ticket Status Updated 🔄</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>${statusMessage}</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Ticket ID:</strong> ${populatedTicket._id}</p>
              <p><strong>Previous Status:</strong> <span style="text-decoration: line-through; color: #999;">${oldStatus}</span></p>
              <p><strong>Current Status:</strong> <span style="color: ${status === 'In Progress' ? '#f39c12' : '#e74c3c'}; font-weight: bold;">${status}</span></p>
              <p><strong>Category:</strong> ${populatedTicket.category}</p>
              <p><strong>Title:</strong> ${populatedTicket.title}</p>
            </div>
            
            <p>Our team will continue to work on your ticket. Thank you for your patience!</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
          </div>
        `;
      }
      
      await sendEmail({ to: user.email, subject: emailSubject, html: emailContent });
    }

    // Send email to support managers when ticket is escalated
    let managerEmailSent = false;
    if (status === 'Escalated') {
      try {
        // Find all managers
        const managers = await User.find({ role: 'manager' });
        
        if (managers && managers.length > 0) {
          const agent = populatedTicket.assignedTo;
          
          for (const manager of managers) {
            const emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #c0392b;">Ticket Escalated - Requires Manager Review 🚨</h2>
                <p>Hello <strong>${manager.name}</strong>,</p>
                <p>A support ticket has been escalated and requires your immediate attention and review. Please assess the situation and take necessary action.</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Ticket ID:</strong> ${populatedTicket._id}</p>
                  <p><strong>Status:</strong> <span style="color: #c0392b; font-weight: bold;">Escalated</span></p>
                  <p><strong>Previous Status:</strong> ${oldStatus}</p>
                  <p><strong>Category:</strong> ${populatedTicket.category}</p>
                  <p><strong>Priority:</strong> <span style="color: ${populatedTicket.priority === 'High' ? '#e74c3c' : populatedTicket.priority === 'Medium' ? '#f39c12' : '#27ae60'}; font-weight: bold;">${populatedTicket.priority}</span></p>
                  <p><strong>Title:</strong> ${populatedTicket.title}</p>
                  <p><strong>Description:</strong> ${populatedTicket.description}</p>
                  <p><strong>User:</strong> ${populatedTicket.userId.name} (${populatedTicket.userId.email})</p>
                  ${agent ? `<p><strong>Currently Assigned To:</strong> ${agent.name} (${agent.role})</p>` : '<p><strong>Currently Assigned To:</strong> Unassigned</p>'}
                </div>
                
                <div style="background-color: #ffe6e6; padding: 15px; border-left: 4px solid #c0392b; margin: 20px 0; border-radius: 5px;">
                  <p><strong>⚠️ Action Required:</strong></p>
                  <p>This ticket has been escalated because:</p>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>The assigned agent may need assistance</li>
                    <li>The issue is complex or urgent</li>
                    <li>Customer satisfaction is at risk</li>
                  </ul>
                  <p>Please log in to the dashboard immediately and review this ticket. Contact the assigned agent if additional support is needed.</p>
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
              </div>
            `;
            
            await sendEmail({ to: manager.email, subject: `ESCALATED: Ticket #${populatedTicket._id} - Manager Review Required`, html: emailContent });
          }
          
          managerEmailSent = true;
        }
      } catch (error) {
        console.error('Error sending escalation email to managers:', error.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      ticket: populatedTicket,
      emailSent: (populatedTicket.userId && populatedTicket.userId.email) || managerEmailSent ? true : false,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign Ticket to Support Agent
exports.assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (agentId) {
      // Manager manually selecting an agent - allow even without matching expertise
      const agent = await SupportAgent.findById(agentId);
      if (!agent) {
        return res.status(404).json({ success: false, message: 'Support agent not found' });
      }

      ticket.assignedTo = agentId;
      let assignmentNote = 'Ticket assigned successfully';
      
      // Add note if agent doesn't have expertise in this category
      if (!agent.expertise.includes(ticket.category)) {
        assignmentNote = `Ticket assigned to ${agent.name}. Note: Agent doesn't have direct expertise in ${ticket.category}, but will handle as needed.`;
      }

      ticket.status = 'In Progress';
      await ticket.save();

      const populatedTicket = await Ticket.findById(id)
        .populate('assignedTo', 'name role expertise email')
        .populate('userId', 'name email');

      // Send email to assigned agent
      let agentEmailSent = false;
      if (populatedTicket.assignedTo && populatedTicket.assignedTo.email && populatedTicket.userId) {
        const agent = populatedTicket.assignedTo;
        const user = populatedTicket.userId;
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #333;">New Ticket Assigned 📋</h2>
            <p>Hello <strong>${agent.name}</strong>,</p>
            <p>You have been assigned a new support ticket. Please review the details below and take necessary action.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Ticket ID:</strong> ${populatedTicket._id}</p>
              <p><strong>Category:</strong> ${populatedTicket.category}</p>
              <p><strong>Priority:</strong> <span style="color: ${populatedTicket.priority === 'High' ? '#e74c3c' : populatedTicket.priority === 'Medium' ? '#f39c12' : '#27ae60'}; font-weight: bold;">${populatedTicket.priority}</span></p>
              <p><strong>Title:</strong> ${populatedTicket.title}</p>
              <p><strong>Description:</strong> ${populatedTicket.description}</p>
              <p><strong>User:</strong> ${user.name} (${user.email})</p>
            </div>
            
            <p>Please log in to the dashboard to update the ticket status and communicate with the user if needed.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
          </div>
        `;
        
        try {
          await sendEmail({ to: agent.email, subject: `Ticket #${populatedTicket._id} - Assigned to You`, html: emailContent });
          agentEmailSent = true;
          console.log(`✅ Agent email sent successfully to ${agent.email} for ticket ${populatedTicket._id}`);
        } catch (emailError) {
          console.error(`❌ Failed to send agent email to ${agent.email}:`, emailError.message);
        }
      }

      // Send email to ticket owner
      let userEmailSent = false;
      if (populatedTicket.userId && populatedTicket.userId.email) {
        const user = populatedTicket.userId;
        const agent = populatedTicket.assignedTo;
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #27ae60;">Your Ticket is Being Worked On ✅</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Good news! Your support ticket has been assigned to one of our support agents and is now being worked on.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Ticket ID:</strong> ${populatedTicket._id}</p>
              <p><strong>Status:</strong> <span style="color: #f39c12; font-weight: bold;">In Progress</span></p>
              <p><strong>Assigned To:</strong> ${agent ? agent.name : 'N/A'}</p>
              <p><strong>Category:</strong> ${populatedTicket.category}</p>
              <p><strong>Title:</strong> ${populatedTicket.title}</p>
            </div>
            
            <p>Our support agent will work on resolving your issue as quickly as possible. You will receive updates as the status of your ticket changes.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
          </div>
        `;
        
        try {
          await sendEmail({ to: user.email, subject: `Ticket #${populatedTicket._id} - Your Issue is Being Worked On`, html: emailContent });
          userEmailSent = true;
          console.log(`✅ User email sent successfully to ${user.email} for ticket ${populatedTicket._id}`);
        } catch (emailError) {
          console.error(`❌ Failed to send user email to ${user.email}:`, emailError.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: assignmentNote,
        ticket: populatedTicket,
        emailsStatus: {
          agentEmail: agentEmailSent ? 'sent' : 'failed',
          userEmail: userEmailSent ? 'sent' : 'failed'
        },
      });
    } else {
      // Auto-assign based on category using hybrid approach
      const matchingAgent = await SupportAgent.findOne({
        expertise: ticket.category,
        isActive: true,
      });

      if (matchingAgent) {
        // Specialist found
        ticket.assignedTo = matchingAgent._id;
        ticket.status = 'In Progress';
        await ticket.save();
      } else {
        // No specialist - try generalist
        const generalAgent = await SupportAgent.findOne({
          role: 'Generalist',
          isActive: true,
        });

        if (generalAgent) {
          // Generalist available
          ticket.assignedTo = generalAgent._id;
          ticket.status = 'In Progress';
          await ticket.save();
        } else {
          // No agents available - escalate to manager
          const UserModel = require('../models/User');
          const manager = await UserModel.findOne({ role: 'manager' });
          
          ticket.status = 'Escalated';
          await ticket.save();

          // Notify manager about escalation
          if (manager && manager.email) {
            const emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #e74c3c;">🚨 Ticket Escalated - Requires Attention</h2>
                <p>Hello <strong>${manager.name}</strong>,</p>
                <p>A support ticket has been escalated and requires manager review and assignment, as no support agents are currently available.</p>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <p><strong>Ticket ID:</strong> ${ticket._id}</p>
                  <p><strong>Category:</strong> ${ticket.category}</p>
                  <p><strong>Priority:</strong> ${ticket.priority}</p>
                  <p><strong>Title:</strong> ${ticket.title}</p>
                </div>
                
                <p>Please log in to the dashboard to review and assign this ticket to an available agent.</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
              </div>
            `;
            
            await sendEmail({ to: manager.email, subject: `🚨 ESCALATED - Ticket #${ticket._id} Requires Manager Review`, html: emailContent });
          }

          return res.status(200).json({
            success: true,
            message: 'No support agents available at the moment. Ticket has been escalated to manager for priority assignment.',
            ticket,
            escalated: true,
          });
        }
      }
    }

    const populatedTicket = await Ticket.findById(id)
      .populate('assignedTo', 'name role expertise email')
      .populate('userId', 'name email');

    // Send emails for auto-assigned tickets
    let agentEmailSent = false;
    if (populatedTicket.assignedTo && populatedTicket.assignedTo.email && populatedTicket.userId) {
      const agent = populatedTicket.assignedTo;
      const user = populatedTicket.userId;
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">New Ticket Assigned 📋</h2>
          <p>Hello <strong>${agent.name}</strong>,</p>
          <p>You have been assigned a new support ticket. Please review the details below and take necessary action.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> ${populatedTicket._id}</p>
            <p><strong>Category:</strong> ${populatedTicket.category}</p>
            <p><strong>Priority:</strong> <span style="color: ${populatedTicket.priority === 'High' ? '#e74c3c' : populatedTicket.priority === 'Medium' ? '#f39c12' : '#27ae60'}; font-weight: bold;">${populatedTicket.priority}</span></p>
            <p><strong>Title:</strong> ${populatedTicket.title}</p>
            <p><strong>Description:</strong> ${populatedTicket.description}</p>
            <p><strong>User:</strong> ${user.name} (${user.email})</p>
          </div>
          
          <p>Please log in to the dashboard to update the ticket status and communicate with the user if needed.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      `;
      
      await sendEmail({ to: agent.email, subject: `Ticket #${populatedTicket._id} - Assigned to You`, html: emailContent });
      agentEmailSent = true;
    }

    let userEmailSent = false;
    if (populatedTicket.userId && populatedTicket.userId.email) {
      const user = populatedTicket.userId;
      const agent = populatedTicket.assignedTo;
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #27ae60;">Your Ticket is Being Worked On ✅</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Good news! Your support ticket has been assigned to one of our support agents and is now being worked on.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> ${populatedTicket._id}</p>
            <p><strong>Status:</strong> <span style="color: #f39c12; font-weight: bold;">In Progress</span></p>
            <p><strong>Assigned To:</strong> ${agent ? agent.name : 'N/A'}</p>
            <p><strong>Category:</strong> ${populatedTicket.category}</p>
            <p><strong>Title:</strong> ${populatedTicket.title}</p>
          </div>
          
          <p>Our support agent will work on resolving your issue as quickly as possible. You will receive updates as the status of your ticket changes.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      `;
      
      await sendEmail({ to: user.email, subject: `Ticket #${populatedTicket._id} - Your Issue is Being Worked On`, html: emailContent });
      userEmailSent = true;
    }

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket: populatedTicket,
      emailSent: agentEmailSent || userEmailSent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Support Agents
exports.getSupportAgents = async (req, res) => {
  try {
    const agents = await SupportAgent.find({ isActive: true });

    res.status(200).json({
      success: true,
      agents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reopen Ticket
exports.reopenTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Check if ticket is resolved (can only reopen resolved tickets)
    if (ticket.status !== 'Resolved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only resolved tickets can be reopened' 
      });
    }

    const oldStatus = ticket.status;
    ticket.status = 'In Progress';
    await ticket.save();

    // Populate ticket details
    const populatedTicket = await Ticket.findById(id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name role email');

    // Send email to assigned agent if ticket has one
    let emailSent = false;
    if (populatedTicket.assignedTo && populatedTicket.assignedTo.email) {
      const agent = populatedTicket.assignedTo;
      const user = populatedTicket.userId;
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #e74c3c;">Ticket Reopened - Action Required ⚠️</h2>
          <p>Hello <strong>${agent.name}</strong>,</p>
          <p>A previously resolved ticket has been reopened by the user. It appears the issue was not fully resolved. Please review and continue working on this ticket.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> ${populatedTicket._id}</p>
            <p><strong>Previous Status:</strong> <span style="text-decoration: line-through; color: #999;">Resolved</span></p>
            <p><strong>Current Status:</strong> <span style="color: #e74c3c; font-weight: bold;">In Progress</span></p>
            <p><strong>Category:</strong> ${populatedTicket.category}</p>
            <p><strong>Priority:</strong> ${populatedTicket.priority}</p>
            <p><strong>Title:</strong> ${populatedTicket.title}</p>
            <p><strong>Description:</strong> ${populatedTicket.description}</p>
            <p><strong>User:</strong> ${user.name} (${user.email})</p>
          </div>
          
          <div style="background-color: #ffe6e6; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0; border-radius: 5px;">
            <p><strong>📌 Please Note:</strong></p>
            <p>This ticket has been reopened because the user indicated the issue is not fully resolved. Please contact the user if needed and work towards a complete resolution.</p>
          </div>
          
          <p>Thank you for your continued support!</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      `;
      
      await sendEmail(agent.email, `Ticket #${populatedTicket._id} - Reopened, Continue Work`, emailContent);
      emailSent = true;
    }

    res.status(200).json({
      success: true,
      message: 'Ticket reopened successfully',
      ticket: populatedTicket,
      emailSent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get tickets assigned to current agent
exports.getAssignedTickets = async (req, res) => {
  try {
    const { status, sortBy } = req.query;
    const agentEmail = req.user.email;

    console.log('Agent email from token:', agentEmail);

    // Find the SupportAgent record by email
    const agent = await SupportAgent.findOne({ email: agentEmail.toLowerCase() });
    
    console.log('Found agent:', agent);

    if (!agent) {
      console.log('Agent not found, returning empty tickets');
      return res.status(200).json({ success: true, tickets: [], message: 'No agent record found' });
    }

    let filter = { assignedTo: agent._id };
    if (status) filter.status = status;

    let query = Ticket.find(filter)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name role expertise');

    if (sortBy === 'recent') {
      query = query.sort({ createdAt: -1 });
    } else if (sortBy === 'oldest') {
      query = query.sort({ createdAt: 1 });
    }

    const tickets = await query;

    console.log('Found tickets:', tickets.length);

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error('Error fetching assigned tickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Rate Ticket
exports.rateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.status !== 'Resolved') {
      return res.status(400).json({ success: false, message: 'Only resolved tickets can be rated' });
    }

    // Only the ticket owner can rate it
    if (String(ticket.userId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this ticket' });
    }

    ticket.rating = Number(rating);
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback! Ticket rated successfully.',
      ticket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
