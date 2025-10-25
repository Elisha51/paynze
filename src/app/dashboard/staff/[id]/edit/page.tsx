
'use client';

import { StaffForm } from '@/components/dashboard/staff-form';
import { getStaff } from '@/services/staff';
import type { Staff } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditStaffPage() {
  const params = useParams();
  const id = params.id as string;
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        if (!id) return;
        setLoading(true);
        const allStaff = await getStaff();
        const foundStaff = allStaff.find(s => s.id === id);
        setStaff(foundStaff || null);
        setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
      return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      );
  }

  if (!staff) {
      return <div>Staff member not found.</div>
  }

  return <StaffForm initialStaff={staff} />;
}
