export const JOURNAL_ENTRY_STATUS = {
  DRAFT: 'Draft',
  POSTED: 'Posted',
  VOIDED: 'Voided',
  REVERSED: 'Reversed',
} as const

export const RECEIVABLE_STATUS = {
  UNPAID: 'Unpaid',
  PARTIALLY_PAID: 'PartiallyPaid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  WRITTEN_OFF: 'WrittenOff',
  CANCELLED: 'Cancelled',
} as const

export const ACCOUNTING_RULE_OPERATOR = {
  EQUAL: '=',
  NOT_EQUAL: '!=',
  GREATER_THAN: '>',
  LESS_THAN: '<',
  GREATER_OR_EQUAL: '>=',
  LESS_OR_EQUAL: '<=',
} as const

export const ACCOUNTING_RULE_LOGICAL_OPERATOR = {
  AND: 'AND',
  OR: 'OR',
} as const

export type JournalEntryStatus = (typeof JOURNAL_ENTRY_STATUS)[keyof typeof JOURNAL_ENTRY_STATUS]
export type ReceivableStatus = (typeof RECEIVABLE_STATUS)[keyof typeof RECEIVABLE_STATUS]
export type AccountingRuleOperator = (typeof ACCOUNTING_RULE_OPERATOR)[keyof typeof ACCOUNTING_RULE_OPERATOR]
export type AccountingRuleLogicalOperator = (typeof ACCOUNTING_RULE_LOGICAL_OPERATOR)[keyof typeof ACCOUNTING_RULE_LOGICAL_OPERATOR]

export const JOURNAL_ENTRY_STATUS_LABELS: Record<JournalEntryStatus, string> = {
  [JOURNAL_ENTRY_STATUS.DRAFT]: 'Nháp',
  [JOURNAL_ENTRY_STATUS.POSTED]: 'Đã ghi sổ',
  [JOURNAL_ENTRY_STATUS.VOIDED]: 'Đã hủy',
  [JOURNAL_ENTRY_STATUS.REVERSED]: 'Đã đảo bút toán',
}

export const RECEIVABLE_STATUS_LABELS: Record<ReceivableStatus, string> = {
  [RECEIVABLE_STATUS.UNPAID]: 'Chưa thanh toán',
  [RECEIVABLE_STATUS.PARTIALLY_PAID]: 'Thanh toán một phần',
  [RECEIVABLE_STATUS.PAID]: 'Đã thanh toán',
  [RECEIVABLE_STATUS.OVERDUE]: 'Quá hạn',
  [RECEIVABLE_STATUS.WRITTEN_OFF]: 'Đã xóa nợ',
  [RECEIVABLE_STATUS.CANCELLED]: 'Đã hủy',
}

export const ACCOUNTING_RULE_OPERATOR_LABELS: Record<AccountingRuleOperator, string> = {
  [ACCOUNTING_RULE_OPERATOR.EQUAL]: 'Bằng',
  [ACCOUNTING_RULE_OPERATOR.NOT_EQUAL]: 'Khác',
  [ACCOUNTING_RULE_OPERATOR.GREATER_THAN]: 'Lớn hơn',
  [ACCOUNTING_RULE_OPERATOR.LESS_THAN]: 'Nhỏ hơn',
  [ACCOUNTING_RULE_OPERATOR.GREATER_OR_EQUAL]: 'Lớn hơn hoặc bằng',
  [ACCOUNTING_RULE_OPERATOR.LESS_OR_EQUAL]: 'Nhỏ hơn hoặc bằng',
}

export const ACCOUNTING_RULE_LOGICAL_OPERATOR_LABELS: Record<AccountingRuleLogicalOperator, string> = {
  [ACCOUNTING_RULE_LOGICAL_OPERATOR.AND]: 'Và',
  [ACCOUNTING_RULE_LOGICAL_OPERATOR.OR]: 'Hoặc',
}

export const JOURNAL_ENTRY_STATUS_OPTIONS = Object.values(JOURNAL_ENTRY_STATUS).map((value) => ({
  label: JOURNAL_ENTRY_STATUS_LABELS[value],
  value,
}))

export const RECEIVABLE_STATUS_OPTIONS = Object.values(RECEIVABLE_STATUS).map((value) => ({
  label: RECEIVABLE_STATUS_LABELS[value],
  value,
}))

export const ACCOUNTING_RULE_OPERATOR_OPTIONS = Object.values(ACCOUNTING_RULE_OPERATOR).map((value) => ({
  label: ACCOUNTING_RULE_OPERATOR_LABELS[value],
  value,
}))

export const ACCOUNTING_RULE_LOGICAL_OPERATOR_OPTIONS = Object.values(ACCOUNTING_RULE_LOGICAL_OPERATOR).map((value) => ({
  label: ACCOUNTING_RULE_LOGICAL_OPERATOR_LABELS[value],
  value,
}))
