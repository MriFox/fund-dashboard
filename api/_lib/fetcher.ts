/**
 * HTTP 请求封装
 *
 * - 5s 超时（AbortController）
 * - 1 次自动重试（仅对超时 / 网络错误重试）
 * - 自动清洗上游非标准格式（JSONP 回调包裹等）
 */

// ─── 自定义错误 ──────────────────────────────────────────────────────

export class FetchError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

// ─── 核心请求函数 ────────────────────────────────────────────────────

const TIMEOUT_MS = 5000;
const MAX_RETRIES = 1;

export async function fetchText(url: string): Promise<string> {
  return executeWithRetry(url, MAX_RETRIES);
}

async function executeWithRetry(url: string, retriesLeft: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://fund.eastmoney.com/',
      },
    });

    if (!res.ok) {
      throw new FetchError(1003, `上游返回 HTTP ${res.status}`);
    }

    const text = await res.text();
    return text;
  } catch (err: unknown) {
    if (err instanceof FetchError) throw err;

    // 超时
    if (err instanceof Error && err.name === 'AbortError') {
      if (retriesLeft > 0) {
        return executeWithRetry(url, retriesLeft - 1);
      }
      throw new FetchError(1002, '上游超时');
    }

    // 网络错误，重试一次
    if (retriesLeft > 0) {
      return executeWithRetry(url, retriesLeft - 1);
    }
    throw new FetchError(1003, `请求失败: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}

// ─── 响应清洗 ────────────────────────────────────────────────────────

/**
 * 清洗上游返回的文本，提取纯 JSON 部分。
 *
 * 天天基金/东方财富常见非标准格式：
 * 1. JSONP 回调：`jsonpgz({...})`
 * 2. JS 变量赋值：`var r = [...];`
 * 3. 带 BOM 头
 */
export function cleanJsonpResponse(text: string): string {
  let cleaned = text.trim();

  // 移除 UTF-8 BOM
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.slice(1);
  }

  // 处理 JSONP 回调包裹：jsonpgz({...}) 或 jQuery 回调
  const jsonpMatch = cleaned.match(/^[a-zA-Z_$][\w$.]*\((.*)\);?\s*$/s);
  if (jsonpMatch) {
    const inner = jsonpMatch[1].trim();
    // 确认内层是 JSON 对象
    if (inner.startsWith('{') || inner.startsWith('[')) {
      return inner;
    }
  }

  // 处理 JS 变量赋值：var r = [...];
  const varMatch = cleaned.match(/^(?:var\s+)?\w+\s*=\s*(\[.*]);?\s*$/s);
  if (varMatch) {
    return varMatch[1].trim();
  }

  return cleaned;
}

/**
 * 带清洗的标准 JSON 请求
 */
export async function fetchJson<T = unknown>(url: string): Promise<T> {
  const text = await fetchText(url);
  const cleaned = cleanJsonpResponse(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new FetchError(1003, `上游数据解析失败: 内容前 200 字符="${cleaned.slice(0, 200)}"`);
  }
}
