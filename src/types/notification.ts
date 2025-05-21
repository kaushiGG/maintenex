
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string; // Contains JSON with the notification content
  type: 'job' | 'schedule' | 'alert' | 'message' | 'system';
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}

// Extended notification type for frontend use (with additional fields)
export interface ExtendedNotification extends Notification {
  description?: string; // Extracted from message JSON for display
  actions?: {
    accept?: boolean;
    decline?: boolean;
    jobId?: string;
    [key: string]: any;
  };
}
