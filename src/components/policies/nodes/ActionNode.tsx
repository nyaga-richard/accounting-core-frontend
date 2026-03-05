// src/components/policies/nodes/ActionNode.tsx

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Settings, 
  Trash2, 
  Copy,
  DollarSign,
  Mail,
  GitMerge,
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActionType } from '@/lib/types/policy.types';
import { cn } from '@/lib/utils';

interface ActionNodeData {
  subjectTemplate: any;
  label: string;
  actionType: ActionType;
  debitAccount?: any;
  creditAccount?: any;
  amount?: any;
  descriptionTemplate?: string;
  workflowId?: string;
  channel?: string;
  isValid?: boolean;
}

const ActionNode = memo(({ data, isConnectable, selected }: NodeProps<ActionNodeData>) => {
  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case ActionType.CREATE_LEDGER_ENTRY:
        return <DollarSign className="h-4 w-4" />;
      case ActionType.SEND_NOTIFICATION:
        return <Mail className="h-4 w-4" />;
      case ActionType.TRIGGER_WORKFLOW:
        return <GitMerge className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getActionColor = (type: ActionType) => {
    switch (type) {
      case ActionType.CREATE_LEDGER_ENTRY:
        return 'bg-green-50 border-green-200';
      case ActionType.SEND_NOTIFICATION:
        return 'bg-purple-50 border-purple-200';
      case ActionType.TRIGGER_WORKFLOW:
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatAmount = (amount: any) => {
    if (!amount) return null;
    
    switch (amount.type) {
      case 'fixed':
        return `$${amount.fixedAmount}`;
      case 'fromContext':
        return `{${amount.contextPath}}`;
      case 'percentage':
        return `${amount.percentage}% of ${amount.percentageOf}`;
      case 'formula':
        return amount.formula;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />

      {/* Main Node Content */}
      <Card className={cn(
        "min-w-[240px] border-2 transition-shadow",
        getActionColor(data.actionType),
        selected ? "border-blue-500 shadow-lg" : "",
        !data.isValid && "border-red-300 bg-red-50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b bg-white bg-opacity-50">
          <div className="flex items-center space-x-2">
            {getActionIcon(data.actionType)}
            <span className="text-sm font-medium">
              {data.actionType?.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Action Details */}
        <div className="p-3 space-y-3">
          {!data.isValid && (
            <div className="flex items-center text-xs text-red-600 bg-red-100 p-1 rounded">
              <AlertCircle className="h-3 w-3 mr-1" />
              Incomplete action configuration
            </div>
          )}

          {data.actionType === ActionType.CREATE_LEDGER_ENTRY && (
            <>
              {/* Debit Account */}
              {data.debitAccount && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500">Debit</div>
                  <div className="text-sm bg-white p-2 rounded border">
                    {data.debitAccount.type === 'fixed' ? (
                      <span className="font-mono">Account: {data.debitAccount.fixedAccountId}</span>
                    ) : data.debitAccount.type === 'fromContext' ? (
                      <span className="font-mono">From: {data.debitAccount.contextPath}</span>
                    ) : (
                      <span className="font-mono">Expression: {data.debitAccount.expression}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Credit Account */}
              {data.creditAccount && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500">Credit</div>
                  <div className="text-sm bg-white p-2 rounded border">
                    {data.creditAccount.type === 'fixed' ? (
                      <span className="font-mono">Account: {data.creditAccount.fixedAccountId}</span>
                    ) : data.creditAccount.type === 'fromContext' ? (
                      <span className="font-mono">From: {data.creditAccount.contextPath}</span>
                    ) : (
                      <span className="font-mono">Expression: {data.creditAccount.expression}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Amount */}
              {data.amount && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500">Amount</div>
                  <Badge variant="outline" className="bg-white">
                    {formatAmount(data.amount)}
                  </Badge>
                </div>
              )}

              {/* Description */}
              {data.descriptionTemplate && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500">Description</div>
                  <p className="text-xs bg-white p-1 rounded border truncate">
                    {data.descriptionTemplate}
                  </p>
                </div>
              )}
            </>
          )}

          {data.actionType === ActionType.SEND_NOTIFICATION && (
            <>
              <Badge variant="outline">{data.channel || 'email'}</Badge>
              {data.subjectTemplate && (
                <p className="text-xs truncate">Subject: {data.subjectTemplate}</p>
              )}
            </>
          )}

          {data.actionType === ActionType.TRIGGER_WORKFLOW && (
            <Badge variant="outline">Workflow: {data.workflowId}</Badge>
          )}

          {!data.actionType && (
            <p className="text-sm text-gray-400 italic">Click to configure action</p>
          )}
        </div>

        {/* Connector Label */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="outline" className="bg-white text-xs">
            Execute
          </Badge>
        </div>
      </Card>
    </div>
  );
});

ActionNode.displayName = 'ActionNode';

export default ActionNode;