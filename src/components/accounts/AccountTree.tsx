// src/components/accounts/AccountTree.tsx

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FolderOpen, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Account, AccountType } from '@/lib/types/account.types';
import { cn } from '@/lib/utils';

interface AccountTreeProps {
  accounts?: Account[];
  onSelect?: (account: Account) => void;
  onAddChild?: (parent: Account) => void;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
}

interface TreeNodeProps {
  account: Account;
  level: number;
  onSelect?: (account: Account) => void;
  onAddChild?: (parent: Account) => void;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
}

function TreeNode({ account, level, onSelect, onAddChild, onEdit, onDelete }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = account.children && account.children.length > 0;

  const getTypeColor = (type: AccountType) => {
    const colors: Record<AccountType, string> = {
      asset: 'text-green-600',
      liability: 'text-red-600',
      equity: 'text-purple-600',
      revenue: 'text-blue-600',
      expense: 'text-orange-600',
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer',
          !account.isActive && 'opacity-50'
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        <div className="flex items-center flex-1" onClick={() => onSelect?.(account)}>
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mr-1"
            >
              {isExpanded ? (
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
          
          <span className="font-mono text-sm mr-2">{account.code}</span>
          <span className="text-sm mr-2">{account.name}</span>
          
          <Badge variant="outline" className={cn('text-xs', getTypeColor(account.type))}>
            {account.type}
          </Badge>
          
          {account.isHeader && (
            <Badge variant="secondary" className="ml-2 text-xs">Header</Badge>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {onAddChild && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onAddChild(account)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onEdit(account)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          {onDelete && !hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-600"
              onClick={() => onDelete(account)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {isExpanded && account.children && account.children.length > 0 && (
        <div>
          {account.children.map((child) => (
            <TreeNode
              key={child.id}
              account={child}
              level={level + 1}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountTree({ accounts=[], onSelect, onAddChild, onEdit, onDelete }: AccountTreeProps) {
  const rootAccounts = accounts.filter(a => !a.parentId);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="text-sm font-medium mb-2">Chart of Accounts</div>
      <div className="space-y-1">
        {rootAccounts.map((account) => (
          <TreeNode
            key={account.id}
            account={account}
            level={0}
            onSelect={onSelect}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}