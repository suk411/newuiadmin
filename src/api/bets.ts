import axiosInstance from './axiosInstance'

export interface ProviderBet {
  userId: number
  game: string
  amount: number
  payout: number
  turnover: number
  gameId: string
  product: string
  member: string
  status: number
  settleTime: string
  createdAt: string
}

export interface WingoBet {
  userId: string
  game: string
  gameMode: string
  amount: number
  realAmount: number
  fee: number
  payout: number
  selectType: string
  issueNumber: string
  orderNumber: string
  result: {
    number: string
    colour: string
    profitAmount: number
  }
  status: string
  mobile: string
  settleTime: string
  createdAt: string
}

export interface BetSummary {
  totalAmount: number
  totalPayout: number
}

interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  summary: BetSummary
}

async function fetchList<T>(url: string, params: Record<string, string | number>): Promise<ListResponse<T>> {
  const res = await axiosInstance.get(url, { params })
  const body = res.data
  return {
    data: Array.isArray(body.data) ? body.data : [],
    total: body.total ?? 0,
    page: body.page ?? 1,
    summary: body.summary ?? { totalAmount: 0, totalPayout: 0 },
  }
}

export async function fetchProviderBets(params: Record<string, string | number>): Promise<ListResponse<ProviderBet>> {
  return fetchList<ProviderBet>('/bets/provider', params)
}

export async function fetchWingoBets(params: Record<string, string | number>): Promise<ListResponse<WingoBet>> {
  return fetchList<WingoBet>('/bets/wingo', params)
}

export interface DailyStatWingo {
  betCount: number
  totalBets: number
  totalPayout: number
  wonCount: number
  lostCount: number
}

export interface DailyStatProvider {
  betCount: number
  totalBets: number
  totalPayout: number
  netPL: number
}

export interface DailyStat {
  date: string
  wingo: DailyStatWingo
  provider: DailyStatProvider
}

export async function fetchDailyStats(params: Record<string, string | number>): Promise<{ data: DailyStat[]; total: number; page: number }> {
  const res = await axiosInstance.get('/bets/daily-stats', { params })
  const body = res.data
  return {
    data: Array.isArray(body.data) ? body.data : [],
    total: body.total ?? 0,
    page: body.page ?? 1,
  }
}