---
name: project-views
description: Pick the Taskade project view that answers the user's question, and explain why a view is empty or locked. Use when the user asks "which view fits this job", "show this as a board or a calendar", "why is my calendar empty" or "why can I not open Gantt Chart". Needs no Taskade account and no MCP connection. Do not use it to plan an app (plan-new-app skill) or to import rows (import-spreadsheet skill).
---

# Project views

A Taskade project is one tree of tasks. Each view shows the same tree in another form. No view copies the data, so a change in one view shows in every view.

## Requirements

None. This skill is a reference. A connection helps only to fix the data that a view needs.

## Pick a view

The view bar shows List, Board, Table and Mind Map. The "More views" menu holds Docs, Calendar, Gantt Chart, Actionsheet and Org Chart.

| The user asks | View | The data needs |
|---|---|---|
| What is the plan, step by step? | List | Nothing |
| What stage is each item in? | Board | One top-level task for each stage |
| How do the rows compare? | Table | Custom fields |
| What is due on which day? | Calendar | A task date |
| What runs when, and for how long? | Gantt Chart | A task date with a start and an end |
| How do the ideas connect? | Mind Map | Nesting |
| Who reports to whom? | Org Chart | Nesting |

## What each view needs

- Board: each top-level task is a column, and the tasks nested under it are its cards. A drag to another column moves the task in the tree.
- Calendar and Gantt Chart read the task date, not a Date custom field. Calendar leaves out a task with no date. Gantt Chart shows it as an empty row, and a click on the row gives it a date.
- Table: one row for each task, and one column for each field, the date and the assignee included.
- Mind Map and Org Chart draw the nesting. A flat list gives a diagram with one level.

## Plans

Gantt Chart, Actionsheet and Org Chart need a paid plan. Every paid plan unlocks all three, Starter included. The other views work on Free.

## With a connection

No hosted MCP tool reads or sets the view of a project. The user selects the view in Taskade, or asks Taskade EVE to set it. The agent can fix the data:

- Set a task date with `set_task_date` for Calendar and Gantt Chart.
- Move a task under a top-level task with `move_task` to put a card in a Board column.
- Read the project again, and make sure that each change is there.

## Known problems

- The view is saved on the project for every member. Only a member who can edit the project can change it.
- The menu marks the three paid views with a "Pro" badge. Starter also unlocks them.
- On Free, a project saved in Org Chart or Actionsheet opens in List with an upgrade prompt. Gantt Chart shows an upgrade screen.
- Taskade EVE can set the view of a project that it builds. Name the view in the request.
- A project made from a template keeps the view of the template. A project made from Markdown through MCP opens in List.

## Scope

This skill covers the views of one project. The pages of a Taskade Genesis app are its own screens. For those, use the plan-new-app skill.
