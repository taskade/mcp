# ⚡ FlipReseller Automations

The automation layer that wires your reselling stack together — **Slack**, **Taskade** (via Thor), **Notion** (FlipReseller workspace), **Todoist**, **GitHub**, glued with **Make.com** (primary) and **Zapier** (backup).

## The stack, by job

| Layer | Tool | Role |
| --- | --- | --- |
| Conversation | Slack | Where the team works; where Thor lives |
| Agents | Thor + Claude | Turn conversation into structured action |
| Projects/Tasks | Taskade | Thor's native tool belt |
| Source of truth | Notion (FlipReseller) | Inventory, sales, sources, tasks |
| Personal tasks | Todoist | Quick capture / on-the-go |
| Code | GitHub | This repo + notifications |
| Glue | Make.com / Zapier | Move data between the above |

## Data flow (the big picture)

```
Slack thread ──@Thor──▶ Taskade project/tasks
     │                         │
     │ (!source keyword)       │ (Make: Todoist/Taskade → Notion)
     ▼                         ▼
Make scenario ─────────▶ Notion: Inventory + Tasks (FlipReseller)
     ▲                         │
     │                         │ (Status = Sold)
 Todoist ◀── list task         ▼
                         Notion: Sales Log ──▶ Slack #sales-agent 🎉
```

## Build order

1. **Notion** — create the FlipReseller workspace and databases → [`notion-schema.md`](./notion-schema.md).
2. **Todoist** — create a `FlipReseller` project (one line, in the app).
3. **Make.com** — connect Slack, Notion, Todoist, then build the scenarios → [`make-scenarios.md`](./make-scenarios.md).
4. **Zapier** — optional single-step backups → [`zapier-recipes.md`](./zapier-recipes.md).
5. **GitHub** — repo notifications into Slack → [`github-setup.md`](./github-setup.md).

> Channel mapping in use: sourcing → #flipreseller-operations, sold → #sales-agent, digest → #flipreseller, GitHub → #flipreseller-dev.

## Free-tier budget (keep it $0)

- **Make free:** 1,000 ops/mo, 15-min min interval. Put the daily digest on a schedule; keep instant triggers for low-volume events (sales, sourcing).
- **Zapier free:** 100 tasks/mo, single-step. Use only for 1–2 high-value one-hop zaps.
- **Notion / Todoist / GitHub free:** unlimited for this usage.

Rule of thumb: **Make for anything multi-step or branching; Zapier only when Make would burn ops on a trivial one-hop.**
