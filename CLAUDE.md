# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build
npm run build          # Compile TypeScript to ./dist/

# Test
npm test               # Run all tests with coverage (requires .env file)
npm run test:ci        # Run tests for CI (no .env required)

# Run a single test file
npx jest tests/run/yepcodeRun.test.ts

# Lint
npm run lint           # Check for lint errors
npm run lint:fix       # Auto-fix lint errors
```

Tests require a `.env` file with `YEPCODE_*` credentials to run against the real API.

## Architecture

This is a zero-dependency TypeScript SDK for the YepCode Cloud API. It requires Node.js >= 18 (uses native `fetch`). Output is compiled CommonJS to `./dist/`.

### Public surface (`src/index.ts`)

Four exported classes:
- **`YepCodeRun`** — Execute JavaScript/Python code in isolated YepCode sandboxes. Creates processes (deduplicated by SHA256 hash of code), executes them, and returns `Execution` instances.
- **`YepCodeEnv`** — CRUD for team-level environment variables with auto-pagination.
- **`YepCodeStorage`** — Upload/list/download/delete files (accepts `File`, `Blob`, or `Readable` streams).
- **`YepCodeApi`** — Raw HTTP client exposing the full REST API (processes, executions, schedules, modules, sandboxes, service accounts).

### Key internals

**`src/api/yepcodeApi.ts`** — The core HTTP client (~820 lines). Handles:
- Auth via API token, client credentials (OAuth), or direct access token
- Auto-refresh of expired access tokens
- All REST endpoints as typed methods

**`src/run/execution.ts`** — Wraps a running execution with adaptive polling:
- 250ms × 4, then 500ms × 8, then 1000ms thereafter
- Logs polled every 2s or on completion
- Event callbacks: `onLog`, `onFinish`, `onError`

**`src/api/configManager.ts`** — Reads `YEPCODE_API_TOKEN`, `YEPCODE_CLIENT_ID`, `YEPCODE_CLIENT_SECRET`, `YEPCODE_TEAM_ID`, `YEPCODE_ACCESS_TOKEN`, `YEPCODE_API_HOST` from the environment.

**`src/utils/languageDetector.ts`** — Regex/scoring-based JS vs Python detection used when language is not specified explicitly.

## OpenAPI spec

The live spec is always available at:
```
https://cloud.yepcode.io/api/rest/public/api-docs
```

Fetch it with `WebFetch` to audit which endpoints are missing from `src/api/yepcodeApi.ts` before adding new ones. New endpoints are deployed to that URL before this SDK is updated.
