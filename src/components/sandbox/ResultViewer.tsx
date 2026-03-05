// src/components/sandbox/ResultViewer.tsx

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ResultViewerProps {
  result: any;
}

export function ResultViewer({ result }: ResultViewerProps) {
  if (result.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center text-red-800">
          <XCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Error:</span>
          <span className="ml-2">{result.error}</span>
        </div>
      </div>
    );
  }

  if (!result.executedActions) {
    return (
      <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  }

  return (
    <div className="space-y-4">
      {/* Policy Execution Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Policy</p>
          <p className="text-lg font-semibold">{result.policyName}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Conditions Met</p>
          <div className="flex items-center">
            {result.conditionsMet ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-lg font-semibold text-green-600">Yes</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-lg font-semibold text-red-600">No</span>
              </>
            )}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Actions Executed</p>
          <p className="text-lg font-semibold">{result.executedActions.length}</p>
        </Card>
      </div>

      {/* Ledger Entries */}
      {result.transactionIds && result.transactionIds.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Generated Ledger Entries</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.transactionIds.map((id: string, index: number) => (
                <TableRow key={id}>
                  <TableCell className="font-mono text-sm">{id}</TableCell>
                  <TableCell>
                    <Badge variant="default">Created</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Action Details */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Action Details</h4>
        <div className="space-y-3">
          {result.executedActions.map((action: any, index: number) => (
            <div key={index} className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{action.actionType}</Badge>
                {action.error ? (
                  <Badge variant="destructive">Failed</Badge>
                ) : (
                  <Badge variant="default">Success</Badge>
                )}
              </div>
              
              {action.error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {action.error}
                </p>
              )}
              
              {action.result && (
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(action.result, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}