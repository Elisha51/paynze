
'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

type Tab = { value: string; label: string; className?: string };

type DashboardPageLayoutProps = {
  title: string;
  description?: string;
  tabs?: Tab[];
  cta?: React.ReactNode;
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  backHref?: string;
};

// Main content container
const Content = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};
Content.displayName = 'Content';

// Wrapper for simple content without tabs
const SimpleContent = ({ children }: { children: React.ReactNode }) => {
    return (
        <Card className="mt-4">
            <CardContent className="p-6">
                {children}
            </CardContent>
        </Card>
    )
}
SimpleContent.displayName = 'SimpleContent';

// Regular tab content
const TabContent = ({ value, children }: { value: string, children: React.ReactNode }) => {
    return <TabsContent value={value} className="mt-6">{children}</TabsContent>
}
TabContent.displayName = 'TabContent';


export function DashboardPageLayout({ title, description, tabs, cta, children, activeTab, onTabChange, backHref }: DashboardPageLayoutProps) {
  
  const HeaderContent = () => (
     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            {backHref && (
                 <Button variant="outline" size="icon" asChild>
                    <Link href={backHref}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
            )}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
        </div>
        {cta && <div className="w-full sm:w-auto flex-shrink-0">{cta}</div>}
     </div>
  );
  
  const MainTabsWrapper = ({ children }: { children: React.ReactNode }) => {
    if (tabs && tabs.length > 0) {
        const defaultValue = tabs[0].value;
        const value = activeTab || defaultValue;
        return (
            <Tabs defaultValue={defaultValue} value={value} onValueChange={onTabChange}>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <TabsList className="overflow-x-auto w-full justify-start sm:w-auto">
                        {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className={tab.className}>
                            {tab.label}
                        </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex w-full sm:w-auto items-center justify-end space-x-2">
                        {cta}
                    </div>
                </div>
                {children}
            </Tabs>
        );
    }
    // Layout for pages without main tabs
    return (
        <div className="space-y-6">
            <HeaderContent />
            {children}
        </div>
    )
  }

  return (
    <>
      <MainTabsWrapper>
        {children}
      </MainTabsWrapper>
    </>
  );
}

DashboardPageLayout.TabContent = TabContent;
DashboardPageLayout.Content = Content;
