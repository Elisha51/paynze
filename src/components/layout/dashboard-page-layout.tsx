
'use client';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearch } from '@/context/search-context';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Breadcrumbs } from '../ui/breadcrumbs';
import { usePathname } from 'next/navigation';

type Tab = { value: string; label: string; className?: string };

type DashboardPageLayoutProps = {
  title: string;
  tabs?: Tab[];
  cta: React.ReactNode;
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (value: string) => void;
};

// Main content container
const Content = ({ children }: { children: React.ReactNode }) => {
    return <div className="mt-4">{children}</div>;
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

// Wrapper for filterable tabs inside a card
const FilterTabs = ({ filterTabs, defaultValue, children }: { filterTabs: Tab[], defaultValue: string, children: React.ReactNode }) => {
    return (
        <Card>
            <Tabs defaultValue={defaultValue}>
                <CardHeader>
                    <TabsList className="flex-wrap h-auto justify-start">
                        {filterTabs.map(tab => (
                            <TabsTrigger key={tab.value} value={tab.value} className={`${tab.className} whitespace-nowrap`}>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Tabs>
        </Card>
    );
};
FilterTabs.displayName = 'FilterTabs';

// Regular tab content
const TabContent = ({ value, children }: { value: string, children: React.ReactNode }) => {
    return <TabsContent value={value}>{children}</TabsContent>
}
TabContent.displayName = 'TabContent';


export function DashboardPageLayout({ title, tabs, cta, children, activeTab, onTabChange }: DashboardPageLayoutProps) {
  const { searchQuery, setSearchQuery } = useSearch();
  const pathname = usePathname();

  const breadcrumbItems = pathname.split('/').filter(Boolean).map((segment, index, arr) => {
      const href = '/' + arr.slice(0, index + 1).join('/');
      // Simple capitalization, can be improved with a mapping for specific routes
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      return { href, label };
  });

  const MainTabsWrapper = ({ children }: { children: React.ReactNode }) => {
    if (tabs && tabs.length > 0) {
        const defaultValue = tabs[0].value;
        const value = activeTab || defaultValue;
        return (
            <Tabs defaultValue={defaultValue} value={value} onValueChange={onTabChange}>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <TabsList className="overflow-x-auto w-full justify-start lg:w-auto">
                        {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className={tab.className}>
                            {tab.label}
                        </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex w-full lg:w-auto items-center space-x-2">
                        <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={`Search ${breadcrumbItems[breadcrumbItems.length - 1]?.label || 'items'}...`}
                            className="w-full appearance-none bg-background pl-8 shadow-none lg:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        </div>
                        {cta}
                    </div>
                </div>
                {children}
            </Tabs>
        );
    }
    // Layout for pages without main tabs
    return (
        <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-end gap-4">
                 <div className="flex w-full md:w-auto items-center space-x-2">
                    <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={`Search ${breadcrumbItems[breadcrumbItems.length - 1]?.label || 'items'}...`}
                        className="w-full appearance-none bg-background pl-8 shadow-none md:w-auto lg:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    </div>
                    {cta}
                </div>
            </div>
            {children}
        </>
    )
  }

  return (
    <>
      <div className="space-y-2 mb-4">
         <Breadcrumbs items={breadcrumbItems} />
        <h2 className="text-3xl font-bold tracking-tight font-headline">{title}</h2>
      </div>
      <MainTabsWrapper>
        {children}
      </MainTabsWrapper>
    </>
  );
}

DashboardPageLayout.TabContent = TabContent;
DashboardPageLayout.Content = Content;
DashboardPageLayout.FilterTabs = FilterTabs;
