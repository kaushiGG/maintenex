// Simple Express server to handle email sending
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

// Create Express app
const app = express();
const port = 3000;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON requests
app.use(express.json());

// Initialize Resend with API key
const resend = new Resend('5118b9d572d10d800475ef72c4027e238105aefcf40ac12533768625ad77270a');

// Email sending endpoint
app.post('/api/send-invitation-email', async (req, res) => {
  try {
    const { to, firstName, lastName, invitationUrl, role, department, message } = req.body;
    
    // Validate required fields
    if (!to || !firstName || !lastName || !invitationUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`Sending email to ${to} (${firstName} ${lastName})`);
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'MaintenX <no-reply@maintenx.com>',
      to: to,
      subject: 'You\'ve been invited to join MaintenX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to MaintenX!</h2>
          <p>Hello ${firstName},</p>
          <p>You've been invited to join MaintenX as an employee.</p>
          ${message ? `<p>Message from your employer: ${message}</p>` : ''}
          ${role ? `<p>Your role: ${role}</p>` : ''}
          ${department ? `<p>Department: ${department}</p>` : ''}
          <p>Click the button below to accept the invitation and set up your account:</p>
          <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Accept Invitation</a>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p>${invitationUrl}</p>
          <p>This invitation link will expire in 7 days.</p>
          <p>Best regards,<br>The MaintenX Team</p>
        </div>
      `,
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('Email sent successfully:', data);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Email server running at http://localhost:${port}`);
}); 