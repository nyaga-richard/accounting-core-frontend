// src/components/policies/ActionEditor.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionType } from '@/lib/types/policy.types';
import { Account } from '@/lib/types/account.types'; // Add this import
import { AccountSelector } from '../accounts/AccountSelector';

const actionSchema = z.object({
  type: z.nativeEnum(ActionType),
  debitAccount: z.object({
    type: z.enum(['fixed', 'fromContext', 'expression']),
    fixedAccountId: z.string().optional(),
    contextPath: z.string().optional(),
    expression: z.string().optional(),
  }).optional(),
  creditAccount: z.object({
    type: z.enum(['fixed', 'fromContext', 'expression']),
    fixedAccountId: z.string().optional(),
    contextPath: z.string().optional(),
    expression: z.string().optional(),
  }).optional(),
  amount: z.object({
    type: z.enum(['fixed', 'fromContext', 'percentage', 'formula']),
    fixedAmount: z.number().optional(),
    contextPath: z.string().optional(),
    percentageOf: z.string().optional(),
    percentage: z.number().optional(),
    formula: z.string().optional(),
  }).optional(),
  descriptionTemplate: z.string().optional(),
  workflowId: z.string().optional(),
  channel: z.string().optional(),
  subjectTemplate: z.string().optional(),
  bodyTemplate: z.string().optional(),
});

type ActionFormData = z.infer<typeof actionSchema>;

interface ActionEditorProps {
  data: any;
  accounts?: Account[]; // Add this prop
  onChange: (data: Partial<ActionFormData>) => void;
}

export function ActionEditor({ data, accounts = [], onChange }: ActionEditorProps) {
  const form = useForm<ActionFormData>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      type: data.actionType || data.type || ActionType.CREATE_LEDGER_ENTRY,
      ...data,
    },
  });

  const actionType = form.watch('type');

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(onChange)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ActionType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {actionType === ActionType.CREATE_LEDGER_ENTRY && (
          <Tabs defaultValue="debit" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="debit">Debit</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger>
              <TabsTrigger value="amount">Amount</TabsTrigger>
            </TabsList>
            
            <TabsContent value="debit" className="space-y-4">
              <FormField
                control={form.control}
                name="debitAccount.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Selection</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Account</SelectItem>
                        <SelectItem value="fromContext">From Context</SelectItem>
                        <SelectItem value="expression">Expression</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {form.watch('debitAccount.type') === 'fixed' && (
                <AccountSelector
                  accounts={accounts} // Pass accounts here
                  onSelect={(account) => 
                    form.setValue('debitAccount.fixedAccountId', account.id)
                  }
                />
              )}

              {form.watch('debitAccount.type') === 'fromContext' && (
                <FormField
                  control={form.control}
                  name="debitAccount.contextPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context Path</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., data.accountCode" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>

            <TabsContent value="credit" className="space-y-4">
              <FormField
                control={form.control}
                name="creditAccount.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Selection</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Account</SelectItem>
                        <SelectItem value="fromContext">From Context</SelectItem>
                        <SelectItem value="expression">Expression</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {form.watch('creditAccount.type') === 'fixed' && (
                <AccountSelector
                  accounts={accounts} // Pass accounts here
                  onSelect={(account) => 
                    form.setValue('creditAccount.fixedAccountId', account.id)
                  }
                />
              )}

              {form.watch('creditAccount.type') === 'fromContext' && (
                <FormField
                  control={form.control}
                  name="creditAccount.contextPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context Path</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., data.accountCode" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>

            <TabsContent value="amount" className="space-y-4">
              <FormField
                control={form.control}
                name="amount.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Calculation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="fromContext">From Context</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="formula">Formula</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {form.watch('amount.type') === 'fixed' && (
                <FormField
                  control={form.control}
                  name="amount.fixedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {form.watch('amount.type') === 'fromContext' && (
                <FormField
                  control={form.control}
                  name="amount.contextPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context Path</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., data.amount" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {form.watch('amount.type') === 'percentage' && (
                <>
                  <FormField
                    control={form.control}
                    name="amount.percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount.percentageOf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentage Of</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., data.total" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              {form.watch('amount.type') === 'formula' && (
                <FormField
                  control={form.control}
                  name="amount.formula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formula</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., data.amount * 1.1" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>
          </Tabs>
        )}

        <FormField
          control={form.control}
          name="descriptionTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description Template</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Invoice ${data.invoiceNumber}" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}