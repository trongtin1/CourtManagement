import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountingApi } from './accountingApi'
import type { ChartOfAccountRequest, JournalEntryQuery, JournalEntryUpdateRequest, PostJournalEntriesRequest } from '../model/types'

export const accountingKeys = {
  all: ['accounting'] as const,
  accountTypes: () => [...accountingKeys.all, 'account-types'] as const,
  documentTypes: () => [...accountingKeys.all, 'document-types'] as const,
  partnerTypes: () => [...accountingKeys.all, 'partner-types'] as const,
  bankAccounts: () => [...accountingKeys.all, 'bank-accounts'] as const,
  cashFunds: () => [...accountingKeys.all, 'cash-funds'] as const,
  journal: (params?: JournalEntryQuery) => [...accountingKeys.all, 'journal', params] as const,
  accounts: () => [...accountingKeys.all, 'accounts'] as const,
  rules: () => [...accountingKeys.all, 'rules'] as const,
  vouchers: () => [...accountingKeys.all, 'vouchers'] as const,
  cashflow: (type?: string) => [...accountingKeys.all, 'cashflow', type] as const,
  receivables: () => [...accountingKeys.all, 'receivables'] as const,
  payables: () => [...accountingKeys.all, 'payables'] as const,
}

export const useAccountingAccountTypesQuery = () =>
  useQuery({ queryKey: accountingKeys.accountTypes(), queryFn: () => accountingApi.getAccountTypes() })

export const useAccountingDocumentTypesQuery = () =>
  useQuery({ queryKey: accountingKeys.documentTypes(), queryFn: () => accountingApi.getDocumentTypes() })

export const useAccountingPartnerTypesQuery = () =>
  useQuery({ queryKey: accountingKeys.partnerTypes(), queryFn: () => accountingApi.getPartnerTypes() })

export const useAccountingBankAccountsQuery = () =>
  useQuery({ queryKey: accountingKeys.bankAccounts(), queryFn: () => accountingApi.getBankAccounts() })

export const useAccountingCashFundsQuery = () =>
  useQuery({ queryKey: accountingKeys.cashFunds(), queryFn: () => accountingApi.getCashFunds() })

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
