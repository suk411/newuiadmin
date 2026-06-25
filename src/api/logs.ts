import axiosInstance from './axiosInstance'

export interface LogEntry {
  level: string
  message: string
  timestamp: string
}

export async function fetchLogs(level?: string, since?: string, limit?: number): Promise<LogEntry[]> {
  const params: Record<string, string | number> = {}
  if (level) params.level = level
  if (since) params.since = since
  if (limit) params.limit = limit
  const res = await axiosInstance.get('/logs', { params })
  return res.data
}
