# FlipReseller — Make.com scenarios

> ⚠️ Heads-up on your current Make org: it's on the **Free plan (max 2 active scenarios)** and already has 2, and none of Slack/Notion/Todoist are connected under *Connections* yet. Before these run, connect those three apps and free up a scenario slot (or upgrade).

Primary automation layer. First, in Make → *Connections*, connect **Slack**, **Notion**, and **Todoist** (OAuth). Then build these scenarios. Each lists its modules top-to-bottom; when a step maps a Notion property, you pick the database once and Make surfaces its fields.

## Scenario A — Todoist task → Notion Task
Keep every to-do in one place.

1. **Todoist ▸ Watch Tasks** — trigger; project = `FlipReseller`.
2. **Notion ▸ Create a Database Item** — database = *Tasks*.
   - Task = `{{Todoist content}}`
   - Due = `{{Todoist due date}}`
   - Origin = `Todoist`
   - Status = `To do`

Schedule: every 15 min (free-tier minimum). ~1 op/run.

## Scenario B — Slack sourcing intake → Notion Inventory + Todoist
Post `!source <item> | cost <n> | platform <x>` in **#flipreseller-operations** and it's captured.

1. **Slack ▸ Watch Public Channel Messages** — channel = `#flipreseller-operations`.
2. **Filter** — continue only if text starts with `!source`.
3. **Set variables / parse** — split on `|` to get item, cost, platform.
4. **Notion ▸ Create a Database Item** — database = *Inventory*: Item = parsed item, Status = `Sourced`, Cost = parsed cost, Platform = parsed platform.
5. **Todoist ▸ Create a Task** — content = `List {{item}}`, project = `FlipReseller`, due = `today +2 days`.
6. **Slack ▸ Create a Message** — channel `#flipreseller-operations`, threaded on the trigger message: "📦 Logged _{{item}}_ to Inventory and queued a listing task."

## Scenario C — Item sold → Sales Log + celebrate
1. **Notion ▸ Watch Database Items** — database = *Inventory*, watch updated, filter `Status = Sold`.
2. **Notion ▸ Create a Database Item** — database = *Sales Log*: map Item (relation), Platform, Sale Price, Fees, Shipping, Net = `{{Net Profit}}`, Sold On = now.
3. **Slack ▸ Create a Message** — channel `#sales-agent`: "🎉 SOLD: *{{Item}}* for ${{Sale Price}} (net ${{Net Profit}}) on {{Platform}}."

## Scenario D — Daily digest
1. **Schedule** — daily 08:00.
2. **Notion ▸ Search Database Items** — *Inventory*, filter `Status = Listed` (aging stock).
3. **Notion ▸ Search Database Items** — *Tasks*, filter `Due ≤ today` and `Status ≠ Done`.
4. **Array aggregator → Text** — build a summary.
5. **Slack ▸ Create a Message** — channel `#flipreseller`: today's open tasks + items live > 14 days.

## Op budget
A + C + D at low volume, plus occasional B, stays well under Make's 1,000 ops/mo free tier. If Scenario A's 15-min polling gets heavy, move Todoist capture to Zapier (see `zapier-recipes.md`) to save Make ops.
