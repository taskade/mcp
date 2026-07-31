# FlipReseller — Zapier recipes (free-tier backups)

Zapier free = 100 tasks/mo, single-step. Use it only where a one-hop zap saves Make ops. Build each at zapier.com → *Create Zap*.

## Zap 1 — New Todoist task → Notion Task
- **Trigger:** Todoist ▸ New Task (project `FlipReseller`)
- **Action:** Notion ▸ Create Database Item (*Tasks*): Task = task content, Origin = Todoist.

Use this INSTEAD of Make Scenario A if you'd rather save Make ops.

## Zap 2 — Notion sold item → Slack
- **Trigger:** Notion ▸ Updated Database Item (*Inventory*, Status = Sold)
- **Action:** Slack ▸ Send Channel Message (#sales): "🎉 Sold {{Item}} for ${{Sale Price}}".

Single-step alternative to Make Scenario C's Slack step.

> Don't run the Make and Zapier versions of the same flow at once — pick one per flow to avoid duplicates and wasted quota.
