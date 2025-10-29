
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReconciliationOutput } from "@/ai/flows/reconcile-transactions";
import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

type ReconciliationReportProps = {
  result: ReconciliationOutput;
};

const confidenceVariantMap = {
  High: 'default',
  Medium: 'secondary',
  Low: 'outline',
} as const;

export function ReconciliationReport({ result }: ReconciliationReportProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-green-600" />
            Matched Transactions ({result.matchedTransactions.length})
          </CardTitle>
          <CardDescription>
            These transactions were found in both your records and the statement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statement Details</TableHead>
                <TableHead>Your Transaction</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.matchedTransactions.map((item, index) => (
                <TableRow key={`matched-${index}`}>
                  <TableCell className="text-muted-foreground">{item.statementDetails}</TableCell>
                  <TableCell>
                    <Button variant="link" asChild className="p-0 h-auto">
                        <Link href={`/dashboard/transactions/${item.transactionId}`}>TRN-{item.transactionId.substring(0, 8)}...</Link>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={confidenceVariantMap[item.confidence]}>{item.confidence}</Badge>
                  </TableCell>
                  <TableCell>{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="text-orange-500" />
            Unmatched Statement Items ({result.unmatchedStatementItems.length})
          </CardTitle>
          <CardDescription>
            These items appeared on your statement but are not in your records. You may need to record them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statement Details</TableHead>
                <TableHead>Suggested Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.unmatchedStatementItems.map((item, index) => (
                <TableRow key={`unmatched-stmt-${index}`}>
                  <TableCell>{item.details}</TableCell>
                  <TableCell className="text-muted-foreground">{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="text-blue-500" />
            Unmatched Your Items ({result.unmatchedUserItems.length})
          </CardTitle>
          <CardDescription>
            You recorded these items, but they haven't appeared on the statement yet. They might be pending.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Your Item Details</TableHead>
                <TableHead>Suggested Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.unmatchedUserItems.map((item, index) => (
                <TableRow key={`unmatched-user-${index}`}>
                  <TableCell>{item.details}</TableCell>
                  <TableCell className="text-muted-foreground">{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
