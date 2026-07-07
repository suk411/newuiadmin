import axiosInstance from './axiosInstance'
import { check, oneOf } from '../utils/validate'

export interface DashboardOverview {
  totalUsers: number
  newUsers: number
}

export interface DepositSummary {
  total: number
  count: number
  pendingCount: number
}

export interface WithdrawalBucket {
  count: number
  total: number
  chargeTotal: number
}

export interface WithdrawalByStatusEntry {
  count: number
  total: number
}

export interface WithdrawalSummary {
  total: number
  chargeTotal: number
  count: number
  success: WithdrawalBucket
  pending: WithdrawalBucket
  failed: WithdrawalBucket
  byStatus: Record<string, WithdrawalByStatusEntry>
}

export interface AgentCommission {
  total: number
  count: number
}

export interface TrendPoint {
  date: string
  amount?: number
  count?: number
}

export interface Trends {
  granularity: 'hourly' | 'daily' | 'monthly'
  deposits: TrendPoint[]
  withdrawals: TrendPoint[]
  signups: TrendPoint[]
  netCashflow: TrendPoint[]
}

export interface DistributionItem {
  channel?: string
  method?: string
  status?: string
  type?: string
  level?: string
  count: number
  amount?: number
  chargeTotal?: number
}

export interface KPI {
  avgDepositAmount: number
  avgWithdrawalAmount: number
  depositSuccessRate: number
  withdrawalSuccessRate: number
  activeUsers: number
  usersWhoDeposited: number
  repeatDepositors: number
  pendingQueueAging: PendingQueueBucket[]
}

export interface PendingQueueBucket {
  bucket: string
  count: number
}

export interface PlatformInfo {
  totalBalance: number
  totalWithdrawable: number
  pendingTurnover: number
}

export interface DashboardResponse {
  status: string
  period: string
  overview: DashboardOverview
  deposits: DepositSummary
  withdrawals: WithdrawalSummary
  agentCommission: AgentCommission
  trends: Trends
  distributions: {
    depositsByChannel: DistributionItem[]
    withdrawalsByMethod: DistributionItem[]
    depositByStatus: DistributionItem[]
    withdrawalByStatus: DistributionItem[]
    usersByVipLevel: DistributionItem[]
    usersByStatus: DistributionItem[]
    transactionTypes: DistributionItem[]
  }
  kpi: KPI
  platform: PlatformInfo
}

export async function fetchDashboard(period?: string, date?: string): Promise<DashboardResponse> {
  if (period) check('period', period, oneOf(['today', 'month']))
  const params: Record<string, string> = {}
  if (period) params.period = period
  if (date) params.date = date
  const res = await axiosInstance.get('/dashboard', { params })
  return res.data
}
