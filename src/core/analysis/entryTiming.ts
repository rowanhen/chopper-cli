import type { Candle, EntryTimingResult } from "../types.js";
import { bestSingleTrade } from "./bestTrade.js";

export type { EntryTimingResult };

interface TradeEntry {
  hour: number;
  day: number;
  pctReturn: number;
}

/**
 * Analyze entry timing patterns by finding best trades in rolling windows.
 *
 * @param candles - Array of OHLCV candles sorted by timestamp ascending
 * @param windowSize - Size of each analysis window in candles
 * @param stepSize - How many candles to advance between windows
 * @param maxCandles - Optional constraint on trade duration within each window
 */
export function analyzeEntryTiming(
  candles: Candle[],
  windowSize: number,
  stepSize: number = 1,
  maxCandles?: number
): EntryTimingResult | null {
  if (candles.length < windowSize) {
    return null;
  }

  const entries: TradeEntry[] = [];
  const hourReturns: number[][] = Array.from({ length: 24 }, () => []);
  const dayReturns: number[][] = Array.from({ length: 7 }, () => []);

  // Slide window across data
  for (let i = 0; i <= candles.length - windowSize; i += stepSize) {
    const window = candles.slice(i, i + windowSize);
    const trade = bestSingleTrade(window, { maxCandles });

    if (trade && trade.pctReturn > 0) {
      const entryDate = new Date(trade.entryTs);
      const hour = entryDate.getUTCHours();
      const day = entryDate.getUTCDay();

      entries.push({ hour, day, pctReturn: trade.pctReturn });
      hourReturns[hour].push(trade.pctReturn);
      dayReturns[day].push(trade.pctReturn);
    }
  }

  if (entries.length === 0) {
    return null;
  }

  // Build distributions
  const hourDistribution = hourReturns.map((r) => r.length);
  const dayDistribution = dayReturns.map((r) => r.length);

  const avgReturn =
    entries.reduce((sum, e) => sum + e.pctReturn, 0) / entries.length;

  // Find best hours (sorted by count)
  const bestHours = hourReturns
    .map((returns, hour) => ({
      hour,
      count: returns.length,
      avgReturn:
        returns.length > 0
          ? returns.reduce((a, b) => a + b, 0) / returns.length
          : 0,
    }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Find best days
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bestDays = dayReturns
    .map((returns, day) => ({
      day,
      count: returns.length,
      avgReturn:
        returns.length > 0
          ? returns.reduce((a, b) => a + b, 0) / returns.length
          : 0,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    hourDistribution,
    dayDistribution,
    totalTrades: entries.length,
    avgReturn,
    bestHours,
    bestDays,
  };
}
