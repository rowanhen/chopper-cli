import type { Candle, OracleBoundResult } from "../types.js";
import { buyAndHold } from "./buyHold.js";

/**
 * Calculate the oracle upper bound - the theoretical maximum return
 * achievable with perfect foresight and unlimited trades.
 *
 * This is computed as: exp(sum of positive log returns) - 1
 * Where log return = ln(price[i] / price[i-1])
 *
 * @param candles - Array of OHLCV candles sorted by timestamp ascending
 * @returns Oracle bound result with both oracle and buy-and-hold returns
 */
export function oracleBound(candles: Candle[]): OracleBoundResult | null {
  if (candles.length < 2) {
    return null;
  }

  let sumPositiveLogReturns = 0;
  let positiveMovesCount = 0;

  for (let i = 1; i < candles.length; i++) {
    const prevClose = candles[i - 1].close;
    const currClose = candles[i].close;

    if (prevClose > 0 && currClose > 0) {
      const logReturn = Math.log(currClose / prevClose);
      if (logReturn > 0) {
        sumPositiveLogReturns += logReturn;
        positiveMovesCount++;
      }
    }
  }

  const oracleBoundPct = (Math.exp(sumPositiveLogReturns) - 1) * 100;
  const buyAndHoldPct = buyAndHold(candles);

  return {
    oracleBound: oracleBoundPct,
    buyAndHold: buyAndHoldPct ?? 0,
    totalCandles: candles.length,
    positiveMovesCount,
  };
}
