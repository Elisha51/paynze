
'use client';
import { CustomerForm } from '@/components/dashboard/customer-form';

// This is a generic edit page. In a real app, you'd likely fetch customer data
// based on a query param or some other state management.
// For now, it presents an empty form for demonstration.
export default function EditCustomerPage() {
    return <CustomerForm initialCustomer={null} />;
}
