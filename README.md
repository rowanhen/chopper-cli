# @shepherd-terminal/chopper

Cryptocurrency trade analysis CLI and library.

## Installation

```bash
npm install -g @shepherd-terminal/chopper
```

Or use with npx:

```bash
npx @shepherd-terminal/chopper best BTC/USDT --from 2024-01-01 --to 2024-06-01
```

## CLI Commands

### `chopper best <symbol>`

Find the best single long trade (buy then sell) in a time window.

```bash
chopper best BTC/USDT --from 2024-01-01 --to 2024-06-01
```

Constrain to trades within a time window using `--max-candles`:

```bash
# Best trade within any 24h window (using 1m candles for accuracy)
chopper best BTC/USDT -t 1m --from 2024-01-01 --to 2024-01-07 --max-candles 1440

# Best trade within any 7-day window
chopper best ETH/USDT -t 1h --from 2024-01-01 --to 2024-03-01 --max-candles 168
```

### `chopper bound <symbol>`

Calculate the oracle upper bound - the theoretical maximum return achievable with perfect foresight and unlimited trades.

```bash
chopper bound BTC/USDT --tf 1d --from 2020-01-01 --to 2024-01-01 --json
```

### `chopper dd <symbol>`

Calculate max drawdown over a time window.

```bash
chopper dd BTC/USDT --tf 4h --from 2023-01-01 --to 2023-12-31
```

## Common Options

| Option | Description | Default |
|--------|-------------|---------|
| `-e, --exchange <name>` | Exchange to use | `binance` |
| `-t, --tf <timeframe>` | Candle timeframe | `1h` |
| `-f, --from <iso>` | Start date (ISO format) | required |
| `-T, --to <iso>` | End date (ISO format) | required |
| `-j, --json` | Output as JSON | `false` |

### Best Command Options

| Option | Description |
|--------|-------------|
| `-n, --max-candles <n>` | Max candles between entry and exit (constrains trade duration) |

## Library Usage

```typescript
import {
  bestSingleTrade,
  oracleBound,
  maxDrawdown,
  fetchCandles,
  type Candle,
} from "@shepherd-terminal/chopper";

// Fetch candles
const candles = await fetchCandles(
  "binance",
  "BTC/USDT",
  "1h",
  Date.parse("2024-01-01"),
  Date.parse("2024-06-01")
);

// Analyze
const best = bestSingleTrade(candles);
const bestConstrained = bestSingleTrade(candles, { maxCandles: 24 }); // within 24 candles
const bound = oracleBound(candles);
const dd = maxDrawdown(candles);

console.log(best);  // { entryTs, exitTs, entryPrice, exitPrice, pctReturn, candlesBetween }
console.log(bound); // { oracleBound, buyAndHold, totalCandles, positiveMovesCount }
console.log(dd);    // { pct, peakTs, troughTs, peakPrice, troughPrice }
```

## Development

```bash
# Install dependencies
bun install

# Run in development
bun run dev best BTC/USDT --from 2024-01-01 --to 2024-02-01

# Build
bun run build

# Release (creates tag, publishes to npm)
bun run release
```

## License

MIT
