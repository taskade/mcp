<div align="center">

# Taskade MCP Server

> The **Workspace MCP** (`@taskade/mcp-server`) — run your Taskade workspace from any AI client.

**Connect [Taskade](https://www.taskade.com) to any AI assistant — Claude, Cursor, Windsurf, VS Code, and more — via the [Model Context Protocol](https://modelcontextprotocol.io/).**

[![npm](https://img.shields.io/npm/v/@taskade/mcp-server?style=flat-square&color=FF2D60)](https://www.npmjs.com/package/@taskade/mcp-server)
[![GitHub stars](https://img.shields.io/github/stars/taskade/mcp?style=flat-square)](https://github.com/taskade/mcp)
[![License](https://img.shields.io/github/license/taskade/mcp?style=flat-square)](https://github.com/taskade/mcp/blob/main/LICENSE)

[![Add to Cursor](https://img.shields.io/badge/Add_to-Cursor-0098FF?style=flat-square)](cursor://anysphere.cursor-deeplink/mcp/install?name=taskade&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkB0YXNrYWRlL21jcC1zZXJ2ZXIiXSwiZW52Ijp7IlRBU0tBREVfQVBJX0tFWSI6InlvdXItYXBpLWtleS1oZXJlIn19)
[![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)](vscode:mcp/install?%7B%22name%22%3A%22taskade%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40taskade%2Fmcp-server%22%5D%2C%22env%22%3A%7B%22TASKADE_API_KEY%22%3A%22%24%7Binput%3Ataskade_api_key%7D%22%7D%7D)

**Built-in tools** for workspaces, projects, tasks, AI agents, agent chat, webhooks, knowledge bases, templates, media, and sharing — all from your AI client.

</div>

- [MCP Server](https://github.com/taskade/mcp/tree/main/packages/server) — Connect Taskade to Claude Desktop, Cursor, Windsurf, or any MCP client.
- [OpenAPI Codegen](https://github.com/taskade/mcp/tree/main/packages/openapi-codegen) — Generate MCP tools from any OpenAPI spec — not just Taskade.

---

## Contents

- [Demo](#demo)
- [Which Taskade MCP do I want?](#which-taskade-mcp-do-i-want)
- [Quick Start](#quick-start) (local Workspace MCP)
- [Hosted Taskade MCP](#hosted-taskade-mcp-httpswwwtaskadecommcp)
- [Built-in tools](#built-in-tools)
- [Why Taskade MCP?](#why-taskade-mcp)
- [Workspace MCP recipes](#workspace-mcp-recipes)
- [Hosted Taskade MCP recipes](#hosted-taskade-mcp-recipes)
- [Use Cases](#use-cases)
- [OpenAPI Codegen](#openapi-codegen)
- [What is Taskade?](#what-is-taskade)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Demo

MCP-powered Taskade agent running inside Claude Desktop by Anthropic:

![Taskade MCP Demo — AI agent managing tasks and projects in Claude Desktop](https://github.com/user-attachments/assets/0cee987b-b0d4-4d10-bb7f-da49a080d731)

---

## Which Taskade MCP do I want?

Taskade has **two inbound MCP products**. Pick by transport and auth, not by “apps vs workspace”:

| I want to… | Use | Where / auth |
|---|---|---|
| Run a **local** server that wraps the public API (workspaces, projects, tasks, agents, media, webhooks) | **Workspace MCP** — this repo (`@taskade/mcp-server`) | Local **stdio** · `TASKADE_API_KEY` personal token · [guide](https://www.taskade.com/docs/mcp/workspace-mcp) |
| Connect **remotely** over HTTPS — workspaces, projects, tasks, agents, conversations, knowledge, plus Taskade Genesis `app/` source | **[Hosted Taskade MCP](https://www.taskade.com/docs/mcp/hosted-mcp)** | Streamable HTTP at [`https://www.taskade.com/mcp`](https://www.taskade.com/mcp) · OAuth 2.0 (PKCE) · **every paid plan** (`mcp.access`; not Free) |

Hosted Taskade MCP is **not** an app-code-only surface. It lists and writes workspaces, projects, tasks, and agents. `write_file` is the exception: it edits **`app/` paths only**.

Compare the two: [Which Taskade MCP do I want?](https://www.taskade.com/docs/mcp/which-mcp).

---

## Quick Start

Local Workspace MCP. For the hosted OAuth server, skip to [Hosted Taskade MCP](#hosted-taskade-mcp-httpswwwtaskadecommcp).

### 1. Get Your API Key

Go to [Taskade Settings > API](https://www.taskade.com/settings/api) and create a Personal Access Token.

### 2. Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "taskade": {
      "command": "npx",
      "args": ["-y", "@taskade/mcp-server"],
      "env": {
        "TASKADE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "taskade": {
      "command": "npx",
      "args": ["-y", "@taskade/mcp-server"],
      "env": {
        "TASKADE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 4. Windsurf

Add to `~/.codeium/windsurf/mcp_config.json` (or **Settings → Cascade → MCP → Add Server**):

```json
{
  "mcpServers": {
    "taskade": {
      "command": "npx",
      "args": ["-y", "@taskade/mcp-server"],
      "env": {
        "TASKADE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 5. Cline

In VS Code, open the Cline **MCP Servers** panel → **Configure MCP Servers** and add:

```json
{
  "mcpServers": {
    "taskade": {
      "command": "npx",
      "args": ["-y", "@taskade/mcp-server"],
      "env": {
        "TASKADE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 6. VS Code

Add a `.vscode/mcp.json` to your workspace (VS Code uses the `servers` key; `${input:…}` prompts for your key on first run):

```json
{
  "servers": {
    "taskade": {
      "command": "npx",
      "args": ["-y", "@taskade/mcp-server"],
      "env": {
        "TASKADE_API_KEY": "${input:taskade_api_key}"
      }
    }
  }
}
```

### 7. HTTP / SSE (source / development only)

The published `@taskade/mcp-server` CLI is **stdio-only**. `packages/server/src/cli.ts` constructs `StdioServerTransport` and does not parse `--http`. There is no `npx @taskade/mcp-server --http` flag.

HTTP/SSE is a **source entry point** for local development:

```bash
# from a clone of this repository
yarn --cwd packages/server start:server
```

That runs `packages/server/src/http.ts`. The process listens on `http://localhost:3000` (override with `PORT`). Connect over SSE at `http://localhost:3000/sse?access_token=your-api-key-here`.

Tokens in query strings can be logged. Use this only on a trusted local network or behind TLS. For a remote hosted server, use [Hosted Taskade MCP](#hosted-taskade-mcp-httpswwwtaskadecommcp).

---

## Hosted Taskade MCP (`https://www.taskade.com/mcp`)

Official **remote** Taskade MCP. Nothing to install locally. Paste the URL into any MCP client that supports Streamable HTTP + OAuth.

| | |
|---|---|
| **Endpoint** | `https://www.taskade.com/mcp` |
| **Auth** | OAuth 2.0 with PKCE. Discovery: `https://www.taskade.com/.well-known/oauth-protected-resource/mcp` |
| **Unauthenticated `initialize`** | Returns **401** on purpose. The browser GET is a user-facing install page; MCP clients must complete the OAuth sign-in. |
| **Plan** | Every paid plan. The `mcp.access` switch gates each workspace. Not available on Free. |
| **Guide** | [Hosted Taskade MCP](https://www.taskade.com/docs/mcp/hosted-mcp) |

```json
{
  "mcpServers": {
    "taskade": {
      "type": "http",
      "url": "https://www.taskade.com/mcp"
    }
  }
}
```

Hosted tools include workspaces (`list_spaces`), projects and tasks (`list_projects`, `read_project`, `list_tasks`, `create_project`, `create_task`, and task mutations), agents and conversations (`list_agents`, `prompt_agent`, `list_conversations`), knowledge (`add_knowledge_project`), workspace inspection (`inspect_space`), and Taskade Genesis app-source edits (`write_file`, **`app/` only**).

---

## Built-in tools

Generated from the Taskade public API. Names below are the current Workspace MCP allow-list (`packages/server/src/constants.ts` and `constants.v2.ts`). The catalog evolves; do not treat the length of this table as a product promise.

### Workspaces

| Tool | Description |
|------|-------------|
| `workspacesGet` | List all workspaces |
| `workspaceFoldersGet` | List folders in a workspace |
| `workspaceCreateProject` | Create a project in a workspace |

### Projects

| Tool | Description |
|------|-------------|
| `projectGet` | Get project details |
| `projectCreate` | Create a new project |
| `projectCopy` | Copy a project to a folder |
| `projectComplete` | Mark project as completed |
| `projectRestore` | Restore a completed project |
| `projectMembersGet` | List project members |
| `projectFieldsGet` | Get custom fields for a project |
| `projectShareLinkGet` | Get the share link |
| `projectShareLinkEnable` | Enable the share link |
| `projectBlocksGet` | Get all blocks in a project |
| `projectTasksGet` | Get all tasks in a project |
| `folderProjectsGet` | List projects in a folder |

### Tasks

| Tool | Description |
|------|-------------|
| `taskGet` | Get task details |
| `taskCreate` | Create one or more tasks |
| `taskPut` | Update a task |
| `taskDelete` | Delete a task |
| `taskComplete` | Mark task as complete |
| `taskUncomplete` | Mark task as incomplete |
| `taskMove` | Move a task within a project |
| `taskAssigneesGet` | Get task assignees |
| `taskPutAssignees` | Assign users to a task |
| `taskDeleteAssignees` | Remove assignees |
| `taskGetDate` | Get task due date |
| `taskPutDate` | Set task due date |
| `taskDeleteDate` | Remove task due date |
| `taskNoteGet` | Get task note |
| `taskNotePut` | Update task note |
| `taskNoteDelete` | Delete task note |
| `taskFieldsValueGet` | Get all field values |
| `taskFieldValueGet` | Get a specific field value |
| `taskFieldValuePut` | Set a field value |
| `taskFieldValueDelete` | Delete a field value |

### AI Agents

Create, manage, and publish autonomous AI agents with custom knowledge and built-in tools.

| Tool | Description |
|------|-------------|
| `folderAgentGenerate` | Generate an AI agent from a text prompt |
| `folderCreateAgent` | Create an agent with custom configuration |
| `folderAgentGet` | List agents in a folder |
| `agentGet` | Get agent details |
| `agentUpdate` | Update agent configuration |
| `deleteAgent` | Delete an agent |
| `agentPublicAccessEnable` | Publish agent publicly |
| `agentPublicGet` | Get public agent details |
| `agentPublicUpdate` | Update public agent settings |
| `agentKnowledgeProjectCreate` | Add a project as agent knowledge |
| `agentKnowledgeMediaCreate` | Add media as agent knowledge |
| `agentKnowledgeProjectRemove` | Remove project from knowledge |
| `agentKnowledgeMediaRemove` | Remove media from knowledge |
| `agentConvosGet` | List agent conversations |
| `agentConvoGet` | Get conversation details |
| `publicAgentGet` | Get agent by public ID |

### Templates

| Tool | Description |
|------|-------------|
| `folderProjectTemplatesGet` | List available project templates |
| `projectFromTemplate` | Create a project from a template |

### Media

| Tool | Description |
|------|-------------|
| `mediasGet` | List media files in a folder |
| `mediaGet` | Get media details |
| `mediaDelete` | Delete a media file |

### Personal

| Tool | Description |
|------|-------------|
| `meProjectsGet` | List all your projects |

### Agent Chat & Webhooks (API v2, beta)

Capabilities the v1 API doesn't have: hold a live conversation with an AI agent, and receive real-time events.

| Tool | Description |
|------|-------------|
| `promptAgent` | Send a message to an AI agent and get its reply |
| `listConversations` | List an agent's conversations |
| `getConversation` | Get a conversation's messages |
| `subscribeWebhook` | Subscribe to real-time Taskade event webhooks |
| `unsubscribeWebhook` | Remove a webhook subscription |

---

## Why Taskade MCP?

Taskade MCP gives your AI assistant **access to your workspace** — projects, tasks, agents, knowledge bases, and templates. Some public-API operations such as workspace listing are plan-gated for free accounts. Hosted inbound MCP (`https://www.taskade.com/mcp`) requires every paid plan (`mcp.access`). Instead of writing API code, describe what you need in natural language.

```
┌──────────────────────────────────────────────────────────┐
│                HOW WORKSPACE MCP WORKS                   │
└──────────────────────────────────────────────────────────┘

  You (in Claude/Cursor/Windsurf):
  "Create a support agent trained on our docs project"
                         ↓
  ┌──────────────────────────────────┐
  │     Taskade MCP Server           │
  │     (built-in tools)             │
  └──────────────────────────────────┘
       ↓              ↓            ↓
  folderCreateAgent  agentKnowledgeProjectCreate  agentPublicAccessEnable
  (creates agent)    (attaches docs)              (publishes it)
                         ↓
  Result: Live AI chatbot trained on your data
```

| What You Say | What Happens |
|-------------|-------------|
| "Show me all overdue tasks" | Reads projects → filters tasks → formats report |
| "Create a support agent trained on our docs" | Creates agent → attaches knowledge → publishes |
| "Set up next week's sprint from our template" | Copies template → populates tasks → assigns team |
| "Summarize yesterday's completed work" | Reads task history → generates standup summary |

### Why MCP Instead of REST API?

| | REST API | MCP Server |
|-|----------|-----------|
| **Setup** | Write HTTP client, handle auth, parse JSON | `npx @taskade/mcp-server` — one command |
| **Interface** | Code against endpoints | Natural language — describe what you need |
| **Chaining** | Manual orchestration | AI chains tools intelligently |
| **Error handling** | Write error handling code | AI interprets errors and retries |

### Why Taskade MCP Over Other MCP Servers?

Taskade MCP includes **AI agent management** (create, train, deploy agents), **knowledge base training** (attach docs, projects, media), and **OpenAPI codegen** (generate MCP tools from any API spec).

---

## Workspace MCP recipes

Local stdio + personal token. Each job names a generated tool from this repo. Use placeholder IDs from a prior read — never paste a real workspace, project, or conversation into examples.

| Job | Tool | Docs |
|---|---|---|
| Find my workspaces | `workspacesGet` | [workspaces-get](https://www.taskade.com/docs/rest/workspaces-get) |
| List projects I can access | `meProjectsGet` | [me-projects-get](https://www.taskade.com/docs/rest/me-projects-get) |
| Create a project from Markdown | `workspaceCreateProject` | [workspace-create-project](https://www.taskade.com/docs/rest/workspace-create-project) |
| Read a project's tasks | `projectTasksGet` | [project-tasks-get](https://www.taskade.com/docs/rest/project-tasks-get) |
| Create a task from chat | `taskCreate` | [task-create](https://www.taskade.com/docs/rest/task-create) |
| Set a due date | `taskPutDate` | [task-put-date](https://www.taskade.com/docs/rest/task-put-date) |
| Create an agent in a folder | `folderCreateAgent` | [folder-create-agent](https://www.taskade.com/docs/rest/folder-create-agent) |
| Prompt an agent | `promptAgent` | [Workspace MCP](https://www.taskade.com/docs/mcp/workspace-mcp) |
| Read an agent conversation | `agentConvoGet` | [agent-convo-get](https://www.taskade.com/docs/rest/agent-convo-get) |
| Add a knowledge project | `agentKnowledgeProjectCreate` | [agent-knowledge-project-create](https://www.taskade.com/docs/rest/agent-knowledge-project-create) |

<details>
<summary><b>Example: standup from yesterday's work</b></summary>
<br>

```
You: "List my projects, read the tasks in the one I name,
      then create today's follow-ups from what's still open."

The client uses:
  1. meProjectsGet → find projects the token can access
  2. projectTasksGet → read tasks in the chosen project
  3. taskCreate → add follow-up tasks
```

</details>

<details>
<summary><b>Example: agent with a knowledge project</b></summary>
<br>

```
You: "Create an agent in this folder and attach our docs project
      as knowledge, then send it a prompt."

The client uses:
  1. folderCreateAgent → create the agent
  2. agentKnowledgeProjectCreate → attach the project
  3. promptAgent → send the prompt (consumes credits)
```

</details>

---

## Hosted Taskade MCP recipes

OAuth at `https://www.taskade.com/mcp`. Tool names are from the hosted user-MCP registrars in `taskade/taskcade`. Each space must have `mcp.access` (every paid plan). Do not paste private transcripts or real IDs into prompts you share.

| Job | Hosted tools | Safety note |
|---|---|---|
| Find an accessible space | `list_spaces` | Space must have `mcp.access` |
| Browse projects and tasks | `list_projects` → `read_project` / `list_tasks` | Read before editing by task ID |
| Create a project | `create_project` | Content and permissions must match the runtime schema |
| Create and update tasks | `create_task` → `update_task` / `complete_task` / `set_task_date` | Use real IDs from a read |
| Find and prompt an agent | `list_agents` → `get_agent` → `prompt_agent` | Consumes credits; do not promise model behavior |
| Review agent history | `list_conversations` → `get_conversation` | Never expose private transcripts in examples |
| Manage agent knowledge | `add_knowledge_project` / `remove_knowledge_project` | Membership and plan checks still apply |
| Inspect a Taskade Genesis app | `inspect_space` | Read the virtual filesystem first |
| Edit app source | `write_file` | `app/` paths only |

Guide: [Hosted Taskade MCP](https://www.taskade.com/docs/mcp/hosted-mcp).

---

## Use Cases

### Project Management with AI

Ask your AI assistant to manage your Taskade workspace:

- "Show me all my projects and their status"
- "Create a new project called Q1 Planning with tasks for each team"
- "Move all overdue tasks to the Backlog project"
- "Set due dates for all tasks in the Sprint project"

### AI Agent Creation

Build and deploy AI agents directly from your editor:

- "Create an AI agent called Customer Support Bot with knowledge from our docs project"
- "Generate an agent for code review using this prompt: ..."
- "Publish my agent publicly and give me the share link"
- "Add our API documentation project as knowledge to the agent"

### Template Workflows

Automate project creation from templates:

- "List all templates in my workspace"
- "Create 5 new client onboarding projects from the Client Template"
- "Copy the Sprint Retrospective project for this week"

---

## OpenAPI Codegen

Use our generator to build MCP tools from any OpenAPI spec — not just Taskade.

```bash
npm install --save-dev @taskade/mcp-openapi-codegen @readme/openapi-parser
```

```ts
import { dereference } from '@readme/openapi-parser';
import { codegen } from '@taskade/mcp-openapi-codegen';

const document = await dereference('your-api-spec.yaml');

await codegen({
  path: 'src/tools.generated.ts',
  document,
});
```

Works with any OpenAPI 3.0+ spec. Generate MCP tools for your own APIs in minutes.

---

## What is Taskade?

[Taskade](https://www.taskade.com) ([Y Combinator S19](https://www.ycombinator.com/companies/taskade)) is the AI-native workspace for building apps, deploying agents, and automating workflows — from a single prompt. **150,000+ apps generated. Trusted by 3M, Nike, Tesla, Netflix, Airbnb, Disney, Adobe.** Rated 4.8/5 across 9,300+ reviews.

- **Taskade Genesis** — Build complete apps from prompts. Dashboards, CRMs, portals, forms — deployed instantly. [Try it →](https://www.taskade.com/create)
- **AI Agents** — Custom agents with built-in tools, persistent memory, multi-agent teams, public embedding
- **Automations** — No-code workflow automation with 100+ integrations, branching, looping, filtering
- **Real-time Collaboration** — Multiplayer workspace with chat, video, and multiple project views
- **Templates** — 700+ templates for project management, engineering, marketing, and more
- **API & MCP** — REST API, this Workspace MCP server, Hosted Taskade MCP, Agent API, webhooks, OAuth 2.0

**Links:**
- App: [taskade.com](https://www.taskade.com)
- Create: [taskade.com/create](https://www.taskade.com/create)
- Apps gallery: [taskade.com/apps](https://www.taskade.com/apps)
- Agents: [taskade.com/agents](https://www.taskade.com/agents)
- Templates: [taskade.com/templates](https://www.taskade.com/templates)
- [Which Taskade MCP](https://www.taskade.com/docs/mcp/which-mcp) · [Workspace MCP](https://www.taskade.com/docs/mcp/workspace-mcp) · [Hosted Taskade MCP](https://www.taskade.com/docs/mcp/hosted-mcp)
- Blog: [taskade.com/blog](https://www.taskade.com/blog)

---

## Roadmap

See [open issues](https://github.com/taskade/mcp/issues) for planned features and improvements.

**Recently shipped (v0.1.0):** Agent chat (`promptAgent`) and webhook triggers, live now via the [Taskade API v2 tool layer](#agent-chat--webhooks-api-v2-beta).

- **Automation & Flow Tools** — Roadmap only; hosted and local MCP do not create or manage automations today
- **`agent.js`** — Open-source autonomous agent toolkit (coming soon)
- **Developer platform** — [Taskade developer platform overview](https://www.taskade.com/docs/getting-started/developer-platform)

---

## Privacy & Security

Your Taskade API token authorizes the MCP server to call the Taskade public API on your behalf. The server talks **only** to the Taskade public API — `https://www.taskade.com/api/v1` and `https://www.taskade.com/api/v2` — and does not send your data to other third-party services.

- **Privacy** — see the [Taskade Privacy Policy](https://www.taskade.com/privacy).
- **Security & vulnerability reporting** — see [SECURITY.md](./SECURITY.md).
- Store your token in an environment variable; never commit it.

---

## Contributing

Help us improve MCP tools, OpenAPI workflows, and agent capabilities.

- [Issues](https://github.com/taskade/mcp/issues) — Report bugs or request features
- [Pull Requests](https://github.com/taskade/mcp/pulls) — Contributions welcome
- [Apps](https://www.taskade.com/apps) — Browse and clone community apps
- [Contact](mailto:hello@taskade.com) — hello@taskade.com

---

## More from Taskade

- [Workspace MCP guide](https://www.taskade.com/docs/mcp/workspace-mcp) · [Hosted Taskade MCP](https://www.taskade.com/docs/mcp/hosted-mcp)
- [Agent skill (`SKILL.md`)](https://www.taskade.com/SKILL.md) · [llms.txt index](https://www.taskade.com/llms.txt) · [Developer docs](https://github.com/taskade/docs)
- [Awesome Vibe Coding](https://github.com/taskade/awesome-vibe-coding) — curated vibe-coding tools, MCP servers, and agent skills
- [Integration Kit](https://github.com/taskade/integrations) — open-source Zapier/n8n actions & triggers
- [Taskade on GitHub](https://github.com/taskade) — org home and open-source repos

---

## License

MIT
