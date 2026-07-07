import axiosInstance from './axiosInstance'
import { check, required } from '../utils/validate'

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
  check('ownerIds', config.ownerIds, required())
  check('allowedUserIds', config.allowedUserIds, required())
  check('allowedGroupIds', config.allowedGroupIds, required())
  const res = await axiosInstance.put<BotConfigResponse>('/bot-config', config)
  return res.data.data
}
