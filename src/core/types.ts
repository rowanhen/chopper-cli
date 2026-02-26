/**
 * OHLCV candle data structure
 */
export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Result of the best single trade analysis
 */
export interface BestTradeResult {
  entryTs: number;
  exitTs: number;
  entryPrice: number;
  exitPrice: number;
  pctReturn: number;
  candlesBetween: number;
}

/**
 * Options for best trade analysis
 */
export interface BestTradeOptions {
  maxCandles?: number;
}

/**
 * Result of the oracle bound analysis
 */
export interface OracleBoundResult {
  oracleBound: number;
  buyAndHold: number;
  totalCandles: number;
  positiveMovesCount: number;
}

/**
 * Result of the max drawdown analysis
 */
export interface MaxDrawdownResult {
  pct: number;
  peakTs: number;
  troughTs: number;
  peakPrice: number;
  troughPrice: number;
}

/**
 * Common CLI options across all commands
 */
export interface CommonOptions {
  exchange: string;
  tf: string;
  from: string;
  to: string;
  json: boolean;
}

/**
 * Result of entry timing analysis
 */
export interface EntryTimingResult {
  hourDistribution: number[];
  dayDistribution: number[];
  totalTrades: number;
  avgReturn: number;
  bestHours: { hour: number; count: number; avgReturn: number }[];
  bestDays: { day: number; count: number; avgReturn: number }[];
}
