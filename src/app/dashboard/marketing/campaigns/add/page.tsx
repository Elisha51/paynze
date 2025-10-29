
'use client';
import { ArrowLeft, Save, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AddCampaignPage() {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [isEndDate, setIsEndDate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/marketing?tab=campaigns">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Campaign</h1>
          <p className="text-muted-foreground text-sm">Fill in the details to launch a new marketing campaign.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Campaign
            </Button>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input id="name" placeholder="e.g., Summer Sale" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="description">Description</Label>
                    <Button variant="ghost" size="sm">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                    </Button>
                </div>
                <Textarea id="description" placeholder="A brief description of the campaign's goals." />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Audience & Channel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="channel">Channel</Label>
                        <Select>
                            <SelectTrigger id="channel">
                                <SelectValue placeholder="Select a channel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="push">Push Notification</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="audience">Audience</Label>
                        <Select>
                            <SelectTrigger id="audience">
                                <SelectValue placeholder="Select an audience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Customers</SelectItem>
                                <SelectItem value="new">New Customers</SelectItem>
                                <SelectItem value="wholesalers">Wholesalers</SelectItem>
                                <SelectItem value="abandoned">Abandoned Carts (Last 7 days)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                    <CardDescription>Set the start and end dates for the campaign.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus/>
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isEndDate" checked={isEndDate} onChange={(e) => setIsEndDate(e.target.checked)} />
                        <Label htmlFor="isEndDate">Set an end date</Label>
                    </div>
                    {isEndDate && (
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus/>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
