import React, { useState, useEffect } from 'react';
import BusinessDashboard from '@/components/BusinessDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Clock, CheckCircle, AlertTriangle, Filter, Download, UserCheck } from 'lucide-react';

              <TabsList className="mb-4">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="expiring" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Expiring Soon
                </TabsTrigger>
                <TabsTrigger value="verification" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Verification Status
                </TabsTrigger>
              </TabsList> 