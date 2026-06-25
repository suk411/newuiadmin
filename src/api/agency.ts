import axiosInstance from './axiosInstance'

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

export async function fetchAgencyDashboard(): Promise<AgencyStats> {
  const res = await axiosInstance.get('/agency/dashboard')
  return res.data
}

export async function fetchAgencyMembers(params: Record<string, string | number>): Promise<{ data: AgencyMember[]; total: number }> {
  const res = await axiosInstance.get('/agency/members', { params })
  const body = res.data
  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0 }
  }
  return { data: [], total: 0 }
}
