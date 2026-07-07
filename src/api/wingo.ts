import axiosInstance from './axiosInstance'
import { check, required, numeric, min, max, oneOf } from '../utils/validate'

const WINGO_MODES = ['30s', '1m', '3m', '5m'] as const
const RESULT_MODES = ['RANDOM', 'MAX_PROFIT', 'MAX_LOSS'] as const

export interface RoundResult {
  number: number | null
  color: string | null
  size: string | null
}

export interface CurrentRound {
  issueNumber: string
  gameMode: string
  status: string
  startTime: number
  endTime: number
  result: RoundResult
  resultMode: string
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
  result: RoundResult
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
  check('mode', mode, oneOf(WINGO_MODES))
  const res = await axiosInstance.get('/current-round', { params: { mode } })
  return res.data
}

export async function fetchCurrentRoundBets(mode = '30s', page = 1, limit = 50): Promise<{ data: CurrentRoundBetsItem[]; total: number }> {
  check('mode', mode, oneOf(WINGO_MODES))
  check('limit', limit, numeric(), min(1), max(100))
  const res = await axiosInstance.get('/current-round/bets', { params: { mode, page, limit } })
  const body = res.data
  return { data: body.items ?? body.data ?? [], total: body.total ?? 0 }
}

export async function fetchSettledRounds(mode = '30s', page = 1, limit = 25): Promise<{ data: SettledRound[]; total: number }> {
  check('mode', mode, oneOf(WINGO_MODES))
  check('limit', limit, numeric(), min(1), max(50))
  const res = await axiosInstance.get('/rounds', { params: { mode, page, limit } })
  const body = res.data
  return { data: body.items ?? body.data ?? [], total: body.total ?? 0 }
}

export async function fetchRoundStats(issueNumber: string): Promise<RoundDetail> {
  check('issueNumber', issueNumber, required())
  const res = await axiosInstance.get(`/round-stats/${issueNumber}`)
  return res.data
}

export async function fetchResultMode(mode = '30s'): Promise<{ mode: string }> {
  check('mode', mode, oneOf(WINGO_MODES))
  const res = await axiosInstance.get('/result-mode', { params: { mode } })
  return res.data
}

export async function setResultMode(mode: string, gameMode = '30s'): Promise<{ currentIssue: string; applyIssue: string }> {
  check('mode', mode, required(), oneOf(RESULT_MODES))
  check('gameMode', gameMode, oneOf(WINGO_MODES))
  const res = await axiosInstance.post('/result-mode', { mode, gameMode })
  return res.data
}
