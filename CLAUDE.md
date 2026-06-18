# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read AGENTS.md first

**[AGENTS.md](./AGENTS.md) is the single source of truth for working in this repository** — project overview, structure, data layer, business flow, API style, response shapes, LOT rules, commands, verification, deployment, and security. It is the shared, cross-agent guide (Claude Code, Codex, and others), so guidance lives there once instead of being duplicated and drifting out of sync.

Before doing any work here, read [AGENTS.md](./AGENTS.md) and follow it. Everything that used to be in this file now lives there.

## Commands (quick reference)

```bash
npm run dev         # development server with hot-reload (nodemon)
npm start           # production server
npm run mock:seed   # reset all mock data to seed state
npm run mock:smoke  # smoke-test the running API
```

The server runs on port `3001` by default (`PORT` env var). CORS defaults to `http://localhost:5173` (`CORS_ORIGIN` env var). For everything else, see [AGENTS.md](./AGENTS.md).
