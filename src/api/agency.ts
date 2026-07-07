import axiosInstance from './axiosInstance'
import { check, required, numeric, min, max, oneOf } from '../utils/validate'

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
  check('level', level, required(), numeric(), min(0), max(10))
  const res = await axiosInstance.put(`/agency-levels/${level}`, data)
  return res.data.config
}

/* ── Team Stats ── */

export interface TierAmount {
  totalAmount: number
  totalCount: number
}

export interface TeamStats {
  team: { l1: number; l2: number; l3: number; total: number }
  firstDeposit: { l1: TierAmount; l2: TierAmount; l3: TierAmount }
  deposits: { l1: TierAmount; l2: TierAmount; l3: TierAmount }
  withdrawals: { l1: TierAmount; l2: TierAmount; l3: TierAmount }
}

export async function fetchTeamStats(params: Record<string, string>): Promise<TeamStats> {
  check('userId', params.userId, required(), numeric())
  const res = await axiosInstance.get('/agent/team-stats', { params })
  return res.data
}

/* ── Team Members ── */

export interface TeamMember {
  userId: number
  registeredAt: string
  level: string
  totalDeposit: number
  totalWithdrawal: number
  balance: number
  bindBank: boolean
  multipleIp: boolean
}

export interface TeamMembersResponse {
  status: string
  userId: number
  total: number
  page: number
  limit: number
  items: TeamMember[]
}

export async function fetchTeamMembers(params: Record<string, string | number>): Promise<TeamMembersResponse> {
  check('userId', params.userId, required(), numeric())
  if (params.tier) check('tier', params.tier, oneOf(['L1', 'L2', 'L3']))
  check('limit', params.limit, numeric(), min(1), max(100))
  const res = await axiosInstance.get('/agent/team-members', { params })
  return res.data
}

/* ── Agent Commission ── */

export interface AgentCommissionRecord {
  userId: number
  date: string
  rebateLevel: number
  l1Bets: number
  l2Bets: number
  l3Bets: number
  l1Rate: number
  l2Rate: number
  l3Rate: number
  l1Amount: number
  l2Amount: number
  l3Amount: number
  totalAmount: number
  status: string
  creditedAt: string
}

export interface AgentCommissionResponse {
  status: string
  total: number
  page: number
  limit: number
  data: AgentCommissionRecord[]
}

export async function fetchAgentCommission(params: Record<string, string | number>): Promise<AgentCommissionResponse> {
  check('userId', params.userId, required(), numeric())
  const res = await axiosInstance.get('/agent/agentcomm', { params })
  return res.data
}

/* ── Commission Rank ── */

export interface CommissionRankRecord {
  rank: number
  userId: number
  date: string
  rebateLevel: number
  l1Bets: number
  l2Bets: number
  l3Bets: number
  totalComm: number
}

export interface CommissionRankSummary {
  totalComm: number
  highestAmount: number
  totalAgents: number
}

export interface CommissionRankResponse {
  status: string
  total: number
  page: number
  limit: number
  data: CommissionRankRecord[]
  summary: CommissionRankSummary
}

export async function fetchCommissionRanks(params: Record<string, string | number>): Promise<CommissionRankResponse> {
  check('limit', params.limit, numeric(), min(1), max(100))
  const res = await axiosInstance.get('/agent/commision-records', { params })
  return res.data
}

/* ── Midnight Calc ── */

export interface MidnightCalcResponse {
  status: string
  processed: number
  totalCommission: number
}

export async function runMidnightCalc(): Promise<MidnightCalcResponse> {
  const res = await axiosInstance.post('/agent/runmidnightcalc')
  return res.data
}
