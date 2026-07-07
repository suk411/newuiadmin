import axiosInstance from './axiosInstance'
import { check, oneOf, max } from '../utils/validate'

export interface LogEntry {
  level: string
  message: string
  timestamp: string
}

export async function fetchLogs(level?: string, since?: string, limit?: number): Promise<LogEntry[]> {
  if (level) check('level', level, oneOf(['error', 'info', 'warn']))
  check('limit', limit, max(200))
  const params: Record<string, string | number> = {}
  if (level) params.level = level
  if (since) params.since = since
  if (limit) params.limit = limit
  const res = await axiosInstance.get('/logs', { params })
  return res.data
}
