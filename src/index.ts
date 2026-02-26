// Core analysis functions
export { bestSingleTrade } from "./core/analysis/bestTrade.js";
export { oracleBound } from "./core/analysis/oracleBound.js";
export { maxDrawdown } from "./core/analysis/maxDrawdown.js";
export { buyAndHold } from "./core/analysis/buyHold.js";
export { analyzeEntryTiming } from "./core/analysis/entryTiming.js";

// Market data
export { fetchCandles, getSupportedExchanges } from "./core/marketdata/ccxtFetch.js";
export { readCache, writeCache } from "./core/marketdata/cache.js";

// Types
export type {
  Candle,
  BestTradeResult,
  BestTradeOptions,
  OracleBoundResult,
  MaxDrawdownResult,
  CommonOptions,
  EntryTimingResult,
} from "./core/types.js";
