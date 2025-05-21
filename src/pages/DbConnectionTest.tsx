import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testDatabaseConnection, logDatabaseInfo } from '@/utils/dbTest';

const DbConnectionTest: React.FC = () => {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tables?: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    logDatabaseInfo();
    
    try {
      const result = await testDatabaseConnection();
      setTestResult(result);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Current Supabase URL: <code>{import.meta.env.VITE_SUPABASE_URL}</code>
          </p>
          <p className="mb-4">
            Key Available: <code>{import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</code>
          </p>
          <Button 
            onClick={runConnectionTest} 
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Button>
        </CardContent>
      </Card>
      
      {testResult && (
        <Card className={testResult.success ? 'bg-green-50' : 'bg-red-50'}>
          <CardHeader>
            <CardTitle>
              {testResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="font-medium">{testResult.message}</p>
            </div>
            
            {testResult.tables && testResult.tables.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-2">Available Tables:</p>
                <ul className="list-disc pl-6">
                  {testResult.tables.map(table => (
                    <li key={table}>{table}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DbConnectionTest; 