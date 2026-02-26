import { Command } from "commander";
import { fetchCandles } from "../core/marketdata/ccxtFetch.js";
import { readCache, writeCache } from "../core/marketdata/cache.js";
import { oracleBound } from "../core/analysis/oracleBound.js";
import type { CommonOptions } from "../core/types.js";

export const boundCommand = new Command("bound")
  .description("Calculate the oracle upper bound (theoretical maximum return)")
  .argument("<symbol>", "Trading pair (e.g., BTC/USDT)")
  .option("-e, --exchange <name>", "Exchange to use", "binance")
  .option("-t, --tf <timeframe>", "Candle timeframe", "1h")
  .option("-f, --from <iso>", "Start date (ISO format)")
  .option("-T, --to <iso>", "End date (ISO format)")
  .option("-j, --json", "Output as JSON", false)
  .action(async (symbol: string, options: CommonOptions) => {
    const { exchange, tf, from, to, json } = options;

    if (!from || !to) {
      console.error("Error: --from and --to are required");
      process.exit(1);
    }

    const fromMs = new Date(from).getTime();
    const toMs = new Date(to).getTime();

    if (isNaN(fromMs) || isNaN(toMs)) {
      console.error("Error: Invalid date format. Use ISO format (e.g., 2024-01-01)");
      process.exit(1);
    }

    try {
      let candles = readCache(exchange, symbol, tf, fromMs, toMs);

      if (!candles) {
        if (!json) {
          console.log(`Fetching ${symbol} ${tf} candles from ${exchange}...`);
        }
        candles = await fetchCandles(exchange, symbol, tf, fromMs, toMs);
        writeCache(exchange, symbol, tf, fromMs, toMs, candles);
      }

      if (candles.length === 0) {
        console.error("Error: No candles found for the specified period");
        process.exit(1);
      }

      const result = oracleBound(candles);

      if (!result) {
        if (json) {
          console.log(JSON.stringify({ error: "Insufficient data" }));
        } else {
          console.log("Insufficient data for analysis");
        }
        return;
      }

      if (json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log("\nOracle Bound Analysis");
        console.log("─".repeat(40));
        console.log(`Symbol:         ${symbol}`);
        console.log(`Exchange:       ${exchange}`);
        console.log(`Timeframe:      ${tf}`);
        console.log(`Period:         ${from} to ${to}`);
        console.log(`Candles:        ${result.totalCandles}`);
        console.log(`Positive moves: ${result.positiveMovesCount}`);
        console.log("─".repeat(40));
        console.log(`Oracle Bound:   ${result.oracleBound.toFixed(2)}%`);
        console.log(`Buy & Hold:     ${result.buyAndHold.toFixed(2)}%`);
        console.log("─".repeat(40));
        const multiplier = result.oracleBound / Math.max(result.buyAndHold, 0.01);
        console.log(`Multiplier:     ${multiplier.toFixed(2)}x vs buy & hold`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (json) {
        console.log(JSON.stringify({ error: message }));
      } else {
        console.error(`Error: ${message}`);
      }
      process.exit(1);
    }
  });
