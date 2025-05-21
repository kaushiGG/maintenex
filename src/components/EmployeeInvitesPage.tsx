import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/integrations/supabase/client'
import { v4 as uuidv4 } from 'uuid'

interface Invitation {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  department: string
  is_safety_officer: boolean
  message: string
  status: string
  invited_at: string
}

const EmployeeInvitesPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    department: '',
    isSafetyOfficer: false,
    message: '',
  })
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('invited_at', { ascending: false })

      if (error) throw error
      setInvitations(data || [])
    } catch (error) {
      console.error('Error fetching invitations:', error)
      toast.error('Failed to fetch invitations')
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  const handleSendInvitation = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user?.id) {
        throw new Error('No active session')
      }

      // Generate a unique token for the invitation
      const token = uuidv4()
      
      // Create the invitation URL
      const inviteUrl = `${window.location.origin}/register?token=${token}&email=${encodeURIComponent(formData.email)}`
      
      // Store the invitation in the database
      const { error: dbError } = await supabase
        .from('invitations')
        .insert([{
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          department: formData.department,
          is_safety_officer: formData.isSafetyOfficer,
          invitation_type: 'employee',
          inviter_id: session.session.user.id,
          status: 'pending',
          message: formData.message,
          token: token,
        }])

      if (dbError) {
        throw new Error(`Failed to store invitation: ${dbError.message}`)
      }

      // Send the email directly or display the invitation URL
      // Since we're having issues with Edge Functions, show the URL for manual sharing
      toast.success('Invitation created successfully. Share this URL with the employee:', {
        duration: 10000,
      })
      
      toast(
        <div className="flex flex-col gap-2">
          <p className="font-medium">Invitation URL:</p>
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
            <input 
              className="flex-1 bg-transparent border-none outline-none text-sm" 
              value={inviteUrl} 
              readOnly 
            />
            <button
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl)
                toast.success('URL copied to clipboard')
              }}
            >
              Copy
            </button>
          </div>
        </div>,
        { duration: 20000 }
      )

      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        department: '',
        isSafetyOfficer: false,
        message: '',
      })
      fetchInvitations()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleResendInvitation = async (invitation: Invitation) => {
    setLoading(true)
    
    try {
      // Generate a new token
      const token = uuidv4()
      
      // Create the invitation URL
      const inviteUrl = `${window.location.origin}/register?token=${token}&email=${encodeURIComponent(invitation.email)}`
      
      // Update the invitation token in the database
      const { error: dbError } = await supabase
        .from('invitations')
        .update({ token: token, status: 'pending' })
        .eq('id', invitation.id)

      if (dbError) {
        throw new Error(`Failed to update invitation: ${dbError.message}`)
      }

      // Show the invitation URL for manual sharing
      toast.success('Invitation renewed successfully. Share this URL with the employee:', {
        duration: 10000,
      })
      
      toast(
        <div className="flex flex-col gap-2">
          <p className="font-medium">Invitation URL:</p>
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
            <input 
              className="flex-1 bg-transparent border-none outline-none text-sm" 
              value={inviteUrl} 
              readOnly 
            />
            <button
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl)
                toast.success('URL copied to clipboard')
              }}
            >
              Copy
            </button>
          </div>
        </div>,
        { duration: 20000 }
      )

      fetchInvitations()
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to resend invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Render your component content here */}
    </div>
  )
}

export default EmployeeInvitesPage 