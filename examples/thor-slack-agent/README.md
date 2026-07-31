# ⚡ Thor — a Slack AI agent powered by Taskade MCP

Thor is a Slack-native AI agent. Mention `@Thor` in a channel or send him a DM, and he reasons with Claude and *acts* on your Taskade workspace through this repository's [`@taskade/mcp-server`](../../packages/server) — creating projects, capturing tasks, summarizing docs, and taming the chaos, all without leaving Slack.

## Why "empower"?

A Slack bot on its own can only talk. Thor is wired to real tools: every one of the 60+ Taskade MCP tools becomes an action he can take. That is the difference between a chatbot and an agent.

## What Thor is best at

Thor shines at *turning conversation into organized action*. Summon him inside a thread and he reads the whole thread, then:

- **Captures action items** — "@Thor turn this thread into a project" → he mines the discussion for decisions, tasks, owners, and deadlines and builds a Taskade project from it.
- **Kicks off projects from a brief** — "@Thor spin up a launch plan for the new pricing page" → a structured project with sensible tasks.
- **Runs roundups** — "@Thor what's left on Q3 Launch?" → a crisp status pulled straight from Taskade.

Because he reads the thread he is mentioned in, he works best right where the conversation already lives.

## Architecture

```
Slack  ──mention / DM──▶  Thor (Bolt, Socket Mode)
                            │
                            ├─▶ Claude (Anthropic)  ◀── reasons, picks tools
                            │
                            └─▶ Taskade MCP server (stdio child process)
                                       │
                                       └─▶ Taskade API  (workspaces, projects, tasks, agents)
```

1. A Slack message arrives (`app_mention` or a DM).
2. Thor sends the thread plus the Taskade tool catalog to Claude.
3. Claude decides which tools to call; Thor executes them against the MCP server and feeds the results back.
4. The loop continues until Claude produces a final answer, which Thor posts back in-thread.

## Setup

### 1. Prerequisites

- Node.js 18+
- A Taskade API key — https://www.taskade.com/settings/password
- An Anthropic API key — https://console.anthropic.com/
- Permission to create a Slack app in your workspace

### 2. Create the Slack app

1. Go to https://api.slack.com/apps → *Create New App* → *From an app manifest*.
2. Paste [`manifest.yaml`](./manifest.yaml).
3. Under *Basic Information*, copy the *Signing Secret* → `SLACK_SIGNING_SECRET`.
4. Under *App-Level Tokens*, generate a token with the `connections:write` scope → `SLACK_APP_TOKEN` (`xapp-…`).
5. *Install App* to your workspace, then copy the *Bot User OAuth Token* → `SLACK_BOT_TOKEN` (`xoxb-…`).

### 3. Configure

```bash
cd examples/thor-slack-agent
cp .env.example .env
# fill in the keys
npm install
```

### 4. Run

```bash
npm run dev            # hot-reload during development
# or
npm run build && npm start
```

You will see `⚡ Thor is listening on Slack.` Invite him to a channel and summon him:

> @Thor create a project called "Q3 Launch" with tasks for copy, design, and QA

> Or drop him into any thread: *@Thor capture this thread into a Taskade project* — he'll read the discussion and build it.

## Configuration reference

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | — | Thor's reasoning (Claude) |
| `TASKADE_API_KEY` | yes | — | Auth for the Taskade tools |
| `SLACK_BOT_TOKEN` | yes | — | Bot token (`xoxb-…`) |
| `SLACK_APP_TOKEN` | yes | — | Socket-mode app token (`xapp-…`) |
| `SLACK_SIGNING_SECRET` | yes | — | Verifies Slack requests |
| `THOR_MODEL` | no | `claude-sonnet-5` | Claude model id |
| `THOR_MAX_STEPS` | no | `12` | Max tool-call iterations per turn |
| `TASKADE_MCP_COMMAND` | no | `npx` | Command to launch the MCP server |
| `TASKADE_MCP_ARGS` | no | `-y,@taskade/mcp-server` | Args (comma-separated) |

## Customizing Thor

- **Persona / behavior** → `src/prompt.ts`
- **Which Claude model** → `THOR_MODEL`
- **Tool-loop depth** → `THOR_MAX_STEPS`
- **Swap the MCP server** → `TASKADE_MCP_COMMAND` / `TASKADE_MCP_ARGS`. Thor will wield whatever MCP tools you point him at, so you can aim him at a different MCP server entirely.

## How it maps to this repo

Thor is a thin, focused consumer of `@taskade/mcp-server`. He does not reimplement any Taskade logic — he spawns the very server this repo publishes and speaks MCP to it, which is exactly the integration story the server is built for.

## Files

| File | Role |
| --- | --- |
| `src/index.ts` | Slack (Bolt, Socket Mode) wiring — mentions & DMs |
| `src/agent.ts` | The reason → act → observe loop (Claude + tools) |
| `src/mcp.ts` | Spawns the Taskade MCP server and adapts its tools for Claude |
| `src/prompt.ts` | Thor's persona and operating rules |
| `src/config.ts` | Environment/config loading |
| `manifest.yaml` | Slack app manifest |
