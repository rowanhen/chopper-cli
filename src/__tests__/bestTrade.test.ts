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
});
