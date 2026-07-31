# FlipReseller — Operations Runbook

How the pieces fit and how to run day-to-day. This is the human index for the automation blueprints in this folder.

## The system at a glance

- **Thor** (Slack agent, `../thor-slack-agent`) — mention him in a thread to turn conversation into Taskade projects/tasks.
- **Taskade** — Thor's tool belt (projects, tasks, agents).
- **Notion — FlipReseller** — the source of truth: Inventory, Tasks, Sources, Sales Log (schema in `notion-schema.md`).
- **Todoist — FlipReseller** — quick/mobile capture; syncs to Notion via Make.
- **Make.com** — the glue (scenarios in `make-scenarios.md`); Zapier backs up single hops (`zapier-recipes.md`).
- **GitHub → Slack** — dev notifications (`github-setup.md`).

## Channel map (live)

| Purpose | Channel |
| --- | --- |
| Sourcing intake (`!source …`) | `#flipreseller-operations` |
| Sold notifications | `#sales-agent` |
| Daily digest | `#flipreseller` |
| GitHub activity | `#flipreseller-dev` |

## Capture conventions

- **Log a find:** in `#flipreseller-operations`, post
  `!source <item> | cost <n> | platform <ebay|poshmark|mercari|fb>`
  → Make creates an Inventory row (Status = Sourced) and a Todoist "List <item>" task.
- **Turn a thread into work:** `@Thor capture this thread into a Taskade project`.
- **Mark sold:** set an Inventory item's Status = Sold in Notion → Make logs the sale and posts to `#sales-agent`.

## Daily / weekly cadence (mirrored in Todoist)

- **Daily:** flip review — listings, orders, buyer messages.
- **Weekly:** sourcing run; P&L reconciliation (cost, fees, shipping, net).

## Status & what's left

- Done: Thor agent, Todoist project, Notion HQ page, automation blueprints.
- Pending — **Notion databases:** create the four under FlipReseller HQ (blocked only on the Notion connector being live).
- Pending — **Make scenarios:** connect Slack/Notion/Todoist in Make → *Connections*, free a scenario slot (Free plan = 2 active), then build A–D from `make-scenarios.md`.
