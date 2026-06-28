import axiosInstance from './axiosInstance'

export interface CurrentRound {
  issueNumber: string
  gameMode: string
  status: string
  startTime: number
  endTime: number
}

export interface RoundBreakdown {
  red: number
  green: number
  violet: number
  big: number
  small: number
  [key: string]: number
}

export interface RoundStats {
  totalBets: number
  totalBetAmount: number
  uniqueUsers: number
  breakdown: RoundBreakdown
}

export interface CurrentRoundBetsItem {
  _id: string
  userId: string
  issueNumber: string
  orderNumber: string
  betAmount: number
  fee: number
  selectType: string
  status: string
  result: number | null
  mobile?: string
  createdAt: string
}

export interface SettledRoundStats {
  totalBets: number
  totalBetAmount: number
  totalPayout: number
  wonCount: number
  lostCount: number
}

export interface SettledRound {
  issueNumber: string
  result: number
  resultMode: string
  status: string
  startTime: number
  endTime: number
  createdAt: string
  stats: SettledRoundStats
}

export interface RoundDetailStats {
  totalBets: number
  totalBetAmount: number
  totalPayout: number
  profitLoss: number
  wonCount: number
  lostCount: number
  uniqueUsers: number
  breakdown: Record<string, { count: number; amount: number }>
}

export interface RoundDetail {
  issue: { issueNumber: string; gameMode: string }
  stats: RoundDetailStats
}

export async function fetchCurrentRound(mode = '30s'): Promise<{ round: CurrentRound; stats: RoundStats }> {
  const res = await axiosInstance.get('/wingo/admin/current-round', { params: { mode } })
  return res.data
}

export async function fetchCurrentRoundBets(mode = '30s', page = 1, limit = 50): Promise<{ data: CurrentRoundBetsItem[]; total: number }> {
  const res = await axiosInstance.get('/wingo/admin/current-round/bets', { params: { mode, page, limit } })
  const body = res.data
  return { data: body.items ?? body.data ?? [], total: body.total ?? 0 }
}

export async function fetchSettledRounds(mode = '30s', page = 1, limit = 25): Promise<{ data: SettledRound[]; total: number }> {
  const res = await axiosInstance.get('/wingo/admin/rounds', { params: { mode, page, limit } })
  const body = res.data
  return { data: body.items ?? body.data ?? [], total: body.total ?? 0 }
}

export async function fetchRoundStats(issueNumber: string): Promise<RoundDetail> {
  const res = await axiosInstance.get(`/wingo/admin/round-stats/${issueNumber}`)
  return res.data
}

export async function fetchResultMode(mode = '30s'): Promise<{ mode: string }> {
  const res = await axiosInstance.get('/wingo/admin/result-mode', { params: { mode } })
  return res.data
}

export async function setResultMode(mode: string, gameMode = '30s'): Promise<{ currentIssue: string; applyIssue: string }> {
  const res = await axiosInstance.post('/wingo/admin/result-mode', { mode, gameMode })
  return res.data
}
