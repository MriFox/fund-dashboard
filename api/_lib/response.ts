/**
 * 统一响应格式化工具
 *
 * 所有 API 端点使用 { code, data, message, timestamp } 格式
 * 成功: success(data) → { code: 0, data, message: 'ok', timestamp }
 * 失败: error(code, msg) → { code, data: null, message: msg, timestamp }
 */

import type { VercelResponse } from '@vercel/node';

// ─── 类型 ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

// ─── 工厂函数 ────────────────────────────────────────────────────────

export function success<T>(data: T, message = 'ok'): ApiResponse<T> {
  return { code: 0, data, message, timestamp: Date.now() };
}

export function error(code: number, message: string): ApiResponse<null> {
  return { code, data: null, message, timestamp: Date.now() };
}

// ─── 快捷发送（带可选 Cache-Control） ─────────────────────────────────

export function sendJson<T>(
  res: VercelResponse,
  body: ApiResponse<T>,
  cacheControl?: string,
): void {
  if (cacheControl) {
    res.setHeader('Cache-Control', cacheControl);
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const statusCode = body.code === 0 ? 200 : 400;
  res.status(statusCode).json(body);
}
