// src/components/policies/PolicyFlowChart.tsx

import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Panel,
  Position,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Save, 
  Play, 
  GitBranch, 
  Zap, 
  Flag,
  PlayCircle,
  DollarSign,
  Mail,
  Bell,
  Repeat,
  Shield,
  Settings,
  Trash2,
  Copy,
  Maximize2,
  Minimize2,
  Grid,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Link2,
  Unlink,
  Lock,
  Unlock,
} from 'lucide-react';
import { Account } from '@/lib/types/account.types';
import { ActionType } from '@/lib/types/policy.types';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Enhanced Node Components with Handles
const StartNode = ({ data, isConnectable }: { data: any; isConnectable?: boolean }) => {
  return (
    <div className="px-4 py-3 shadow-xl rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 min-w-[200px] group hover:shadow-2xl transition-all duration-200">
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-green-500 border-2 border-white group-hover:scale-125 transition-transform"
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-green-500 border-2 border-white group-hover:scale-125 transition-transform"
        isConnectable={isConnectable}
      />
      <div className="flex items-center">
        <div className="p-1.5 bg-green-200 rounded-lg mr-3">
          <PlayCircle className="h-5 w-5 text-green-700" />
        </div>
        <div>
          <div className="font-bold text-green-800">{data.label}</div>
          {data.description && (
            <div className="text-xs text-green-600 mt-0.5">{data.description}</div>
          )}
        </div>
      </div>
      {data.eventType && (
        <div className="mt-2 pt-2 border-t border-green-200">
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            {data.eventType}
          </Badge>
        </div>
      )}
    </div>
  );
};

const EndNode = ({ data, isConnectable }: { data: any; isConnectable?: boolean }) => {
  return (
    <div className="px-4 py-3 shadow-xl rounded-xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 min-w-[150px] group hover:shadow-2xl transition-all duration-200">
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-red-500 border-2 border-white group-hover:scale-125 transition-transform"
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-red-500 border-2 border-white group-hover:scale-125 transition-transform"
        isConnectable={isConnectable}
      />
      <div className="flex items-center">
        <div className="p-1.5 bg-red-200 rounded-lg mr-3">
          <Flag className="h-5 w-5 text-red-700" />
        </div>
        <div>
          <div className="font-bold text-red-800">{data.label}</div>
        </div>
      </div>
    </div>
  );
};

const ConditionNode = ({ data, isConnectable, selected }: { data: any; isConnectable?: boolean; selected?: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(data);

  const getOperatorColor = (op: string) => {
    const colors: Record<string, string> = {
      'equals': 'bg-blue-100 text-blue-700',
      'notEquals': 'bg-orange-100 text-orange-700',
      'greaterThan': 'bg-green-100 text-green-700',
      'lessThan': 'bg-yellow-100 text-yellow-700',
      'contains': 'bg-purple-100 text-purple-700',
      'in': 'bg-indigo-100 text-indigo-700',
    };
    return colors[op] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <div 
        className={cn(
          "px-4 py-3 shadow-xl rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 min-w-[250px] group hover:shadow-2xl transition-all duration-200",
          selected ? "border-blue-600 ring-2 ring-blue-300" : "border-blue-400"
        )}
        onDoubleClick={() => setIsEditing(true)}
      >
        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="w-3 h-3 bg-blue-500 border-2 border-white group-hover:scale-125 transition-transform"
          isConnectable={isConnectable}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="w-3 h-3 bg-blue-500 border-2 border-white group-hover:scale-125 transition-transform"
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="w-3 h-3 bg-blue-500 border-2 border-white group-hover:scale-125 transition-transform"
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="w-3 h-3 bg-blue-500 border-2 border-white group-hover:scale-125 transition-transform"
          isConnectable={isConnectable}
        />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-200 rounded-lg mr-3">
              <GitBranch className="h-5 w-5 text-blue-700" />
            </div>
            <div className="font-bold text-blue-800">{data.label}</div>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            Condition
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between bg-blue-100/50 p-2 rounded-lg">
            <span className="text-xs font-mono text-blue-800">{data.field || 'field'}</span>
            <Badge className={cn("text-xs", getOperatorColor(data.operator))}>
              {data.operator || 'equals'}
            </Badge>
            <span className="text-xs font-mono text-blue-800">{JSON.stringify(data.value) || 'value'}</span>
          </div>
        </div>

        <div className="mt-2 flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-white/50 hover:bg-white"
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-white/50 hover:bg-white text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Condition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Field</Label>
              <Input 
                value={localData.field} 
                onChange={(e) => setLocalData({ ...localData, field: e.target.value })}
                placeholder="e.g., data.amount"
              />
            </div>
            <div>
              <Label>Operator</Label>
              <Select value={localData.operator} onValueChange={(v) => setLocalData({ ...localData, operator: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="notEquals">Not Equals</SelectItem>
                  <SelectItem value="greaterThan">Greater Than</SelectItem>
                  <SelectItem value="lessThan">Less Than</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="in">In</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input 
                value={localData.value} 
                onChange={(e) => setLocalData({ ...localData, value: e.target.value })}
                placeholder="Value to compare"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={() => {
                Object.assign(data, localData);
                setIsEditing(false);
              }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ActionNode = ({ data, isConnectable, selected }: { data: any; isConnectable?: boolean; selected?: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(data);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'CREATE_LEDGER_ENTRY':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'SEND_NOTIFICATION':
        return <Bell className="h-4 w-4 text-purple-600" />;
      case 'TRIGGER_WORKFLOW':
        return <Repeat className="h-4 w-4 text-blue-600" />;
      default:
        return <Zap className="h-4 w-4 text-orange-600" />;
    }
  };

  return (
    <>
      <div 
        className={cn(
          "px-4 py-3 shadow-xl rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 min-w-[280px] group hover:shadow-2xl transition-all duration-200",
          selected ? "border-amber-600 ring-2 ring-amber-300" : "border-amber-400"
        )}
        onDoubleClick={() => setIsEditing(true)}
      >
        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="w-3 h-3 bg-amber-500 border-2 border-white group-hover:scale-125 transition-transform"
          isConnectable={isConnectable}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="w-3 h-3 bg-amber-500 border-2 border-white group-hover:scale-125 transition-transform"
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="w-3 h-3 bg-amber-500 border-2 border-white group-hover:scale-125 transition-transform"
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="w-3 h-3 bg-amber-500 border-2 border-white group-hover:scale-125 transition-transform"
          isConnectable={isConnectable}
        />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="p-1.5 bg-amber-200 rounded-lg mr-3">
              {getActionIcon(data.actionType || data.type)}
            </div>
            <div className="font-bold text-amber-800">{data.label}</div>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
            Action
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-amber-700 bg-amber-100/50 p-2 rounded-lg">
            <div className="font-medium mb-1">Type: {data.actionType?.replace(/_/g, ' ') || data.type?.replace(/_/g, ' ')}</div>
            {data.amount && (
              <div className="flex items-center justify-between">
                <span>Amount:</span>
                <span className="font-mono">
                  {data.amount.type === 'fixed' ? `$${data.amount.fixedAmount}` : 
                   data.amount.type === 'percentage' ? `${data.amount.percentage}%` :
                   data.amount.type || 'Dynamic'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-white/50 hover:bg-white"
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-white/50 hover:bg-white text-red-600"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-white/50 hover:bg-white text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Action</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="amount">Amount</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 py-4">
              <div>
                <Label>Action Type</Label>
                <Select value={localData.actionType || localData.type} onValueChange={(v) => setLocalData({ ...localData, type: v, actionType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ActionType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description Template</Label>
                <Input 
                  value={localData.descriptionTemplate || ''} 
                  onChange={(e) => setLocalData({ ...localData, descriptionTemplate: e.target.value })}
                  placeholder="e.g., Transaction for {{invoice.number}}"
                />
              </div>
            </TabsContent>
            <TabsContent value="accounts" className="space-y-4 py-4">
              <div>
                <Label>Debit Account</Label>
                <Select value={localData.debitAccount?.type} onValueChange={(v) => setLocalData({ 
                  ...localData, 
                  debitAccount: { ...localData.debitAccount, type: v } 
                })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Account</SelectItem>
                    <SelectItem value="fromContext">From Context</SelectItem>
                    <SelectItem value="expression">Expression</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Credit Account</Label>
                <Select value={localData.creditAccount?.type} onValueChange={(v) => setLocalData({ 
                  ...localData, 
                  creditAccount: { ...localData.creditAccount, type: v } 
                })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Account</SelectItem>
                    <SelectItem value="fromContext">From Context</SelectItem>
                    <SelectItem value="expression">Expression</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="amount" className="space-y-4 py-4">
              <div>
                <Label>Amount Type</Label>
                <Select value={localData.amount?.type} onValueChange={(v) => setLocalData({ 
                  ...localData, 
                  amount: { ...localData.amount, type: v } 
                })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="fromContext">From Context</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="formula">Formula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {localData.amount?.type === 'fixed' && (
                <div>
                  <Label>Amount</Label>
                  <Input 
                    type="number"
                    value={localData.amount?.fixedAmount || ''} 
                    onChange={(e) => setLocalData({ 
                      ...localData, 
                      amount: { ...localData.amount, fixedAmount: parseFloat(e.target.value) } 
                    })}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={() => {
              Object.assign(data, localData);
              setIsEditing(false);
            }}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Node types mapping - defined outside component to prevent re-renders
const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  condition: ConditionNode,
  action: ActionNode,
};

interface PolicyFlowChartProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  accounts?: Account[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onTest?: () => void;
}

// Edge Types - defined outside component
const edgeTypes = {
  default: (props: any) => (
    <g>
      <path
        {...props}
        className="stroke-gray-400 stroke-2 hover:stroke-blue-500 transition-colors"
        markerEnd="url(#arrowhead)"
      />
    </g>
  ),
};

// Inner component that uses the React Flow hooks
function FlowContent({
  initialNodes = [],
  initialEdges = [],
  accounts = [],
  onSave,
  onTest
}: PolicyFlowChartProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [viewMode, setViewMode] = useState<'default' | 'compact' | 'detailed'>('detailed');
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'default',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      console.log('Deleted nodes:', deleted);
    },
    []
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      console.log('Deleted edges:', deleted);
    },
    []
  );

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  const addNode = useCallback((type: 'condition' | 'action') => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: type === 'condition' 
        ? { 
            label: 'New Condition',
            field: '',
            operator: 'equals',
            value: ''
          }
        : { 
            label: 'New Action',
            type: ActionType.CREATE_LEDGER_ENTRY,
            actionType: ActionType.CREATE_LEDGER_ENTRY
          },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Update nodes when initialNodes changes
  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Policy Flow Designer</h3>
          <p className="text-sm text-gray-500">
            Drag nodes to arrange • Double-click to edit • Connect nodes to create flow
          </p>
        </div>
        <div className="flex space-x-2">
          {/* View Controls */}
          <div className="flex border rounded-lg overflow-hidden mr-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none border-r"
              onClick={() => setViewMode('default')}
            >
              Default
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none border-r"
              onClick={() => setViewMode('compact')}
            >
              Compact
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </Button>
          </div>

          {/* Toolbar */}
          <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
            {showGrid ? <Grid className="h-4 w-4" /> : <Grid className="h-4 w-4 opacity-50" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowMiniMap(!showMiniMap)}>
            {showMiniMap ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsLocked(!isLocked)}>
            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSnapToGrid(!snapToGrid)}>
            {snapToGrid ? <Grid className="h-4 w-4" /> : <Grid className="h-4 w-4 opacity-50" />}
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Button variant="outline" size="sm" onClick={() => addNode('condition')}>
            <Plus className="h-4 w-4 mr-1" />
            Condition
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNode('action')}>
            <Plus className="h-4 w-4 mr-1" />
            Action
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="secondary" size="sm" onClick={onTest}>
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span className="text-xs">Start</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
          <span className="text-xs">Condition</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
          <span className="text-xs">Action</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span className="text-xs">End</span>
        </div>
      </div>

      <div style={{ height: '600px' }} className="border rounded-lg overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          snapToGrid={snapToGrid}
          snapGrid={[15, 15]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.1}
          maxZoom={2}
          selectNodesOnDrag={false}
          nodesDraggable={!isLocked}
          nodesConnectable={!isLocked}
          elementsSelectable={!isLocked}
          zoomOnScroll={true}
          panOnScroll={true}
          panOnDrag={true}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Shift']}
          selectionKeyCode={['Shift']}
          selectionOnDrag={true}
        >
          {showGrid && <Background gap={15} size={1} color="#e2e8f0" />}
          <Controls />
          {showMiniMap && (
            <MiniMap 
              nodeColor={(node) => {
                switch (node.type) {
                  case 'start': return '#22c55e';
                  case 'end': return '#ef4444';
                  case 'condition': return '#3b82f6';
                  case 'action': return '#f59e0b';
                  default: return '#94a3b8';
                }
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
              className="!bottom-16 !right-4"
            />
          )}
          
          {/* Custom Arrow Definition */}
          <svg>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="5"
                orient="auto"
              >
                <path d="M2,2 L2,8 L8,5 L2,2" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>
        </ReactFlow>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium">Selected Node</h4>
              <p className="text-xs text-gray-500">ID: {selectedNode.id}</p>
              <p className="text-xs text-gray-500">Type: {selectedNode.type}</p>
            </div>
            <Badge variant="outline">
              {selectedNode.type === 'condition' ? 'Condition' : 
               selectedNode.type === 'action' ? 'Action' : 
               selectedNode.type}
            </Badge>
          </div>
          <ScrollArea className="h-32 mt-2">
            <pre className="text-xs bg-white p-2 rounded">
              {JSON.stringify(selectedNode.data, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}

// Main export - wrapped with Provider
export default function PolicyFlowChartWithProvider(props: PolicyFlowChartProps) {
  return (
    <ReactFlowProvider>
      <FlowContent {...props} />
    </ReactFlowProvider>
  );
}