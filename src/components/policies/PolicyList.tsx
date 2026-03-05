// src/components/policies/PolicyList.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Copy, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Policy } from '@/lib/types/policy.types';
import { format } from 'date-fns';

interface PolicyListProps {
  policies: Policy[];
  onDelete: (id: string) => void;
  onDuplicate: (policy: Policy) => void;
  onTest: (policy: Policy) => void;
}

export function PolicyList({ policies, onDelete, onDuplicate, onTest }: PolicyListProps) {
  const navigate = useNavigate();

  const getEventTypeBadge = (eventType: string) => {
    const colors: Record<string, string> = {
      'invoice.created': 'bg-blue-100 text-blue-800',
      'payment.received': 'bg-green-100 text-green-800',
      'bill.created': 'bg-yellow-100 text-yellow-800',
      'period.closing': 'bg-purple-100 text-purple-800',
    };
    
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Accounting Policies</h2>
        <Button onClick={() => navigate('/policies/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Policy
        </Button>
      </div>

      <div className="border rounded-lg">
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
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="font-medium">
                  {policy.name}
                  {policy.description && (
                    <p className="text-sm text-gray-500">{policy.description}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getEventTypeBadge(policy.eventType)}>
                    {policy.eventType}
                  </Badge>
                </TableCell>
                <TableCell>{policy.priority}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {policy.conditions.length} conditions
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {policy.actions.length} actions
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                    {policy.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>v{policy.version}</TableCell>
                <TableCell>{format(new Date(policy.updatedAt), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/policies/${policy.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(policy)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTest(policy)}>
                        <Play className="mr-2 h-4 w-4" />
                        Test
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(policy.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}