/**
 * 服务端内存 LRU 缓存
 *
 * - 线程安全（Node.js 单线程无竞态，但 get/set 为原子操作）
 * - LRU 淘汰：超过 maxSize 时淘汰最久未访问的条目
 * - TTL 过期：条目创建/更新后超过 ttl 毫秒视为过期，get 时自动删除
 */

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

export class LRUCache<V = unknown> {
  private readonly map = new Map<string, CacheEntry<V>>();
  private readonly maxSize: number;
  private readonly defaultTtl: number;

  /**
   * @param maxSize  最大条目数（超出时淘汰 20% 最旧的条目）
   * @param ttl      默认过期时间（毫秒），0 表示永不过期
   */
  constructor(maxSize = 100, ttl = 0) {
    this.maxSize = maxSize;
    this.defaultTtl = ttl;
  }

  // ─── 公共方法 ──────────────────────────────────────────────────────

  get(key: string): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;

    // 检查过期
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }

    // LRU：删除后重新插入（保持在迭代器末尾）
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key: string, value: V, ttl?: number): void {
    // 如果键已存在，先删除以保持 LRU 顺序
    if (this.map.has(key)) {
      this.map.delete(key);
    }

    const expiresAt = ttl !== undefined
      ? Date.now() + ttl
      : this.defaultTtl
        ? Date.now() + this.defaultTtl
        : 0;

    this.map.set(key, { value, expiresAt });

    // 超出容量，淘汰最旧的条目（迭代器第一个）
    if (this.map.size > this.maxSize) {
      const deleteCount = Math.ceil(this.maxSize * 0.2); // 淘汰 20%
      const keysToDelete: string[] = [];
      for (const k of this.map.keys()) {
        if (keysToDelete.length >= deleteCount) break;
        keysToDelete.push(k);
      }
      for (const k of keysToDelete) {
        this.map.delete(k);
      }
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }
}
