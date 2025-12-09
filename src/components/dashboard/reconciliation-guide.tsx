
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertTriangle } from "lucide-react";

export function ReconciliationGuide() {
    return (
        <div className="prose prose-sm max-w-none">
            <h4>1. Export as a CSV file</h4>
            <p>From your banking app, mobile money provider, or Excel, export your statement as a <strong>CSV (Comma-Separated Values)</strong> file.</p>

            <h4>2. Check Your File Content</h4>
            <p>The AI is flexible, but for best results, make sure your CSV file includes columns that clearly represent:</p>
            <ul>
                <li>The transaction <strong>date</strong>.</li>
                <li>A <strong>description</strong> of the transaction.</li>
                <li>The transaction <strong>amount</strong>.</li>
            </ul>
            <p className="mt-2">Column names can vary (e.g., "Date", "Transaction Date", "Details", "Amount", "Value"). The AI will do its best to interpret the structure.</p>

            <h4>3. Handle Income and Expenses</h4>
            <p>This is the most important step. To distinguish between money coming in and money going out, use positive and negative numbers in your 'Amount' column:</p>
            <ul>
                <li><strong className="text-green-600">Income / Credits:</strong> Use positive numbers (e.g., <code>50000</code>).</li>
                <li><strong className="text-red-600">Expenses / Debits:</strong> Use negative numbers (e.g., <code>-15000</code>).</li>
            </ul>

            <h4>Example of a Good CSV Structure:</h4>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Transaction Date</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>2024-07-28</TableCell>
                        <TableCell>Payment from Order #123</TableCell>
                        <TableCell className="text-right text-green-600">150000</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>2024-07-28</TableCell>
                        <TableCell>Bank Charges</TableCell>
                        <TableCell className="text-right text-red-600">-500</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>2024-07-27</TableCell>
                        <TableCell>ATM Withdrawal</TableCell>
                        <TableCell className="text-right text-red-600">-50000</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-orange-500"/>
                <p>For best results, upload statements with fewer than 500 rows at a time.</p>
            </div>
        </div>
    );
}
