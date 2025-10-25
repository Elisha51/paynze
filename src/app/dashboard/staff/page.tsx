
'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/dashboard/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Staff = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Sales Agent' | 'Delivery Rider';
  status: 'Active' | 'Inactive';
};

const staff: Staff[] = [
  { id: 'staff-001', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 'staff-002', name: 'Jane Smith', email: 'jane@example.com', role: 'Sales Agent', status: 'Active' },
  { id: 'staff-003', name: 'Peter Jones', email: 'peter@example.com', role: 'Delivery Rider', status: 'Inactive' },
];

const columns: ColumnDef<Staff>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { 
    accessorKey: 'role', 
    header: 'Role',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('role')}</Badge>
  },
  { 
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }) => <Badge variant={row.getValue('status') === 'Active' ? 'default' : 'secondary'}>{row.getValue('status')}</Badge>
  },
  {
    id: 'actions',
    cell: () => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit Details</DropdownMenuItem>
            <DropdownMenuItem>View Performance</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export default function StaffPage() {
  const cta = (
    <Button>
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Staff Member
    </Button>
  );

  return (
    <DashboardPageLayout title="Staff Management" cta={cta}>
        <Card>
          <CardHeader>
              <CardTitle>Your Team</CardTitle>
              <CardDescription>Manage staff accounts, roles, and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={staff} />
          </CardContent>
        </Card>
    </DashboardPageLayout>
  );
}
