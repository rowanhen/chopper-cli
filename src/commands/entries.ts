import { Command } from "commander";
import { fetchCandles } from "../core/marketdata/ccxtFetch.js";
import { readCache, writeCache } from "../core/marketdata/cache.js";
import { analyzeEntryTiming } from "../core/analysis/entryTiming.js";
import type { CommonOptions } from "../core/types.js";

interface EntriesCommandOptions extends CommonOptions {
  window: string;
  step: string;
  maxCandles?: string;
}

export const entriesCommand = new Command("entries")
  .description("Analyze entry timing patterns for best trades")
  .argument("<symbol>", "Trading pair (e.g., BTC/USDT)")
  .option("-e, --exchange <name>", "Exchange to use", "binance")
  .option("-t, --tf <timeframe>", "Candle timeframe", "1h")
  .option("-f, --from <iso>", "Start date (ISO format)")
  .option("-T, --to <iso>", "End date (ISO format)")
  .option("-w, --window <n>", "Window size in candles", "24")
  .option("-s, --step <n>", "Step size between windows", "1")
  .option("-n, --max-candles <n>", "Max candles per trade")
  .option("-j, --json", "Output as JSON", false)
  .action(async (symbol: string, options: EntriesCommandOptions) => {
    const {
      exchange,
      tf,
      from,
      to,
      json,
      window: windowStr,
      step: stepStr,
      maxCandles: maxCandlesStr,
    } = options;

    if (!from || !to) {
      console.error("Error: --from and --to are required");
      process.exit(1);
    }

    const fromMs = new Date(from).getTime();
    const toMs = new Date(to).getTime();

    if (isNaN(fromMs) || isNaN(toMs)) {
      console.error(
        "Error: Invalid date format. Use ISO format (e.g., 2024-01-01)"
      );
      process.exit(1);
    }

    const windowSize = parseInt(windowStr, 10);
    const stepSize = parseInt(stepStr, 10);
    const maxCandles = maxCandlesStr ? parseInt(maxCandlesStr, 10) : undefined;

    if (isNaN(windowSize) || windowSize < 2) {
      console.error("Error: --window must be at least 2");
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

      if (candles.length < windowSize) {
        console.error(
          `Error: Not enough candles (${candles.length}) for window size (${windowSize})`
        );
        process.exit(1);
      }

      const result = analyzeEntryTiming(
        candles,
        windowSize,
        stepSize,
        maxCandles
      );

      if (!result) {
        if (json) {
          console.log(JSON.stringify({ error: "No trades found" }));
        } else {
          console.log("No profitable trades found in the analysis windows");
        }
        return;
      }

      if (json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        console.log("\nEntry Timing Analysis");
        console.log("─".repeat(50));
        console.log(`Symbol:       ${symbol}`);
        console.log(`Exchange:     ${exchange}`);
        console.log(`Timeframe:    ${tf}`);
        console.log(`Period:       ${from} to ${to}`);
        console.log(`Window:       ${windowSize} candles`);
        console.log(`Total trades: ${result.totalTrades}`);
        console.log(`Avg return:   ${result.avgReturn.toFixed(2)}%`);

        console.log("\n─".repeat(50));
        console.log("Best Entry Hours (UTC)");
        console.log("─".repeat(50));
        for (const h of result.bestHours) {
          const pct = ((h.count / result.totalTrades) * 100).toFixed(1);
          const bar = "█".repeat(Math.round(h.count / result.totalTrades * 20));
          console.log(
            `${h.hour.toString().padStart(2, "0")}:00  ${bar.padEnd(20)} ${h.count} (${pct}%) avg: ${h.avgReturn.toFixed(2)}%`
          );
        }

        console.log("\n─".repeat(50));
        console.log("Entry Distribution by Day");
        console.log("─".repeat(50));
        for (const d of result.bestDays) {
          const pct = ((d.count / result.totalTrades) * 100).toFixed(1);
          const bar = "█".repeat(Math.round(d.count / result.totalTrades * 20));
          console.log(
            `${dayNames[d.day].padEnd(3)}  ${bar.padEnd(20)} ${d.count} (${pct}%) avg: ${d.avgReturn.toFixed(2)}%`
          );
        }

        // Show hour histogram
        console.log("\n─".repeat(50));
        console.log("24-Hour Distribution");
        console.log("─".repeat(50));
        const maxCount = Math.max(...result.hourDistribution);
        for (let h = 0; h < 24; h++) {
          const count = result.hourDistribution[h];
          const barLen = maxCount > 0 ? Math.round((count / maxCount) * 30) : 0;
          const bar = "▓".repeat(barLen);
          console.log(`${h.toString().padStart(2, "0")} ${bar}`);
        }
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
