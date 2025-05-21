
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, ChevronDown, Zap, Droplet, 
  Thermometer, Shield, Tag, CheckSquare 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ServiceCard from '@/components/services/directory/ServiceCard';
import BusinessDashboard from '@/components/BusinessDashboard';

// Mock data for the service directory
const serviceItems = [
  {
    id: 1,
    title: 'Test & Tag',
    description: 'Electrical Equipment Testing',
    icon: Tag,
    stats: {
      jobsCompleted: 243,
      activeContractors: 18,
      complianceRate: 97
    },
    category: 'Electrical',
    route: '/services/test-a-tag'
  },
  {
    id: 2,
    title: 'RCD Testing',
    description: 'Residual Current Device Testing',
    icon: Zap,
    stats: {
      jobsCompleted: 187,
      activeContractors: 12,
      complianceRate: 94
    },
    category: 'Electrical',
    route: '/services/rcd-testing'
  },
  {
    id: 3,
    title: 'Plumbing Services',
    description: 'General Plumbing Maintenance',
    icon: Droplet,
    stats: {
      jobsCompleted: 156,
      activeContractors: 9,
      complianceRate: 92
    },
    category: 'Plumbing',
    route: '/services/plumbing'
  },
  {
    id: 4,
    title: 'Air Conditioning',
    description: 'HVAC System Maintenance',
    icon: Thermometer,
    stats: {
      jobsCompleted: 201,
      activeContractors: 14,
      complianceRate: 95
    },
    category: 'HVAC',
    route: '/services/air-conditioning'
  },
  {
    id: 5,
    title: 'Safety Inspection',
    description: 'Workplace Safety Compliance',
    icon: Shield,
    stats: {
      jobsCompleted: 129,
      activeContractors: 7,
      complianceRate: 98
    },
    category: 'Safety',
    route: '/services/safety'
  },
  {
    id: 6,
    title: 'Emergency Lighting',
    description: 'Exit & Emergency Light Testing',
    icon: CheckSquare,
    stats: {
      jobsCompleted: 173,
      activeContractors: 11,
      complianceRate: 96
    },
    category: 'Electrical',
    route: '/services/emergency-exit-lighting'
  }
];

interface ServiceDirectoryProps {
  switchRole?: () => void;
  userRole?: 'business' | 'contractor';
  handleLogout?: () => void;
}

const ServiceDirectory = ({
  switchRole = () => {},
  userRole = 'business',
  handleLogout = () => {}
}: ServiceDirectoryProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Services');
  
  const categories = ['All Services', 'Electrical', 'Plumbing', 'HVAC', 'Safety'];
  
  const filteredServices = serviceItems.filter(service => {
    // Filter by search query
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = activeCategory === 'All Services' || service.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <BusinessDashboard 
      switchRole={switchRole} 
      userRole={userRole} 
      handleLogout={handleLogout}
    >
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-4">
          {/* Header section */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Service Directory</h1>
            <Button className="bg-[#7851CA] hover:bg-[#6740B4]">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
          
          {/* Search and filter section */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-2/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search services..." 
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-1/3">
              <div className="relative w-1/2">
                <Button variant="outline" className="w-full justify-between" onClick={() => {}}>
                  All Categories
                  <ChevronDown size={16} />
                </Button>
              </div>
              <div className="relative w-1/2">
                <Button variant="outline" className="w-full justify-between" onClick={() => {}}>
                  All Statuses
                  <ChevronDown size={16} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Category tabs */}
          <div className="border-b">
            <div className="flex space-x-4 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`py-2 px-2 text-sm font-medium whitespace-nowrap ${
                    activeCategory === category 
                      ? 'text-[#7851CA] border-b-2 border-[#7851CA]' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Service cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filteredServices.map((service) => (
              <ServiceCard 
                key={service.id}
                service={service}
                onViewDetails={() => navigate(service.route)}
                onCreateJob={() => navigate(`/jobs/assign?service=${service.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </BusinessDashboard>
  );
};

export default ServiceDirectory;
