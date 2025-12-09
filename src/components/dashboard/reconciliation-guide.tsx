
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertTriangle } from "lucide-react";

export function ReconciliationGuide() {
    return (
        <div className="prose prose-sm max-w-none">
            <h4>1. Export as a CSV file</h4>
            <p>From your banking app or Excel, export your statement as a <strong>CSV (Comma-Separated Values)</strong> file.</p>

            <h4>2. Format Your Columns</h4>
            <p>The AI needs three specific columns to work. Make sure your CSV file has columns with these exact headers:</p>
            <ul>
                <li><code>Date</code>: The date of the transaction (e.g., 2024-07-28).</li>
                <li><code>Description</code>: A short description of the transaction.</li>
                <li><code>Amount</code>: The transaction amount.</li>
            </ul>

            <h4>3. Handle Income and Expenses</h4>
            <p>This is the most important step. To distinguish between money coming in and money going out, use positive and negative numbers:</p>
            <ul>
                <li><strong className="text-green-600">Income / Credits:</strong> Use positive numbers (e.g., <code>50000</code>).</li>
                <li><strong className="text-red-600">Expenses / Debits:</strong> Use negative numbers (e.g., <code>-15000</code>).</li>
            </ul>

            <h4>Example CSV Structure:</h4>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
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
