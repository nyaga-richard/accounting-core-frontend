"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

//import { PolicyFlowChart } from "@/components/policies/PolicyFlowChart"
import { SandboxTester } from "@/components/sandbox/SandboxTester"
import { ActionEditor } from "@/components/policies/ActionEditor"
import { ConditionEditor } from "@/components/policies/ConditionEditor"

import { policiesApi } from "@/lib/api/policies"
import { accountsApi } from "@/lib/api/accounts"
import { Policy, Condition, Action, ActionType, BusinessEventType, ConditionOperator } from "@/lib/types/policy.types"
import { Account } from "@/lib/types/account.types"
import  PolicyFlowChart from '@/components/policies/PolicyFlowChart';

import { 
  Save, 
  ArrowLeft, 
  Check, 
  ChevronsUpDown, 
  Building2,
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  Eye,
  Copy,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Position } from "reactflow"

// Common event types for autofill
const COMMON_EVENT_TYPES = [
  "invoice.created",
  "invoice.paid",
  "invoice.voided",
  "payment.received",
  "payment.made",
  "expense.recorded",
  "journal.entry.created",
  "account.created",
  "account.updated",
  "transaction.posted",
  "transaction.reversed",
  "budget.exceeded",
  "reconciliation.completed",
  "report.generated"
]

// Common tags for autofill
const COMMON_TAGS = [
  "automation",
  "compliance",
  "audit",
  "revenue",
  "expense",
  "asset",
  "liability",
  "equity",
  "tax",
  "approval",
  "notification",
  "integration"
]

// Sortable Condition Item Component
function SortableConditionItem({ 
  condition, 
  index, 
  onUpdate, 
  onRemove 
}: { 
  condition: Condition; 
  index: number; 
  onUpdate: (index: number, updatedCondition: Condition) => void; 
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: condition.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="flex items-start gap-2 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div 
          className="mt-1 cursor-move text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-blue-50">Condition {index + 1}</Badge>
          </div>
          <ConditionEditor
            data={condition}
            onChange={(updated) => onUpdate(index, { ...condition, ...updated })}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Sortable Action Item Component
function SortableActionItem({ 
  action, 
  index, 
  onUpdate, 
  onRemove,
  accounts 
}: { 
  action: Action; 
  index: number; 
  onUpdate: (index: number, updatedAction: Action) => void; 
  onRemove: (index: number) => void;
  accounts: Account[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="flex items-start gap-2 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div 
          className="mt-1 cursor-move text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-green-50">Action {index + 1}</Badge>
            <Badge variant="secondary">{action.type?.replace(/_/g, ' ')}</Badge>
          </div>
          <ActionEditor
            data={action}
            accounts={accounts}
            onChange={(updated) => onUpdate(index, { ...action, ...updated })}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Update the convertPolicyToFlow function to use the custom node types
const convertPolicyToFlow = (policy: Partial<Policy>) => {
  const nodes: any[] = [];
  const edges: any[] = [];

  // Ensure policy exists
  if (!policy) {
    return { nodes, edges };
  }

  // Create start node
  nodes.push({
    id: 'start',
    type: 'start', // Use 'start' type for the custom node
    data: { 
      label: 'Start',
      description: `Trigger: ${policy.eventType || 'No event type'}`
    },
    position: { x: 250, y: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });

  // Safely handle conditions
  const conditions = Array.isArray(policy.conditions) ? policy.conditions : [];
  
  // Create condition nodes
  conditions.forEach((condition, index) => {
    if (!condition) return;
    
    nodes.push({
      id: `condition-${index}`,
      type: 'condition', // Use 'condition' type for the custom node
      data: { 
        label: `Condition ${index + 1}`,
        description: condition.field && condition.operator 
          ? `${condition.field} ${condition.operator} ${JSON.stringify(condition.value)}`
          : 'Configure condition',
        field: condition.field,
        operator: condition.operator,
        value: condition.value
      },
      position: { x: 250, y: (index + 1) * 150 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    // Connect from previous node
    const sourceId = index === 0 ? 'start' : `condition-${index - 1}`;
    edges.push({
      id: `edge-${sourceId}-condition-${index}`,
      source: sourceId,
      target: `condition-${index}`,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: 'arrowclosed' },
    });
  });

  // Safely handle actions
  const actions = Array.isArray(policy.actions) ? policy.actions : [];
  
  // Create action nodes
  actions.forEach((action, index) => {
    if (!action) return;
    
    nodes.push({
      id: `action-${index}`,
      type: 'action', // Use 'action' type for the custom node
      data: { 
        label: `Action ${index + 1}`,
        description: action.descriptionTemplate || action.type?.replace(/_/g, ' '),
        actionType: action.type,
        amount: action.amount,
        debitAccount: action.debitAccount,
        creditAccount: action.creditAccount
      },
      position: { x: 250, y: (conditions.length + index + 1) * 150 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    // Connect from last condition or start
    const lastConditionIndex = conditions.length - 1;
    const sourceId = lastConditionIndex >= 0 ? `condition-${lastConditionIndex}` : 'start';
    
    edges.push({
      id: `edge-${sourceId}-action-${index}`,
      source: sourceId,
      target: `action-${index}`,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: 'arrowclosed' },
    });
  });

  // Create end node if there are actions
  if (actions.length > 0) {
    nodes.push({
      id: 'end',
      type: 'end', // Use 'end' type for the custom node
      data: { 
        label: 'End',
        description: 'Policy execution complete'
      },
      position: { x: 250, y: (conditions.length + actions.length + 1) * 150 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    const lastActionIndex = actions.length - 1;
    edges.push({
      id: 'edge-end',
      source: `action-${lastActionIndex}`,
      target: 'end',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: 'arrowclosed' },
    });
  }

  return { nodes, edges };
};

export default function PolicyEditor() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const id = params?.id as string | undefined
  const tab = searchParams?.get('tab') || 'flow'

  // Default policy state
  const defaultPolicy: Partial<Policy> = {
    name: "",
    description: "",
    eventType: "",
    priority: 100,
    isActive: true,
    conditions: [],
    actions: [],
    tags: [],
    version: 1
  }

  const [policy, setPolicy] = useState<Partial<Policy>>(defaultPolicy)
  const [flowNodes, setFlowNodes] = useState<any[]>([])
  const [flowEdges, setFlowEdges] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [eventTypeOpen, setEventTypeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(tab)

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load accounts for autofill
  useEffect(() => {
    loadAccounts()
  }, [])

  // Load policy when ID changes
  useEffect(() => {
    const loadData = async () => {
      if (id && id !== "new") {
        setIsLoading(true)
        try {
          await loadPolicy(id)
        } catch (error) {
          console.error("Error loading policy:", error)
        } finally {
          setIsLoading(false)
          setInitialLoadComplete(true)
        }
      } else {
        // For new policy, just set default and mark as complete
        setPolicy(defaultPolicy)
        setInitialLoadComplete(true)
      }
    }
    
    loadData()
  }, [id])

  // Update flow visualization when policy changes
  useEffect(() => {
    if (!policy || !initialLoadComplete) return

    try {
      const { nodes, edges } = convertPolicyToFlow(policy)
      setFlowNodes(nodes)
      setFlowEdges(edges)
    } catch (error) {
      console.error('Error converting policy to flow:', error)
    }
  }, [policy, initialLoadComplete])

  const loadAccounts = async () => {
    setLoadingAccounts(true)
    try {
      const response = await accountsApi.list({ isActive: true })
      let accountsData: Account[] = []
      
      if (response && typeof response === 'object') {
        if (response.data && Array.isArray(response.data)) {
          accountsData = response.data
        } else if (Array.isArray(response)) {
          accountsData = response
        } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
          accountsData = response.data.items
        }
      }
      
      setAccounts(accountsData)
    } catch (error) {
      console.error("Failed to load accounts:", error)
      toast.error("Failed to load accounts")
    } finally {
      setLoadingAccounts(false)
    }
  }

  const loadPolicy = async (policyId: string) => {
    try {
      console.log("Loading policy with ID:", policyId)
      const response = await policiesApi.get(policyId)
      console.log("Policy API response:", response)
      
      // Handle the response structure: { success: true, data: { ... } }
      let policyData = null
      
      if (response?.data) {
        // If response has a data property, that's our policy
        policyData = response.data
      } else if (response) {
        // Otherwise assume response itself is the policy
        policyData = response
      }
      
      console.log("Extracted policy data:", policyData)
      
      if (policyData) {
        setPolicy(policyData)
      } else {
        throw new Error("No policy data found")
      }
    } catch (error) {
      console.error("Failed to load policy:", error)
      toast.error("Failed to load policy")
      router.push("/policies")
      throw error // Re-throw to be caught by the caller
    }
  }

  const handleSave = async () => {
    // Validate required fields
    if (!policy.name?.trim()) {
      toast.error("Policy name is required")
      return
    }
    if (!policy.eventType) {
      toast.error("Event type is required")
      return
    }

    setIsSaving(true)

    try {
      if (id === "new" || !id) {
        await policiesApi.create(policy)
        toast.success("Policy created successfully")
      } else {
        await policiesApi.update(id, policy)
        toast.success("Policy updated successfully")
      }

      router.push("/policies")
    } catch (error: any) {
      console.error("Save error:", error)
      toast.error(error.response?.data?.error || "Failed to save policy")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async (testPolicy: Policy, context: any) => {
    try {
      return await policiesApi.test(testPolicy, context)
    } catch (error: any) {
      console.error("Test error:", error)
      throw error
    }
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !policy.tags?.includes(trimmedTag)) {
      setPolicy({
        ...policy,
        tags: [...(policy.tags || []), trimmedTag]
      })
    }
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    setPolicy({
      ...policy,
      tags: policy.tags?.filter(tag => tag !== tagToRemove) || []
    })
  }

  // Condition management
  const addCondition = () => {
    const newCondition: Condition = {
      id: `cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      field: "",
      operator: ConditionOperator.EQUALS,
      value: ""
    }
    setPolicy({
      ...policy,
      conditions: [...(policy.conditions || []), newCondition]
    })
  }

  const updateCondition = (index: number, updatedCondition: Condition) => {
    const newConditions = [...(policy.conditions || [])]
    newConditions[index] = updatedCondition
    setPolicy({ ...policy, conditions: newConditions })
  }

  const removeCondition = (index: number) => {
    const newConditions = [...(policy.conditions || [])]
    newConditions.splice(index, 1)
    setPolicy({ ...policy, conditions: newConditions })
  }

  const handleConditionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id && policy.conditions) {
      const oldIndex = policy.conditions.findIndex(c => c.id === active.id)
      const newIndex = policy.conditions.findIndex(c => c.id === over?.id)
      setPolicy({
        ...policy,
        conditions: arrayMove(policy.conditions, oldIndex, newIndex)
      })
    }
  }

  // Action management
  const addAction = () => {
    const newAction: Action = {
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: ActionType.CREATE_LEDGER_ENTRY,
        referenceTemplate: undefined
    }
    setPolicy({
      ...policy,
      actions: [...(policy.actions || []), newAction]
    })
  }

  const updateAction = (index: number, updatedAction: Action) => {
    const newActions = [...(policy.actions || [])]
    newActions[index] = updatedAction
    setPolicy({ ...policy, actions: newActions })
  }

  const removeAction = (index: number) => {
    const newActions = [...(policy.actions || [])]
    newActions.splice(index, 1)
    setPolicy({ ...policy, actions: newActions })
  }

  const handleActionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id && policy.actions) {
      const oldIndex = policy.actions.findIndex(a => a.id === active.id)
      const newIndex = policy.actions.findIndex(a => a.id === over?.id)
      setPolicy({
        ...policy,
        actions: arrayMove(policy.actions, oldIndex, newIndex)
      })
    }
  }

  // Duplicate policy
  const handleDuplicate = async () => {
    if (!policy) return
    
    try {
      const { id, ...policyData } = policy
      const newPolicy = {
        ...policyData,
        name: `${policy.name} (Copy)`,
        isActive: false,
        version: 1
      }
      
      await policiesApi.create(newPolicy)
      toast.success("Policy duplicated successfully")
      router.push("/policies")
    } catch (error) {
      toast.error("Failed to duplicate policy")
    }
  }

  // Show loading only while actually loading and no data yet
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading policy...</p>
          <p className="text-xs text-gray-400 mt-2">Policy ID: {id}</p>
        </div>
      </div>
    )
  }

  // If not loading but no policy data (should not happen, but just in case)
  if (!policy) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Failed to load policy</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push("/policies")}
          >
            Back to Policies
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/policies")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold">
              {id === "new" ? "Create New Policy" : "Edit Policy"}
            </h1>
            <p className="text-gray-500">
              Define accounting rules and conditions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {id !== "new" && id && (
            <Button
              variant="outline"
              onClick={handleDuplicate}
              disabled={isSaving}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push("/policies")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Policy
              </>
            )}
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
                value={policy.name || ""}
                onChange={(e) =>
                  setPolicy({ ...policy, name: e.target.value })
                }
                placeholder="e.g., Revenue Recognition"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={policy.description || ""}
                onChange={(e) =>
                  setPolicy({ ...policy, description: e.target.value })
                }
                placeholder="Describe what this policy does"
                rows={4}
              />
            </div>

            {/* Tags Section */}
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(policy.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-2 py-1">
                    {tag}
                    <button
                      className="ml-1 hover:text-destructive"
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag(tagInput)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTag(tagInput)}
                >
                  Add
                </Button>
              </div>
              {tagInput && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {COMMON_TAGS.filter(tag => 
                    tag.includes(tagInput.toLowerCase()) && !(policy.tags || []).includes(tag)
                  ).slice(0, 5).map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => addTag(tag)}
                    >
                      + {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Event Type with Autocomplete */}
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Popover open={eventTypeOpen} onOpenChange={setEventTypeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={eventTypeOpen}
                    className="w-full justify-between"
                  >
                    {policy.eventType || "Select or type event type..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search event types..." 
                      value={policy.eventType || ""}
                      onValueChange={(value) => {
                        setPolicy({ ...policy, eventType: value })
                      }}
                    />
                    <CommandEmpty>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setPolicy({ ...policy, eventType: policy.eventType })
                          setEventTypeOpen(false)
                        }}
                      >
                        Use "{policy.eventType}"
                      </Button>
                    </CommandEmpty>
                    <CommandGroup>
                      {COMMON_EVENT_TYPES.map((event) => (
                        <CommandItem
                          key={event}
                          value={event}
                          onSelect={(currentValue) => {
                            setPolicy({ ...policy, eventType: currentValue })
                            setEventTypeOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              policy.eventType === event ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {event}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500 mt-1">
                Common: invoice.created, payment.received, expense.recorded
              </p>
            </div>

            <div>
              <Label htmlFor="priority">Priority (Lower = Higher Priority)</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="999"
                value={policy.priority || 100}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    priority: parseInt(e.target.value) || 100
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Range: 0-999 (0 = highest priority)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={policy.isActive || false}
                onCheckedChange={(checked) =>
                  setPolicy({ ...policy, isActive: checked })
                }
              />
              <Label htmlFor="active">
                Active
              </Label>
            </div>

            {/* Related Accounts Summary */}
            {accounts.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Available Accounts</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="bg-green-50">
                    Assets: {accounts.filter(a => a.type === 'asset').length}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50">
                    Liabilities: {accounts.filter(a => a.type === 'liability').length}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50">
                    Equity: {accounts.filter(a => a.type === 'equity').length}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50">
                    Revenue: {accounts.filter(a => a.type === 'revenue').length}
                  </Badge>
                  <Badge variant="outline" className="bg-orange-50">
                    Expenses: {accounts.filter(a => a.type === 'expense').length}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flow">
            Flow Designer
          </TabsTrigger>
          <TabsTrigger value="conditions">
            Conditions ({policy.conditions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="actions">
            Actions ({policy.actions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="test">
            Test in Sandbox
          </TabsTrigger>
        </TabsList>

        {/* Flow Designer */}
        <TabsContent value="flow">
          <PolicyFlowChart
            initialNodes={flowNodes}
            initialEdges={flowEdges}
            accounts={accounts}
            onSave={(nodes, edges) => {
              console.log("Flow saved:", { nodes, edges })
              toast.success("Flow visualization updated")
            }}
            onTest={() => {
              setActiveTab("test")
            }}
          />
        </TabsContent>

        {/* Conditions Builder */}
        <TabsContent value="conditions">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium">Conditions</h3>
                <p className="text-sm text-gray-500">
                  Define when this policy should be applied
                </p>
              </div>
              <Button onClick={addCondition}>
                <Plus className="mr-2 h-4 w-4" />
                Add Condition
              </Button>
            </div>

            {(!policy.conditions || policy.conditions.length === 0) ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Conditions</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Add conditions to control when this policy should be applied. 
                  Conditions are evaluated in order, and all conditions must be met for the policy to trigger.
                </p>
                <Button onClick={addCondition} variant="outline" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Condition
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <p>Conditions are evaluated in order. Drag to reorder. All conditions must be met.</p>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleConditionDragEnd}
                >
                  <SortableContext
                    items={policy.conditions.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-3">
                        {policy.conditions.map((condition, index) => (
                          <SortableConditionItem
                            key={condition.id}
                            condition={condition}
                            index={index}
                            onUpdate={updateCondition}
                            onRemove={removeCondition}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </SortableContext>
                </DndContext>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Actions Builder */}
        <TabsContent value="actions">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium">Actions</h3>
                <p className="text-sm text-gray-500">
                  Define what happens when conditions are met
                </p>
              </div>
              <Button onClick={addAction}>
                <Plus className="mr-2 h-4 w-4" />
                Add Action
              </Button>
            </div>

            {(!policy.actions || policy.actions.length === 0) ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Actions</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Add actions to define what happens when this policy is triggered. 
                  Actions are executed in order when all conditions are met.
                </p>
                <Button onClick={addAction} variant="outline" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Action
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                  <p>Actions are executed in order. Drag to reorder.</p>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleActionDragEnd}
                >
                  <SortableContext
                    items={policy.actions.map(a => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-3">
                        {policy.actions.map((action, index) => (
                          <SortableActionItem
                            key={action.id}
                            action={action}
                            index={index}
                            onUpdate={updateAction}
                            onRemove={removeAction}
                            accounts={accounts}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </SortableContext>
                </DndContext>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Sandbox Tester */}
        <TabsContent value="test">
          <SandboxTester
            policy={policy as Policy}
            accounts={accounts}
            onTest={handleTest}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}