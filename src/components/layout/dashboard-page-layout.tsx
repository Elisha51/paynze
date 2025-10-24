
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearch } from '@/context/search-context';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

type DashboardPageLayoutProps = {
  title: string;
  tabs: { value: string; label: string, className?: string }[];
  cta: React.ReactNode;
  children: React.ReactNode;
};

const TabContent = ({ value, children }: { value: string, children: React.ReactNode }) => {
    return (
        <TabsContent value={value}>
            <Card className="mt-4">
                <CardContent className="p-6">
                    {children}
                </CardContent>
            </Card>
        </TabsContent>
    )
}

TabContent.displayName = 'TabContent';


export function DashboardPageLayout({ title, tabs, cta, children }: DashboardPageLayoutProps) {
  const { searchQuery, setSearchQuery } = useSearch();

  // This logic is to handle cases where the table has its own Card wrapper
  const childrenArray = Array.isArray(children) ? children : [children];
  const enhancedChildren = childrenArray.map((child, index) => {
    if (child.type.displayName === 'TabContent') {
      const childProps = child.props.children.props;
      // If the direct child of TabContent is already a Card, we don't need to wrap it again.
      if (child.props.children.type.displayName === 'Card') {
          return child;
      }
      // If the table component has its own CardHeader, render it directly
      if (childProps.cardTitle && childProps.cardDescription) {
          return (
             <TabsContent key={index} value={child.props.value}>
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>{childProps.cardTitle}</CardTitle>
                        <CardDescription>{childProps.cardDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {child.props.children}
                    </CardContent>
                </Card>
             </TabsContent>
          )
      }
    }
    return child;
  });


  return (
    <>
      <div className="space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight font-headline">{title}</h2>
      </div>
      <Tabs defaultValue={tabs[0].value}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <TabsList className="overflow-x-auto w-full justify-start md:w-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className={tab.className}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex w-full md:w-auto items-center space-x-2">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-auto lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {cta}
          </div>
        </div>
        {enhancedChildren}
      </Tabs>
    </>
  );
}

DashboardPageLayout.TabContent = TabContent;
