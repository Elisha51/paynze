
'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/dashboard/data-table';
import type { Staff } from '@/lib/types';
import { getStaff } from '@/services/staff';
import Link from 'next/link';
import { RolesPermissionsTab } from '@/components/dashboard/roles-permissions-tab';

const columns: ColumnDef<Staff>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { 
    accessorKey: 'role', 
    header: 'Role',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('role')}</Badge>
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
  },
  { 
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }) => <Badge variant={row.getValue('status') === 'Active' ? 'default' : 'secondary'}>{row.getValue('status')}</Badge>
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const staffMember = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild><Link href={`/dashboard/staff/${staffMember.id}/edit`}>Edit Details</Link></DropdownMenuItem>
              <DropdownMenuItem>View Performance</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
  },
];

export default function StaffPage() {
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStaff() {
        setIsLoading(true);
        const fetched = await getStaff();
        setStaff(fetched);
        setIsLoading(false);
    }
    loadStaff();
  }, []);

  const mainTabs = [
      { value: 'team', label: 'Your Team' },
      { value: 'permissions', label: 'Roles & Permissions' },
  ];

  const cta = (
    <Button asChild>
      <Link href="/dashboard/staff/add">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Staff Member
      </Link>
    </Button>
  );

  return (
    <DashboardPageLayout title="Staff Management" tabs={mainTabs} cta={cta}>
        <DashboardPageLayout.TabContent value="team">
            <DataTable columns={columns} data={staff} />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="permissions">
            <RolesPermissionsTab />
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
