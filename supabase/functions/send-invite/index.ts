import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'npm:resend'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, firstName, lastName, role, department, isSafetyOfficer, message, inviterId } = await req.json()

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // Create invitation URL with token
    const token = crypto.randomUUID()
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
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending invitation:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send invitation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 