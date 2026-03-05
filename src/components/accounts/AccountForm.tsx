"use client"

// src/components/accounts/AccountForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle,
  FolderOpen,
  FileText,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Account, AccountType, NormalBalance } from '@/lib/types/account.types';
import { accountsApi } from '@/lib/api/accounts';
import { cn } from '@/lib/utils';

// Form validation schema - fixed enum syntax
export const accountSchema = z.object({
  code: z
    .string()
    .min(1, "Account code is required")
    .max(20),

  name: z
    .string()
    .min(1, "Account name is required")
    .max(100),

  type: z.enum([
    "asset",
    "liability",
    "equity",
    "revenue",
    "expense",
  ]),

  normalBalance: z.enum(["debit", "credit"]),

  description: z.string().optional(),

  isHeader: z.boolean(),

  parentId: z.string().nullable().optional(),

  isActive: z.boolean(),

  metadata: z.record(z.string(), z.any()),
});
// Infer the type from the schema
export type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  initialData?: Partial<Account>;
  onSubmit: (data: AccountFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AccountForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isLoading = false 
}: AccountFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    message?: string;
  } | null>(null);
  const [previewCode, setPreviewCode] = useState<string>('');

  // Initialize form with proper default values
  const form = useForm<AccountFormData>({
  resolver: zodResolver(accountSchema),

  defaultValues: {
    code: "",
    name: "",
    type: "asset",
    normalBalance: "debit" as NormalBalance,
    description: "",
    isHeader: false,
    parentId: null,
    isActive: true,
    metadata: {},
  },
});

  // Watch form values for real-time validation
  const watchedCode = form.watch('code');
  const watchedType = form.watch('type');
  const watchedIsHeader = form.watch('isHeader');
  const watchedParentId = form.watch('parentId');

  // Load accounts for parent selection
  useEffect(() => {
    loadAccounts();
  }, []);

  // Validate code uniqueness
  useEffect(() => {
    const validateCode = async () => {
      if (!watchedCode || watchedCode === initialData?.code) {
        setValidationStatus(null);
        return;
      }

      try {
        const existing = await accountsApi.getByCode(watchedCode);
        if (existing.data) {
          setValidationStatus({
            isValid: false,
            message: 'Account code already exists',
          });
        } else {
          setValidationStatus({
            isValid: true,
            message: 'Code is available',
          });
        }
      } catch (error) {
        // Code doesn't exist - that's good
        setValidationStatus({
          isValid: true,
          message: 'Code is available',
        });
      }
    };

    const timeout = setTimeout(validateCode, 500);
    return () => clearTimeout(timeout);
  }, [watchedCode, initialData?.code]);

  // Generate preview code based on parent
  useEffect(() => {
    const generatePreview = async () => {
      if (watchedParentId && watchedCode) {
        const parent = accounts.find(a => a.id === watchedParentId);
        if (parent) {
          setPreviewCode(`${parent.code}-${watchedCode}`);
        } else {
          setPreviewCode(watchedCode);
        }
      } else {
        setPreviewCode(watchedCode);
      }
    };
    generatePreview();
  }, [watchedCode, watchedParentId, accounts]);

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await accountsApi.list({ isActive: true });
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (data: AccountFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error is handled by parent
    }
  };

  // Get available parent accounts
  const getAvailableParents = () => {
    return accounts.filter(account => {
      // Can't parent to itself
      if (account.id === initialData?.id) return false;
      
      // Can't parent to a detail account
      if (!account.isHeader) return false;
      
      // Can't create circular reference
      if (initialData?.id && account.path?.includes(initialData.id)) return false;
      
      return true;
    });
  };

  // Get type-specific help text
  const getTypeHelpText = (type: AccountType): string => {
    const helpTexts: Record<AccountType, string> = {
      asset: 'Resources owned by the business (e.g., Cash, Inventory, Equipment)',
      liability: 'Obligations owed to others (e.g., Loans, Accounts Payable)',
      equity: 'Owner\'s interest in the business (e.g., Capital, Retained Earnings)',
      revenue: 'Income from business activities (e.g., Sales, Service Revenue)',
      expense: 'Costs incurred in running the business (e.g., Rent, Salaries)',
    };
    return helpTexts[type];
  };

  // Get normal balance explanation
    const normalBalanceRules = {
    asset: "debit",
    liability: "credit",
    equity: "credit",
    revenue: "credit",
    expense: "debit",
    } as const;

    const getNormalBalanceHelp = (type: AccountType, balance: NormalBalance): string => {
    const expected = normalBalanceRules[type];

    if (balance !== expected) {
        return `Warning: ${type} accounts typically have a ${expected} normal balance`;
    }

    return `Correct: ${type} accounts normally have a ${expected} balance`;
    };

  const parentAccounts = getAvailableParents();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {initialData?.id ? 'Edit Account' : 'Create New Account'}
            </h2>
            <p className="text-sm text-gray-500">
              {initialData?.id 
                ? 'Modify the account details below' 
                : 'Enter the details for the new account'}
            </p>
          </div>
          {initialData?.id && (
            <Badge variant={initialData.isActive ? 'default' : 'secondary'}>
              {initialData.isActive ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Account Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Account Code
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="e.g., 1000, 1100, 2000" 
                        {...field} 
                        className={cn(
                          "pr-8 font-mono",
                          validationStatus && !validationStatus.isValid && "border-red-500",
                          validationStatus?.isValid && "border-green-500"
                        )}
                        disabled={isLoading || initialData?.id !== undefined}
                      />
                      {validationStatus && (
                        <div className="absolute right-2 top-2.5">
                          {validationStatus.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {validationStatus && (
                    <p className={cn(
                      "text-xs mt-1",
                      validationStatus.isValid ? "text-green-600" : "text-red-600"
                    )}>
                      {validationStatus.message}
                    </p>
                  )}
                  <FormDescription>
                    Unique identifier for the account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Account Name
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cash - Operating" {...field} />
                  </FormControl>
                  <FormDescription>
                    Descriptive name for the account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Account Type
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value ? getTypeHelpText(field.value as AccountType) : 'Select an account type to see guidance'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

            {/* Right Column */}
            <div className="space-y-4">
            {/* Normal Balance */}
            <FormField
                control={form.control}
                name="normalBalance"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center">
                    Normal Balance
                    <span className="text-red-500 ml-1">*</span>
                    </FormLabel>

                    <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                    >
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select normal balance" />
                        </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                        <SelectItem value="debit">Debit</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                    </Select>

                    <FormDescription
                    className={cn(
                        form.watch('type') &&
                        field.value &&
                        getNormalBalanceHelp(
                            form.watch('type') as AccountType,
                            field.value as NormalBalance
                        ).includes('Warning')
                        ? 'text-yellow-600'
                        : ''
                    )}
                    >
                    {form.watch('type') && field.value
                        ? getNormalBalanceHelp(
                            form.watch('type') as AccountType,
                            field.value as NormalBalance
                        )
                        : 'Select both type and normal balance to see guidance'}
                    </FormDescription>

                    <FormMessage />
                </FormItem>
                )}
            />
            </div>

            </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter account description..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description of the account's purpose
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preview Card */}
        {(watchedCode || watchedParentId) && (
          <Card className="p-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Account Preview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Full Code</p>
                <p className="font-mono font-medium">{previewCode || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500">Full Name</p>
                <p>{form.watch('name') || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                {form.watch('type') && (
                  <Badge variant="outline" className={cn(
                    form.watch('type') === 'asset' && 'bg-green-50 text-green-700',
                    form.watch('type') === 'liability' && 'bg-red-50 text-red-700',
                    form.watch('type') === 'equity' && 'bg-purple-50 text-purple-700',
                    form.watch('type') === 'revenue' && 'bg-blue-50 text-blue-700',
                    form.watch('type') === 'expense' && 'bg-orange-50 text-orange-700',
                  )}>
                    {form.watch('type')}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-gray-500">Normal Balance</p>
                {form.watch('normalBalance') && (
                  <Badge variant="secondary">
                    {form.watch('normalBalance')}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Validation Rules */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Account Validation Rules</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Account codes must be unique</li>
              <li>Header accounts cannot be used in transactions</li>
              <li>Parent accounts must be header accounts</li>
              <li>Cannot create circular references in hierarchy</li>
              {watchedIsHeader && (
                <li className="text-yellow-600">
                  ⚠️ Header accounts will be available as parents for other accounts
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
            <Button 
            type="submit" 
            disabled={isLoading || validationStatus?.isValid === false}
            >
            {isLoading ? (
                <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
                </>
            ) : (
                <>
                <Save className="mr-2 h-4 w-4" />
                {initialData?.id ? 'Update Account' : 'Create Account'}
                </>
            )}
            </Button>
        </div>
      </form>
    </Form>
  );
}