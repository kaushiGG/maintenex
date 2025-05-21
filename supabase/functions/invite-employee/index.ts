// Follow this setup guide to integrate the Deno runtime:
// https://supabase.com/docs/guides/functions/deno-runtime

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'npm:resend'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:8080',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// This is a Supabase Edge Function that uses the service role key
// to send invitations via Supabase Auth's admin API
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Verify the request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const { email, firstName, lastName, role, department, isSafetyOfficer, message, inviterId } = await req.json()

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Generate a unique token for the invitation
    const token = crypto.randomUUID()
    
    // Store the invitation in the database
    const { error: dbError } = await supabaseAdmin
      .from('invitations')
      .insert([{
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        department,
        is_safety_officer: isSafetyOfficer,
        invitation_type: 'employee',
        inviter_id: inviterId,
        status: 'pending',
        message,
        token,
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }])

    if (dbError) {
      console.error('Error storing invitation:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to store invitation' }),
        { 
          status: 500, 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // Create invitation URL with token
    const inviteUrl = `${Deno.env.get('APP_URL')}/register?token=${token}&email=${encodeURIComponent(email)}`

    // Send email using Resend
    await resend.emails.send({
      from: 'MaintenX <noreply@maintenx.com>',
      to: email,
      subject: 'You\'ve been invited to join MaintenX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to MaintenX!</h2>
          <p>Hello ${firstName},</p>
          <p>You've been invited to join MaintenX as an employee.</p>
          ${message ? `<p>Message from your employer: ${message}</p>` : ''}
          <p>Your role: ${role || 'Employee'}</p>
          ${department ? `<p>Department: ${department}</p>` : ''}
          ${isSafetyOfficer ? '<p>You have been designated as a Safety Officer.</p>' : ''}
          <p>Click the button below to accept the invitation and set up your account:</p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Accept Invitation</a>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p>${inviteUrl}</p>
          <p>This invitation link will expire in 7 days.</p>
          <p>Best regards,<br>The MaintenX Team</p>
        </div>
      `,
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation sent successfully' }),
      { 
        status: 200, 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error sending invitation:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send invitation' }),
      { 
        status: 500, 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
}) 