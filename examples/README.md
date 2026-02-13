# Taskade MCP Server — Integration Examples

Ready-to-use templates for connecting Taskade MCP Server to popular AI and automation platforms.

## n8n

Import [`n8n-taskade-mcp-workflow.json`](./n8n-taskade-mcp-workflow.json) into n8n to create an AI agent with access to all 62+ Taskade tools.

### Prerequisites

1. Install the [n8n MCP Client](https://www.npmjs.com/package/n8n-nodes-mcp) community node
2. Set `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` in your n8n environment
3. Get your Taskade API key from [Settings > API](https://taskade.com)

### Setup

1. In n8n, go to **Settings > Community Nodes > Install** and add `n8n-nodes-mcp`
2. Import the workflow JSON via **Workflow > Import from File**
3. Replace `YOUR_TASKADE_API_KEY` in the Taskade MCP node with your actual API key
4. Configure your OpenAI (or other LLM) credentials
5. Activate the workflow

### What you can do

Ask the AI agent natural language questions like:

- "Show me all my projects in Taskade"
- "Create a new project called Q1 Planning with tasks for each team"
- "What tasks are overdue?"
- "Create an AI agent that monitors project deadlines"

### Alternative: HTTP/SSE mode

If you prefer to run the MCP server as a standalone HTTP service:

```bash
PORT=3001 npx @taskade/mcp-server --http --token YOUR_TASKADE_API_KEY
```

Then configure the n8n MCP node to use **HTTP Streamable** transport with URL `http://localhost:3001/mcp`.

## More examples coming soon

- CrewAI integration
- LangChain tool binding
- AutoGen agent example
