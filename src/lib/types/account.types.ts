// src/lib/types/account.types.ts

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense'
}

export enum NormalBalance {
  DEBIT = 'debit',
  CREDIT = 'credit'
}

export interface Account {
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  description?: string;
  isActive: boolean;
  isHeader: boolean;
  parentId?: string;
  level: number;
  path: string;
  children?: Account[];
  metadata?: Record<string, any>;
}

export interface AccountStructure {
  id: string;
  name: string;
  segments: AccountCodeSegment[];
  separator: string;
}

export interface AccountCodeSegment {
  name: string;
  length: number;
  padding?: 'left' | 'right';
  padChar?: string;
  description?: string;
}