import axiosInstance from './axiosInstance'

export interface UserData {
  userId: number
  mobile: string
  name: string
  status: string
  balance: number
  createdAt: string
}

export async function searchUser(userId: string): Promise<UserData> {
  const res = await axiosInstance.get('/user', { params: { userId } })
  return res.data.data ?? res.data
}

export async function searchUserByMobile(mobile: string): Promise<UserData> {
  const res = await axiosInstance.get('/user', { params: { mobile } })
  return res.data.data ?? res.data
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
