# Taskade MCP Server

MCP server for Taskade's public API

## Manual setup

- Clone this repo: `git clone git@github.com:taskade/mcp.git`
- Install dependencies: `yarn install`
- Build: `yarn build`
- Install server on your MCP client.

For example, to install the server on Claude, edit your `claude_desktop_config.json`:

```json
{
    "mcpServers": {
        "taskade": {
            "command": "node",
            "args": [
                "/Users/prevwong/Documents/taskade/mcp" // path to this repo
            ],
            "env": {
                "TASKADE_API_KEY": "INSERT_YOUR_TASKADE_PERSONAL_ACCESS_TOKEN_HERE"
            }
        }
    }
}
```
> You will need a valid Taskade personal access token, generate one [here](https://www.taskade.com/settings/password)

### Connect Via SSE/Streamable HTTP

For clients that support connecting MCP servers via SSE/Streamable HTTP (ie: Cursor):

1. Run the local server: `yarn start:server`
2. Add the SSE endpoint in your client config (ie: `~/.cursor/mcp.json`):

```
```json
{
    "mcpServers": {
        "taskade": {
            "url": "http://localhost:3000/sse?access_token=INSERT_YOUR_TASKADE_PERSONAL_ACCESS_TOKEN_HERE"
        }
    }
}
```