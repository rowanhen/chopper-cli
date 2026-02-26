import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Candle } from "../types.js";

const CACHE_DIR = join(homedir(), ".chopper", "cache");

/**
 * Get cache file path for a specific request
 */
function getCachePath(
  exchange: string,
  symbol: string,
  timeframe: string,
  fromMs: number,
  toMs: number
): string {
  const safeSymbol = symbol.replace(/\//g, "-");
  const filename = `${exchange}_${safeSymbol}_${timeframe}_${fromMs}-${toMs}.json`;
  return join(CACHE_DIR, filename);
}

/**
 * Ensure cache directory exists
 */
function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Read candles from cache if available
 */
export function readCache(
  exchange: string,
  symbol: string,
  timeframe: string,
  fromMs: number,
  toMs: number
): Candle[] | null {
  const cachePath = getCachePath(exchange, symbol, timeframe, fromMs, toMs);

  if (!existsSync(cachePath)) {
    return null;
  }

  try {
    const data = readFileSync(cachePath, "utf-8");
    return JSON.parse(data) as Candle[];
  } catch {
    return null;
  }
}

/**
 * Write candles to cache
 */
export function writeCache(
  exchange: string,
  symbol: string,
  timeframe: string,
  fromMs: number,
  toMs: number,
  candles: Candle[]
): void {
  ensureCacheDir();
  const cachePath = getCachePath(exchange, symbol, timeframe, fromMs, toMs);

  try {
    writeFileSync(cachePath, JSON.stringify(candles), "utf-8");
  } catch {
    // Silently fail on cache write errors
  }
}
