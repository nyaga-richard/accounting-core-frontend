// src/components/policies/nodes/EventNode.tsx

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Settings, 
  Trash2, 
  Copy,
  Calendar,
  Clock,
  Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BusinessEventType } from '@/lib/types/policy.types';
import { cn } from '@/lib/utils';

interface EventNodeData {
  label: string;
  eventType: BusinessEventType | string;
  isSchedule?: boolean;
  scheduleExpression?: string;
  description?: string;
}

const EventNode = memo(({ data, isConnectable, selected }: NodeProps<EventNodeData>) => {
  const getEventColor = (eventType: string) => {
    if (data.isSchedule) return 'bg-purple-50 border-purple-300';
    
    if (eventType.includes('invoice')) return 'bg-blue-50 border-blue-300';
    if (eventType.includes('payment')) return 'bg-green-50 border-green-300';
    if (eventType.includes('bill')) return 'bg-yellow-50 border-yellow-300';
    if (eventType.includes('period')) return 'bg-purple-50 border-purple-300';
    
    return 'bg-gray-50 border-gray-300';
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  return (
    <div className="relative">
      {/* Only source handle - events trigger flows */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />

      {/* Main Node Content */}
      <Card className={cn(
        "min-w-[200px] border-2 transition-shadow",
        getEventColor(data.eventType),
        selected && "border-blue-500 shadow-lg"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b bg-white bg-opacity-50">
          <div className="flex items-center space-x-2">
            {data.isSchedule ? (
              <Calendar className="h-4 w-4 text-purple-600" />
            ) : (
              <Radio className="h-4 w-4 text-blue-600" />
            )}
            <span className="text-sm font-medium">
              {data.isSchedule ? 'Scheduled' : 'Event'}
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

        {/* Event Details */}
        <div className="p-3 space-y-2">
          <div className="text-center">
            <Badge variant="default" className={cn(
              "text-sm",
              data.isSchedule ? "bg-purple-600" : "bg-blue-600"
            )}>
              {data.isSchedule ? '⏰' : '⚡'} {formatEventType(data.eventType)}
            </Badge>
          </div>

          {data.isSchedule && data.scheduleExpression && (
            <div className="flex items-center justify-center space-x-1 text-xs bg-white p-2 rounded border">
              <Clock className="h-3 w-3" />
              <span className="font-mono">{data.scheduleExpression}</span>
            </div>
          )}

          {data.description && (
            <p className="text-xs text-gray-600 text-center mt-1">
              {data.description}
            </p>
          )}

          {/* Example payload preview */}
          {!data.isSchedule && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs font-medium text-gray-500 mb-1">Example payload:</p>
              <pre className="text-[10px] bg-gray-100 p-1 rounded overflow-hidden">
                {`{
  "amount": 1000,
  "customer": "Acme"
}`}
              </pre>
            </div>
          )}
        </div>

        {/* Connector Label */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="outline" className="bg-white text-xs">
            Triggers
          </Badge>
        </div>
      </Card>

      {/* Right handle for multiple outputs if needed */}
      <Handle
        type="source"
        position={Position.Right}
        id="secondary"
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-400"
        style={{ right: -8 }}
      />
    </div>
  );
});

EventNode.displayName = 'EventNode';

export default EventNode;