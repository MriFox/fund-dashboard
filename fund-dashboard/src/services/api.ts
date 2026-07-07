import { API_BASE_URL } from '@/utils/constants'

/** 统一 API 错误类 */
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiResponse<T> {
  code: number
  data: T
  message: string
  timestamp: number
}

const DEFAULT_TIMEOUT = 5_000 // 5s
const MAX_RETRIES = 1         // 最多重试 1 次

/**
 * 带超时的 fetch 封装
 * 超时 → 自动重试 1 次 → 失败抛出 ApiError
 */
export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`

  const doFetch = async (): Promise<T> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new ApiError(res.status, `HTTP ${res.status}: ${res.statusText}`)
      }

      const json: ApiResponse<T> = await res.json()

      if (json.code !== 0) {
        throw new ApiError(json.code, json.message || '接口返回错误')
      }

      return json.data
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (err instanceof ApiError) throw err
      if (err.name === 'AbortError') {
        throw new ApiError(1002, '请求超时')
      }
      throw new ApiError(1001, err.message || '网络错误')
    }
  }

  // 首次请求
  try {
    return await doFetch()
  } catch (err) {
    // 最多重试 1 次
    if (MAX_RETRIES > 0) {
      return await doFetch()
    }
    throw err
  }
}
