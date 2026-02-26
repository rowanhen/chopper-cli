import { describe, expect, test } from "bun:test";
import { oracleBound } from "../core/analysis/oracleBound.js";
import {
  uptrendCandles,
  downtrendCandles,
  vShapeCandles,
  alternatingCandles,
  flatCandles,
  realisticCandles,
  singleCandle,
  emptyCandles,
} from "./fixtures.js";

describe("oracleBound", () => {
  test("calculates oracle bound for uptrend", () => {
    const result = oracleBound(uptrendCandles);

    expect(result).not.toBeNull();
    // All moves are positive in uptrend
    expect(result!.oracleBound).toBeGreaterThan(0);
    expect(result!.buyAndHold).toBe(100); // 100 -> 200 = 100%
    expect(result!.positiveMovesCount).toBe(4); // 4 positive moves
    expect(result!.totalCandles).toBe(5);
  });

  test("oracle bound equals buy-and-hold for pure uptrend", () => {
    const result = oracleBound(uptrendCandles);

    expect(result).not.toBeNull();
    // For a pure uptrend, oracle bound ≈ buy and hold (compounding vs simple)
    // Oracle uses log returns compounded: exp(sum(ln(p[i]/p[i-1]))) - 1
    // For 100->125->150->175->200:
    // ln(125/100) + ln(150/125) + ln(175/150) + ln(200/175) = ln(200/100) = ln(2)
    // exp(ln(2)) - 1 = 1 = 100%
    expect(result!.oracleBound).toBeCloseTo(100, 1);
  });

  test("oracle bound is 0 for pure downtrend", () => {
    const result = oracleBound(downtrendCandles);

    expect(result).not.toBeNull();
    // No positive moves in downtrend
    expect(result!.oracleBound).toBe(0);
    expect(result!.buyAndHold).toBe(-50); // 200 -> 100 = -50%
    expect(result!.positiveMovesCount).toBe(0);
  });

  test("oracle bound exceeds buy-and-hold for V-shape", () => {
    const result = oracleBound(vShapeCandles);

    expect(result).not.toBeNull();
    // Buy and hold: 100 -> 100 = 0%
    // Oracle captures the upswing: 50 -> 75 -> 100
    expect(result!.buyAndHold).toBe(0);
    expect(result!.oracleBound).toBeGreaterThan(0);
    expect(result!.positiveMovesCount).toBe(2); // two positive moves in recovery
  });

  test("oracle bound is much higher for alternating prices", () => {
    const result = oracleBound(alternatingCandles);

    expect(result).not.toBeNull();
    // Buy and hold: 100 -> 110 = 10%
    // Oracle captures every up move: 100->110, 100->110, 100->110 (3 times)
    // Each up move is ln(110/100) ≈ 0.0953
    // Sum = 3 * 0.0953 ≈ 0.286
    // exp(0.286) - 1 ≈ 0.331 = 33.1%
    expect(result!.buyAndHold).toBe(10);
    expect(result!.oracleBound).toBeGreaterThan(30);
    expect(result!.positiveMovesCount).toBe(3);
  });

  test("oracle bound is 0 for flat prices", () => {
    const result = oracleBound(flatCandles);

    expect(result).not.toBeNull();
    expect(result!.oracleBound).toBe(0);
    expect(result!.buyAndHold).toBe(0);
    expect(result!.positiveMovesCount).toBe(0);
  });

  test("works with realistic data", () => {
    const result = oracleBound(realisticCandles);

    expect(result).not.toBeNull();
    expect(result!.totalCandles).toBe(12);
    // Should have some positive moves
    expect(result!.positiveMovesCount).toBeGreaterThan(0);
    // Oracle should beat buy-and-hold
    expect(result!.oracleBound).toBeGreaterThan(result!.buyAndHold);
  });

  test("returns null for single candle", () => {
    const result = oracleBound(singleCandle);

    expect(result).toBeNull();
  });

  test("returns null for empty array", () => {
    const result = oracleBound(emptyCandles);

    expect(result).toBeNull();
  });

  test("handles two candles correctly", () => {
    const candles = [
      { timestamp: 1000, open: 100, high: 100, low: 100, close: 100, volume: 1000 },
      { timestamp: 2000, open: 100, high: 110, low: 100, close: 110, volume: 1000 },
    ];
    const result = oracleBound(candles);

    expect(result).not.toBeNull();
    expect(result!.buyAndHold).toBe(10);
    expect(result!.positiveMovesCount).toBe(1);
    // Oracle bound should equal buy and hold for single positive move
    expect(result!.oracleBound).toBeCloseTo(10, 1);
  });
});
