---
"@taskade/mcp-server": major
---

The package now forwards to the hosted Taskade MCP server by default. It connects to `https://www.taskade.com/mcp` with `TASKADE_API_KEY` as a Bearer token, and serves the hosted tools with their names, titles, annotations, schemas, results and errors. It also passes through the instructions, resources and prompts of the hosted server, and the notifications that a list changed. It does not pass through progress notifications, log messages, resource subscriptions, or the roots, sampling and elicitation capabilities of the client. The default mode needs a paid Taskade plan, as the hosted server does. At each start, the package writes one line about `--legacy` to stderr, and adds one sentence about it after the hosted instructions.

A client config with `npx -y @taskade/mcp-server` and no version gets this version at the next start of the client. To keep the behavior of version 0.2.1 with no other change, use `@taskade/mcp-server@0.2.1`.

This is a breaking change for a prompt, skill or script that names a tool of version 0.2, for example `workspacesGet` (now `list_spaces`) or `promptAgent` (now `prompt_agent`). Start the package with `--legacy`, or set `TASKADE_MCP_LEGACY=1`, to get the 66 tools of version 0.2 with the same names and the same API calls, on any plan. Legacy mode stays for one major version.

A token that the hosted server refuses (HTTP 401) stops the package with one message. It tells how to create a token, states the plan rule and names `--legacy`. A network failure or an HTTP error at the start stops the package with one message that names `--legacy` too. In the default mode, every start failure, also a missing or short token, goes to stderr and is the error of the `initialize` request. Legacy mode writes it only to stderr, as before. The package removes the whitespace around the token, as version 0.2 did. A control character that is still in the token, for example a line break inside it, stops the package before any request. No message holds the token. `TASKADE_MCP_URL` points the package at a mock for a test. It accepts only `https://www.taskade.com`, or `127.0.0.1`, `localhost` and `[::1]`.
