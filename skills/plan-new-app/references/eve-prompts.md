# Write a strong build request for Taskade EVE

Taskade EVE is the AI builder inside Taskade. It turns one request into a running app: projects, agents, knowledge links, automations and the interface, in that order. A new build makes its own app space with its own data. This server cannot start a build. Your job is to write the request. For a new app, the user opens `https://www.taskade.com/create?prompt=<the request, URL-encoded>`, reads the request and starts the build. Percent-encode the whole request, also `&`, `#`, `+`, parentheses and line breaks. Show the request as text too. If the link is longer than 2,000 characters, give the text and `https://www.taskade.com/create`.

## Put each part in the request, in this order

1. **Who uses the app and what they do.** "My clients sign in and see only their own jobs" says sign-in, per-user rows and a client portal in one sentence.
2. **The records, as nouns, with their fields.** Name each kind of record (jobs, invoices, applicants) and its fields with a type: "Status (New, Scheduled, Done)", "Price (number, USD)", "Due date (date)". Each kind of record becomes a project.
3. **The agents.** Say who uses each agent, which records it answers from, and what it does (see "Agents" below).
4. **What happens without a click.** "Every Monday at 8am New York time, email me a list of late invoices." Name the time zone for each time. Each such sentence becomes an automation.
5. **What the screens show, and who signs in.** A board, a chart, a form, a calendar, a chat with the agent. Say which. Ask for a sign-in only when the app needs one.
6. **The look and the language.** Name something concrete: light or dark, the brand colors, the language of the pages.
7. **What is out of scope.**

Leave out the technology. Do not name a database, a framework, a package, a file or a host. Leave out passwords, API keys and tokens: the user connects each account when Taskade EVE asks. Every Taskade app gets a designed interface, so "make it modern and beautiful" adds nothing.

```
weak:   Build a CRM.
strong: Track leads through the stages New, Contacted, Proposal, Won and Lost,
        with owner, deal value (number, USD) and next action date.
        When a lead has no change for 14 days, flag it, and every Monday at 8am
        New York time email me a list.
        Show a pipeline board, a chart of deal value by owner, and a lead form on the home page.
```

## Give it one closed loop

The most useful sentence names a full cycle: an input, an action, and a result that the user can see. For example: "When a customer submits the booking form, add a row to Bookings, email the customer a confirmation, and show the booking on the calendar." A request with a loop comes back as a working system. A request that describes only screens comes back as screens.

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

Name the agent's job, who uses it, and the records it must know: "A Dispatcher agent for the office team that answers what is on today, using Jobs and Customers." Do not create the projects or the agent with this server before the build. A new app gets its own space, and it reads only the data of that space. Taskade EVE builds the agent and its knowledge links from the request.

## What happens after the user starts the build

- Taskade EVE can ask up to 3 short questions at the start, one time. Tell the user to answer them in the chat.
- A build uses AI credits from the workspace plan.
- When Taskade EVE finishes, it lists what it built, the defaults it chose and what it needs from the user.
- A new app starts as a draft. The owner presses **Publish** in the Taskade app to put it on the web. For who can use the app, Taskade EVE proposes the setting and the owner applies it.
- Taskade EVE keeps its build plan in the workspace memory (`projects/memory/TASKS.md`). The fix-my-app skill reads it later.

## After the first build

The user opens the app at `https://www.taskade.com/spaces/{spaceId}` and asks Taskade EVE for one change at a time there: "Add a chart of jobs by status to the dashboard." A small change keeps what already works. The app's Version History in Taskade can undo a change.

Before you call the app done, tell the user to use it once: submit the form, move a row, and check the automation run. A page that shows is not yet an app that works. You can read the run with `get_flow_runs`.
