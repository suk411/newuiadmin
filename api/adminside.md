# Wingo Game API - Admin Side (Admin Backend)

## Base URL

```
https://admin-backend-7lwn.onrender.com/api/admin
```

## Authentication

All admin endpoints require Bearer token with admin privileges:

```
Authorization: Bearer <admin_token>
```

## Game Modes

Most admin endpoints support filtering by game mode via `?mode=` query parameter (defaults to `30s`):

| Mode | Duration | Game Code | Issue Example |
|------|----------|-----------|---------------|
| `30s` | 30 sec | `WinGo_30S` | `20260628000001` |
| `1m` | 1 min | `WinGo_1M` | `1M_20260628000001` |
| `3m` | 3 min | `WinGo_3M` | `3M_20260628000001` |
| `5m` | 5 min | `WinGo_5M` | `5M_20260628000001` |

Issue numbers for non-30s modes are prefixed with the mode (e.g., `1M_`, `3M_`, `5M_`).

---

## Result Generation Mode

Each game mode has its own independent result mode (RANDOM, MAX_PROFIT, MAX_LOSS).

### Get Current Mode

```
GET /api/admin/result-mode?mode=30s
```

**Query Params:** `mode` (optional, default: `30s`)

**Response:**
```json
{
  "success": true,
  "mode": "RANDOM"
}
```

### Set Mode

```
POST /api/admin/result-mode
```

**Body:**
```json
{
  "mode": "MAX_PROFIT",
  "gameMode": "30s"
}
```

| Param | Type | Required | Description |
|-------|------|---------|-------------|
| mode | string | Yes | `RANDOM`, `MAX_PROFIT`, or `MAX_LOSS` |
| gameMode | string | No | Target game mode (`30s`, `1m`, `3m`, `5m`). Defaults to `30s`. |

| Result Mode | Description |
|------|-------------|
| `RANDOM` | Truly random result |
| `MAX_PROFIT` | Generates result for maximum platform profit |
| `MAX_LOSS` | Generates result for maximum platform loss |

**Response:**
```json
{
  "success": true,
  "currentIssue": "1M_20260628000001",
  "applyIssue": "1M_20260628000002"
}
```

---

## Current Round Info

```
GET /api/admin/current-round?mode=30s
```

Returns current round with bet type breakdown for the specified game mode.

**Query Params:** `mode` (optional, default: `30s`)

**Response:**
```json
{
  "success": true,
  "round": {
    "issueNumber": "20260628000002",
    "gameMode": "30s",
    "status": "open",
    "startTime": 1777274790000,
    "endTime": 1777274820000
  },
  "stats": {
    "totalBets": 150,
    "totalBetAmount": 50000,
    "uniqueUsers": 42,
    "breakdown": {
      "red": 10000,
      "green": 15000,
      "violet": 5000,
      "big": 10000,
      "small": 10000,
      "0": 0, "1": 0, "2": 0, "3": 0, "4": 0,
      "5": 0, "6": 0, "7": 0, "8": 0, "9": 0
    }
  }
}
```

---

## Current Round Bets

```
GET /api/admin/current-round/bets?page=1&limit=50&mode=30s
```

Returns all bets for the current round with user mobile numbers.

**Query Params:** `mode` (optional, default: `30s`), `page` (default: 1), `limit` (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "page": 1,
  "limit": 50,
  "total": 150,
  "issueNumber": "20260628000002",
  "items": [
    {
      "_id": "...",
      "userId": "123456",
      "mobile": "9876543210",
      "orderNumber": "WGO1712345678901",
      "betAmount": 100,
      "fee": 0,
      "selectType": "green",
      "status": "pending",
      "result": null,
      "createdAt": "2026-03-19T10:30:00.000Z"
    }
  ]
}
```

---

## Round Stats

```
GET /api/admin/round-stats/:issueNumber
```

Full stats for a specific round with profit/loss calculation. The game mode is inferred from the issue number prefix (e.g., `1M_` prefix = 1m mode, no prefix = 30s).

**Response:**
```json
{
  "success": true,
  "issue": { "issueNumber": "1M_20260628000001", "gameMode": "1m" },
  "stats": {
    "totalBets": 150,
    "totalBetAmount": 50000,
    "totalPayout": 30000,
    "profitLoss": 20000,
    "wonCount": 60,
    "lostCount": 90,
    "uniqueUsers": 42,
    "breakdown": {
      "red": { "count": 30, "amount": 10000 },
      "green": { "count": 40, "amount": 15000 },
      "violet": { "count": 20, "amount": 5000 },
      "big": { "count": 30, "amount": 10000 },
      "small": { "count": 30, "amount": 10000 }
    }
  }
}
```

---

## Settled Rounds

```
GET /api/admin/rounds?page=1&limit=25&mode=30s
```

Paginated list of settled rounds with per-round stats for the specified game mode.

**Query Params:** `mode` (optional, default: `30s`), `page` (default: 1), `limit` (default: 25, max: 50)

**Response:**
```json
{
  "success": true,
  "page": 1,
  "limit": 25,
  "total": 200,
  "items": [
    {
      "issueNumber": "20260628000001",
      "result": 5,
      "resultMode": "RANDOM",
      "status": "settled",
      "startTime": 1777274790000,
      "endTime": 1777274820000,
      "createdAt": "2026-06-28T00:00:00.000Z",
      "stats": {
        "totalBets": 150,
        "totalBetAmount": 50000,
        "totalPayout": 30000,
        "wonCount": 60,
        "lostCount": 90
      }
    }
  ]
}
```
