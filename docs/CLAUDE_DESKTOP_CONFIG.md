# Claude Desktop Integration Guide

This guide explains how to configure Claude Desktop to use the Taskade MCP Server.

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Claude Desktop | Latest version installed |
| Taskade Account | Active account with API access |
| Personal Access Token | Generated from Taskade settings |
| Node.js | v20 or later (for local development) |

## Generate Your Taskade API Token

1. Navigate to [Taskade Settings](https://www.taskade.com/settings/password)
2. Scroll to "Personal Access Tokens"
3. Click "Generate New Token"
4. Copy the token immediately (shown only once)
5. Store securely — never commit to version control

## Configuration Methods

### Method 1: NPX (Recommended)

Use the published npm package — no local installation required.

**Config file location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "taskade": {
      "command": "npx",
      "args": ["-y", "@taskade/mcp-server"],
      "env": {
        "TASKADE_API_KEY": "your_taskade_personal_access_token_here"
      }
    }
  }
}
```

### Method 2: Local Development

For development or customization, run from a local clone.

**Steps:**

1. Clone the repository:
   ```bash
   git clone https://github.com/taskade/mcp.git
   cd mcp
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build:
   ```bash
   pnpm run build
   ```

4. Configure Claude Desktop:

```json
{
  "mcpServers": {
    "taskade": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/packages/server/bin/cli.mjs"],
      "env": {
        "TASKADE_API_KEY": "your_taskade_personal_access_token_here"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/mcp` with the actual path to your cloned repository.

## Verify Installation

1. Restart Claude Desktop after saving configuration
2. Open a new conversation
3. Claude should now have access to Taskade tools
4. Test with: "List my Taskade workspaces"

## Available Tools

| Tool | Description |
|------|-------------|
| `workspacesGet` | List all workspaces |
| `workspaceFoldersGet` | List folders in a workspace |
| `folderProjectsGet` | List projects in a folder |
| `projectGet` | Get project details |
| `projectTasksGet` | List tasks in a project |
| `taskCreate` | Create a new task |
| `taskComplete` | Mark a task complete |
| `taskPut` | Update a task |

See [constants.ts](../packages/server/src/constants.ts) for the complete list of 21 enabled tools.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "TASKADE_API_KEY not set" | Verify env variable in config |
| Tools not appearing | Restart Claude Desktop |
| Permission errors | Verify token has required scopes |
| Connection timeout | Check network/firewall settings |

### Debug Mode

To see server logs, run manually in terminal:

```bash
TASKADE_API_KEY="your_token" npx -y @taskade/mcp-server
```

Or for local builds:

```bash
TASKADE_API_KEY="your_token" node /path/to/packages/server/bin/cli.mjs
```

## Security Notes

- Never share your API token
- Token is passed via environment variable, not stored in code
- See [SECURITY.md](../SECURITY.md) for token rotation procedures
- For production deployments, rotate tokens quarterly

## Related Documentation

- [Cursor SSE Configuration](./CURSOR_SSE_CONFIG.md)
- [Security Policy](../SECURITY.md)
- [Taskade API Documentation](https://developers.taskade.com)
