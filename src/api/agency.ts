import axiosInstance from './axiosInstance'

export interface AgencyStats {
  totalAgents: number
  totalCommission: number
  activeAgents: number
}

export interface AgencyMember {
  id: string
  name: string
  commission: number
  status: string
  joinedAt: string
}

export async function fetchAgencyDashboard(): Promise<AgencyStats> {
  const res = await axiosInstance.get('/agency/dashboard')
  return res.data
}

export async function fetchAgencyMembers(params: Record<string, string | number>): Promise<{ data: AgencyMember[]; total: number }> {
  const res = await axiosInstance.get('/agency/members', { params })
  const body = res.data
  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0 }
  }
  return { data: [], total: 0 }
}

/* ── Agency Level Configs ── */

export interface AgencyLevelConfig {
  _id: string
  level: number
  minMembers: number
  minBets: number
  minDeposit: number
  l1Rate: number
  l2Rate: number
  l3Rate: number
  createdAt: string
  updatedAt: string
}

export async function fetchAgencyLevels(): Promise<AgencyLevelConfig[]> {
  const res = await axiosInstance.get('/agency-levels')
  return res.data.configs ?? []
}

export async function updateAgencyLevel(level: number, data: Partial<AgencyLevelConfig>): Promise<AgencyLevelConfig> {
  const res = await axiosInstance.put(`/agency-levels/${level}`, data)
  return res.data.config
}

/* ── Team Stats ── */

export interface TeamStats {
  team: { l1: number; l2: number; l3: number; total: number }
  firstDeposit: { count: number; totalAmount: number }
  deposits: { totalAmount: number; totalCount: number } & Record<string, { amount: number; count: number }>
  withdrawals: { totalAmount: number; totalCount: number } & Record<string, { amount: number; count: number }>
}

export async function fetchTeamStats(params: { userId: string; tier?: string; dateFrom?: string; dateTo?: string }): Promise<TeamStats> {
  const res = await axiosInstance.get('/agent/team-stats', { params })
  return res.data
}
