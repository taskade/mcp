# Cursor SSE Integration Guide

This guide explains how to configure Cursor to use the Taskade MCP Server via SSE (Server-Sent Events).

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Cursor | Latest version with MCP support |
| Taskade Account | Active account with API access |
| Personal Access Token | Generated from Taskade settings |
| Node.js | v20 or later |

## Generate Your Taskade API Token

1. Navigate to [Taskade Settings](https://www.taskade.com/settings/password)
2. Scroll to "Personal Access Tokens"
3. Click "Generate New Token"
4. Copy the token immediately (shown only once)
5. Store securely — never commit to version control

## Configuration Methods

### Method 1: NPX with stdio (Simple)

For basic integration without running a server.

**Config file location:** `~/.cursor/mcp.json`

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

### Method 2: SSE/HTTP (Advanced)

For clients that support SSE connections. Requires running a local server.

**Step 1: Clone and build**

```bash
git clone https://github.com/taskade/mcp.git
cd mcp
pnpm install
pnpm run build
```

**Step 2: Start the HTTP server**

```bash
cd packages/server
pnpm run start:server
```

The server will start on port 3000.

**Step 3: Configure Cursor**

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "taskade": {
      "url": "http://localhost:3000/sse?access_token=your_taskade_personal_access_token_here"
    }
  }
}
```

## Security Considerations

⚠️ **IMPORTANT:** The SSE/HTTP mode passes your access token as a URL query parameter.

| Risk | Mitigation |
|------|------------|
| Token in URL | Use HTTPS in production |
| Token in logs | Configure server to not log URLs |
| Token exposure | Only use on localhost or behind TLS |

For production deployments, place the server behind a reverse proxy with HTTPS.

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
| Connection refused | Verify server is running on port 3000 |
| "Access token required" | Check token in URL query param |
| Tools not appearing | Restart Cursor after config change |
| CORS errors | Not applicable for SSE transport |

### Verify Server is Running

```bash
curl -v "http://localhost:3000/sse?access_token=test"
```

Expected: SSE connection established (will hang waiting for events).

### View Server Logs

The server outputs to stderr. When starting with `pnpm run start:server`, you'll see:

```
⚠️  SECURITY WARNING: HTTP/SSE mode passes access tokens via query parameters.
   For production use, ensure this server is behind HTTPS/TLS.
   Tokens in HTTP URLs may be logged or intercepted.
   See SECURITY.md for best practices.
```

This warning is expected and reminds you to use HTTPS in production.

## Production Deployment

For production use:

1. Deploy behind HTTPS reverse proxy (nginx, Caddy, etc.)
2. Use environment variables for token (not URL params)
3. Implement rate limiting
4. Enable access logging (without tokens)

Example nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name mcp.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /sse {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_cache off;
    }
}
```

## Related Documentation

- [Claude Desktop Configuration](./CLAUDE_DESKTOP_CONFIG.md)
- [Security Policy](../SECURITY.md)
- [Taskade API Documentation](https://developers.taskade.com)
