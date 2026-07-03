# Bet Search - Admin API

All endpoints require Bearer token with admin privileges:

```
Authorization: Bearer <admin_token>
```

---

## Provider Game Bets (All Bets by Member)

**Base URL:** `https://admin-backend-7lwn.onrender.com/api/admin`

```
GET /api/admin/game/all-bets?member=u12345&site=JE&status=1&dateFrom=2026-01-01&dateTo=2026-03-20&page=1&limit=50
```

Search provider game bet records by member (userId).

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
  "member": "u12345",
  "page": 1,
  "limit": 50,
  "total": 25,
  "summary": {
    "totalBet": 5000,
    "totalPayout": 3000,
    "totalTurnover": 5000,
    "netPnl": -2000
  },
  "items": [
    {
      "bet": 200,
      "payout": 100,
      "turnover": 200,
      "gameId": "51",
      "site": "JE",
      "product": "slot",
      "betTime": "2026-03-19T10:30:00.000Z",
      "settleTime": "2026-03-19T10:30:00.000Z",
      "createdAt": "2026-03-19T10:30:00.000Z"
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| items[].bet | Bet amount |
| items[].payout | Payout amount |
| items[].turnover | Turnover amount |
| items[].gameId | Game ID |
| items[].site | Provider code |
| items[].product | Game product type |
| items[].settleTime | Settlement time |
| totalBet | Sum of bet amounts in current page |
| totalPayout | Sum of payouts in current page |
| totalTurnover | Sum of turnover amounts |
| netPnl | totalPayout - totalBet (negative = platform profit) |

---

## Wingo Bet Search (All Bets)

**Base URL:** `https://admin-backend-7lwn.onrender.com/api/admin`

```
GET /api/admin/wingo/all-bets?userId=123&gameMode=30s&status=won&dateFrom=2026-07-01&dateTo=2026-07-03&page=1&limit=50
```

Search Wingo bets with multiple filters. Returns each bet with user mobile number.

**Query Params:**
| Param | Type | Required | Description |
|-------|------|---------|-------------|
| userId | string | No | Filter by user ID |
| issueNumber | string | No | Filter by issue/round number |
| gameMode | string | No | Filter: `30s`, `1m`, `3m`, `5m` |
| status | string | No | Filter: `pending`, `won`, `lost` |
| orderNumber | string | No | Filter by exact order number |
| dateFrom | string | No | Start date (YYYY-MM-DD). Filters by createdAt |
| dateTo | string | No | End date (YYYY-MM-DD). Filters by createdAt |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 50, max: 100) |

**Response:**

```json
{
  "status": "success",
  "page": 1,
  "limit": 50,
  "total": 25,
  "summary": {
    "totalBet": 5000,
    "totalPayout": 1200,
    "wonCount": 3,
    "lostCount": 22
  },
  "items": [
    {
      "userId": "123",
      "issueNumber": "202607030000001",
      "orderNumber": "WGO1712345678901",
      "betAmount": 100,
      "fee": 2,
      "selectType": "green",
      "status": "won",
      "gameMode": "30s",
      "result": {
        "number": "5",
        "selectType": "green",
        "colour": "green",
        "premium": null,
        "profitAmount": 90,
        "timestamp": "03-07-2026 10:30:00"
      },
      "mobile": "98****76",
      "createdAt": "2026-07-03T05:00:00.000Z"
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| summary.totalBet | Sum of all betAmount in current page |
| summary.totalPayout | Sum of all result.profitAmount |
| summary.wonCount | Count of won bets in current page |
| summary.lostCount | Count of lost bets in current page |
| items[].orderNumber | Unique order number for this bet |
| items[].selectType | Bet selection: red, green, violet, big, small, or 0-9 |
| items[].gameMode | Game mode: 30s, 1m, 3m, 5m |
| items[].status | Bet status: pending, won, lost |
| items[].result | Full result object (number, selectType, colour, premium, profitAmount, timestamp) |
| items[].mobile | User mobile number (masked) |

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


