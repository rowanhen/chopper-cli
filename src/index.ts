// Core analysis functions
export { bestSingleTrade } from "./core/analysis/bestTrade.js";
export { oracleBound } from "./core/analysis/oracleBound.js";
export { maxDrawdown } from "./core/analysis/maxDrawdown.js";
export { buyAndHold } from "./core/analysis/buyHold.js";

// Market data
export { fetchCandles, getSupportedExchanges } from "./core/marketdata/ccxtFetch.js";
export { readCache, writeCache } from "./core/marketdata/cache.js";

// Types
export type {
  Candle,
  BestTradeResult,
  OracleBoundResult,
  MaxDrawdownResult,
  CommonOptions,
} from "./core/types.js";
