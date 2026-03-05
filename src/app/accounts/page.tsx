"use client"

// src/pages/Accounts.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  RefreshCw,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  Badge,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AccountForm } from '@/components/accounts/AccountForm';
import { AccountTree } from '@/components/accounts/AccountTree';
import { Account, AccountType, NormalBalance } from '@/lib/types/account.types';
import { accountsApi } from '@/lib/api/accounts';
import { cn } from '@/lib/utils';

export default function Accounts() {
  const router = useRouter();

  // State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [importLoading, setImportLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<AccountType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    headers: 0,
    detail: 0,
    byType: {} as Record<AccountType, number>
  });

  // Load accounts
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await accountsApi.list();
      const accountsData = response.data;
      setAccounts(accountsData);
      calculateStats(accountsData);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (accounts: Account[]) => {
    const stats = {
      total: accounts.length,
      active: accounts.filter(a => a.isActive).length,
      headers: accounts.filter(a => a.isHeader).length,
      detail: accounts.filter(a => !a.isHeader).length,
      byType: {} as Record<AccountType, number>
    };

    accounts.forEach(account => {
      if (!stats.byType[account.type]) {
        stats.byType[account.type] = 0;
      }
      stats.byType[account.type]++;
    });

    setStats(stats);
  };

  const handleCreateAccount = async (data: any) => {
    try {
      const response = await accountsApi.create(data);
      toast.success('Account created successfully');
      setIsCreateDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const handleUpdateAccount = async (id: string, data: any) => {
    try {
      await accountsApi.update(id, data);
      toast.success('Account updated successfully');
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (error) {
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    
    setDeleteLoading(true);
    try {
      await accountsApi.deactivate(selectedAccount.id);
      toast.success('Account deactivated successfully');
      setIsDeleteDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to deactivate account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(accounts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `chart-of-accounts-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success(`Exported ${accounts.length} accounts`);
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
        throw new Error('Invalid file format: Expected an array of accounts');
      }

      console.log('Importing accounts:', content);

      // First, get all existing accounts to map codes to IDs
      const existingAccountsResponse = await accountsApi.list();
      
      // Extract accounts array from the response
      let existingAccounts: Account[] = [];
      if (existingAccountsResponse && typeof existingAccountsResponse === 'object') {
        // Check if the response has a data property that's an array
        if ('data' in existingAccountsResponse && Array.isArray(existingAccountsResponse.data)) {
          existingAccounts = existingAccountsResponse.data;
        } 
        // Check if the response itself is an array
        else if (Array.isArray(existingAccountsResponse)) {
          existingAccounts = existingAccountsResponse;
        }
      }
      
      console.log('Existing accounts:', existingAccounts);

      // Create a map of account code to account object for quick lookup
      const accountMap = new Map<string, Account>();
      existingAccounts.forEach(acc => {
        if (acc.code) {
          accountMap.set(acc.code, acc);
        }
      });

      console.log('Account map:', Array.from(accountMap.entries()));

      // Validate and prepare accounts
      const requiredFields = ['code', 'name', 'type', 'normalBalance'];
      const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
      const validBalances = ['debit', 'credit'];
      
      const validationErrors: string[] = [];
      const preparedAccounts: any[] = [];

      for (let i = 0; i < content.length; i++) {
        const account = content[i];
        const errors: string[] = [];
        
        // Check required fields
        for (const field of requiredFields) {
          if (!account[field]) {
            errors.push(`Missing ${field}`);
          }
        }
        
        // Validate type
        if (account.type && !validTypes.includes(account.type)) {
          errors.push(`Invalid type: ${account.type}. Must be one of: ${validTypes.join(', ')}`);
        }
        
        // Validate normalBalance
        if (account.normalBalance && !validBalances.includes(account.normalBalance)) {
          errors.push(`Invalid normalBalance: ${account.normalBalance}. Must be 'debit' or 'credit'`);
        }
        
        // Check code format
        if (account.code && !/^[A-Za-z0-9\-_]+$/.test(account.code)) {
          errors.push('Code can only contain letters, numbers, hyphens, and underscores');
        }

        // Handle parentId - convert from code to UUID if needed
        let parentUuid = null;
        if (account.parentId) {
          // Check if parentId looks like a code (alphanumeric without hyphens) or UUID
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(account.parentId);
          
          if (isUuid) {
            // It's already a UUID, use it directly
            parentUuid = account.parentId;
          } else {
            // It's a code, look up the UUID
            const parentAccount = accountMap.get(account.parentId);
            if (parentAccount && parentAccount.id) {
              parentUuid = parentAccount.id;
              console.log(`Found parent UUID for code ${account.parentId}: ${parentUuid}`);
            } else {
              errors.push(`Parent account with code "${account.parentId}" not found. Available codes: ${Array.from(accountMap.keys()).join(', ')}`);
            }
          }
        }
        
        if (errors.length > 0) {
          validationErrors.push(`Account ${i + 1} (${account.code || 'unknown'}): ${errors.join(', ')}`);
        } else {
          preparedAccounts.push({
            code: account.code,
            name: account.name,
            type: account.type,
            normalBalance: account.normalBalance,
            description: account.description || '',
            isHeader: account.isHeader || false,
            parentId: parentUuid,
            isActive: true,
          });
        }
      }

      if (validationErrors.length > 0) {
        console.warn('Validation errors:', validationErrors);
        const errorMessage = validationErrors.slice(0, 3).join('\n');
        if (validationErrors.length > 3) {
          toast.warning(`${validationErrors.length} validation errors found. First 3:\n${errorMessage}`);
        } else {
          toast.warning(`Validation errors:\n${errorMessage}`);
        }
      }

      if (preparedAccounts.length === 0) {
        throw new Error('No valid accounts to import');
      }

      // Import prepared accounts
      let successCount = 0;
      let errorCount = 0;
      const errors: Array<{account: any, error: string}> = [];

      for (const account of preparedAccounts) {
        try {
          console.log('Attempting to create account:', account);
          const response = await accountsApi.create(account);
          console.log('Account created successfully:', response);
          successCount++;
        } catch (error: any) {
          console.error('Failed to import account:', account, error);
          console.error('Error response:', error.response?.data);
          errorCount++;
          errors.push({
            account,
            error: error.response?.data?.error || error.message || 'Unknown error'
          });
        }

        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Show error summary
      if (errors.length > 0) {
        console.error('Import errors:', errors);
        
        const errorGroups: Record<string, number> = {};
        errors.forEach(e => {
          const key = e.error.split(':')[0];
          errorGroups[key] = (errorGroups[key] || 0) + 1;
        });
        
        const errorSummary = Object.entries(errorGroups)
          .map(([error, count]) => `${error}: ${count} account(s)`)
          .join('\n');
        
        toast.error(`Failed to import ${errorCount} accounts:\n${errorSummary}`);
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} accounts`);
      }

      if (successCount > 0 || errorCount > 0) {
        await loadAccounts();
        if (successCount > 0) {
          setIsImportDialogOpen(false);
        }
      }
      
      event.target.value = '';
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to parse import file');
    } finally {
      setImportLoading(false);
    }
  };

  reader.onerror = () => {
    console.error('File read error');
    toast.error('Failed to read file');
    setImportLoading(false);
  };

  reader.readAsText(file);
};
  const handleBulkImport = async (accounts: any[]) => {
    setImportLoading(true);
    try {
      // Alternative: Use a bulk import endpoint if available
      // await accountsApi.bulkCreate(accounts);
      
      // For now, import one by one
      let successCount = 0;
      let errorCount = 0;

      for (const account of accounts) {
        try {
          await accountsApi.create(account);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      toast.success(`Imported ${successCount} accounts successfully`);
      if (errorCount > 0) {
        toast.warning(`${errorCount} accounts failed to import`);
      }
      
      loadAccounts();
    } catch (error) {
      toast.error('Failed to import accounts');
    } finally {
      setImportLoading(false);
    }
  };

  const filterAccounts = (accounts: Account[]): Account[] => {
    return accounts.filter(account => {
      const matchesSearch = search === '' || 
        account.code.toLowerCase().includes(search.toLowerCase()) ||
        account.name.toLowerCase().includes(search.toLowerCase()) ||
        account.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = selectedType === 'all' || account.type === selectedType;
      
      return matchesSearch && matchesType;
    });
  };

  const getTypeColor = (type: AccountType) => {
    const colors: Record<AccountType, string> = {
      asset: 'text-green-600 bg-green-50 border-green-200',
      liability: 'text-red-600 bg-red-50 border-red-200',
      equity: 'text-purple-600 bg-purple-50 border-purple-200',
      revenue: 'text-blue-600 bg-blue-50 border-blue-200',
      expense: 'text-orange-600 bg-orange-50 border-orange-200',
    };
    return colors[type] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getNormalBalanceIcon = (balance: NormalBalance) => {
    return balance === 'debit' ? '→ Dr' : '← Cr';
  };

  // Stats Cards
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="p-6">
        <div>
          <p className="text-sm text-gray-500">Total Accounts</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
      </Card>
      
      <Card className="p-6">
        <div>
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
          </p>
        </div>
      </Card>
      
      <Card className="p-6">
        <div>
          <p className="text-sm text-gray-500">Header Accounts</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.headers}</p>
        </div>
      </Card>
      
      <Card className="p-6">
        <div>
          <p className="text-sm text-gray-500">Detail Accounts</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.detail}</p>
        </div>
      </Card>
      
      <Card className="p-6">
        <p className="text-sm text-gray-500 mb-2">By Type</p>
        <div className="flex flex-wrap gap-1">
          {Object.entries(stats.byType).map(([type, count]) => (
            <span 
              key={type} 
              className={cn(
                "px-2 py-1 text-xs rounded-full border",
                getTypeColor(type as AccountType)
              )}
            >
              {type}: {count}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );

  // List View
  const renderListView = () => {
    const filteredAccounts = filterAccounts(accounts);

    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Normal</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No accounts found
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow 
                  key={account.id}
                  className={cn(
                    !account.isActive && 'opacity-50 bg-gray-50',
                    account.isHeader && 'font-medium'
                  )}
                >
                  <TableCell className="font-mono">{account.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {account.isHeader ? (
                        <FolderOpen className="h-4 w-4 mr-2 text-yellow-600" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      )}
                      {account.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full border",
                      getTypeColor(account.type)
                    )}>
                      {account.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 font-mono">
                      {getNormalBalanceIcon(account.normalBalance)}
                    </span>
                  </TableCell>
                  <TableCell>{account.level}</TableCell>
                  <TableCell>
                    {account.isActive ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.isHeader ? (
                      <span className="px-2 py-1 text-xs rounded-full border border-yellow-300 bg-yellow-50 text-yellow-700">
                        Header
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full border border-blue-300 bg-blue-50 text-blue-700">
                        Detail
                      </span>
                    )}
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
                          setSelectedAccount(account);
                          setIsViewDialogOpen(true);
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedAccount(account);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {account.isActive ? (
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedAccount(account);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Tree View
  const renderTreeView = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    return (
      <AccountTree
        accounts={accounts}
        onSelect={(account) => {
          setSelectedAccount(account);
          setIsViewDialogOpen(true);
        }}
        onAddChild={(parent) => {
          setSelectedAccount(parent);
          setIsCreateDialogOpen(true);
        }}
        onEdit={(account) => {
          setSelectedAccount(account);
          setIsEditDialogOpen(true);
        }}
        onDelete={(account) => {
          setSelectedAccount(account);
          setIsDeleteDialogOpen(true);
        }}
      />
    );
  };

  // Quick Actions
  const quickActions = [
    { title: 'New Account', action: () => setIsCreateDialogOpen(true), icon: Plus },
    { title: 'Export Chart', action: handleExport, icon: Download },
    { title: 'Import Accounts', action: () => setIsImportDialogOpen(true), icon: Upload },
    { title: 'Refresh', action: loadAccounts, icon: RefreshCw },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Chart of Accounts</h1>
        <p className="text-gray-500 mt-1">Manage your account structure and hierarchy</p>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={action.action}
              >
                <Icon className="h-6 w-6" />
                <span>{action.title}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by code, name, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as AccountType | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="asset">Assets</SelectItem>
              <SelectItem value="liability">Liabilities</SelectItem>
              <SelectItem value="equity">Equity</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tree')}
              className="rounded-none"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Tree
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <FileText className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Display */}
      {viewMode === 'tree' ? renderTreeView() : renderListView()}

      {/* Create Account Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Add a new account to your chart of accounts
            </DialogDescription>
          </DialogHeader>
          <AccountForm
            initialData={selectedAccount ? { parentId: selectedAccount.id } : undefined}
            onSubmit={handleCreateAccount}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Modify account details
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <AccountForm
              initialData={selectedAccount}
              onSubmit={(data) => handleUpdateAccount(selectedAccount.id, data)}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedAccount(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Account Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Code</p>
                  <p className="font-mono text-lg">{selectedAccount.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedAccount.name}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full border inline-block",
                    getTypeColor(selectedAccount.type)
                  )}>
                    {selectedAccount.type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Normal Balance</p>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                    {selectedAccount.normalBalance}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p>{selectedAccount.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full border",
                    selectedAccount.isHeader 
                      ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                      : "border-blue-300 bg-blue-50 text-blue-700"
                  )}>
                    {selectedAccount.isHeader ? 'Header Account' : 'Detail Account'}
                  </span>
                </div>
              </div>

              {selectedAccount.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1">{selectedAccount.description}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p>{new Date(selectedAccount.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p>{new Date(selectedAccount.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsEditDialogOpen(true);
                }}>
                  Edit Account
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAccount?.children ? (
                <span className="text-red-600">
                  This account has child accounts. Deactivating it will also deactivate all child accounts.
                </span>
              ) : (
                "This action will deactivate the account. You can reactivate it later."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Accounts</DialogTitle>
            <DialogDescription>
              Upload a JSON file containing account definitions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your JSON file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                File should contain an array of account objects
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              <pre className="text-xs bg-white p-2 rounded overflow-auto">
{`[
  {
    "code": "1000",
    "name": "Cash",
    "type": "asset",
    "normalBalance": "debit",
    "description": "Main cash account",
    "isHeader": false
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