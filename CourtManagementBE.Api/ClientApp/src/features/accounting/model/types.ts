import type { JournalEntryStatus } from '../constants/accountingConstants'

export type JournalEntryLine = {
  id: string
  journalEntryId: string
  accountCode: string
  accountName?: string | null
  debitAmount: number
  creditAmount: number
  partnerId?: string | null
  description: string
}

export type JournalEntry = {
  id: string
  voucherNo: string
  entryDate: string
  documentType: string
  sourceTable: string
  sourceId: string
  description: string
  status: JournalEntryStatus | string
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
  lines: JournalEntryLine[]
}

export type JournalEntryQuery = {
  status?: string
  fromDate?: string
  toDate?: string
  keyword?: string
}

export type JournalEntryLineUpdate = {
  id?: string
  accountCode: string
  debitAmount: number
  creditAmount: number
  partnerId?: string | null
  description: string
}

export type JournalEntryUpdateRequest = {
  description?: string
  lines: JournalEntryLineUpdate[]
}

export type PostJournalEntriesRequest = {
  entryIds: string[]
}

export type PostJournalEntriesResponse = {
  postedCount: number
  postedEntryIds: string[]
}

export type ChartOfAccount = {
  id: string
  accountCode: string
  accountName: string
  accountType: string
  parentAccountId?: string | null
  level: number
  isActive: boolean
}

export type ChartOfAccountRequest = {
  accountCode: string
  accountName: string
  accountType: string
  parentAccountId?: string | null
  level: number
  isActive?: boolean
}

export type AccountingOption = {
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
}

export type AccountingAccountTypeOption = AccountingOption & {
  normalBalance: string
}

export type JournalDocumentTypeOption = AccountingOption & {
  voucherPrefix: string
}

export type BankAccountOption = {
  bankAccountID: number
  code: string
  bankName: string
  accountNumberMasked: string
  accountCode: string
  openingBalance: number
  colorCode: string
  sortOrder: number
  isActive: boolean
}

export type CashFundOption = {
  cashFundID: number
  code: string
  name: string
  accountCode: string
  openingBalance: number
  sortOrder: number
  isActive: boolean
}

export type AccountingRuleCondition = {
  id: string
  ruleId: string
  sourceTable: string
  fieldName: string
  operator: string
  expectedValue: string
  description: string
}

export type AccountingRule = {
  id: string
  transactionType: string
  debitAccount: string
  creditAccount: string
  originalSource: string
  description: string
  conditions: AccountingRuleCondition[]
}

export type VoucherResponse = {
  id: string
  no: string
  date: string
  type: string
  desc: string
  amt: number
  state: string
}

export type CashflowTransaction = {
  key: string
  date: string
  no: string
  desc: string
  debit: number
  credit: number
}

export type CashflowFund = {
  key: string
  name: string
  bal: number
}

export type CashflowBank = {
  key: string
  name: string
  acc: string
  bal: number
  color: string
}

export type CashflowResponse = {
  startBal: number
  ledger: CashflowTransaction[]
  cashFunds: CashflowFund[]
  banks: CashflowBank[]
}

export type ReceivableResponse = {
  key: string
  code: string
  name: string
  total: number
  paid: number
  due: string
  age: string
}

export type PayableResponse = {
  key: string
  code: string
  name: string
  total: number
  paid: number
  due: string
  urg: string
}

