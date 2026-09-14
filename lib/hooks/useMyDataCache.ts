"use client";

import { enrollmentApi, sessionApi } from "@/lib/api";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 30_000;
const FETCH_TIMEOUT_MS = 5000;

function readCache<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

function writeCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), FETCH_TIMEOUT_MS)),
    ]);
  } catch {
    return fallback;
  }
}

export async function getCachedEnrollments(force = false) {
  if (!force) {
    const cached = readCache<any[]>("my.enrollments");
    if (cached) return cached;
  }
  const res = await withTimeout(enrollmentApi.getMine(), { data: { enrollments: [] } });
  const items = res.data?.enrollments || [];
  writeCache("my.enrollments", items);
  return items;
}

export async function getCachedSessions(force = false) {
  if (!force) {
    const cached = readCache<any[]>("my.sessions");
    if (cached) return cached;
  }
  const res = await withTimeout(sessionApi.getMine(), { data: { sessions: [] } });
  const items = res.data?.sessions || [];
  writeCache("my.sessions", items);
  return items;
}

export function invalidateMyDataCache(keys?: Array<"enrollments" | "sessions">) {
  if (!keys || keys.length === 0) {
    cache.delete("my.enrollments");
    cache.delete("my.sessions");
    return;
  }
  if (keys.includes("enrollments")) cache.delete("my.enrollments");
  if (keys.includes("sessions")) cache.delete("my.sessions");
}
