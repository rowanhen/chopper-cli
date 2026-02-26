import ccxt, { type Exchange } from "ccxt";
import type { Candle } from "../types.js";

type ExchangeConstructor = new (config: { enableRateLimit: boolean }) => Exchange;

/**
 * Fetch OHLCV candles from an exchange using ccxt with pagination.
 *
 * @param exchangeId - Exchange identifier (e.g., 'binance')
 * @param symbol - Trading pair (e.g., 'BTC/USDT')
 * @param timeframe - Candle timeframe (e.g., '1h', '1d')
 * @param fromMs - Start timestamp in milliseconds
 * @param toMs - End timestamp in milliseconds
 * @returns Array of candles sorted by timestamp ascending
 */
export async function fetchCandles(
  exchangeId: string,
  symbol: string,
  timeframe: string,
  fromMs: number,
  toMs: number
): Promise<Candle[]> {
  if (!ccxt.exchanges.includes(exchangeId)) {
    throw new Error(`Exchange '${exchangeId}' not found in ccxt`);
  }

  const ExchangeClass = (ccxt as unknown as Record<string, ExchangeConstructor>)[exchangeId];
  const exchange = new ExchangeClass({
    enableRateLimit: true,
  });

  const allCandles: Candle[] = [];
  let since = fromMs;
  const limit = 1000;

  while (since < toMs) {
    const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, since, limit);

    if (ohlcv.length === 0) {
      break;
    }

    for (const candle of ohlcv) {
      const [timestamp, open, high, low, close, volume] = candle;
      if (
        timestamp !== undefined &&
        open !== undefined &&
        high !== undefined &&
        low !== undefined &&
        close !== undefined &&
        volume !== undefined &&
        timestamp >= fromMs &&
        timestamp <= toMs
      ) {
        allCandles.push({
          timestamp,
          open,
          high,
          low,
          close,
          volume,
        });
      }
    }

    const lastTimestamp = ohlcv[ohlcv.length - 1][0];
    if (lastTimestamp === undefined || lastTimestamp <= since) {
      break;
    }

    since = lastTimestamp + 1;
  }

  // Sort by timestamp and remove duplicates
  const seen = new Set<number>();
  return allCandles
    .filter((c) => {
      if (seen.has(c.timestamp)) return false;
      seen.add(c.timestamp);
      return true;
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get list of supported exchanges
 */
export function getSupportedExchanges(): string[] {
  return ccxt.exchanges;
}
