
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
                {children}
            </Card>
        </TabsContent>
    )
}

TabContent.displayName = 'TabContent';


export function DashboardPageLayout({ title, tabs, cta, children }: DashboardPageLayoutProps) {
  const { searchQuery, setSearchQuery } = useSearch();

  const childrenArray = Array.isArray(children) ? children : [children];
  const cardContent = childrenArray.map((child, index) => {
    if (child.type.displayName === 'TabContent') {
      const cardTitle = child.props.children.props.cardTitle;
      const cardDescription = child.props.children.props.cardDescription;
      return (
        <TabsContent key={index} value={child.props.value}>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>{cardTitle}</CardTitle>
                    <CardDescription>{cardDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  {child.props.children}
                </CardContent>
            </Card>
        </TabsContent>
      )
    }
    return child;
  });


  return (
    <>
      <div className="space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight font-headline">{title}</h2>
      </div>
      <Tabs defaultValue={tabs[0].value}>
        <div className="flex items-center justify-between">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className={tab.className}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {cta}
          </div>
        </div>
        {children}
      </Tabs>
    </>
  );
}

DashboardPageLayout.TabContent = TabContent;
