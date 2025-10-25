
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Shift } from "@/lib/types";
import { Clock } from "lucide-react";

type StaffScheduleCardProps = {
    schedule: Shift[];
};

const daysOfWeek: Shift['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function StaffScheduleCard({ schedule }: StaffScheduleCardProps) {
    
    const getShiftForDay = (day: Shift['day']) => {
        return schedule.find(s => s.day === day);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Weekly Schedule
                </CardTitle>
                <CardDescription>The assigned working hours for the week.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {daysOfWeek.map(day => {
                            const shift = getShiftForDay(day);
                            return (
                                <TableRow key={day}>
                                    <TableCell className="font-semibold">{day}</TableCell>
                                    <TableCell>
                                        {shift ? shift.startTime : <Badge variant="outline">Off</Badge>}
                                    </TableCell>
                                    <TableCell>
                                        {shift ? shift.endTime : <Badge variant="outline">Off</Badge>}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

