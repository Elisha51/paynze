
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';

type SidebarContextValue = {
  state: 'expanded' | 'collapsed';
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isSheetOpen, setSheetOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isMobile) {
      const storedState = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
        ?.split('=')[1];
      if (storedState) {
        setIsCollapsed(storedState === 'collapsed');
      }
    } else {
        setIsCollapsed(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSheetOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => {
        const newState = !prev;
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState ? 'collapsed' : 'expanded'}; path=/; max-age=${60 * 60 * 24 * 365}`;
        return newState;
      });
    }
  };

  const state = isMobile ? 'expanded' : isCollapsed ? 'collapsed' : 'expanded';
  
  const sheetOpenValue = isMobile ? isSheetOpen : false;
  const onSheetOpenChange = isMobile ? setSheetOpen : () => {};

  return (
    <SidebarContext.Provider value={{ state, isMobile, toggleSidebar }}>
      <Sheet open={sheetOpenValue} onOpenChange={onSheetOpenChange}>
          {children}
      </Sheet>
    </SidebarContext.Provider>
  );
}

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { state, isMobile } = useSidebar();
  const Comp = isMobile ? SheetContent : 'aside';

  return (
    <Comp
      ref={ref}
      className={cn(
        'group flex flex-col transition-all duration-300 ease-in-out',
        !isMobile && 'h-screen sticky top-0 border-r bg-sidebar text-sidebar-foreground',
        !isMobile && state === 'expanded' && 'w-64',
        !isMobile && state === 'collapsed' && 'w-16',
        isMobile && 'w-64 bg-sidebar text-sidebar-foreground p-0',
        className
      )}
      data-state={state}
      {...props}
    >
      {isMobile && <SheetTitle className="sr-only">Navigation Menu</SheetTitle>}
      {children}
    </Comp>
  );
});
Sidebar.displayName = 'Sidebar';


export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  return (
    <SheetTrigger asChild>
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', className)}
        {...props}
      >
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    </SheetTrigger>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('border-b p-2 h-14 flex items-center', className)}
    {...props}
  />
));
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto overflow-x-hidden p-2', className)}
    {...props}
  />
));
SidebarContent.displayName = 'SidebarContent';

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-2', className)}
    {...props}
  />
));
SidebarFooter.displayName = 'SidebarFooter';

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('space-y-1', className)}
    {...props}
  />
));
SidebarMenu.displayName = 'SidebarMenu';

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('relative', className)}
    {...props}
  />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

const sidebarMenuButtonVariants = cva(
  'flex items-center w-full gap-3 rounded-md p-2 text-left text-sm font-medium outline-none ring-sidebar-ring transition-colors focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      isActive: {
        true: 'bg-sidebar-accent text-sidebar-accent-foreground',
        false: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
);

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: React.ReactNode;
  }
>(({ asChild, isActive, tooltip, className, children, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  const { state } = useSidebar();

  const buttonContent = (
    <Comp
      ref={ref}
      className={cn(sidebarMenuButtonVariants({ isActive }), 'group/button relative', state === 'collapsed' && 'justify-center', className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
           if (child.props.className?.includes('badge')) {
            return React.cloneElement(child as React.ReactElement, {
                className: cn(
                    child.props.className,
                    'transition-all duration-300',
                    state === 'expanded' ? '' : 'absolute -top-1 -right-1 p-1 h-auto text-[10px] leading-none',
                ),
            });
           }
           if (child.type === 'span') {
            return React.cloneElement(child as React.ReactElement, {
              className: cn(
                child.props.className,
                'transition-all duration-300',
                state === 'collapsed' && 'opacity-0 w-0'
              ),
            });
           }
        }
        return child;
      })}
    </Comp>
  );

  if (state === 'collapsed' && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent side="right" align="center">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

export const SidebarInset = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => {
    return (
        <div ref={ref} className={cn('flex flex-col w-full', className)} {...props} />
    )
})
SidebarInset.displayName = 'SidebarInset';
