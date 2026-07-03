# Bet Search - Admin API

All endpoints require Bearer token with admin privileges:

```
Authorization: Bearer <admin_token>
```

---

## Endpoint Summary

| Endpoint | Description |
|----------|-------------|
| `GET /api/admin/bets/wingo` | Search Wingo bets with filters |
| `GET /api/admin/bets/provider` | Search provider game bets by member |
| `GET /api/admin/bets/daily-stats` | Per-user daily aggregated bet stats |

All three endpoints share the same response wrapper:

```json
{
  "status": "success",
  "total": 25,
  "page": 1,
  "limit": 50,
  "data": [...],
  "summary": { "totalAmount": 5000, "totalPayout": 3000 }
}
```

---

## Wingo Bet Search

**Base URL:** `https://admin-backend-7lwn.onrender.com/api/admin`

```
GET /api/admin/bets/wingo?userId=123&dateFrom=2026-07-01&dateTo=2026-07-03&page=1&limit=50
```

Search Wingo bets by user ID and date range.

**Query Params:**
| Param | Type | Required | Description |
|-------|------|---------|-------------|
| userId | string | No | Filter by user ID |
| dateFrom | string | No | Start date (YYYY-MM-DD). Filters by createdAt |
| dateTo | string | No | End date (YYYY-MM-DD). Filters by createdAt |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 50, max: 100) |

**Response:**

```json
{
  "status": "success",
  "total": 25,
  "page": 1,
  "limit": 50,
  "data": [
    {
      "userId": "123",
      "game": "wingo",
      "gameMode": "30s",
      "amount": 100,
      "realAmount": 98,
      "fee": 2,
      "payout": 90,
      "selectType": "green",
      "issueNumber": "202607030000001",
      "orderNumber": "WGO1712345678901",
      "result": {
        "number": "5",
        "colour": "green",
        "profitAmount": 90
      },
      "status": "won",
      "mobile": "98****76",
      "settleTime": "03-07-2026 10:30:00",
      "createdAt": "2026-07-03T05:00:00.000Z"
    }
  ],
  "summary": {
    "totalAmount": 5000,
    "totalPayout": 1200
  }
}
```

| Field | Description |
|-------|-------------|
| data[].userId | User ID |
| data[].game | Always `"wingo"` |
| data[].gameMode | Game mode: 30s, 1m, 3m, 5m |
| data[].amount | Bet amount placed |
| data[].realAmount | Bet amount after fee deduction |
| data[].fee | Fee charged |
| data[].payout | Payout (profitAmount from result) |
| data[].selectType | Bet selection: red, green, violet, big, small, or 0-9 |
| data[].issueNumber | Issue/round number |
| data[].orderNumber | Unique order number |
| data[].result | Result object: number, colour, profitAmount |
| data[].status | Bet status: pending, won, lost |
| data[].mobile | User mobile number (masked) |
| data[].settleTime | Bet settlement/resolve time in IST (`DD-MM-YYYY HH:mm:ss`) |
| summary.totalAmount | Sum of all `amount` in current page |
| summary.totalPayout | Sum of all `payout` in current page |

---

## Provider Game Bets

**Base URL:** `https://admin-backend-7lwn.onrender.com/api/admin`

```
GET /api/admin/bets/provider?member=u12345&site=JE&status=1&dateFrom=2026-01-01&dateTo=2026-03-20&page=1&limit=50
```

Search provider game bet records by member.

**Query Params:**
| Param | Type | Required | Description |
|-------|------|---------|-------------|
| member | string | Yes | Member ID (format: `u` + userId, e.g. `u12345`) |
| site | string | No | Provider code: JE, PG, JD, TU |
| status | number | No | Bet status (1=valid) |
| dateFrom | string | No | Start date (YYYY-MM-DD). Filters by settleTime |
| dateTo | string | No | End date (YYYY-MM-DD). Filters by settleTime |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 50, max: 100) |

**Response:**

```json
{
  "status": "success",
  "total": 25,
  "page": 1,
  "limit": 50,
  "data": [
    {
      "userId": 12345,
      "game": "JE",
      "amount": 200,
      "payout": 100,
      "turnover": 200,
      "gameId": "51",
      "product": "slot",
      "member": "u12345",
      "status": 1,
      "settleTime": "03-07-2026 10:30:00",
      "createdAt": "2026-07-03T05:00:00.000Z"
    }
  ],
  "summary": {
    "totalAmount": 5000,
    "totalPayout": 3000
  }
}
```

| Field | Description |
|-------|-------------|
| data[].userId | Numeric user ID (extracted from member) |
| data[].game | Provider site code |
| data[].amount | Bet amount |
| data[].payout | Payout amount |
| data[].turnover | Turnover amount |
| data[].gameId | Game ID |
| data[].product | Game product type |
| data[].member | Raw member ID (`u` + userId) |
| data[].status | Bet status |
| data[].settleTime | Settlement time in IST (`DD-MM-YYYY HH:mm:ss`) |

---

## User Bet Daily Stats

**Base URL:** `https://admin-backend-7lwn.onrender.com/api/admin`

```
GET /api/admin/bets/daily-stats?userId=123&dateFrom=2026-07-01&dateTo=2026-07-03&page=1&limit=31
```

Per-user daily aggregated bet stats (Wingo + game provider) grouped by date.

**Query Params:**
| Param | Type | Required | Description |
|-------|------|---------|-------------|
| userId | number | Yes | User ID |
| dateFrom | string | No | Start date (YYYY-MM-DD). Default: today |
| dateTo | string | No | End date (YYYY-MM-DD). Default: today |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 31, max: 365) |

**Response:**

```json
{
  "status": "success",
  "userId": 123,
  "total": 3,
  "page": 1,
  "limit": 31,
  "data": [
    {
      "date": "2026-07-03",
      "wingo": {
        "betCount": 12,
        "totalBets": 2400,
        "totalPayout": 1500,
        "wonCount": 5,
        "lostCount": 7
      },
      "provider": {
        "betCount": 8,
        "totalBets": 4000,
        "totalPayout": 3200,
        "netPL": -800
      }
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| data[].date | Date in IST (YYYY-MM-DD) |
| data[].wingo.betCount | Number of Wingo bets placed |
| data[].wingo.totalBets | Total Wingo bet amount |
| data[].wingo.totalPayout | Total Wingo payout (sum of profitAmount) |
| data[].wingo.wonCount | Number of winning Wingo bets |
| data[].wingo.lostCount | Number of losing Wingo bets |
| data[].provider.betCount | Number of provider game bets |
| data[].provider.totalBets | Total provider bet amount |
| data[].provider.totalPayout | Total provider payout |
| data[].provider.netPL | Provider net P&L (totalBets - totalPayout) |
