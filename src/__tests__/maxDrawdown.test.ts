import { describe, expect, test } from "bun:test";
import { maxDrawdown } from "../core/analysis/maxDrawdown.js";
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

describe("maxDrawdown", () => {
  test("returns null for pure uptrend (no drawdown)", () => {
    const result = maxDrawdown(uptrendCandles);

    // Pure uptrend has no drawdown
    expect(result).toBeNull();
  });

  test("calculates drawdown for pure downtrend", () => {
    const result = maxDrawdown(downtrendCandles);

    expect(result).not.toBeNull();
    // 200 -> 100 = 50% drawdown
    expect(result!.pct).toBe(50);
    expect(result!.peakTs).toBe(1000);
    expect(result!.troughTs).toBe(5000);
    expect(result!.peakPrice).toBe(200);
    expect(result!.troughPrice).toBe(100);
  });

  test("calculates drawdown for V-shape", () => {
    const result = maxDrawdown(vShapeCandles);

    expect(result).not.toBeNull();
    // 100 -> 50 = 50% drawdown
    expect(result!.pct).toBe(50);
    expect(result!.peakTs).toBe(1000);
    expect(result!.troughTs).toBe(3000);
    expect(result!.peakPrice).toBe(100);
    expect(result!.troughPrice).toBe(50);
  });

  test("calculates drawdown for inverted V", () => {
    const result = maxDrawdown(invertedVCandles);

    expect(result).not.toBeNull();
    // Peak at 200, trough at 100 = 50% drawdown
    expect(result!.pct).toBe(50);
    expect(result!.peakTs).toBe(3000);
    expect(result!.troughTs).toBe(5000);
    expect(result!.peakPrice).toBe(200);
    expect(result!.troughPrice).toBe(100);
  });

  test("returns null for flat prices (no drawdown)", () => {
    const result = maxDrawdown(flatCandles);

    expect(result).toBeNull();
  });

  test("works with realistic data", () => {
    const result = maxDrawdown(realisticCandles);

    expect(result).not.toBeNull();
    // Peak should be at 45000, trough at 35000
    expect(result!.peakPrice).toBe(45000);
    expect(result!.troughPrice).toBe(35000);
    // Drawdown: (45000 - 35000) / 45000 = 22.22%
    expect(result!.pct).toBeCloseTo(22.22, 1);
  });

  test("returns null for single candle", () => {
    const result = maxDrawdown(singleCandle);

    expect(result).toBeNull();
  });

  test("returns null for empty array", () => {
    const result = maxDrawdown(emptyCandles);

    expect(result).toBeNull();
  });

  test("handles multiple drawdowns and finds the largest", () => {
    // Two drawdowns: 100->80 (20%) and 90->60 (33%)
    const candles = [
      { timestamp: 1000, open: 100, high: 100, low: 100, close: 100, volume: 1000 },
      { timestamp: 2000, open: 100, high: 100, low: 80, close: 80, volume: 1000 },
      { timestamp: 3000, open: 80, high: 90, low: 80, close: 90, volume: 1000 },
      { timestamp: 4000, open: 90, high: 90, low: 60, close: 60, volume: 1000 },
      { timestamp: 5000, open: 60, high: 70, low: 60, close: 70, volume: 1000 },
    ];
    const result = maxDrawdown(candles);

    expect(result).not.toBeNull();
    // First peak is 100, lowest after is 60 = 40% drawdown
    expect(result!.peakPrice).toBe(100);
    expect(result!.troughPrice).toBe(60);
    expect(result!.pct).toBe(40);
  });

  test("handles new peak resetting drawdown tracking", () => {
    // Price goes up to new peak, then drops
    const candles = [
      { timestamp: 1000, open: 100, high: 100, low: 100, close: 100, volume: 1000 },
      { timestamp: 2000, open: 100, high: 150, low: 100, close: 150, volume: 1000 },
      { timestamp: 3000, open: 150, high: 150, low: 120, close: 120, volume: 1000 },
    ];
    const result = maxDrawdown(candles);

    expect(result).not.toBeNull();
    // Peak at 150, trough at 120 = 20% drawdown
    expect(result!.peakPrice).toBe(150);
    expect(result!.troughPrice).toBe(120);
    expect(result!.pct).toBe(20);
  });

  test("handles two candles with drawdown", () => {
    const candles = [
      { timestamp: 1000, open: 100, high: 100, low: 100, close: 100, volume: 1000 },
      { timestamp: 2000, open: 100, high: 100, low: 50, close: 50, volume: 1000 },
    ];
    const result = maxDrawdown(candles);

    expect(result).not.toBeNull();
    expect(result!.pct).toBe(50);
  });

  test("handles two candles without drawdown", () => {
    const candles = [
      { timestamp: 1000, open: 100, high: 100, low: 100, close: 100, volume: 1000 },
      { timestamp: 2000, open: 100, high: 150, low: 100, close: 150, volume: 1000 },
    ];
    const result = maxDrawdown(candles);

    expect(result).toBeNull();
  });
});
