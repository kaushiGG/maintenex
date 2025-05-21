// This file provides an email service interface using a local Express server.

import { supabase } from '@/lib/supabase';

// Local server URL - no authentication needed
const LOCAL_SERVER_URL = 'http://localhost:3000/api/send-invitation-email';

/**
 * Sends an invitation email to an employee using local Express server
 */
export const sendInvitationEmail = async (
  recipientEmail: string,
  firstName: string,
  lastName: string,
  inviteUrl: string,
  role?: string,
  department?: string,
  message?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Sending invitation email to:', recipientEmail);

    // Call the local email server directly - no need for authentication
    const response = await fetch(LOCAL_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: recipientEmail,
        firstName,
        lastName,
        invitationUrl: inviteUrl,
        role,
        department,
        message
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Failed to send email through local server:', data);
      return { 
        success: false, 
        error: data.error || `Failed to send email: Status ${response.status}` 
      };
    }

    console.log('Email sent successfully through local server');
    return { success: true };
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send invitation email' 
    };
  }
};

// Instructions to set up EmailJS:
// 1. Create an account at https://www.emailjs.com/
// 2. Create an email service (Gmail, Outlook, etc.) in your EmailJS dashboard
// 3. Create an email template with the following variables:
//    - to_email: Recipient's email
//    - to_name: Recipient's name
//    - from_name: Sender's name
//    - message: Custom message
//    - invite_url: The URL for accepting the invitation
//    - company_name: Your company name
// 4. Get your service ID, template ID, and public key from the EmailJS dashboard
// 5. Replace the placeholder values in this file with your actual credentials
//
// Example template HTML:
/*
<!DOCTYPE html>
<html>
<head>
  <title>Employee Invitation</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
      <h2>You've Been Invited</h2>
    </div>
    <div style="padding: 20px;">
      <p>Hello {{to_name}},</p>
      
      <p>{{from_name}} has invited you to join {{company_name}} as an employee.</p>
      
      <p>{{message}}</p>
      
      <p style="text-align: center;">
        <a href="{{invite_url}}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; margin-bottom: 20px;">Accept Invitation</a>
      </p>
      
      <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
      <p style="word-break: break-all;">{{invite_url}}</p>
      
      <p>This invitation will expire in 7 days.</p>
    </div>
    <div style="font-size: 12px; color: #777; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
*/ 