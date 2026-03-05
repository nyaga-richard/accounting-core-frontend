// src/components/policies/PolicyFlowChart.tsx

import React, { useCallback, useState } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Save, Play } from 'lucide-react';
import ConditionNode  from './nodes/ConditionNode';
import ActionNode  from './nodes/ActionNode';
import EventNode  from './nodes/EventNode';
import { ActionEditor } from './ActionEditor';
import { ConditionEditor } from './ConditionEditor';

const nodeTypes: NodeTypes = {
  event: EventNode,
  condition: ConditionNode,
  action: ActionNode,
};

interface PolicyFlowChartProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onTest?: () => void;
}

export function PolicyFlowChart({
  initialNodes = [],
  initialEdges = [],
  onSave,
  onTest
}: PolicyFlowChartProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addConditionNode = useCallback(() => {
    const newNode: Node = {
      id: `condition-${Date.now()}`,
      type: 'condition',
      position: { x: 100, y: 100 },
      data: { 
        label: 'New Condition',
        field: '',
        operator: 'equals',
        value: ''
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const addActionNode = useCallback(() => {
    const newNode: Node = {
      id: `action-${Date.now()}`,
      type: 'action',
      position: { x: 100, y: 200 },
      data: { 
        label: 'New Action',
        actionType: 'createLedgerEntry'
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  return (
    <div className="h-[600px] w-full border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        
        <Panel position="top-left" className="bg-white p-2 rounded shadow-sm space-x-2">
          <Button size="sm" variant="outline" onClick={addConditionNode}>
            <Plus className="mr-1 h-3 w-3" />
            Condition
          </Button>
          <Button size="sm" variant="outline" onClick={addActionNode}>
            <Plus className="mr-1 h-3 w-3" />
            Action
          </Button>
          <Button size="sm" variant="default" onClick={handleSave}>
            <Save className="mr-1 h-3 w-3" />
            Save
          </Button>
          <Button size="sm" variant="secondary" onClick={onTest}>
            <Play className="mr-1 h-3 w-3" />
            Test
          </Button>
        </Panel>

        {selectedNode && (
          <Panel position="bottom-right" className="bg-white p-4 rounded shadow-lg w-80">
            <h3 className="font-semibold mb-2">Node Properties</h3>
            {selectedNode.type === 'condition' && (
              <ConditionEditor
                data={selectedNode.data}
                onChange={(newData) => {
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, ...newData } }
                        : n
                    )
                  );
                }}
              />
            )}
            {selectedNode.type === 'action' && (
              <ActionEditor
                data={selectedNode.data}
                onChange={(newData) => {
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, ...newData } }
                        : n
                    )
                  );
                }}
              />
            )}
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}