import type { Candle, BestTradeResult, BestTradeOptions } from "../types.js";

/**
 * Find the best single long trade (buy then sell) in a window using close prices.
 *
 * When maxCandles is not specified, uses O(n) algorithm tracking minimum price seen so far.
 * When maxCandles is specified, uses O(n) sliding window minimum with monotonic deque.
 *
 * @param candles - Array of OHLCV candles sorted by timestamp ascending
 * @param options - Optional constraints for the trade search
 * @returns Best trade result, or null if no profitable trade exists
 */
export function bestSingleTrade(
  candles: Candle[],
  options?: BestTradeOptions
): BestTradeResult | null {
  if (candles.length < 2) {
    return null;
  }

  const maxCandles = options?.maxCandles;

  if (maxCandles !== undefined && maxCandles < 1) {
    return null;
  }

  // Use constrained algorithm if maxCandles is specified
  if (maxCandles !== undefined) {
    return bestTradeConstrained(candles, maxCandles);
  }

  return bestTradeUnconstrained(candles);
}

/**
 * Unconstrained best trade - O(n) algorithm tracking global minimum
 */
function bestTradeUnconstrained(candles: Candle[]): BestTradeResult | null {
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
    candlesBetween: bestExit - bestEntry,
  };
}

/**
 * Constrained best trade - O(n) sliding window minimum using monotonic deque
 * Only considers trades where exit - entry <= maxCandles
 */
function bestTradeConstrained(
  candles: Candle[],
  maxCandles: number
): BestTradeResult | null {
  // Monotonic deque storing indices, front has the minimum price in window
  const deque: number[] = [];
  let maxProfit = 0;
  let bestEntry = 0;
  let bestExit = 0;

  for (let i = 0; i < candles.length; i++) {
    // Remove indices outside the window (entry must be within maxCandles of current position)
    // Entry at index j is valid for exit at i if i - j <= maxCandles, so j >= i - maxCandles
    while (deque.length > 0 && deque[0] < i - maxCandles) {
      deque.shift();
    }

    // Check profit if we exit at current candle (only if we have valid entries)
    if (deque.length > 0) {
      const minIdx = deque[0];
      const profit = candles[i].close - candles[minIdx].close;
      if (profit > maxProfit) {
        maxProfit = profit;
        bestEntry = minIdx;
        bestExit = i;
      }
    }

    // Add current index to deque, removing larger elements from back
    while (
      deque.length > 0 &&
      candles[deque[deque.length - 1]].close >= candles[i].close
    ) {
      deque.pop();
    }
    deque.push(i);
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
    candlesBetween: bestExit - bestEntry,
  };
}
