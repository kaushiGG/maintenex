import React, { useState } from 'react';
import { Site } from '@/types/site';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin, Phone, Mail, PackageIcon, ChevronRight, X } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';

interface SitesTableProps {
  sites: Site[];
  onEdit: (site: Site) => void;
  onDelete: (siteId: string) => void;
}

const SitesTable = ({ sites, onEdit, onDelete }: SitesTableProps) => {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-500">Compliant</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500">Warning</Badge>;
      case 'non-compliant':
        return <Badge className="bg-red-500">Non-Compliant</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  const handleViewDetails = (site: Site) => {
    setSelectedSite(site);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.id}>
                <TableCell className="font-medium">{site.name}</TableCell>
                <TableCell>
                  <div className="flex items-start gap-1">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{site.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {site.contact_phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{site.contact_phone}</span>
                    </div>
                  )}
                  {site.contact_email && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{site.contact_email}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {site.site_type || 'Office'}
                  </Badge>
                </TableCell>
                <TableCell>{site.itemCount || 0}</TableCell>
                <TableCell>{getStatusBadge(site.complianceStatus)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(site)}
                      className="text-orange-500 border-orange-200 hover:bg-orange-50"
                    >
                      <PackageIcon className="h-4 w-4 mr-1" />
                      Equipment
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(site)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDelete(site.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-7xl">
            <DrawerHeader className="border-b">
              <DrawerTitle className="flex items-center">
                {selectedSite?.name} - Equipment Details
              </DrawerTitle>
              <DrawerClose>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="p-6">
              {selectedSite?.equipment && selectedSite.equipment.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Equipment at {selectedSite.name}</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSite.equipment.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                              <Badge className={`
                                ${item.status === 'Operational' ? 'bg-green-100 text-green-800' : 
                                  item.status === 'Maintenance Required' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'}`}
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <PackageIcon className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-1">No Equipment Found</h3>
                  <p className="text-gray-500">This site has no equipment registered in the system.</p>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SitesTable;
