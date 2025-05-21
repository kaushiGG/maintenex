import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BusinessDashboardContent from '@/components/client/dashboard/BusinessDashboardContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { deleteInvitationById } from '@/lib/supabase-functions';
import { Mail, Send, RefreshCw, Shield, User, Trash2, Copy, Check, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { sendInvitationEmail } from '@/lib/emailService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Helper function for clipboard copy with fallback
const copyToClipboard = (text: string) => {
  try {
    // Try using the clipboard API first
    navigator.clipboard.writeText(text)
      .then(() => toast.success('URL copied to clipboard'))
      .catch(err => {
        console.error('Clipboard API failed:', err);
        // Fallback method using document.execCommand
        fallbackCopyToClipboard(text);
      });
  } catch (err) {
    console.error('Copy failed:', err);
    // Fallback method
    fallbackCopyToClipboard(text);
  }
};

// Fallback copy method using document.execCommand
const fallbackCopyToClipboard = (text: string) => {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      toast.success('URL copied to clipboard');
    } else {
      toast.error('Failed to copy URL. Please select and copy it manually.');
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
    toast.error('Failed to copy URL. Please select and copy it manually.');
  }
};

interface Invitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  is_safety_officer: boolean;
  invited_at: string;
  status: string;
  token: string;
  message?: string;
  invitation_type: string;
  inviter_id: string;
}

const EmployeeInvitesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // State for invitation form
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    department: '',
    isSafetyOfficer: false,
    message: 'You have been invited to join our company platform as an employee. Please use the link below to create your account.'
  });
  
  // State for invitations list
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  
  // State for URL sharing modal
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [currentInviteUrl, setCurrentInviteUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    fetchInvitations();
  }, []);
  
  const fetchInvitations = async () => {
    setIsLoadingInvitations(true);
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('invitation_type', 'employee')
        .order('invited_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setInvitations(data || []);
    } catch (error: unknown) {
      console.error('Error fetching invitations:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to load invitations: ${errorMessage}`);
    } finally {
      setIsLoadingInvitations(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isSafetyOfficer: checked }));
  };
  
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      // Generate a unique token for the invitation
      const token = uuidv4();
      
      // Create the invitation URL
      const inviteUrl = `${window.location.origin}/register?token=${token}&email=${encodeURIComponent(formData.email)}`;
      
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
          inviter_id: user.id,
          status: 'pending',
          message: formData.message,
          token: token,
        }]);

      if (dbError) {
        throw new Error(`Failed to store invitation: ${dbError.message}`);
      }
      
      // Try to send the invitation email
      try {
        const emailResult = await sendInvitationEmail(
          formData.email,
          formData.firstName,
          formData.lastName,
          inviteUrl,
          formData.role,
          formData.department,
          formData.message
        );
        
        if (emailResult.success) {
          toast.success('Invitation email sent successfully!');
        } else {
          // Log the error for debugging
          console.error('Email sending error:', emailResult.error);
          
          // Show a toast with the error and instructions
          toast.error(
            <div>
              <p>Could not send email: {emailResult.error}</p>
              <p className="text-xs mt-1">The invitation has been created and you can share the link manually.</p>
            </div>
          );
        }
      } catch (emailError: unknown) {
        console.error('Email sending failed:', emailError);
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
        toast.error(
          <div>
            <p>Email service error: {errorMessage}</p>
            <p className="text-xs mt-1">The invitation has been created and you can share the link manually.</p>
          </div>
        );
      }
      
      // Show invitation URL in modal
      setCurrentInviteUrl(inviteUrl);
      setIsCopied(false);
      setIsUrlModalOpen(true);
      
      // Reset the form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        department: '',
        isSafetyOfficer: false,
        message: 'You have been invited to join our company platform as an employee. Please use the link below to create your account.'
      });
      
      // Refresh the invitations list
      fetchInvitations();
    } catch (error: unknown) {
      console.error('Error sending invitation:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to send invitation: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmDeleteInvitation = (id: string) => {
    setInvitationToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const executeDeleteInvitation = async () => {
    if (!invitationToDelete) return;
    
    const id = invitationToDelete;
    setIsDeleteDialogOpen(false);
    setInvitationToDelete(null);
    
    try {
      console.log('Attempting to delete invitation with ID:', id);
      
      // Try RLS-based deletion first
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting invitation with RLS:', error);
        
        // Try alternative deletion method using our helper function
        const result = await deleteInvitationById(id);
        
        if (result.success) {
          console.log('Invitation deleted successfully via helper function');
          toast.success('Invitation deleted successfully');
          fetchInvitations();
        } else {
          toast.error(`Failed to delete invitation: ${result.error}`);
        }
      } else {
        console.log('Invitation deleted successfully via RLS');
        toast.success('Invitation deleted successfully');
        fetchInvitations();
      }
    } catch (error: unknown) {
      console.error('Exception in delete invitation:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to delete invitation: ${errorMessage}`);
    }
  };
  
  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      // Generate a new token
      const token = uuidv4();
      
      // Create the invitation URL
      const inviteUrl = `${window.location.origin}/register?token=${token}&email=${encodeURIComponent(invitation.email)}`;
      
      // Update the invitation token in the database
      const { error: dbError } = await supabase
        .from('invitations')
        .update({ 
          token: token, 
          status: 'pending',
          // Update the timestamp
          invited_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (dbError) {
        throw new Error(`Failed to update invitation: ${dbError.message}`);
      }
      
      // Try to send the invitation email
      try {
        const emailResult = await sendInvitationEmail(
          invitation.email,
          invitation.first_name,
          invitation.last_name,
          inviteUrl,
          invitation.role,
          invitation.department,
          invitation.message || undefined
        );
        
        if (emailResult.success) {
          toast.success('Invitation email resent successfully!');
        } else {
          // Log the error for debugging
          console.error('Email resending error:', emailResult.error);
          
          // Show a toast with the error and instructions
          toast.error(
            <div>
              <p>Could not resend email: {emailResult.error}</p>
              <p className="text-xs mt-1">The invitation has been renewed and you can share the link manually.</p>
            </div>
          );
        }
      } catch (emailError: unknown) {
        console.error('Email resending failed:', emailError);
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
        toast.error(
          <div>
            <p>Email service error: {errorMessage}</p>
            <p className="text-xs mt-1">The invitation has been renewed and you can share the link manually.</p>
          </div>
        );
      }
      
      // Show invitation URL in modal
      setCurrentInviteUrl(inviteUrl);
      setIsCopied(false);
      setIsUrlModalOpen(true);
      
      // Refresh the invitations list
      fetchInvitations();
    } catch (error: unknown) {
      console.error('Error resending invitation:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to resend invitation: ${errorMessage}`);
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <BusinessDashboardContent 
      handleLogout={handleLogout}
      userRole="business"
      switchRole={null}
      userMode="management"
      userData={user}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Invitations</h1>
          <p className="text-muted-foreground">
            Invite employees to join your company platform
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Invitation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Send New Invitation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendInvitation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="employee@example.com"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      onValueChange={(value) => handleSelectChange(value, 'role')}
                      value={formData.role}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Safety Manager">Safety Manager</SelectItem>
                        <SelectItem value="Safety Officer">Safety Officer</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Team Member">Team Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Operations"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isSafetyOfficer" 
                    checked={formData.isSafetyOfficer}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="isSafetyOfficer" className="cursor-pointer">
                    This employee is a safety officer
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Invitation Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Invitations List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Sent Invitations
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchInvitations}
                disabled={isLoadingInvitations}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingInvitations ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingInvitations ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No invitations sent yet</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell>
                            <div className="font-medium">
                              {invitation.first_name} {invitation.last_name}
                              {invitation.is_safety_officer && (
                                <span className="ml-2">
                                  <Shield className="h-4 w-4 text-green-500 inline" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{invitation.role || "Not specified"}</div>
                          </TableCell>
                          <TableCell>{invitation.email}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                              ${invitation.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                invitation.status === 'expired' ? 'bg-gray-100 text-gray-800' : 
                                'bg-amber-100 text-amber-800'}`}
                            >
                              {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {invitation.status === 'pending' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 px-2" 
                                  onClick={() => handleResendInvitation(invitation)}
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-destructive" 
                                onClick={() => confirmDeleteInvitation(invitation.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Invitation URL Modal */}
      <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Invitation Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Copy this invitation link and share it with the employee. They can use this link to register their account.
            </p>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <textarea
                  className="w-full p-2 border rounded-md text-sm text-gray-900 bg-gray-50"
                  rows={2}
                  readOnly
                  value={currentInviteUrl}
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="px-3"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(currentInviteUrl);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  } catch (err) {
                    fallbackCopyToClipboard(currentInviteUrl);
                  }
                }}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              <p>Tips:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Click in the box to select the entire URL</li>
                <li>Use the copy button on the right</li>
                <li>Press Ctrl+C (Windows) or Cmd+C (Mac) to copy</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsUrlModalOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invitation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteInvitation} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BusinessDashboardContent>
  );
};

export default EmployeeInvitesPage; 