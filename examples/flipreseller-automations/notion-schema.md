# FlipReseller — Notion schema

Create a Notion workspace named **FlipReseller** (Notion → workspace switcher → *Create workspace*; the API cannot create workspaces). Inside it, create one parent page **FlipReseller HQ** and add these four full-page databases.

## 1. Inventory
The heart of the system — one row per item you source.

| Property | Type | Notes |
| --- | --- | --- |
| Item | Title | e.g. "Nike Air Max 90 — sz 10" |
| Status | Select | Sourced · Listed · Sold · Shipped · Returned |
| Platform | Select | eBay · Poshmark · Mercari · FB Marketplace |
| SKU | Text | your internal code |
| Cost | Number ($) | what you paid |
| List Price | Number ($) | asking price |
| Sale Price | Number ($) | actual |
| Fees | Number ($) | platform + payment fees |
| Shipping | Number ($) | your cost to ship |
| Net Profit | Formula | see below |
| Source | Relation → Sources | where it came from |
| Tasks | Relation → Tasks | to-dos for this item |
| Listing URL | URL | live listing |
| Photos | Files | |
| Date Sourced | Date | |
| Date Sold | Date | |

**Net Profit** formula:
```
prop("Sale Price") - prop("Cost") - prop("Fees") - prop("Shipping")
```

## 2. Tasks
Operational to-dos, fed by Thor/Taskade, Todoist, and Slack.

| Property | Type | Notes |
| --- | --- | --- |
| Task | Title | |
| Status | Status | To do · Doing · Done |
| Priority | Select | Low · Med · High |
| Due | Date | |
| Item | Relation → Inventory | optional |
| Origin | Select | Slack · Taskade · Todoist · Manual |

## 3. Sources
Where inventory comes from.

| Property | Type |
| --- | --- |
| Name | Title |
| Type | Select (Thrift · Estate · Wholesale · Online · Consignment) |
| Location | Text |
| Reliability | Select (A · B · C) |
| Notes | Text |

## 4. Sales Log
One row per completed sale (created automatically when an item flips to Sold).

| Property | Type |
| --- | --- |
| Item | Relation → Inventory |
| Platform | Select |
| Sale Price | Number ($) |
| Fees | Number ($) |
| Shipping | Number ($) |
| Net | Number ($) |
| Sold On | Date |

## Dashboards (optional)
On **FlipReseller HQ**, add linked views:
- Inventory board grouped by Status
- Inventory filtered `Status = Listed` (what's live)
- Sales Log this month with a Net sum
- Tasks filtered `Due ≤ today`
