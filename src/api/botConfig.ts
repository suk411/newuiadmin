import axiosInstance from './axiosInstance'

export interface BotConfig {
  ownerIds: string[]
  allowedUserIds: string[]
  allowedGroupIds: string[]
}

export interface BotConfigResponse {
  success: boolean
  data: BotConfig
}

export async function fetchBotConfig(): Promise<BotConfig> {
  const res = await axiosInstance.get<BotConfigResponse>('/bot-config')
  return res.data.data
}

export async function updateBotConfig(config: BotConfig): Promise<BotConfig> {
  const res = await axiosInstance.put<BotConfigResponse>('/bot-config', config)
  return res.data.data
}
