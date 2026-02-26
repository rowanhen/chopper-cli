import { describe, expect, test } from "bun:test";
import { buyAndHold } from "../core/analysis/buyHold.js";
import {
  uptrendCandles,
  downtrendCandles,
  vShapeCandles,
  flatCandles,
  realisticCandles,
  singleCandle,
  emptyCandles,
} from "./fixtures.js";

describe("buyAndHold", () => {
  test("calculates positive return for uptrend", () => {
    const result = buyAndHold(uptrendCandles);

    expect(result).toBe(100); // 100 -> 200 = 100%
  });

  test("calculates negative return for downtrend", () => {
    const result = buyAndHold(downtrendCandles);

    expect(result).toBe(-50); // 200 -> 100 = -50%
  });

  test("calculates zero return for V-shape (same start/end)", () => {
    const result = buyAndHold(vShapeCandles);

    expect(result).toBe(0); // 100 -> 100 = 0%
  });

  test("calculates zero return for flat prices", () => {
    const result = buyAndHold(flatCandles);

    expect(result).toBe(0);
  });

  test("works with realistic data", () => {
    const result = buyAndHold(realisticCandles);

    expect(result).not.toBeNull();
    // 40000 -> 42000 = 5%
    expect(result).toBe(5);
  });

  test("returns null for single candle", () => {
    const result = buyAndHold(singleCandle);

    expect(result).toBeNull();
  });

  test("returns null for empty array", () => {
    const result = buyAndHold(emptyCandles);

    expect(result).toBeNull();
  });

  test("handles large gains correctly", () => {
    const candles = [
      { timestamp: 1000, open: 10, high: 10, low: 10, close: 10, volume: 1000 },
      { timestamp: 2000, open: 10, high: 100, low: 10, close: 100, volume: 1000 },
    ];
    const result = buyAndHold(candles);

    expect(result).toBe(900); // 10 -> 100 = 900%
  });

  test("handles large losses correctly", () => {
    const candles = [
      { timestamp: 1000, open: 100, high: 100, low: 100, close: 100, volume: 1000 },
      { timestamp: 2000, open: 100, high: 100, low: 10, close: 10, volume: 1000 },
    ];
    const result = buyAndHold(candles);

    expect(result).toBe(-90); // 100 -> 10 = -90%
  });

  test("handles fractional returns", () => {
    const candles = [
      { timestamp: 1000, open: 100, high: 100, low: 100, close: 100, volume: 1000 },
      { timestamp: 2000, open: 100, high: 105, low: 100, close: 105, volume: 1000 },
    ];
    const result = buyAndHold(candles);

    expect(result).toBe(5); // 100 -> 105 = 5%
  });

  test("returns null for zero initial price", () => {
    const candles = [
      { timestamp: 1000, open: 0, high: 0, low: 0, close: 0, volume: 1000 },
      { timestamp: 2000, open: 100, high: 100, low: 100, close: 100, volume: 1000 },
    ];
    const result = buyAndHold(candles);

    expect(result).toBeNull();
  });
});
