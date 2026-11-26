# Taskade MCP Server — Workspace MCP (`@taskade/mcp-server`)

The **Workspace MCP** server connects an MCP client that runs local stdio servers (Claude Desktop, Claude Code, Cursor, VS Code, Windsurf) to your Taskade workspace.

By default, the package connects to the hosted Taskade MCP server, `https://www.taskade.com/mcp`, with your token as a Bearer token. It serves the hosted tools with their names, and forwards each request. The hosted server works on every paid Taskade plan. It does not work on the Free plan.

With `--legacy` (or `TASKADE_MCP_LEGACY=1`), the package serves the tools of version 0.2 instead. They read and write your projects, tasks, AI agents, media and custom fields through the Taskade public API v1 and v2, on any plan. Legacy mode stays for one major version.

A client that connects to remote servers needs no install: it can use `https://www.taskade.com/mcp` directly, with OAuth. See [Hosted server or local package](https://github.com/taskade/mcp#hosted-server-or-local-package).

> 📖 **Full documentation lives in the canonical sources — this package README is intentionally a stub to avoid drift.**

- **Setup for each client and the tool reference:** [taskade/mcp README](https://github.com/taskade/mcp#local-package-stdio)
- **Workspace MCP guide:** [taskade.com/docs/mcp/workspace-mcp](https://www.taskade.com/docs/mcp/workspace-mcp)
- **Which Taskade MCP do I want?** [taskade.com/docs/mcp/which-mcp](https://www.taskade.com/docs/mcp/which-mcp)

## Quick start

```sh
TASKADE_API_KEY="your-api-key-here" npx -y @taskade/mcp-server
```

You need Node.js 18 or later and a Taskade personal access token. Create the token at [https://www.taskade.com/settings/api](https://www.taskade.com/settings/api).

Legacy mode:

```sh
TASKADE_API_KEY="your-api-key-here" npx -y @taskade/mcp-server --legacy
```

A client config with `npx -y @taskade/mcp-server` and no version gets version 1.0.0 at the next start of the client. To keep the behavior of version 0.2.1 with no other change, use `@taskade/mcp-server@0.2.1`.

To test the package against a local mock, set `TASKADE_MCP_URL`. It accepts only an address on `https://www.taskade.com`, `127.0.0.1`, `localhost` or `[::1]`, because the package sends your token there.

To list the tools and call them, run the package in the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```sh
npx @modelcontextprotocol/inspector -e TASKADE_API_KEY=your-api-key-here -- npx -y @taskade/mcp-server
```

This package runs over stdio only. For a client that connects over HTTP, use the hosted server at `https://www.taskade.com/mcp`.
