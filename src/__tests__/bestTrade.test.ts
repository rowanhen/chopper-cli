import { describe, expect, test } from "bun:test";
import { bestSingleTrade } from "../core/analysis/bestTrade.js";
import {
  uptrendCandles,
  downtrendCandles,
  vShapeCandles,
  invertedVCandles,
  flatCandles,
  realisticCandles,
  singleCandle,
  emptyCandles,
} from "./fixtures.js";

describe("bestSingleTrade", () => {
  test("finds best trade in uptrend (buy first, sell last)", () => {
    const result = bestSingleTrade(uptrendCandles);

    expect(result).not.toBeNull();
    expect(result!.entryTs).toBe(1000);
    expect(result!.exitTs).toBe(5000);
    expect(result!.entryPrice).toBe(100);
    expect(result!.exitPrice).toBe(200);
    expect(result!.pctReturn).toBe(100); // 100% gain
    expect(result!.candlesBetween).toBe(4);
  });

  test("returns null for pure downtrend (no profitable trade)", () => {
    const result = bestSingleTrade(downtrendCandles);

    expect(result).toBeNull();
  });

  test("finds best trade in V-shape (buy at bottom)", () => {
    const result = bestSingleTrade(vShapeCandles);

    expect(result).not.toBeNull();
    expect(result!.entryTs).toBe(3000); // buy at 50
    expect(result!.exitTs).toBe(5000); // sell at 100
    expect(result!.entryPrice).toBe(50);
    expect(result!.exitPrice).toBe(100);
    expect(result!.pctReturn).toBe(100); // 100% gain
  });

  test("finds best trade in inverted V (buy early, sell at peak)", () => {
    const result = bestSingleTrade(invertedVCandles);

    expect(result).not.toBeNull();
    expect(result!.entryTs).toBe(1000); // buy at 100
    expect(result!.exitTs).toBe(3000); // sell at 200
    expect(result!.entryPrice).toBe(100);
    expect(result!.exitPrice).toBe(200);
    expect(result!.pctReturn).toBe(100);
  });

  test("returns null for flat price (no profit possible)", () => {
    const result = bestSingleTrade(flatCandles);

    expect(result).toBeNull();
  });

  test("works with realistic price data", () => {
    const result = bestSingleTrade(realisticCandles);

    expect(result).not.toBeNull();
    // Best trade: buy at trough (35000) sell at peak before it (45000) won't work
    // since peak comes before trough. Best is buy at trough, sell at end.
    // Actually best is: buy at 35000 (trough), but need to check what comes after
    // After trough: 38000, 40000, 42000 - so best exit is 42000
    // But wait, there's also the early move: 40000 -> 45000 = 12.5%
    // vs trough to end: 35000 -> 42000 = 20%
    // So best should be buy at 35000, sell at 42000
    expect(result!.entryPrice).toBe(35000);
    expect(result!.exitPrice).toBe(42000);
    expect(result!.pctReturn).toBeCloseTo(20, 1);
  });

  test("returns null for single candle", () => {
    const result = bestSingleTrade(singleCandle);

    expect(result).toBeNull();
  });

  test("returns null for empty array", () => {
    const result = bestSingleTrade(emptyCandles);

    expect(result).toBeNull();
  });

  test("handles two candles with profit", () => {
    const candles = [
      { timestamp: 1000, open: 100, high: 100, low: 100, close: 100, volume: 1000 },
      { timestamp: 2000, open: 100, high: 150, low: 100, close: 150, volume: 1000 },
    ];
    const result = bestSingleTrade(candles);

    expect(result).not.toBeNull();
    expect(result!.pctReturn).toBe(50);
  });

  test("handles two candles with loss", () => {
    const candles = [
      { timestamp: 1000, open: 100, high: 100, low: 100, close: 100, volume: 1000 },
      { timestamp: 2000, open: 100, high: 100, low: 50, close: 50, volume: 1000 },
    ];
    const result = bestSingleTrade(candles);

    expect(result).toBeNull();
  });

  describe("with maxCandles constraint", () => {
    test("finds best trade within candle limit", () => {
      // Uptrend: 100 -> 125 -> 150 -> 175 -> 200
      // With maxCandles=2, best is 150->200 (last 2 candles) = 33.3%
      // Or 175->200 = 14.3%
      // Actually let's trace: at each exit, find min in window
      // Exit at idx 2 (150): window [0,1,2], min at 0 (100), profit 50
      // Exit at idx 3 (175): window [1,2,3], min at 1 (125), profit 50
      // Exit at idx 4 (200): window [2,3,4], min at 2 (150), profit 50
      // All same profit, first one wins: entry at 100, exit at 150
      const result = bestSingleTrade(uptrendCandles, { maxCandles: 2 });

      expect(result).not.toBeNull();
      expect(result!.candlesBetween).toBeLessThanOrEqual(2);
      expect(result!.pctReturn).toBe(50); // 100 -> 150 = 50%
    });

    test("constrains to 1 candle window", () => {
      const result = bestSingleTrade(uptrendCandles, { maxCandles: 1 });

      expect(result).not.toBeNull();
      expect(result!.candlesBetween).toBe(1);
      // Each adjacent pair: 100->125 (25%), 125->150 (20%), 150->175 (16.7%), 175->200 (14.3%)
      // Best is first: 100->125 = 25%
      expect(result!.pctReturn).toBe(25);
    });

    test("returns null when maxCandles is 0", () => {
      const result = bestSingleTrade(uptrendCandles, { maxCandles: 0 });
      expect(result).toBeNull();
    });

    test("finds V-shape trade within constraint", () => {
      // V-shape: 100 -> 75 -> 50 -> 75 -> 100
      // With maxCandles=2: best is 50->100 at end = 100%
      const result = bestSingleTrade(vShapeCandles, { maxCandles: 2 });

      expect(result).not.toBeNull();
      expect(result!.candlesBetween).toBeLessThanOrEqual(2);
      expect(result!.entryPrice).toBe(50);
      expect(result!.exitPrice).toBe(100);
    });

    test("misses best trade when window too small", () => {
      // V-shape: 100 -> 75 -> 50 -> 75 -> 100
      // Best unconstrained: buy at 50 (idx 2), sell at 100 (idx 4) = 100%
      // With maxCandles=1, best is 50->75 (50%) or 75->100 (33%), so 50%
      const unconstrained = bestSingleTrade(vShapeCandles);
      const constrained = bestSingleTrade(vShapeCandles, { maxCandles: 1 });

      expect(unconstrained!.pctReturn).toBe(100);
      expect(constrained!.pctReturn).toBe(50);
      expect(constrained!.candlesBetween).toBe(1);
    });

    test("large maxCandles equals unconstrained", () => {
      const unconstrained = bestSingleTrade(uptrendCandles);
      const constrained = bestSingleTrade(uptrendCandles, { maxCandles: 100 });

      expect(constrained).toEqual(unconstrained);
    });
  });
});
