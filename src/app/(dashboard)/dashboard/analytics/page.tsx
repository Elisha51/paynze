
'use client';
import { useState, useEffect } from 'react';
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { OrderAnalyticsReport } from '@/components/dashboard/analytics/order-analytics-report';
import { ProductPerformanceReport } from '@/components/dashboard/analytics/product-performance-report';
import { CustomerAnalyticsReport } from '@/components/dashboard/analytics/customer-analytics-report';
import { ProcurementAnalyticsReport } from '@/components/dashboard/analytics/procurement-analytics-report';
import { MarketingAnalyticsReport } from '@/components/dashboard/analytics/marketing-analytics-report';
import type { Order, Product, Customer, PurchaseOrder, Campaign, Discount } from '@/lib/types';
import { getOrders } from '@/services/orders';
import { getProducts } from '@/services/products';
import { getCustomers } from '@/services/customers';
import { getPurchaseOrders } from '@/services/procurement';
import { getCampaigns, getDiscounts } from '@/services/marketing';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';

type ReportType = 'orders' | 'products' | 'customers' | 'procurement' | 'marketing';

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<ReportType>('orders');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [
                ordersData, 
                productsData, 
                customersData, 
                poData,
                campaignsData,
                discountsData
            ] = await Promise.all([
                getOrders(), 
                getProducts(), 
                getCustomers(), 
                getPurchaseOrders(),
                getCampaigns(),
                getDiscounts(),
            ]);
            setOrders(ordersData);
            setProducts(productsData);
            setCustomers(customersData);
            setPurchaseOrders(poData);
            setCampaigns(campaignsData);
            setDiscounts(discountsData);
            setIsLoading(false);
        }
        loadData();
    }, []);

    const tabs = [
        { value: 'orders', label: 'Orders' },
        { value: 'products', label: 'Products' },
        { value: 'customers', label: 'Customers' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'procurement', label: 'Procurement' },
    ];
    
    return (
        <DashboardPageLayout 
            title="Analytics & Reports"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as ReportType)}
            cta={<DateRangePicker date={dateRange} setDate={setDateRange} />}
        >
            <DashboardPageLayout.TabContent value="orders">
                <DashboardPageLayout.Content>
                    <OrderAnalyticsReport orders={orders} dateRange={dateRange} />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="products">
                <DashboardPageLayout.Content>
                    <ProductPerformanceReport products={products} dateRange={dateRange} />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="customers">
                <DashboardPageLayout.Content>
                    <CustomerAnalyticsReport customers={customers} dateRange={dateRange} />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="marketing">
                <DashboardPageLayout.Content>
                    <MarketingAnalyticsReport campaigns={campaigns} discounts={discounts} orders={orders} dateRange={dateRange} />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="procurement">
                <DashboardPageLayout.Content>
                    <ProcurementAnalyticsReport purchaseOrders={purchaseOrders} dateRange={dateRange} />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
        </DashboardPageLayout>
    )
}
