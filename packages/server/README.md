# Taskade MCP Server — Workspace MCP (`@taskade/mcp-server`)

The **Workspace MCP** server connects an MCP client that runs local stdio servers (Claude Desktop, Claude Code, Cursor, VS Code, Windsurf) to your Taskade workspace. Its tools read and write your projects, tasks, AI agents, media and custom fields through the Taskade public API.

Most people need the hosted server instead: `https://www.taskade.com/mcp`. It needs no install, signs in with OAuth, and can edit Taskade Genesis app source. See [Hosted server or local package](https://github.com/taskade/mcp#hosted-server-or-local-package).

> 📖 **Full documentation lives in the canonical sources — this package README is intentionally a stub to avoid drift.**

- **Setup for each client and the tool reference:** [taskade/mcp README](https://github.com/taskade/mcp#local-package-stdio)
- **Workspace MCP guide:** [taskade.com/docs/mcp/workspace-mcp](https://www.taskade.com/docs/mcp/workspace-mcp)
- **Which Taskade MCP do I want?** [taskade.com/docs/mcp/which-mcp](https://www.taskade.com/docs/mcp/which-mcp)

## Quick start

```sh
TASKADE_API_KEY="your-api-key-here" npx -y @taskade/mcp-server
```

You need Node.js 18 or later and a Taskade personal access token. Create the token at [https://www.taskade.com/settings/api](https://www.taskade.com/settings/api).

To list the tools and call them, run the package in the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```sh
npx @modelcontextprotocol/inspector -e TASKADE_API_KEY=your-api-key-here -- npx -y @taskade/mcp-server
```

This package runs over stdio only. For a client that connects over HTTP, use the hosted server at `https://www.taskade.com/mcp`.
