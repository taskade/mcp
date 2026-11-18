---
'@taskade/mcp-openapi-codegen': patch
'@taskade/mcp-server': patch
---

Send the description of each OpenAPI parameter and a top-level `title` for each tool.

- The codegen now copies the `description` of an OpenAPI Parameter Object into the tool input schema. Before, it read only the parameter `schema` and dropped the description.
- The generated code now calls `.update({ title })` on the tool that `server.tool()` returns, so `tools/list` returns the action title as a top-level `title`, as the MCP specification defines it. The title stays in `annotations.title` too. The generated code needs `@modelcontextprotocol/sdk` 1.13.0 or later.
- A new action option, `parameterDescriptions`, describes the parameters that the spec does not describe. A spec description always wins.
- The server describes its id, page and limit parameters, and pins the version of `@taskade/mcp-server` in the Dockerfile. `yarn changeset:version` updates the pin for each release.

No tool name, tool description, input type or required list changes.
