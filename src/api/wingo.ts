import axiosInstance from './axiosInstance'

export interface WingoStats {
  totalBets: number
  totalPayout: number
  activeUsers: number
}

export interface WingoGame {
  id: string
  issueNumber: string
  result: string
  totalBets: number
  status: string
  createdAt: string
}

export async function fetchWingoDashboard(): Promise<WingoStats> {
  const res = await axiosInstance.get('/wingo/dashboard')
  return res.data
}

export async function fetchWingoGames(params: Record<string, string | number>): Promise<{ data: WingoGame[]; total: number }> {
  const res = await axiosInstance.get('/wingo/games', { params })
  const body = res.data
  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0 }
  }
  return { data: [], total: 0 }
}
