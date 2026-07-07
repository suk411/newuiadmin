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

export interface WithdrawalSummary {
  total: number
  chargeTotal: number
  count: number
  success: WithdrawalBucket
  pending: WithdrawalBucket
  failed: WithdrawalBucket
  byStatus: Record<string, unknown>
}

export interface AgentCommission {
  total: number
  count: number
}

export interface DashboardResponse {
  status: string
  period: string
  overview: DashboardOverview
  deposits: DepositSummary
  withdrawals: WithdrawalSummary
  agentCommission: AgentCommission
}

export async function fetchDashboard(period: string): Promise<DashboardResponse> {
  check('period', period, oneOf(['today', 'month']))
  const params: Record<string, string> = { period }
  const res = await axiosInstance.get('/dashboard', { params })
  return res.data
}
