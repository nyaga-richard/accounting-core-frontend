// src/components/accounts/AccountTree.tsx

import React, { useState, useEffect } from 'react';
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

// Extend Account type to include children for the tree structure
interface TreeNode extends Account {
  children: TreeNode[];
}

interface TreeNodeProps {
  account: TreeNode;
  level: number;
  onSelect?: (account: Account) => void;
  onAddChild?: (parent: Account) => void;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
}

// Helper function to build tree from flat list
function buildTree(accounts: Account[]): TreeNode[] {
  // Create a map of all accounts by ID
  const accountMap = new Map<string, TreeNode>();
  
  // First pass: create nodes for all accounts
  accounts.forEach(account => {
    accountMap.set(account.id, {
      ...account,
      children: []
    });
  });

  // Second pass: build the tree structure
  const rootNodes: TreeNode[] = [];

  accountMap.forEach((node) => {
    if (node.parentId && accountMap.has(node.parentId)) {
      // This account has a parent, add it as a child
      const parent = accountMap.get(node.parentId)!;
      parent.children.push(node);
    } else {
      // This is a root level account (no parent or parent not in list)
      rootNodes.push(node);
    }
  });

  // Sort root nodes by code
  rootNodes.sort((a, b) => a.code.localeCompare(b.code));

  // Sort children recursively
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.code.localeCompare(b.code));
    nodes.forEach(node => sortChildren(node.children));
  };
  sortChildren(rootNodes);

  return rootNodes;
}

function TreeNode({ account, level, onSelect, onAddChild, onEdit, onDelete }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = account.children && account.children.length > 0;

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

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center py-2 px-2 hover:bg-gray-50 rounded-lg group',
          !account.isActive && 'opacity-50'
        )}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
      >
        <div className="flex items-center flex-1 min-w-0">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 mr-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-7" />
          )}
          
          <button
            onClick={() => onSelect?.(account)}
            className="flex items-center space-x-2 flex-1 min-w-0 text-left"
          >
            {account.isHeader ? (
              <FolderOpen className="h-4 w-4 mr-2 text-yellow-600 flex-shrink-0" />
            ) : (
              <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
            )}
            
            <span className="font-mono text-sm text-gray-600 flex-shrink-0">
              {account.code}
            </span>
            <span className="text-sm truncate">
              {account.name}
            </span>
          </button>

          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            <Badge variant="outline" className={cn('text-xs', getTypeColor(account.type))}>
              {account.type}
            </Badge>
            
            {account.isHeader ? (
              <Badge variant="outline" className="text-xs border-yellow-300 bg-yellow-50 text-yellow-700">
                Header
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-blue-300 bg-blue-50 text-blue-700">
                Detail
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onAddChild && account.isHeader && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAddChild(account)}
              title="Add child account"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(account)}
              title="Edit account"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && !hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(account)}
              title="Delete account"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
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

export function AccountTree({ accounts = [], onSelect, onAddChild, onEdit, onDelete }: AccountTreeProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  // Build tree whenever accounts change
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const tree = buildTree(accounts);
      setTreeData(tree);
    } else {
      setTreeData([]);
    }
  }, [accounts]);

  if (!accounts || accounts.length === 0) {
    return (
      <div className="border rounded-lg p-8 bg-white text-center">
        <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounts Found</h3>
        <p className="text-gray-500 mb-4">Get started by creating your first account</p>
        {onAddChild && (
          <Button onClick={() => onAddChild({} as Account)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Account
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Chart of Accounts</h3>
            <p className="text-sm text-gray-500">
              {accounts.length} total accounts • {treeData.length} root accounts
            </p>
          </div>
        </div>
      </div>
      <div className="p-2 max-h-[600px] overflow-y-auto">
        {treeData.map((account) => (
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