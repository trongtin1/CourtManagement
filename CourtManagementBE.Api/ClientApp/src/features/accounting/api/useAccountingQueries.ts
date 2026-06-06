import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountingApi } from './accountingApi'
import type { ChartOfAccountRequest, JournalEntryQuery, JournalEntryUpdateRequest, PostJournalEntriesRequest } from '../model/types'

export const accountingKeys = {
  all: ['accounting'] as const,
  journal: (params?: JournalEntryQuery) => [...accountingKeys.all, 'journal', params] as const,
  accounts: () => [...accountingKeys.all, 'accounts'] as const,
  rules: () => [...accountingKeys.all, 'rules'] as const,
  vouchers: () => [...accountingKeys.all, 'vouchers'] as const,
  cashflow: (type?: string) => [...accountingKeys.all, 'cashflow', type] as const,
  receivables: () => [...accountingKeys.all, 'receivables'] as const,
  payables: () => [...accountingKeys.all, 'payables'] as const,
}

export const useAccountingJournalQuery = (params?: JournalEntryQuery) =>
  useQuery({ queryKey: accountingKeys.journal(params), queryFn: () => accountingApi.getJournal(params) })

export const useAccountingAccountsQuery = () =>
  useQuery({ queryKey: accountingKeys.accounts(), queryFn: () => accountingApi.getAccounts() })

export const useAccountingRulesQuery = () =>
  useQuery({ queryKey: accountingKeys.rules(), queryFn: () => accountingApi.getRules() })

export const useAccountingVouchersQuery = () =>
  useQuery({ queryKey: accountingKeys.vouchers(), queryFn: () => accountingApi.getVouchers() })

export const useAccountingCashflowQuery = (type?: string) =>
  useQuery({ queryKey: accountingKeys.cashflow(type), queryFn: () => accountingApi.getCashflow(type) })

export const useAccountingReceivablesQuery = () =>
  useQuery({ queryKey: accountingKeys.receivables(), queryFn: () => accountingApi.getReceivables() })

export const useAccountingPayablesQuery = () =>
  useQuery({ queryKey: accountingKeys.payables(), queryFn: () => accountingApi.getPayables() })

export const usePostJournalBatchMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: PostJournalEntriesRequest) => accountingApi.postJournalBatch(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountingKeys.all }),
  })
}

export const useUpdateDraftJournalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: JournalEntryUpdateRequest }) => accountingApi.updateDraftJournal(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountingKeys.all }),
  })
}

export const useCreateAccountMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ChartOfAccountRequest) => accountingApi.createAccount(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountingKeys.all }),
  })
}
