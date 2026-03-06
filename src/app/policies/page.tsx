"use client"

// src/app/policies/page.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Changed from react-router-dom
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Edit,
  Copy,
  Trash2,
  Play,
  Eye,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Tag,
  FileText,
  GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Policy, BusinessEventType, ActionType } from '@/lib/types/policy.types';
import { policiesApi } from '@/lib/api/policies';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function PoliciesPage() { // Renamed component to avoid confusion with the type
  const router = useRouter(); // Next.js router

  // State
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byEventType: {} as Record<string, number>,
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    }
  });

  // Load policies
  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const response = await policiesApi.list();
      
      // Handle different response structures
      let policiesData: Policy[] = [];
      if (response && typeof response === 'object') {
        if (response.data && Array.isArray(response.data)) {
          policiesData = response.data;
        } else if (Array.isArray(response)) {
          policiesData = response;
        } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
          policiesData = response.data.items;
        }
      }
      
      setPolicies(policiesData);
      calculateStats(policiesData);
    } catch (error) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (policies: Policy[]) => {
    const stats = {
      total: policies.length,
      active: policies.filter(p => p.isActive).length,
      inactive: policies.filter(p => !p.isActive).length,
      byEventType: {} as Record<string, number>,
      byPriority: {
        high: 0,
        medium: 0,
        low: 0
      }
    };

    policies.forEach(policy => {
      // Count by event type
      stats.byEventType[policy.eventType] = (stats.byEventType[policy.eventType] || 0) + 1;

      // Count by priority
      if (policy.priority <= 50) {
        stats.byPriority.high++;
      } else if (policy.priority <= 100) {
        stats.byPriority.medium++;
      } else {
        stats.byPriority.low++;
      }
    });

    setStats(stats);
  };

  const handleDelete = async () => {
    if (!selectedPolicy) return;
    
    setDeleteLoading(true);
    try {
      await policiesApi.delete(selectedPolicy.id);
      toast.success('Policy deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedPolicy(null);
      loadPolicies();
    } catch (error) {
      toast.error('Failed to delete policy');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedPolicy || !duplicateName) return;
    
    try {
      const { id, ...policyData } = selectedPolicy;
      const newPolicy = {
        ...policyData,
        name: duplicateName,
        isActive: false,
        version: 1
      };
      
      await policiesApi.create(newPolicy);
      toast.success('Policy duplicated successfully');
      setIsDuplicateDialogOpen(false);
      setSelectedPolicy(null);
      setDuplicateName('');
      loadPolicies();
    } catch (error) {
      toast.error('Failed to duplicate policy');
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(policies, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `policies-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success(`Exported ${policies.length} policies`);
    } catch (error) {
      toast.error('Failed to export policies');
    }
  };

const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setImportLoading(true);
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const content = JSON.parse(e.target?.result as string);
      
      if (!Array.isArray(content)) {
        throw new Error('Invalid file format: Expected an array of policies');
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: Array<{policy: any, error: string}> = [];

      // Use a valid UUID for system user - this should be a real user ID from your system
      // You might want to get this from your auth context or environment variable
      const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'; // Replace with actual system user UUID

      // Import each policy
      for (const policy of content) {
        try {
          // Format the policy data to match the database schema exactly
          const formattedPolicy = {
            name: policy.name || '',
            description: policy.description || '',
            eventType: policy.eventType || policy.event_type || '',
            priority: typeof policy.priority === 'number' ? policy.priority : 100,
            isActive: policy.isActive !== undefined ? policy.isActive : true,
            conditions: Array.isArray(policy.conditions) ? policy.conditions : [],
            actions: Array.isArray(policy.actions) ? policy.actions : [],
            schedule: policy.schedule || null,
            validFrom: policy.validFrom || policy.valid_from || null,
            validTo: policy.validTo || policy.valid_to || null,
            createdBy: SYSTEM_USER_ID, // Must be a valid UUID, not a string
            version: policy.version || 1,
            previousVersionId: policy.previousVersionId || policy.previous_version_id || null,
            tags: Array.isArray(policy.tags) ? policy.tags : [],
            config: policy.config || {}
          };

          // Validate required fields
          if (!formattedPolicy.name) {
            throw new Error('Policy name is required');
          }
          if (!formattedPolicy.eventType) {
            throw new Error('Event type is required');
          }

          console.log('Importing formatted policy:', formattedPolicy);
          
          const response = await policiesApi.create(formattedPolicy);
          console.log('Import success:', response);
          successCount++;
        } catch (error: any) {
          console.error('Failed to import policy:', {
            policy: policy,
            error: error.response?.data || error.message,
            status: error.response?.status
          });
          errors.push({
            policy,
            error: error.response?.data?.error || error.message
          });
          errorCount++;
        }
      }

      // Show detailed error summary
      if (errors.length > 0) {
        const errorSummary = errors.map(e => 
          `- ${e.policy.name || 'Unnamed'}: ${e.error}`
        ).join('\n');
        
        toast.error(`Failed to import ${errorCount} policies:\n${errorSummary}`);
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} policies`);
      }

      if (successCount > 0) {
        await loadPolicies();
        setIsImportDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to parse import file');
    } finally {
      setImportLoading(false);
      event.target.value = '';
    }
  };

  reader.onerror = () => {
    toast.error('Failed to read file');
    setImportLoading(false);
  };

  reader.readAsText(file);
};

  const handleToggleStatus = async (policy: Policy) => {
    try {
      await policiesApi.update(policy.id, { isActive: !policy.isActive });
      toast.success(`Policy ${policy.isActive ? 'deactivated' : 'activated'} successfully`);
      loadPolicies();
    } catch (error) {
      toast.error('Failed to update policy status');
    }
  };

  const filterPolicies = (): Policy[] => {
    return policies.filter(policy => {
      // Search filter
      const matchesSearch = search === '' || 
        policy.name.toLowerCase().includes(search.toLowerCase()) ||
        policy.description?.toLowerCase().includes(search.toLowerCase()) ||
        policy.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      // Event type filter
      const matchesEventType = selectedEventType === 'all' || policy.eventType === selectedEventType;
      
      // Status filter
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'active' && policy.isActive) ||
        (selectedStatus === 'inactive' && !policy.isActive);
      
      return matchesSearch && matchesEventType && matchesStatus;
    });
  };

  const getEventTypeColor = (eventType: string): string => {
    const colors: Record<string, string> = {
      'invoice.created': 'bg-blue-100 text-blue-800 border-blue-200',
      'invoice.approved': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'payment.received': 'bg-green-100 text-green-800 border-green-200',
      'payment.made': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bill.created': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bill.approved': 'bg-amber-100 text-amber-800 border-amber-200',
      'goods.received': 'bg-orange-100 text-orange-800 border-orange-200',
      'goods.issued': 'bg-red-100 text-red-800 border-red-200',
      'period.closing': 'bg-purple-100 text-purple-800 border-purple-200',
      'period.opening': 'bg-violet-100 text-violet-800 border-violet-200',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityBadge = (priority: number) => {
    if (priority <= 50) {
      return <Badge className="bg-red-100 text-red-800">High</Badge>;
    } else if (priority <= 100) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Low</Badge>;
    }
  };

  const getActionCounts = (policy: Policy) => {
    const counts = {
      ledger: 0,
      workflow: 0,
      notification: 0,
      other: 0
    };

    policy.actions.forEach(action => {
      switch (action.type) {
        case ActionType.CREATE_LEDGER_ENTRY:
          counts.ledger++;
          break;
        case ActionType.TRIGGER_WORKFLOW:
          counts.workflow++;
          break;
        case ActionType.SEND_NOTIFICATION:
          counts.notification++;
          break;
        default:
          counts.other++;
      }
    });

    return counts;
  };

  const filteredPolicies = filterPolicies();

  // Stats Cards
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Policies</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-full">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-2 flex space-x-2">
          <Badge variant="outline" className="bg-green-50">
            Active: {stats.active}
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            Inactive: {stats.inactive}
          </Badge>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Event Types</p>
            <p className="text-2xl font-bold">{Object.keys(stats.byEventType).length}</p>
          </div>
          <div className="p-2 bg-purple-100 rounded-full">
            <Zap className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(stats.byEventType).slice(0, 3).map(([type, count]) => (
            <Badge key={type} variant="outline" className={getEventTypeColor(type)}>
              {type.split('.')[0]}: {count}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Priority Distribution</p>
            <p className="text-2xl font-bold">{stats.byPriority.high + stats.byPriority.medium + stats.byPriority.low}</p>
          </div>
          <div className="p-2 bg-orange-100 rounded-full">
            <GitBranch className="h-5 w-5 text-orange-600" />
          </div>
        </div>
        <div className="mt-2 flex space-x-1">
          <Badge className="bg-red-100 text-red-800">H: {stats.byPriority.high}</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">M: {stats.byPriority.medium}</Badge>
          <Badge className="bg-green-100 text-green-800">L: {stats.byPriority.low}</Badge>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Conditions/Actions</p>
            <p className="text-2xl font-bold">
              {policies.reduce((acc, p) => acc + p.conditions.length, 0)} /{' '}
              {policies.reduce((acc, p) => acc + p.actions.length, 0)}
            </p>
          </div>
          <div className="p-2 bg-green-100 rounded-full">
            <GitBranch className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Total conditions / actions across all policies</p>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Accounting Policies</h1>
          <p className="text-gray-500 mt-1">
            Define and manage business rules that drive your accounting logic
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport} disabled={policies.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={loadPolicies} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => router.push('/policies/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search policies by name, description, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {Object.values(BusinessEventType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Policies Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Conditions</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : filteredPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  No policies found
                </TableCell>
              </TableRow>
            ) : (
              filteredPolicies.map((policy) => {
                const actionCounts = getActionCounts(policy);
                return (
                  <TableRow 
                    key={policy.id}
                    className={cn(!policy.isActive && 'opacity-50 bg-gray-50')}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{policy.name}</p>
                        {policy.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {policy.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className={getEventTypeColor(policy.eventType)}>
                        {policy.eventType}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>{getPriorityBadge(policy.priority)}</TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-100">
                        {policy.conditions.length} condition{policy.conditions.length !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex space-x-1">
                        {actionCounts.ledger > 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            📊 {actionCounts.ledger}
                          </Badge>
                        )}
                        {actionCounts.workflow > 0 && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            🔄 {actionCounts.workflow}
                          </Badge>
                        )}
                        {actionCounts.notification > 0 && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            📧 {actionCounts.notification}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {policy.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">v{policy.version}</Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        {format(new Date(policy.updatedAt), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {policy.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(policy.tags?.length || 0) > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{policy.tags!.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedPolicy(policy);
                            // setIsViewDialogOpen(true);
                            router.push(`/policies/${policy.id}?tab=flow`);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/policies/${policy.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedPolicy(policy);
                            router.push('/sandbox');
                          }}>
                            <Play className="mr-2 h-4 w-4" />
                            Test in Sandbox
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedPolicy(policy);
                            setDuplicateName(`${policy.name} (Copy)`);
                            setIsDuplicateDialogOpen(true);
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleStatus(policy)}>
                            {policy.isActive ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                <span className="text-red-600">Deactivate</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                <span className="text-green-600">Activate</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Table Footer with Summary */}
        {!loading && filteredPolicies.length > 0 && (
          <div className="border-t px-4 py-2 flex justify-between items-center text-sm text-gray-500">
            <div>
              Showing {filteredPolicies.length} of {policies.length} policies
            </div>
            <div className="flex space-x-4">
              <span>Active: {filteredPolicies.filter(p => p.isActive).length}</span>
              <span>Inactive: {filteredPolicies.filter(p => !p.isActive).length}</span>
            </div>
          </div>
        )}
      </Card>

      {/* View Policy Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Policy Details</DialogTitle>
            <DialogDescription>
              Detailed view of policy configuration
            </DialogDescription>
          </DialogHeader>
          
          {selectedPolicy && (
            <ScrollArea className="h-full max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedPolicy.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Event Type</p>
                      <Badge variant="outline" className={getEventTypeColor(selectedPolicy.eventType)}>
                        {selectedPolicy.eventType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      {getPriorityBadge(selectedPolicy.priority)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {selectedPolicy.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {selectedPolicy.description && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Description</p>
                        <p>{selectedPolicy.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Conditions ({selectedPolicy.conditions.length})
                  </h3>
                  {selectedPolicy.conditions.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No conditions (always applies)</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedPolicy.conditions.map((condition, index) => (
                        <div key={condition.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 text-sm">
                            <Badge variant="outline" className="bg-orange-50">
                              #{index + 1}
                            </Badge>
                            <span className="font-mono">{condition.field}</span>
                            <Badge variant="secondary">{condition.operator}</Badge>
                            <span className="font-mono bg-blue-50 px-2 py-1 rounded">
                              {JSON.stringify(condition.value)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Actions ({selectedPolicy.actions.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedPolicy.actions.map((action, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={cn(
                            action.type === ActionType.CREATE_LEDGER_ENTRY && 'bg-green-600',
                            action.type === ActionType.SEND_NOTIFICATION && 'bg-purple-600',
                            action.type === ActionType.TRIGGER_WORKFLOW && 'bg-blue-600',
                          )}>
                            {action.type.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        </div>
                        
                        {action.type === ActionType.CREATE_LEDGER_ENTRY && (
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-gray-500">Debit Account</p>
                                <p className="font-mono">
                                  {action.debitAccount?.type === 'fixed' 
                                    ? action.debitAccount.fixedAccountId 
                                    : action.debitAccount?.contextPath || 'Dynamic'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Credit Account</p>
                                <p className="font-mono">
                                  {action.creditAccount?.type === 'fixed' 
                                    ? action.creditAccount.fixedAccountId 
                                    : action.creditAccount?.contextPath || 'Dynamic'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500">Amount</p>
                              <p className="font-mono">
                                {action.amount?.type === 'fixed' 
                                  ? `$${action.amount.fixedAmount}`
                                  : action.amount?.type === 'percentage'
                                  ? `${action.amount.percentage}% of ${action.amount.percentageOf}`
                                  : action.amount?.formula || action.amount?.contextPath || 'Dynamic'}
                              </p>
                            </div>
                            {action.descriptionTemplate && (
                              <div>
                                <p className="text-gray-500">Description</p>
                                <p className="text-sm">{action.descriptionTemplate}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {action.type === ActionType.SEND_NOTIFICATION && (
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-500">Channel:</span> {action.channel}</p>
                            {action.subjectTemplate && (
                              <p><span className="text-gray-500">Subject:</span> {action.subjectTemplate}</p>
                            )}
                            <p><span className="text-gray-500">Body:</span> {action.bodyTemplate}</p>
                          </div>
                        )}

                        {action.type === ActionType.TRIGGER_WORKFLOW && (
                          <p><span className="text-gray-500">Workflow ID:</span> {action.workflowId}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
                    <div>
                      <p className="text-gray-500">Version</p>
                      <p>v{selectedPolicy.version}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p>{format(new Date(selectedPolicy.createdAt), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Updated</p>
                      <p>{format(new Date(selectedPolicy.updatedAt), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPolicy.tags?.length ? (
                          selectedPolicy.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedPolicy && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                router.push(`/policies/${selectedPolicy.id}`);
              }}>
                Edit Policy
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the policy
              "{selectedPolicy?.name}" and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Policy</DialogTitle>
            <DialogDescription>
              Create a copy of "{selectedPolicy?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="duplicate-name">New Policy Name</Label>
            <Input
              id="duplicate-name"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="Enter policy name"
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDuplicateDialogOpen(false);
              setSelectedPolicy(null);
              setDuplicateName('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleDuplicate} disabled={!duplicateName}>
              Create Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} >
        <DialogContent className="w-[95vw] lg:w-[70vw] max-w-none">
          <DialogHeader>
            <DialogTitle>Import Policies</DialogTitle>
            <DialogDescription>
              Upload a JSON file containing policy definitions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto ">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your JSON file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                File should contain an array of policy objects
              </p>
              <Input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="file-upload"
                disabled={importLoading}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="mt-4"
                disabled={importLoading}
              >
                {importLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Select File
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">File Format Example:</h4>
              <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-[350px]">
{`[
  {
    "name": "Revenue Recognition - Cash Basis",
    "description": "Recognize revenue when cash is received",
    "eventType": "payment.received",
    "priority": 100,
    "isActive": true,
    "conditions": [
      {
        "id": "cond_1",
        "field": "payment.amount",
        "operator": "greaterThan",
        "value": 0
      }
    ],
    "actions": [
      {
        "id": "action_1",
        "type": "CREATE_LEDGER_ENTRY",
        "description": "Create revenue entry",
        "debitAccount": {
          "type": "fixed",
          "fixedAccountId": "cash-account-id"
        },
        "creditAccount": {
          "type": "fixed",
          "fixedAccountId": "revenue-account-id"
        },
        "amount": {
          "type": "context",
          "contextPath": "payment.amount"
        },
        "descriptionTemplate": "Revenue from payment {{payment.reference}}"
      }
    ],
    "tags": ["revenue", "cash-basis", "automation"],
    "config": {
      "requiresApproval": false
    }
  }
]`}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(false)}
              disabled={importLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}