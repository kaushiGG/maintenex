import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PendingApprovalPage() {
  return (
    <div className="container mx-auto py-8 flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">
            Your account is currently pending approval from a business administrator. 
            You will be notified once your account has been approved.
          </p>
          <p className="text-center text-sm text-gray-500">
            This process typically takes 1-2 business days.
          </p>
          <div className="flex justify-center pt-4">
            <Button asChild>
              <a href="/profile">
                View Profile
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 