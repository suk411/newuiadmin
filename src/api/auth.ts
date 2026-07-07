import axios from 'axios'
import { check, required } from '../utils/validate'

const LOGIN_URL = 'https://backend-ledger-0ra6.onrender.com/api/auth/login'

export interface LoginResponse {
  user: { id: number; admin: boolean }
  msg: string
  status: string
  token: string
}

export async function loginAdmin(mobile: string, password: string): Promise<LoginResponse> {
  check('mobile', mobile, required())
  check('password', password, required())
  const { data } = await axios.post<LoginResponse>(LOGIN_URL, { mobile, password })
  return data
}
