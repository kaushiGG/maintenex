
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface NetworkStatusCheckerProps {
  onStatusChange?: (online: boolean) => void;
}

const NetworkStatusChecker = ({ onStatusChange }: NetworkStatusCheckerProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online');
      onStatusChange?.(true);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline', {
        description: 'Please check your internet connection'
      });
      onStatusChange?.(false);
    };
    
    // Check connection status initially
    const checkConnection = async () => {
      try {
        // Attempt a simple fetch request to check connectivity
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response) {
          handleOnline();
        } else {
          handleOffline();
        }
      } catch (error) {
        console.log('Network connection check failed:', error);
        if (!navigator.onLine) {
          handleOffline();
        }
      }
    };
    
    // Run the initial check
    checkConnection();
    
    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onStatusChange]);
  
  return null; // This is a non-visual component
};

export default NetworkStatusChecker;
