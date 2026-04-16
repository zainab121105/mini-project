const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Reusable email function
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}:`, info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    // Don't throw error - let the main API flow continue
    return { success: false, message: error.message };
  }
};

// Email templates
const emailTemplates = {
  ticketCreated: (ticketId, userEmail, ticketDetails) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { margin: 20px 0; }
            .ticket-info { background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50; margin: 10px 0; }
            .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎫 Support Ticket Created</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your support ticket has been created successfully.</p>
              <div class="ticket-info">
                <p><strong>Ticket ID:</strong> #${ticketId.slice(-8).toUpperCase()}</p>
                <p><strong>Title:</strong> ${ticketDetails.title}</p>
                <p><strong>Status:</strong> <span style="color: #d32f2f;">● Open</span></p>
                <p><strong>Priority:</strong> ${ticketDetails.priority}</p>
                <p><strong>Category:</strong> ${ticketDetails.category}</p>
              </div>
              <p>Our support team will review your ticket and get back to you shortly.</p>
              <p>Thank you for reaching out!</p>
            </div>
            <div class="footer">
              <p>Support Ticket Management System | © 2026</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  ticketAssigned: (ticketId, agentName, ticketDetails) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; }
            .header { background-color: #2196F3; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { margin: 20px 0; }
            .ticket-info { background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2196F3; margin: 10px 0; }
            .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>👨‍💼 New Ticket Assigned</h2>
            </div>
            <div class="content">
              <p>Hello ${agentName},</p>
              <p>A new ticket has been assigned to you.</p>
              <div class="ticket-info">
                <p><strong>Ticket ID:</strong> #${ticketId.slice(-8).toUpperCase()}</p>
                <p><strong>Title:</strong> ${ticketDetails.title}</p>
                <p><strong>Description:</strong> ${ticketDetails.description}</p>
                <p><strong>Category:</strong> <span style="color: #1976D2; font-weight: bold;">${ticketDetails.category}</span></p>
                <p><strong>Priority:</strong> <span style="color: #ff6f00; font-weight: bold;">⬆️ ${ticketDetails.priority}</span></p>
              </div>
              <p>Please review the ticket and take necessary action.</p>
              <p>Best regards,<br>Support Team</p>
            </div>
            <div class="footer">
              <p>Support Ticket Management System | © 2026</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  statusUpdated: (ticketId, userName, newStatus) => {
    const statusColor = newStatus === 'Resolved' ? '#4CAF50' : newStatus === 'In Progress' ? '#FF9800' : '#2196F3';
    const statusIcon = newStatus === 'Resolved' ? '✅' : newStatus === 'In Progress' ? '⏳' : '📭';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; }
            .header { background-color: ${statusColor}; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { margin: 20px 0; }
            .status-info { background-color: #f5f5f5; padding: 15px; border-left: 4px solid ${statusColor}; margin: 10px 0; }
            .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${statusIcon} Ticket Status Updated</h2>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Your support ticket status has been updated.</p>
              <div class="status-info">
                <p><strong>Ticket ID:</strong> #${ticketId.slice(-8).toUpperCase()}</p>
                <p><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusIcon} ${newStatus}</span></p>
              </div>
              ${newStatus === 'Resolved' ? `
                <p>Your ticket has been resolved! We would appreciate your feedback on our service.</p>
                <p>Your satisfaction is our priority.</p>
              ` : `
                <p>Our support team is working on your issue. We'll keep you updated.</p>
              `}
              <p>Thank you for your patience!</p>
            </div>
            <div class="footer">
              <p>Support Ticket Management System | © 2026</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },
};

module.exports = { sendEmail, emailTemplates };
