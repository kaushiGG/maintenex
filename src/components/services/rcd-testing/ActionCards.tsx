
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bluetooth, Zap, Printer } from 'lucide-react';

interface ActionCardsProps {
  isConnected: boolean;
  onConnect: () => void;
}

const ActionCards: React.FC<ActionCardsProps> = ({ isConnected, onConnect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Device Connection Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Bluetooth className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Device Connection</h3>
            </div>
            <p className="text-gray-600">Connect to RCD testing device</p>
            <Button onClick={onConnect} className={isConnected ? "bg-green-600 hover:bg-green-700" : ""}>
              {isConnected ? "Connected" : "Connect Device"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test RCD Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <Zap className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Test RCD</h3>
            </div>
            <p className="text-gray-600">Run trip test on RCD devices</p>
            <Button disabled={!isConnected}>Start Testing</Button>
          </div>
        </CardContent>
      </Card>

      {/* Print Report Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-600">
              <Printer className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Print Report</h3>
            </div>
            <p className="text-gray-600">Print compliance certificates</p>
            <Button>Print Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionCards;
