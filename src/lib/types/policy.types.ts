// src/lib/types/policy.types.ts

export enum BusinessEventType {
  INVOICE_CREATED = 'invoice.created',
  INVOICE_APPROVED = 'invoice.approved',
  PAYMENT_RECEIVED = 'payment.received',
  BILL_CREATED = 'bill.created',
  GOODS_RECEIVED = 'goods.received',
  PERIOD_CLOSING = 'period.closing',
  CUSTOM_EVENT = 'custom.event'
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  IN = 'in',
  NOT_IN = 'notIn',
  CONTAINS = 'contains',
  MATCHES = 'matches',
  BETWEEN = 'between'
}

export enum ActionType {
  CREATE_LEDGER_ENTRY = 'createLedgerEntry',
  UPDATE_ACCOUNT = 'updateAccount',
  TRIGGER_WORKFLOW = 'triggerWorkflow',
  SEND_NOTIFICATION = 'sendNotification'
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  eventType: BusinessEventType | string;
  priority: number;
  isActive: boolean;
  conditions: Condition[];
  actions: Action[];
  createdAt: string;
  updatedAt: string;
  version: number;
  tags?: string[];
}

export interface Condition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface Action {
  type: ActionType;
  // Accounting action specific fields
  debitAccount?: AccountRule;
  creditAccount?: AccountRule;
  amount?: AmountRule;
  descriptionTemplate?: string;
  // Workflow action specific
  workflowId?: string;
  // Notification action specific
  channel?: string;
  subjectTemplate?: string;
  bodyTemplate?: string;
}

export interface AccountRule {
  type: 'fixed' | 'fromContext' | 'expression';
  fixedAccountId?: string;
  contextPath?: string;
  expression?: string;
}

export interface AmountRule {
  type: 'fixed' | 'fromContext' | 'percentage' | 'formula';
  fixedAmount?: number;
  contextPath?: string;
  percentageOf?: string;
  percentage?: number;
  formula?: string;
  rounding?: 'up' | 'down' | 'nearest';
  roundingPrecision?: number;
}

export interface EventContext {
  eventId: string;
  eventType: string;
  timestamp: string;
  data: Record<string, any>;
  computed?: Record<string, any>;
}