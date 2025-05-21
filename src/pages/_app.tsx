
import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';

interface AppProps {
  Component: React.ComponentType;
  pageProps: any;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Router>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}
