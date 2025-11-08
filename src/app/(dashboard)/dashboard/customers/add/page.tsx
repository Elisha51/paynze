
import { CustomerForm } from '@/components/dashboard/customer-form';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function AddCustomerPage() {
  return (
    <DashboardPageLayout title="Add New Customer" backHref="/dashboard/customers">
        <CustomerForm />
    </DashboardPageLayout>
  );
}
