# How a Taskade workspace fits together

Read this when the user asks what a part of Taskade is, or when you must pick the right tool for a request. Explain it to the user in their words: their records, their assistant, their automatic steps, their app.

## The parts

| Part | What it is for the user | How you reach it here |
|---|---|---|
| Workspace (space) | The container for one business or team. Members, roles and the plan belong to it. | `list_spaces` |
| Subspace | A workspace inside a workspace. One level only: a subspace cannot hold another subspace. | `list_spaces` (a subspace has a `parentId`) |
| Project | The records: a tree of rows (tasks) with custom fields. Leads, jobs, invoices and products live here. | `list_projects`, `read_project`, `list_tasks`, `list_fields` |
| Agent | An AI assistant with instructions and knowledge (projects and files it can read). | `list_agents`, `get_agent`, `prompt_agent` |
| Automation | A trigger and a chain of steps that run without a click: a schedule, a form, an email, a new task, or "When asked". Steps can write to projects, ask an agent, or act in one of 100+ connected apps. | `list_automations`, `get_flow_runs`, `run_flow` |
| App | A Taskade Genesis app: a web app (React) on top of the projects, agents and automations of the workspace. | `inspect_space` on `app/`, `write_file` |

Taskade calls projects, agents, automations and the app together "Workspace DNA": projects are the memory, agents are the intelligence, automations are the execution, and the app is the interface.

## One copy of the data

The app, the agents, the automations and the people in the workspace all read and write the same project rows. There is no sync step and no second copy. A row that a person edits in Taskade is the row that the app shows. This is why a field name matters: an app that reads a field name which is not in the project shows an empty page.

## The build order

Taskade EVE, the builder inside Taskade, builds an app in this order:

1. Projects (the records and their fields)
2. Agents
3. Knowledge links (which projects each agent reads)
4. Automations
5. The app interface

The interface comes last because it shows the other parts. A request that describes only screens gets only screens.

## What the files look like through MCP

`inspect_space` shows a workspace as folders:

| Folder | Holds | Writable here |
|---|---|---|
| `app/` | The app source code | Yes, with `write_file` |
| `projects/` | One `.taskproj` file per project. The file header holds the `projectId`, and each row holds its task id. | No (use the task tools) |
| `projects/memory/` | The memory of Taskade EVE. `TASKS.md` is its build plan for the app, when it exists. | No (use the task tools) |
| `agents/` | One `.md` file per agent | No (use the agent tools) |
| `automations/` | One `.taskflow` file per automation | No |
| `media/` | Uploaded files | No |

## Roles decide what you can see

The user's role in the workspace limits the folders and tools:

| Role | Sees | Cannot |
|---|---|---|
| Owner, maintainer, collaborator | Every folder, including `app/` and `media/` | Nothing in this list. Only an owner or maintainer can download the app bundle. |
| Participant | Projects, agents (without their instructions), automations | Read `app/` or `media/`, read automation run history, edit the app, change project rows (unless a project gives them edit rights) |
| Viewer | Projects, agents (without their instructions) | See automations, read `app/` or `media/`, edit anything |

If a folder or a tool is refused, say which role the user has and that a workspace owner can change it.

## The plan

MCP access is part of every paid Taskade plan. A workspace on the Free plan does not appear in `list_spaces`. If the response has `hiddenForPlan` and a `hint`, show the hint to the user. The hint holds the upgrade link.

## What MCP can do, and what stays in Taskade

| Through MCP (here) | In Taskade only |
|---|---|
| Read and change projects, rows, fields, dates and assignees. Write notes (a read does not show notes). | Add or change custom fields and their options |
| Create agents, edit their instructions, link knowledge, ask an agent | Build a new app from a prompt (Taskade EVE) |
| List automations, read their run history, run one that starts "When asked" | Create or edit an automation, turn it On or Off |
| Read and edit app source files | Publish the app, set who can use it, connect a domain |

For a task in the right column, write the exact request for the user to paste into Taskade EVE in that workspace, and give the workspace link.
