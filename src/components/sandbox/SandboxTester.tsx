// src/components/sandbox/SandboxTester.tsx

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Save, Copy, Check } from 'lucide-react';
import { Policy, EventContext, BusinessEventType } from '@/lib/types/policy.types';
import { ResultViewer } from './ResultViewer';

interface SandboxTesterProps {
  policy?: Policy;
  onTest: (policy: Policy, context: EventContext) => Promise<any>;
}

export function SandboxTester({ policy, onTest }: SandboxTesterProps) {
  const [eventData, setEventData] = useState<string>('{\n  "amount": 1000,\n  "type": "service",\n  "customer": "Acme Corp"\n}');
  const [eventType, setEventType] = useState<string>(BusinessEventType.INVOICE_CREATED);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [savedScenarios, setSavedScenarios] = useState<Array<{ name: string; data: any }>>([]);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const parsedData = JSON.parse(eventData);
      const context: EventContext = {
        eventId: `test-${Date.now()}`,
        eventType,
        timestamp: new Date().toISOString(),
        data: parsedData,
      };

      const result = await onTest(policy!, context);
      setTestResult(result);
    } catch (error : any) {
      setTestResult({ error: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  const saveScenario = () => {
    const name = prompt('Enter scenario name:');
    if (name) {
      setSavedScenarios([
        ...savedScenarios,
        { name, data: { eventType, eventData } }
      ]);
    }
  };

  const loadScenario = (scenario: any) => {
    setEventType(scenario.data.eventType);
    setEventData(scenario.data.eventData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Event Configuration */}
        <Card className="col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Test Event</h3>
          
          <div className="space-y-4">
            <div>
              <Label>Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BusinessEventType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Event Data (JSON)</Label>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={saveScenario}>
                    <Save className="mr-1 h-3 w-3" />
                    Save Scenario
                  </Button>
                </div>
              </div>
              <Textarea
                rows={10}
                value={eventData}
                onChange={(e) => setEventData(e.target.value)}
                className="font-mono text-sm"
              />
              {!isValidJSON(eventData) && (
                <p className="text-sm text-red-500 mt-1">Invalid JSON format</p>
              )}
            </div>

            <Button 
              onClick={handleTest} 
              disabled={!policy || !isValidJSON(eventData) || isTesting}
              className="w-full"
            >
              {isTesting ? (
                <>Testing...</>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Test Policy
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Saved Scenarios */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Saved Scenarios</h3>
          
          <div className="space-y-2">
            {savedScenarios.length === 0 ? (
              <p className="text-sm text-gray-500">No saved scenarios</p>
            ) : (
              savedScenarios.map((scenario, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => loadScenario(scenario)}
                >
                  <div>
                    <p className="font-medium">{scenario.name}</p>
                    <p className="text-xs text-gray-500">{scenario.data.eventType}</p>
                  </div>
                  <Badge variant="outline">Load</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Test Results */}
      {testResult && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {testResult.transactionIds && (
              <Badge variant="default">
                {testResult.transactionIds.length} Transactions Created
              </Badge>
            )}
          </div>
          
          <ResultViewer result={testResult} />
        </Card>
      )}
    </div>
  );
}

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}