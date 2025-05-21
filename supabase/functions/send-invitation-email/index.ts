// Follow this setup guide to integrate the Deno runtime into your Supabase project:
// https://supabase.com/docs/guides/functions/deno-runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Get Resend API key from environment variable
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "no-reply@maintenx.com";
const FROM_NAME = Deno.env.get("FROM_NAME") || "MaintenX";

interface EmailRequest {
  to: string;
  firstName: string;
  lastName: string;
  invitationUrl: string;
  message?: string;
  role?: string;
  department?: string;
  isSafetyOfficer?: boolean;
}

async function sendEmail(emailData: EmailRequest) {
  // Check if Resend API key is configured
  if (!RESEND_API_KEY) {
    console.error("Resend API key is not configured. Check environment variables.");
    return { success: false, error: "Resend API key not configured" };
  }

  try {
    console.log("Sending email to:", emailData.to);
    
    // Create a personalized email message
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to MaintenX!</h2>
        <p>Hello ${emailData.firstName},</p>
        <p>You've been invited to join MaintenX as an employee.</p>
        ${emailData.message ? `<p>Message from your employer: ${emailData.message}</p>` : ''}
        ${emailData.role ? `<p>Your role: ${emailData.role}</p>` : ''}
        ${emailData.department ? `<p>Department: ${emailData.department}</p>` : ''}
        ${emailData.isSafetyOfficer ? `<p>You have been designated as a Safety Officer.</p>` : ''}
        <p>Click the button below to accept the invitation and set up your account:</p>
        <a href="${emailData.invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Accept Invitation</a>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${emailData.invitationUrl}</p>
        <p>This invitation link will expire in 7 days.</p>
        <p>Best regards,<br>The MaintenX Team</p>
      </div>
    `;

    // Send email using Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: emailData.to,
        subject: "You've been invited to join MaintenX",
        html: htmlContent,
      })
    });

    const responseData = await response.json();
    
    if (response.status !== 200) {
      console.error("Resend API error:", responseData);
      return { success: false, error: responseData.message || "Failed to send email" };
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request data
    const requestData = await req.json();
    
    // Validate request data
    if (!requestData.to || !requestData.invitationUrl || !requestData.firstName || !requestData.lastName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Send the email
    const result = await sendEmail(requestData);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
}); 