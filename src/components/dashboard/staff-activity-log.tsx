
'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/data-table';
import { getStaffActivity } from '@/services/activities';
import type { Staff, StaffActivity } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '../ui/button';

type StaffActivityLogProps = {
  staffId?: string;
  staff?: Staff[];
};

const getColumns = (staff?: Staff[]): ColumnDef<StaffActivity>[] => [
  {
    accessorKey: 'timestamp',
    header: 'Date',
    cell: ({ row }) => format(new Date(row.getValue('timestamp')), 'PPP p'),
  },
  ...(staff ? [{ // Only include Staff Member column if staff list is provided (for master log)
    accessorKey: 'staffName',
    header: 'Staff Member',
    cell: ({ row }: { row: any }) => (
      <Link href={`/dashboard/staff/${row.original.staffId}`} className="font-medium hover:underline">
        {row.getValue('staffName')}
      </Link>
    ),
    filterFn: (row: any, id: any, value: any) => {
        return value.includes(row.getValue(id))
    },
  }] : []),
  {
    accessorKey: 'activity',
    header: 'Activity',
  },
  {
    accessorKey: 'details',
    header: 'Details',
    cell: ({ row }) => {
      const details = row.getValue('details') as { text: string; link?: string };
      if (details.link) {
        return (
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href={details.link}>
              {details.text}
            </Link>
          </Button>
        );
      }
      return details.text;
    },
  },
];

export function StaffActivityLog({ staffId, staff }: StaffActivityLogProps) {
  const [activity, setActivity] = React.useState<StaffActivity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadActivity() {
      setIsLoading(true);
      const fetchedActivity = await getStaffActivity(staffId);
      setActivity(fetchedActivity);
      setIsLoading(false);
    }
    loadActivity();
  }, [staffId]);

  const staffFilterOptions = React.useMemo(() => {
    return staff ? staff.map(s => ({ value: s.name, label: s.name })) : [];
  }, [staff]);

  const columns = React.useMemo(() => getColumns(staff), [staff]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>
          {staffId ? 'A log of recent actions performed by this staff member.' : 'A log of recent actions performed by all staff members.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={activity}
          isLoading={isLoading}
          filters={staff ? [{
            columnId: 'staffName',
            title: 'Staff Member',
            options: staffFilterOptions
          }] : []}
        />
      </CardContent>
    </Card>
  );
}
