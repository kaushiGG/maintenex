
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Wrench, 
  TrendingUp, 
  ShieldAlert
} from 'lucide-react';

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
      <Card className="p-4 bg-white shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center">
          <div className="flex-shrink-0 p-2 rounded-md bg-pretance-light text-pretance-purple">
            <Building className="h-5 w-5" />
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Active Sites
              </dt>
              <dd className="flex items-center">
                <div className="text-2xl font-semibold text-pretance-purple">48</div>
                <Badge className="ml-2 bg-green-100 text-green-800 border-0 text-xs">
                  +3
                </Badge>
              </dd>
            </dl>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-white shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center">
          <div className="flex-shrink-0 p-2 rounded-md bg-pretance-light text-pretance-purple">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Efficiency
              </dt>
              <dd className="flex items-center">
                <div className="text-2xl font-semibold text-pretance-purple">92%</div>
                <Badge className="ml-2 bg-green-100 text-green-800 border-0 text-xs">
                  +4%
                </Badge>
              </dd>
            </dl>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-white shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center">
          <div className="flex-shrink-0 p-2 rounded-md bg-pretance-light text-pretance-purple">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Compliance
              </dt>
              <dd className="flex items-center">
                <div className="text-2xl font-semibold text-pretance-purple">94%</div>
                <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-0 text-xs">
                  3 items
                </Badge>
              </dd>
            </dl>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-white shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center">
          <div className="flex-shrink-0 p-2 rounded-md bg-pretance-light text-pretance-purple">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Maintenance
              </dt>
              <dd className="flex items-center">
                <div className="text-2xl font-semibold text-pretance-purple">24</div>
                <Badge className="ml-2 bg-blue-100 text-blue-800 border-0 text-xs">
                  3 days
                </Badge>
              </dd>
            </dl>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsCards;
