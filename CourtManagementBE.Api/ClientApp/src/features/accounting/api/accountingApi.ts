import { apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type {
  AccountingRule,
  ChartOfAccount,
  ChartOfAccountRequest,
  JournalEntry,
  JournalEntryQuery,
  JournalEntryUpdateRequest,
  PostJournalEntriesRequest,
  PostJournalEntriesResponse,
  VoucherResponse,
  CashflowResponse,
  ReceivableResponse,
  PayableResponse,
} from '../model/types'

export const accountingApi = {
  getJournal: (params?: JournalEntryQuery) => apiGet<JournalEntry[]>('/accounting/journal', params as Record<string, unknown> | undefined),
  postJournalBatch: (body: PostJournalEntriesRequest) => apiPost<PostJournalEntriesResponse>('/accounting/journal/post-batch', body),
  updateDraftJournal: (id: string, body: JournalEntryUpdateRequest) => apiPut<JournalEntry>(`/accounting/journal/${id}`, body),
  getAccounts: () => apiGet<ChartOfAccount[]>('/accounting/accounts'),
  createAccount: (body: ChartOfAccountRequest) => apiPost<ChartOfAccount>('/accounting/accounts', body),
  getRules: () => apiGet<AccountingRule[]>('/accounting/rules'),
  getVouchers: () => apiGet<VoucherResponse[]>('/accounting/vouchers'),
  getCashflow: (type?: string) => apiGet<CashflowResponse>('/accounting/cashflow', { type }),
  getReceivables: () => apiGet<ReceivableResponse[]>('/accounting/receivables'),
  getPayables: () => apiGet<PayableResponse[]>('/accounting/payables'),
}
