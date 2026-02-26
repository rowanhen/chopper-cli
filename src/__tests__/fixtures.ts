import type { Candle } from "../core/types.js";

/**
 * Helper to create a candle with defaults
 */
export function makeCandle(
  timestamp: number,
  close: number,
  open = close,
  high = close,
  low = close,
  volume = 1000
): Candle {
  return { timestamp, open, high, low, close, volume };
}

/**
 * Simple uptrend: prices go from 100 to 200 over 5 candles
 */
export const uptrendCandles: Candle[] = [
  makeCandle(1000, 100),
  makeCandle(2000, 125),
  makeCandle(3000, 150),
  makeCandle(4000, 175),
  makeCandle(5000, 200),
];

/**
 * Simple downtrend: prices go from 200 to 100 over 5 candles
 */
export const downtrendCandles: Candle[] = [
  makeCandle(1000, 200),
  makeCandle(2000, 175),
  makeCandle(3000, 150),
  makeCandle(4000, 125),
  makeCandle(5000, 100),
];

/**
 * V-shape: down then up (100 -> 50 -> 100)
 */
export const vShapeCandles: Candle[] = [
  makeCandle(1000, 100),
  makeCandle(2000, 75),
  makeCandle(3000, 50),
  makeCandle(4000, 75),
  makeCandle(5000, 100),
];

/**
 * Inverted V: up then down (100 -> 200 -> 100)
 */
export const invertedVCandles: Candle[] = [
  makeCandle(1000, 100),
  makeCandle(2000, 150),
  makeCandle(3000, 200),
  makeCandle(4000, 150),
  makeCandle(5000, 100),
];

/**
 * Flat: no change
 */
export const flatCandles: Candle[] = [
  makeCandle(1000, 100),
  makeCandle(2000, 100),
  makeCandle(3000, 100),
  makeCandle(4000, 100),
  makeCandle(5000, 100),
];

/**
 * Realistic BTC-like data with volatility
 * Simulates: 40000 -> peak 45000 -> trough 35000 -> recovery 42000
 */
export const realisticCandles: Candle[] = [
  makeCandle(1704067200000, 40000, 39500, 40500, 39000), // 2024-01-01
  makeCandle(1704153600000, 41000, 40000, 41500, 39800),
  makeCandle(1704240000000, 42500, 41000, 43000, 40500),
  makeCandle(1704326400000, 44000, 42500, 44500, 42000),
  makeCandle(1704412800000, 45000, 44000, 46000, 43500), // peak
  makeCandle(1704499200000, 43000, 45000, 45500, 42500),
  makeCandle(1704585600000, 40000, 43000, 43500, 39500),
  makeCandle(1704672000000, 37000, 40000, 40500, 36500),
  makeCandle(1704758400000, 35000, 37000, 37500, 34500), // trough
  makeCandle(1704844800000, 38000, 35000, 38500, 34800),
  makeCandle(1704931200000, 40000, 38000, 40500, 37500),
  makeCandle(1705017600000, 42000, 40000, 42500, 39500), // end
];

/**
 * Alternating up/down for oracle bound testing
 * 100 -> 110 -> 100 -> 110 -> 100 -> 110
 */
export const alternatingCandles: Candle[] = [
  makeCandle(1000, 100),
  makeCandle(2000, 110),
  makeCandle(3000, 100),
  makeCandle(4000, 110),
  makeCandle(5000, 100),
  makeCandle(6000, 110),
];

/**
 * Single candle (edge case)
 */
export const singleCandle: Candle[] = [makeCandle(1000, 100)];

/**
 * Empty array (edge case)
 */
export const emptyCandles: Candle[] = [];
