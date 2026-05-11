# Nexus Terminal

Browser-based scientific command environment

 The Nexus Terminal gives authenticated users a live, interactive interface to the Nexus Language runtime — directly from the browser. Type pipeline expressions, inspect execution graphs, and see structured output (fits, plots, tables) side-by-side with the command input.

## Access

 The terminal is served at **[localhost:8000](http://localhost:8000)** when running locally. The production endpoint will be on the Calyr.aí / ASC Vienna infrastructure and will require ASC Vienna institutional login (OIDC / SSO).

## Authentication

| Mode | When | How to enable |
| --- | --- | --- |
| Local username / password | Development, self-hosted | Set LOCAL_USERS in .env |
| ASC Vienna SSO (OIDC) | Production (target) | Set OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET in .env |

 In production only ASC Vienna institutional login will be offered. Local credentials are for development and on-premises deployments only.

## Interface

 The page is a single-screen application — login and terminal share the same URL. After authentication the login overlay fades out and the workspace appears. No page reload occurs.

| Panel | Contents |
| --- | --- |
| Left — Nexus Language | xterm.js terminal. Type Nexus DSL expressions, press Enter to execute. |
| Right — Output | Structured results rendered as typed blocks: pipeline graph, fit parameters, P(r) plot, tables, log messages. |

## Quick example

```text
d@run042 > s > c > f@guinier
```

 Loads dataset `run042` from the warehouse, normalises the scattering signal, computes the pair-distance distribution P(r), and fits a Guinier model. Results appear as individual output blocks on the right.

## Running locally

```text
cd apps/terminal
cp .env.example .env          # set JWT_SECRET and LOCAL_USERS
source ../../.venv/bin/activate
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Open [http://localhost:8000](http://localhost:8000).

## Operator reference

| Operator | Argument | Description |
| --- | --- | --- |
| d | dataset key | Load a dataset from the warehouse |
| s | — | Normalise scattering intensity |
| c | — | Compute pair-distance distribution P(r) via indirect Fourier transform |
| f | model name | Fit — guinier supported; more models planned |
| n | — | Nexus operator — joint multi-instrument constraint coupling |

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| ↑ / ↓ | Browse command history |
| Ctrl-C | Cancel current input |
| Ctrl-L | Clear terminal (output panel unchanged) |
