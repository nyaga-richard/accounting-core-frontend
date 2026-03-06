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
import { Play, Save, Copy, Check, Building2 } from 'lucide-react';
import { Policy, EventContext, BusinessEventType } from '@/lib/types/policy.types';
import { Account } from '@/lib/types/account.types';
import { ResultViewer } from './ResultViewer';

interface SandboxTesterProps {
  policy?: Policy;
  accounts?: Account[]; // Add this prop
  onTest: (policy: Policy, context: EventContext) => Promise<any>;
}

export function SandboxTester({ policy, accounts = [], onTest }: SandboxTesterProps) {
  const [eventData, setEventData] = useState<string>('{\n  "amount": 1000,\n  "type": "service",\n  "customer": "Acme Corp"\n}');
  const [eventType, setEventType] = useState<string>(BusinessEventType.INVOICE_CREATED);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [savedScenarios, setSavedScenarios] = useState<Array<{ name: string; data: any }>>([]);

  // Account-aware templates
  const getAccountTemplates = () => {
    const assetAccount = accounts.find(a => a.type === 'asset')?.code || '1000';
    const revenueAccount = accounts.find(a => a.type === 'revenue')?.code || '4000';
    const expenseAccount = accounts.find(a => a.type === 'expense')?.code || '5000';
    
    return {
      invoice: {
        eventType: BusinessEventType.INVOICE_CREATED,
        data: {
          amount: 1000,
          type: "service",
          customer: "Acme Corp",
          lineItems: [
            { description: "Consulting Services", amount: 600, accountCode: revenueAccount },
            { description: "Software License", amount: 400, accountCode: revenueAccount }
          ]
        }
      },
      payment: {
        eventType: BusinessEventType.PAYMENT_RECEIVED,
        data: {
          amount: 1000,
          method: "credit_card",
          reference: "INV-001",
          accountCode: assetAccount
        }
      },
      expense: {
        eventType: BusinessEventType.EXPENSE_RECORDED,
        data: {
          amount: 500,
          category: "office_supplies",
          description: "Office supplies",
          accountCode: expenseAccount
        }
      }
    };
  };

  const loadTemplate = (templateType: 'invoice' | 'payment' | 'expense') => {
    const templates = getAccountTemplates();
    const template = templates[templateType];
    setEventType(template.eventType);
    setEventData(JSON.stringify(template.data, null, 2));
  };

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
      {/* Account Summary */}
      {accounts.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Available Test Accounts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Assets: {accounts.filter(a => a.type === 'asset').length}
            </Badge>
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              Liabilities: {accounts.filter(a => a.type === 'liability').length}
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              Equity: {accounts.filter(a => a.type === 'equity').length}
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              Revenue: {accounts.filter(a => a.type === 'revenue').length}
            </Badge>
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
              Expenses: {accounts.filter(a => a.type === 'expense').length}
            </Badge>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Event Configuration */}
        <Card className="col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Test Event</h3>
          
          <div className="space-y-4">
            {/* Quick Templates */}
            <div className="flex space-x-2 mb-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => loadTemplate('invoice')}
                className="flex-1"
              >
                Invoice Template
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => loadTemplate('payment')}
                className="flex-1"
              >
                Payment Template
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => loadTemplate('expense')}
                className="flex-1"
              >
                Expense Template
              </Button>
            </div>

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
                placeholder='{\n  "amount": 1000,\n  "type": "service",\n  "customer": "Acme Corp"\n}'
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