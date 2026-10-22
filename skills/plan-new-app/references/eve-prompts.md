# Write a strong build prompt for Taskade EVE

Taskade EVE is the builder inside Taskade. It turns one prompt into a running app: projects, agents, knowledge links, automations and the interface, in that order. This server cannot start a build. Your job is to write the prompt, and the user pastes it into Taskade EVE in the right workspace.

## Put four things in the prompt

1. **Who uses the app and what they do.** "My clients sign in and see only their own jobs" says sign-in, per-user rows and a client portal in one sentence.
2. **The records, as nouns, with their fields.** Name each kind of record (jobs, invoices, applicants) and its fields with a type: "Status (New, Scheduled, Done)", "Price (number, USD)", "Due date (date)". Each kind of record becomes a project.
3. **What happens without a click.** "Every Monday at 8am, email me a list of late invoices." Each such sentence becomes an automation.
4. **What the screens show.** A board, a chart, a form, a calendar, a chat with the agent. Say which.

Leave out the technology. Do not name a database, a framework or a host. Every Taskade app gets a designed interface, so "make it modern and beautiful" adds nothing.

```
weak:   Build a CRM.
strong: Track leads through the stages New, Contacted, Proposal, Won and Lost,
        with owner, deal value (number, USD) and next action date.
        When a lead has no change for 14 days, flag it and email me a list every Monday.
        Show a pipeline board, a chart of deal value by owner, and a lead form on the home page.
```

## Give it one closed loop

The most useful sentence names a full cycle: an input, an action, and a result that the user can see. For example: "When a customer submits the booking form, add a row to Bookings, email the customer a confirmation, and show the booking on the calendar." A prompt with a loop comes back as a working system. A prompt that describes only screens comes back as screens.

## Automations: say the trigger in plain words

| Say this | Taskade starts the automation |
|---|---|
| "every Monday at 8am", "each morning" | On a schedule |
| "when someone submits the form" | From a form |
| "when an email arrives at the intake address" | From an email |
| "when a task is added to Jobs" | From a change in a project |
| "when my other system posts to a webhook" | From a webhook |
| "when I ask" | By hand ("When asked"). This kind can also be run from this server with `run_flow`. |

Naming a connected app (Gmail, Slack, Google Sheets) is fine. The user connects that account in Taskade before the step can run. Say what must happen when a step fails (retry, skip, or notify the user), so that a failure is not silent.

## Agents: say the job and the knowledge

Name the agent's job and the projects it must know: "A Dispatcher agent that answers what is on today, using Jobs and Customers." If the projects and the agent already exist (made with this server), name them exactly in the prompt and say "use the existing projects", so that Taskade EVE does not make a second copy.

## What happens after the user sends the prompt

- Taskade EVE can ask up to 3 short questions at the start, one time. Tell the user to answer them in the chat.
- A build uses AI credits from the workspace plan.
- A new app starts as a draft. The owner presses **Publish** to put it on the web, and chooses there who can use it.
- Taskade EVE keeps its build plan in the workspace memory (`projects/memory/TASKS.md`). The fix-my-app skill reads it later.

## After the first build

Ask for one change at a time in the same Taskade EVE chat: "Add a chart of jobs by status to the dashboard." A small change keeps what already works. The app's Version History in Taskade can undo a change.

Before you call the app done, tell the user to use it once: submit the form, move a row, and check the automation run. A page that shows is not yet an app that works. You can read the run with `get_flow_runs`.
