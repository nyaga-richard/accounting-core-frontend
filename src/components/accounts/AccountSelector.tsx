// src/components/accounts/AccountSelector.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Check 
} from 'lucide-react';
import { Account, AccountType } from '@/lib/types/account.types';
import { cn } from '@/lib/utils';

interface AccountSelectorProps {
  accounts?: Account[]; // Add this prop
  onSelect: (account: Account) => void;
  selectedAccountId?: string;
  filterTypes?: AccountType[];
  disabled?: boolean;
  buttonText?: string;
}

export function AccountSelector({ 
  accounts: propAccounts, // Rename to avoid conflict with state
  onSelect, 
  selectedAccountId,
  filterTypes,
  disabled = false,
  buttonText = 'Select Account'
}: AccountSelectorProps) {
  const [open, setOpen] = useState(false);
  const [internalAccounts, setInternalAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Use provided accounts if available, otherwise fetch
  const accounts = propAccounts || internalAccounts;

  // Fetch accounts only if not provided via props and dialog is opened
  useEffect(() => {
    if (open && !propAccounts) {
      loadAccounts();
    }
  }, [open, propAccounts]);

  // Initialize selected account when dialog opens
  useEffect(() => {
    if (open && selectedAccountId && accounts.length > 0) {
      const account = findAccountById(accounts, selectedAccountId);
      if (account) {
        setSelectedAccount(account);
      }
    }
  }, [open, selectedAccountId, accounts]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      // Fetch from API
      const response = await fetch('/api/v1/accounts/tree');
      const data = await response.json();
      setInternalAccounts(data.data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const findAccountById = (accounts: Account[], id: string): Account | null => {
    for (const account of accounts) {
      if (account.id === id) return account;
      if (account.children) {
        const found = findAccountById(account.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleFolder = (accountId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleSelect = (account: Account) => {
    if (!account.isHeader) {
      setSelectedAccount(account);
    }
  };

  const handleConfirm = () => {
    if (selectedAccount) {
      onSelect(selectedAccount);
      setOpen(false);
    }
  };

  const getTypeColor = (type: AccountType) => {
    const colors: Record<AccountType, string> = {
      asset: 'text-green-600 bg-green-50',
      liability: 'text-red-600 bg-red-50',
      equity: 'text-purple-600 bg-purple-50',
      revenue: 'text-blue-600 bg-blue-50',
      expense: 'text-orange-600 bg-orange-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const filterAccounts = (accounts: Account[]): Account[] => {
    if (!search) return accounts;
    
    return accounts.filter(account => {
      const matchesSearch = 
        account.code.toLowerCase().includes(search.toLowerCase()) ||
        account.name.toLowerCase().includes(search.toLowerCase());
      
      if (matchesSearch) return true;
      
      if (account.children) {
        const filteredChildren = filterAccounts(account.children);
        return filteredChildren.length > 0;
      }
      
      return false;
    }).map(account => ({
      ...account,
      children: account.children ? filterAccounts(account.children) : []
    }));
  };

  const renderAccountTree = (accounts: Account[], level = 0) => {
    return accounts
      .filter(account => !filterTypes || filterTypes.includes(account.type))
      .map((account) => (
        <div key={account.id}>
          <div
            className={cn(
              'flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-100',
              selectedAccount?.id === account.id && 'bg-blue-50 hover:bg-blue-100',
              account.isHeader ? 'font-medium' : 'pl-6',
              !account.isActive && 'opacity-50'
            )}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
          >
            {account.children && account.children.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(account.id);
                }}
                className="mr-1"
              >
                {expandedFolders.has(account.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}
            
            {account.isHeader ? (
              <FolderOpen className="h-4 w-4 mr-2 text-yellow-600" />
            ) : (
              <FileText className="h-4 w-4 mr-2 text-gray-400" />
            )}
            
            <div
              className="flex-1 flex items-center"
              onClick={() => handleSelect(account)}
            >
              <span className="font-mono text-sm mr-2">{account.code}</span>
              <span className="text-sm mr-2">{account.name}</span>
              
              {!account.isHeader && (
                <Badge variant="outline" className={cn('text-xs', getTypeColor(account.type))}>
                  {account.type}
                </Badge>
              )}
            </div>

            {selectedAccount?.id === account.id && (
              <Check className="h-4 w-4 text-blue-600 mr-2" />
            )}
          </div>

          {account.children && account.children.length > 0 && expandedFolders.has(account.id) && (
            <div>
              {renderAccountTree(account.children, level + 1)}
            </div>
          )}
        </div>
      ));
  };

  const filteredAccounts = filterAccounts(accounts);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="w-full justify-start">
          {selectedAccountId ? (
            <span className="truncate">
              {selectedAccountId} - Selected Account
            </span>
          ) : (
            buttonText
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search accounts by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Account Tree */}
          <ScrollArea className="h-96 border rounded-lg p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading accounts...</p>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No accounts found</p>
              </div>
            ) : (
              renderAccountTree(filteredAccounts)
            )}
          </ScrollArea>

          {/* Selected Account Info */}
          {selectedAccount && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Selected Account</p>
              <p className="text-sm text-blue-700">
                {selectedAccount.code} - {selectedAccount.name}
              </p>
              <Badge variant="outline" className={cn('mt-1', getTypeColor(selectedAccount.type))}>
                {selectedAccount.type}
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedAccount}>
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}