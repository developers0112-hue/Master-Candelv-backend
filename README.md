# Binary Market Intelligence

Backend foundation for a research and simulation platform that can route work across up to 500 specialized analytical agents without starting 500 processes per request.

## Current implementation

- Capability-based agent registry with explicit lifecycle states.
- Dynamic relevance routing by timeframe and market regime.
- Bounded asynchronous worker pool (`maxConcurrency`, 1-500).
- Per-agent timeout, retry, and failure isolation.
- Structured, versioned evidence with dataset and feature provenance.
- Weighted evidence aggregation and contradiction detection.
- Fail-safe `NO_SIGNAL` gates for poor data, insufficient evidence, failures, disagreement, and calibration failure.
- HTTP endpoints: `GET /health` and `POST /api/v1/analysis`.
- Development adapters are explicitly `UNDER_REVIEW` and return `UNVERIFIED`; they are not market data or model metrics.

## Commands

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

`npm run dev` is not yet wired to a long-running server command; run `node dist/src/server.js` after `npm run build`.

## Architecture

The registry stores metadata and executable adapters, not processes. A request selects only active or degraded agents whose capabilities match the request. The orchestrator schedules selected agents through a bounded worker pool, so scaling the registry from 10 to 500 agents changes routing volume rather than process count. Redis-backed queues can be introduced behind the same execution boundary for long-running backtests and simulations.

Every execution records attempts, selected agents, failures, timestamps, versions, and evidence. Results are analytical only. No live trading or real-money execution is implemented.
