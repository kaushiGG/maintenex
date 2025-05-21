import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { signIn } from '@/services/auth';

// Use environment variable for Supabase URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qdbfcqwbmrhgnaoqwnkp.supabase.co";

// Create a replacement for the checkSupabaseConnection function
const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('Unexpected error checking Supabase connection:', err);
    return { success: false, error: err.message || 'Unknown connection error' };
  }
};

const SupabaseDebug = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginResult, setLoginResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [supabaseInfo, setSupabaseInfo] = useState<string>('');
  const [networkStatus, setNetworkStatus] = useState<boolean>(navigator.onLine);
  const [pingResult, setPingResult] = useState<string>('Not tested');

  useEffect(() => {
    // Test connection on component mount
    checkConnection();
    
    // Show which Supabase instance we're using
    setSupabaseInfo(`Using Supabase URL: ${SUPABASE_URL}`);
    
    // Setup network status listeners
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = async () => {
    try {
      const result = await checkSupabaseConnection();
      
      if (result.success) {
        setConnectionStatus(`✅ Connected to Supabase successfully`);
      } else {
        setConnectionStatus(`❌ Connection failed: ${result.error}`);
      }
    } catch (err: any) {
      setConnectionStatus(`❌ Error checking connection: ${err.message}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginResult('Processing...');

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setLoginResult(`❌ Login failed: ${error.message}`);
      } else {
        setLoginResult(`✅ Login successful! User ID: ${data?.user?.id || 'Unknown'}`);
        
        // Show detailed user data
        if (data?.user) {
          setLoginResult(prev => `${prev}\n\nUser details:\n${JSON.stringify(data.user, null, 2)}`);
        }
      }
    } catch (err: any) {
      setLoginResult(`❌ Error during login: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const pingSupabase = async () => {
    setPingResult('Testing connection...');
    try {
      const startTime = performance.now();
      const response = await fetch(SUPABASE_URL, { 
        method: 'HEAD',
        mode: 'no-cors' // This is required for CORS restrictions
      });
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      setPingResult(`✅ Connection successful! Latency: ${latency}ms`);
    } catch (err: any) {
      setPingResult(`❌ Connection failed: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Debug</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Network Status</CardTitle>
          <CardDescription>Your device's connection status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className={`font-mono ${networkStatus ? 'text-green-500' : 'text-red-500'}`}>
              {networkStatus ? '✅ Your device is online' : '❌ Your device is offline'}
            </p>
          </div>
          <Button onClick={() => setNetworkStatus(navigator.onLine)}>
            Refresh Network Status
          </Button>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase Ping Test</CardTitle>
          <CardDescription>Test basic connectivity to Supabase server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="font-mono">{pingResult}</p>
          </div>
          <Button onClick={pingSupabase}>Ping Supabase</Button>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>{supabaseInfo}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="font-mono">{connectionStatus}</p>
          </div>
          <Button onClick={checkConnection}>Test Connection Again</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Login Test</CardTitle>
          <CardDescription>Try to login with your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Test Login'}
            </Button>
          </form>
          
          {loginResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <pre className="whitespace-pre-wrap font-mono text-sm">{loginResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseDebug;
