// src/pages/PolicyEditor.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { PolicyFlowChart } from '@/components/policies/PolicyFlowChart';
import { SandboxTester } from '@/components/sandbox/SandboxTester';
import { policiesApi } from '@/lib/api/policies';
import { Policy } from '@/lib/types/policy.types';
import { Save, Play, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner'; // ✅ Use Sonner's toast directly

export function PolicyEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [policy, setPolicy] = useState<Partial<Policy>>({
    name: '',
    description: '',
    eventType: '',
    priority: 100,
    isActive: true,
    conditions: [],
    actions: [],
    tags: []
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadPolicy(id);
    }
  }, [id]);

  const loadPolicy = async (policyId: string) => {
    try {
      const response = await policiesApi.get(policyId);
      setPolicy(response.data);
    } catch (error) {
      toast.error('Failed to load policy'); // ✅ Sonner toast
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (id === 'new') {
        await policiesApi.create(policy);
      } else {
        await policiesApi.update(id!, policy);
      }
      toast.success('Policy saved successfully'); // ✅ Sonner toast
      navigate('/policies');
    } catch (error) {
      toast.error('Failed to save policy'); // ✅ Sonner toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (testPolicy: Policy, context: any) => {
    return await policiesApi.test(testPolicy, context);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/policies')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {id === 'new' ? 'Create New Policy' : 'Edit Policy'}
            </h1>
            <p className="text-gray-500">Define accounting rules and conditions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/policies')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Policy'}
          </Button>
        </div>
      </div>

      {/* Policy Details */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Policy Name</Label>
              <Input
                id="name"
                value={policy.name}
                onChange={(e) => setPolicy({ ...policy, name: e.target.value })}
                placeholder="e.g., Revenue Recognition"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={policy.description}
                onChange={(e) => setPolicy({ ...policy, description: e.target.value })}
                placeholder="Describe what this policy does"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Input
                id="eventType"
                value={policy.eventType}
                onChange={(e) => setPolicy({ ...policy, eventType: e.target.value })}
                placeholder="e.g., invoice.created"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={policy.priority}
                onChange={(e) => setPolicy({ ...policy, priority: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={policy.isActive}
                onCheckedChange={(checked: any) => setPolicy({ ...policy, isActive: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs for Flow and Testing */}
      <Tabs defaultValue="flow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flow">Flow Designer</TabsTrigger>
          <TabsTrigger value="test">Test in Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="flow" className="space-y-4">
          <PolicyFlowChart
            initialNodes={[]}
            initialEdges={[]}
            onSave={(nodes, edges) => {
              console.log('Saving flow:', { nodes, edges });
              toast('Flow saved'); // optional notification
            }}
            onTest={() => {}}
          />
        </TabsContent>

        <TabsContent value="test">
          <SandboxTester
            policy={policy as Policy}
            onTest={handleTest}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}