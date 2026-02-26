import type { Candle, MaxDrawdownResult } from "../types.js";

/**
 * Calculate the maximum drawdown over a series of candles using close prices.
 * Drawdown is the peak-to-trough decline during a specific period.
 *
 * @param candles - Array of OHLCV candles sorted by timestamp ascending
 * @returns Max drawdown result with peak and trough information
 */
export function maxDrawdown(candles: Candle[]): MaxDrawdownResult | null {
  if (candles.length < 2) {
    return null;
  }

  let peak = candles[0].close;
  let peakIdx = 0;
  let maxDd = 0;
  let maxDdPeakIdx = 0;
  let maxDdTroughIdx = 0;

  for (let i = 1; i < candles.length; i++) {
    const currentPrice = candles[i].close;

    if (currentPrice > peak) {
      peak = currentPrice;
      peakIdx = i;
    } else {
      const drawdown = (peak - currentPrice) / peak;
      if (drawdown > maxDd) {
        maxDd = drawdown;
        maxDdPeakIdx = peakIdx;
        maxDdTroughIdx = i;
      }
    }
  }

  if (maxDd === 0) {
    return null;
  }

  return {
    pct: maxDd * 100,
    peakTs: candles[maxDdPeakIdx].timestamp,
    troughTs: candles[maxDdTroughIdx].timestamp,
    peakPrice: candles[maxDdPeakIdx].close,
    troughPrice: candles[maxDdTroughIdx].close,
  };
}
