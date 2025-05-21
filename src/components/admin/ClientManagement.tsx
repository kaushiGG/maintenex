import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Search, Archive, Trash2 } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'archived';
  joinDate: string;
}

// Mock data for clients with the correct status type
const MOCK_CLIENTS: Client[] = [
  { id: 1, name: 'MediaCorp', email: 'contact@mediacorp.com', status: 'active', joinDate: '2023-01-15' },
  { id: 2, name: 'TechWave Solutions', email: 'info@techwave.com', status: 'active', joinDate: '2023-02-20' },
  { id: 3, name: 'Global Insights', email: 'support@globalinsights.com', status: 'active', joinDate: '2023-03-05' },
  { id: 4, name: 'Creative Studios', email: 'hello@creativestudios.com', status: 'active', joinDate: '2023-04-12' },
  { id: 5, name: 'DataDrive Analytics', email: 'team@datadrive.com', status: 'active', joinDate: '2023-05-18' },
];

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const archiveClient = (id: number) => {
    setClients(clients.map(client => 
      client.id === id ? { ...client, status: 'archived' } : client
    ));
    
    toast.success('Client archived successfully', {
      style: {
        backgroundColor: '#7851CA',
        color: 'white',
        border: 'none',
      },
    });
  };

  const removeClient = (id: number) => {
    setClients(clients.filter(client => client.id !== id));
    
    toast.success('Client removed successfully', {
      style: {
        backgroundColor: '#7851CA',
        color: 'white',
        border: 'none',
      },
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-pretance-purple mb-6">Client Management</h2>
      
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pretance-purple/60" />
        <Input
          type="text"
          placeholder="Search clients..."
          className="pl-10 bg-white border-pretance-light"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Clients list */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pretance-purple/10">
              <tr>
                <th className="text-left p-4 text-pretance-purple font-medium">Client Name</th>
                <th className="text-left p-4 text-pretance-purple font-medium">Email</th>
                <th className="text-left p-4 text-pretance-purple font-medium">Status</th>
                <th className="text-left p-4 text-pretance-purple font-medium">Join Date</th>
                <th className="text-right p-4 text-pretance-purple font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-pretance-light/30 hover:bg-pretance-purple/5">
                  <td className="p-4">{client.name}</td>
                  <td className="p-4">{client.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="p-4">{client.joinDate}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => archiveClient(client.id)}
                        title="Archive client"
                      >
                        <Archive className="h-4 w-4 text-amber-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeClient(client.id)}
                        title="Remove client"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">No clients found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ClientManagement;
