// src/components/policies/ConditionEditor.tsx

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
import { ConditionOperator } from '@/lib/types/policy.types';

const conditionSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.nativeEnum(ConditionOperator),
  value: z.any(),
});

type ConditionFormData = z.infer<typeof conditionSchema>;

interface ConditionEditorProps {
  data: any;
  onChange: (data: Partial<ConditionFormData>) => void;
}

export function ConditionEditor({ data, onChange }: ConditionEditorProps) {
  const form = useForm<ConditionFormData>({
    resolver: zodResolver(conditionSchema),
    defaultValues: {
      field: data.field || '',
      operator: data.operator || ConditionOperator.EQUALS,
      value: data.value || '',
    },
  });

  const onSubmit = (values: ConditionFormData) => {
    onChange(values);
  };

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., data.amount, data.type" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="operator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operator</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ConditionOperator).map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Value to compare" 
                  {...field} 
                  value={field.value?.toString() || ''}
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