---
"@taskade/mcp-server": major
---

The package now forwards to the hosted Taskade MCP server by default. It connects to `https://www.taskade.com/mcp` with `TASKADE_API_KEY` as a Bearer token, and serves the hosted tools with their names, titles, annotations, schemas, results and errors. It also passes through the instructions, resources and prompts of the hosted server. The default mode needs a paid Taskade plan, as the hosted server does.

This is a breaking change for a prompt, skill or script that names a tool of version 0.2, for example `workspacesGet` (now `list_spaces`) or `promptAgent` (now `prompt_agent`). Start the package with `--legacy`, or set `TASKADE_MCP_LEGACY=1`, to get the 66 tools of version 0.2 with the same names and the same API calls, on any plan. Legacy mode stays for one major version.

A token that the hosted server refuses (HTTP 401) stops the package with one message. It tells how to create a token, states the plan rule and names `--legacy`. The message never holds the token. `TASKADE_MCP_URL` points the package at another server for a test. It accepts `https://`, and `http://` only for `127.0.0.1` and `localhost`.
