# chopper

Cryptocurrency trade analysis CLI and library.

## Installation

```bash
npm install -g chopper
```

Or use with npx:

```bash
npx chopper best BTC/USDT --from 2024-01-01 --to 2024-06-01
```

## CLI Commands

### `chopper best <symbol>`

Find the best single long trade (buy then sell) in a time window.

```bash
chopper best BTC/USDT --from 2024-01-01 --to 2024-06-01
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

## Library Usage

```typescript
import {
  bestSingleTrade,
  oracleBound,
  maxDrawdown,
  fetchCandles,
  type Candle,
} from "chopper";

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
const bound = oracleBound(candles);
const dd = maxDrawdown(candles);

console.log(best);  // { entryTs, exitTs, entryPrice, exitPrice, pctReturn }
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
