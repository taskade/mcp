---
"@taskade/mcp-server": patch
---

Install no runtime dependencies. `bin/cli.mjs` already bundles the MCP SDK, `node-fetch` and `zod`, so these packages and `mcp-proxy` move to `devDependencies`. `npx @taskade/mcp-server` now installs 1 package instead of 120. The README no longer documents a `--http` mode, because the package runs over stdio only.
