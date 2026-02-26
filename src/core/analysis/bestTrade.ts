import type { Candle, BestTradeResult } from "../types.js";

/**
 * Find the best single long trade (buy then sell) in a window using close prices.
 * Uses O(n) algorithm tracking minimum price seen so far.
 *
 * @param candles - Array of OHLCV candles sorted by timestamp ascending
 * @returns Best trade result, or null if no profitable trade exists
 */
export function bestSingleTrade(candles: Candle[]): BestTradeResult | null {
  if (candles.length < 2) {
    return null;
  }

  let minPrice = candles[0].close;
  let minPriceIdx = 0;
  let maxProfit = 0;
  let bestEntry = 0;
  let bestExit = 0;

  for (let i = 1; i < candles.length; i++) {
    const currentPrice = candles[i].close;
    const profit = currentPrice - minPrice;

    if (profit > maxProfit) {
      maxProfit = profit;
      bestEntry = minPriceIdx;
      bestExit = i;
    }

    if (currentPrice < minPrice) {
      minPrice = currentPrice;
      minPriceIdx = i;
    }
  }

  if (maxProfit <= 0) {
    return null;
  }

  const entryPrice = candles[bestEntry].close;
  const exitPrice = candles[bestExit].close;
  const pctReturn = ((exitPrice - entryPrice) / entryPrice) * 100;

  return {
    entryTs: candles[bestEntry].timestamp,
    exitTs: candles[bestExit].timestamp,
    entryPrice,
    exitPrice,
    pctReturn,
  };
}
