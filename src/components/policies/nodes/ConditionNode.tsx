// src/components/policies/nodes/ConditionNode.tsx

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, 
  Settings, 
  Trash2, 
  Copy,
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConditionOperator } from '@/lib/types/policy.types';
import { cn } from '@/lib/utils';

interface ConditionNodeData {
  label: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  isValid?: boolean;
}

const ConditionNode = memo(({ data, isConnectable, selected }: NodeProps<ConditionNodeData>) => {
  const getOperatorSymbol = (operator: ConditionOperator) => {
    const symbols: Record<ConditionOperator, string> = {
      equals: '=',
      notEquals: '≠',
      greaterThan: '>',
      lessThan: '<',
      //greaterThanOrEqual: '≥',
      //lessThanOrEqual: '≤',
      in: '∈',
      notIn: '∉',
      contains: '⊃',
      matches: '~',
      between: '∈[]'
    };
    return symbols[operator] || operator;
  };

  const getDisplayValue = (value: any): string => {
    if (Array.isArray(value)) {
      return `[${value.join(', ')}]`;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
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
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />

      {/* Main Node Content */}
      <Card className={cn(
        "min-w-[200px] border-2 transition-shadow",
        selected ? "border-blue-500 shadow-lg" : "border-gray-200",
        !data.isValid && "border-red-300 bg-red-50"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-orange-50 border-b">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Condition</span>
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

        {/* Condition Details */}
        <div className="p-3 space-y-2">
          {!data.isValid && (
            <div className="flex items-center text-xs text-red-600 bg-red-100 p-1 rounded">
              <AlertCircle className="h-3 w-3 mr-1" />
              Incomplete condition
            </div>
          )}

          {data.field ? (
            <>
              <div className="text-sm">
                <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                  {data.field}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="outline" className="bg-orange-100">
                  {getOperatorSymbol(data.operator)}
                </Badge>
                <span className="font-medium text-gray-700">→</span>
                <span className="font-mono bg-blue-50 px-1 py-0.5 rounded text-blue-700">
                  {getDisplayValue(data.value)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">Click to configure condition</p>
          )}

          {/* Preview of evaluation */}
          {data.field && data.value !== undefined && (
            <div className="text-xs text-gray-500 mt-1 border-t pt-1">
              <span className="font-medium">Example:</span>{' '}
              {data.field} {data.operator} {getDisplayValue(data.value)}
            </div>
          )}
        </div>

        {/* Connector Labels */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="outline" className="bg-white text-xs">
            When
          </Badge>
        </div>
        
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="outline" className="bg-white text-xs">
            Then
          </Badge>
        </div>
      </Card>

      {/* Side handles for complex flows */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
        style={{ right: -8 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="false"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-red-500"
        style={{ left: -8 }}
      />
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;