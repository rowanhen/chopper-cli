import type { Candle } from "../types.js";

/**
 * Calculate the buy-and-hold return over a series of candles.
 * Simply computes (final_price - initial_price) / initial_price as percentage.
 *
 * @param candles - Array of OHLCV candles sorted by timestamp ascending
 * @returns Buy and hold percentage return, or null if insufficient data
 */
export function buyAndHold(candles: Candle[]): number | null {
  if (candles.length < 2) {
    return null;
  }

  const initialPrice = candles[0].close;
  const finalPrice = candles[candles.length - 1].close;

  if (initialPrice === 0) {
    return null;
  }

  return ((finalPrice - initialPrice) / initialPrice) * 100;
}
