# Wingo Game API - Admin Side

## Base URL

```
http://localhost:3000/api/wingo/admin
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
| `30s` | 30 sec | `WinGo_30S` | `202605100000001` |
| `1m` | 1 min | `WinGo_1M` | `1M_20260510000001` |
| `3m` | 3 min | `WinGo_3M` | `3M_20260510000001` |
| `5m` | 5 min | `WinGo_5M` | `5M_20260510000001` |

---

## Result Generation Mode

Each game mode has its own independent result mode (RANDOM, MAX_PROFIT, MAX_LOSS).

### Get Current Mode

```
GET /api/wingo/admin/result-mode?mode=30s
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
POST /api/wingo/admin/result-mode
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
  "currentIssue": "1M_20260510000001",
  "applyIssue": "1M_20260510000002"
}
```

---

## Current Round Info

```
GET /api/wingo/admin/current-round?mode=30s
```

Returns current round with bet type breakdown for the specified game mode.

**Query Params:** `mode` (optional, default: `30s`)

**Response:**

```json
{
  "success": true,
  "round": {
    "issueNumber": "202605100000002",
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
GET /api/wingo/admin/current-round/bets?page=1&limit=50&mode=30s
```

Returns all bets for the current round with user mobile numbers.

**Query Params:** `mode` (optional, default: `30s`)

---

## Round Stats

```
GET /api/wingo/admin/round-stats/:issueNumber
```

Full stats for a specific round with profit/loss calculation. The game mode is inferred from the issue number.

**Response:**

```json
{
  "success": true,
  "issue": { "issueNumber": "1M_20260510000001", "gameMode": "1m", ... },
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
GET /api/wingo/admin/rounds?page=1&limit=25&mode=30s
```

Paginated list of settled rounds with per-round stats for the specified game mode.

**Query Params:** `mode` (optional, default: `30s`)

---

## Bet Search (All Bets)

```
GET /api/wingo/all-bets?userId=123&issueNumber=...&status=...&gameMode=30s&orderNumber=...&page=1&limit=50
```

Search wingo bets. Admins can search by userId, orderNumber, issueNumber, gameMode, and status.

**Query Params:**
| Param | Type | Required | Description |
|-------|------|---------|-------------|
| userId | number | No | Admin only — filter by user ID |
| orderNumber | string | No | Admin only — filter by exact order number (unique) |
| issueNumber | string | No | Filter by issue/round number |
| gameMode | string | No | Filter by game mode: `30s`, `1m`, `3m`, `5m` |
| status | string | No | Filter: `pending`, `won`, `lost` |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 50, max: 100) |

**Response:**

```json
{
  "status": "success",
  "page": 1,
  "limit": 50,
  "total": 1,
  "summary": {
    "totalBet": 100,
    "totalPayout": 0
  },
  "items": [
    {
      "_id": "...",
      "userId": "123",
      "issueNumber": "202605100000001",
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

| Field | Description |
|-------|-------------|
| totalBet | Sum of all bet amounts in current page |
| totalPayout | Sum of all profit amounts in current page |
| items[].orderNumber | Unique order number for this bet |
| items[].selectType | Bet selection: red, green, violet, big, small, or 0-9 |
| items[].status | Bet status: pending, won, lost |
| items[].result | Result object with profitAmount, etc., or null if pending |
