
'use client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

type AffiliateHeaderProps = {
    notificationCount: number;
}

export function AffiliateHeader({ notificationCount }: AffiliateHeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <h1 className="text-xl font-bold font-headline">Affiliate Dashboard</h1>
                <nav className="ml-auto flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {notificationCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 justify-center p-1 text-xs"
                            >
                                {notificationCount}
                            </Badge>
                        )}
                        <span className="sr-only">View notifications</span>
                    </Button>
                    <Button variant="ghost">Log Out</Button>
                </nav>
            </div>
        </header>
    );
}

    