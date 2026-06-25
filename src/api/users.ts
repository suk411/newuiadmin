import axiosInstance from './axiosInstance'

export interface DeviceInfo {
  ip: string
  city: string
  region: string
}

export interface UserData {
  userId: number
  mobile: string
  admin: boolean
  createdAt: string
  updatedAt: string
  vipLevel: string
  vipSince: string
  totalDeposits: number
  status: string
  statusRemark: string
  balance: number
  withdrawable: number
  turnover_requirement: number
  total_turnover_completed: number
  lastIp: string
  deviceInfo: DeviceInfo | null
}

export async function searchUser(userId: string): Promise<UserData> {
  const res = await axiosInstance.get('/user', { params: { userId } })
  const body = res.data.data ?? res.data
  return { ...body.user, ...body.account, lastIp: body.lastIp ?? '', deviceInfo: body.deviceInfo ?? null }
}

export async function searchUserByMobile(mobile: string): Promise<UserData> {
  const res = await axiosInstance.get('/user', { params: { mobile } })
  const body = res.data.data ?? res.data
  return { ...body.user, ...body.account, lastIp: body.lastIp ?? '', deviceInfo: body.deviceInfo ?? null }
}

export async function updateUserStatus(data: { userId: number; status: string }): Promise<void> {
  await axiosInstance.patch('/user', data)
}

export async function updateUserPayments(data: Record<string, unknown>): Promise<void> {
  await axiosInstance.put('/user/payments', data)
}

export async function fetchUsersByIp(ip: string): Promise<UserData[]> {
  const res = await axiosInstance.get('/users-by-ip', { params: { ip } })
  return res.data
}
