import axiosInstance from './axiosInstance'

export interface ProviderBet {
  id: string
  member: string
  site: string
  amount: number
  status: string
  createdAt: string
}

export interface WingoBet {
  id: string
  userId: number
  orderNumber: string
  issueNumber: string
  amount: number
  status: string
  createdAt: string
}

export async function fetchProviderBets(params: Record<string, string | number>): Promise<{ data: ProviderBet[]; total: number }> {
  const res = await axiosInstance.get('/game/all-bets', { params })
  const body = res.data
  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0 }
  }
  return { data: [], total: 0 }
}

export async function fetchWingoBets(params: Record<string, string | number>): Promise<{ data: WingoBet[]; total: number }> {
  const res = await axiosInstance.get('/wingo/all-bets', { params })
  const body = res.data
  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0 }
  }
  return { data: [], total: 0 }
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
  if (body.data && Array.isArray(body.data)) {
    return { data: body.data, total: body.total ?? 0, page: body.page ?? 1 }
  }
  return { data: [], total: 0, page: 1 }
}
