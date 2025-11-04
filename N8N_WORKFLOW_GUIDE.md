# Taskade MCP Server - n8n Integration Guide

## Overview

This n8n workflow provides a complete **MCP (Model Context Protocol) server** integration for the Taskade API. It implements all 21 Taskade API endpoints as AI-powered HTTP Request Tool nodes, accessible through a centralized MCP Server Trigger.

## Architecture

```
┌─────────────────────────────────┐
│   MCP Server Trigger Node       │ ← Entry point for AI/MCP clients
│ (@n8n/n8n-nodes-langchain.      │
│       mcpTrigger)                │
└────────────┬────────────────────┘
             │ ai_tool connections
             ├─────────────────────────────────┐
             │                                 │
             ▼                                 ▼
┌──────────────────────┐      ┌──────────────────────┐
│ HTTP Request Tool    │      │ HTTP Request Tool    │
│  workspacesGet       │ ...  │  folderProjectsGet   │
│ (httpRequestTool)    │      │  (httpRequestTool)   │
└──────────────────────┘      └──────────────────────┘
         (21 AI-enabled HTTP tool nodes)
```

## Key Features

- **AI-Native Design**: Uses `$fromAI()` function for dynamic parameter extraction from AI requests
- **MCP Protocol**: Fully compliant with Model Context Protocol standard
- **21 Tool Nodes**: Complete coverage of Taskade API endpoints
- **ai_tool Connections**: All tools connect via `ai_tool` type for AI orchestration
- **Zero Manual Routing**: MCP Trigger automatically routes requests to the appropriate tool

## Workflow Components

### 1. MCP Server Trigger
- **Type**: `@n8n/n8n-nodes-langchain.mcpTrigger` (v2)
- **Path**: `/taskade-mcp-server`
- **Purpose**: Acts as the MCP server endpoint, automatically routing tool calls to HTTP Request Tool nodes
- **Webhook ID**: `taskade-mcp-server`

### 2. HTTP Request Tool Nodes (21 nodes)

All nodes use:
- **Type**: `n8n-nodes-base.httpRequestTool` (v4.3)
- **Connection Type**: `ai_tool` (connects to MCP Trigger)
- **Parameter Extraction**: `$fromAI()` function for AI-driven parameter passing
- **Authentication**: Bearer token via `$fromAI('api_key', ...)`

#### Workspace Operations (3 tools)
1. **workspacesGet** - Get all workspaces
2. **workspaceCreateProject** - Create project in workspace
3. **workspaceFoldersGet** - Get folders in workspace

#### Project Operations (5 tools)
4. **projectGet** - Get project by ID
5. **projectCreate** - Create new project
6. **projectCopy** - Copy existing project
7. **projectBlocksGet** - Get project blocks (with pagination)
8. **projectTasksGet** - Get project tasks (with pagination)

#### Task Operations (12 tools)
9. **taskGet** - Get task by ID
10. **taskPut** - Update task content
11. **taskCreate** - Create one or more tasks
12. **taskComplete** - Mark task as complete
13. **taskMove** - Move task within project
14. **taskAssigneesGet** - Get task assignees
15. **taskPutAssignees** - Assign users to task
16. **taskDeleteAssignees** - Remove assignee from task
17. **taskGetDate** - Get task date
18. **taskPutDate** - Set or update task date
19. **taskDeleteDate** - Delete task date
20. **taskNotePut** - Add/update task note

#### Folder Operations (1 tool)
21. **folderProjectsGet** - Get projects in folder

## Installation

### Prerequisites
- n8n instance (v1.0+ with LangChain node support)
- Taskade API key from https://www.taskade.com/settings/password
- MCP-compatible AI client (Claude Desktop, Cline, etc.)

### Setup Steps

1. **Import the Workflow**
   - In n8n, go to: Workflows → Import from File
   - Select `n8n-taskade-mcp-workflow.json`
   - Click Import

2. **Activate the Workflow**
   - Open the imported workflow
   - Click "Activate" in the top right corner

3. **Get Your MCP Server URL**
   - Click on the "MCP Server Trigger" node
   - Copy the production URL (e.g., `https://your-n8n.com/webhook/taskade-mcp-server`)

4. **Configure Your AI Client**

   For **Claude Desktop**, edit `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "taskade-n8n": {
         "url": "https://your-n8n.com/webhook/taskade-mcp-server",
         "apiKey": "YOUR_TASKADE_API_KEY"
       }
     }
   }
   ```

   For **Cline/Cursor**, edit MCP settings:
   ```json
   {
     "mcpServers": {
       "taskade-n8n": {
         "url": "https://your-n8n.com/webhook/taskade-mcp-server",
         "headers": {
           "api_key": "YOUR_TASKADE_API_KEY"
         }
       }
     }
   }
   ```

## Usage

### How It Works

1. **AI Client** sends MCP tool request to n8n webhook
2. **MCP Trigger** receives request and identifies the tool
3. **HTTP Request Tool** extracts parameters using `$fromAI()`
4. **Taskade API** receives the formatted HTTP request
5. **Response** flows back through the MCP protocol to the AI client

### Example AI Interactions

Once configured, simply chat with your AI client:

```
User: "Get all my Taskade workspaces"
AI: [Calls workspacesGet tool via MCP]
→ Returns list of workspaces

User: "Create a new task in project abc123 with content 'Review PR'"
AI: [Calls taskCreate tool with projectId and task data]
→ Creates task and returns task details

User: "Assign @john to task xyz789 in project abc123"
AI: [Calls taskPutAssignees with projectId, taskId, and handles]
→ Assigns user and confirms
```

### Direct MCP Tool Calls

You can also test tools directly using MCP protocol:

```json
POST https://your-n8n.com/webhook/taskade-mcp-server
Content-Type: application/json

{
  "method": "tools/call",
  "params": {
    "name": "workspacesGet",
    "arguments": {
      "api_key": "your_taskade_api_key"
    }
  }
}
```

## Tool Reference

| Tool Name | HTTP Method | Endpoint Pattern | Required Parameters |
|-----------|-------------|------------------|---------------------|
| `workspacesGet` | GET | `/workspaces` | `api_key` |
| `workspaceCreateProject` | POST | `/workspaces/{workspaceId}/projects` | `api_key`, `workspaceId`, `content` |
| `workspaceFoldersGet` | GET | `/workspaces/{workspaceId}/folders` | `api_key`, `workspaceId` |
| `projectGet` | GET | `/projects/{projectId}` | `api_key`, `projectId` |
| `projectCreate` | POST | `/projects` | `api_key`, `content` |
| `projectCopy` | POST | `/projects/{projectId}/copy` | `api_key`, `projectId` |
| `projectBlocksGet` | GET | `/projects/{projectId}/blocks` | `api_key`, `projectId` |
| `projectTasksGet` | GET | `/projects/{projectId}/tasks` | `api_key`, `projectId` |
| `taskGet` | GET | `/projects/{projectId}/tasks/{taskId}` | `api_key`, `projectId`, `taskId` |
| `taskPut` | PUT | `/projects/{projectId}/tasks/{taskId}` | `api_key`, `projectId`, `taskId`, `content` |
| `taskCreate` | POST | `/projects/{projectId}/tasks/` | `api_key`, `projectId`, `tasks` |
| `taskComplete` | POST | `/projects/{projectId}/tasks/{taskId}/complete` | `api_key`, `projectId`, `taskId` |
| `taskMove` | PUT | `/projects/{projectId}/tasks/{taskId}/move` | `api_key`, `projectId`, `taskId`, `target` |
| `taskAssigneesGet` | GET | `/projects/{projectId}/tasks/{taskId}/assignees` | `api_key`, `projectId`, `taskId` |
| `taskPutAssignees` | PUT | `/projects/{projectId}/tasks/{taskId}/assignees` | `api_key`, `projectId`, `taskId`, `handles` |
| `taskDeleteAssignees` | DELETE | `/projects/{projectId}/tasks/{taskId}/assignees/{assigneeHandle}` | `api_key`, `projectId`, `taskId`, `assigneeHandle` |
| `taskGetDate` | GET | `/projects/{projectId}/tasks/{taskId}/date` | `api_key`, `projectId`, `taskId` |
| `taskPutDate` | PUT | `/projects/{projectId}/tasks/{taskId}/date` | `api_key`, `projectId`, `taskId` |
| `taskDeleteDate` | DELETE | `/projects/{projectId}/tasks/{taskId}/date` | `api_key`, `projectId`, `taskId` |
| `taskNotePut` | PUT | `/projects/{projectId}/tasks/{taskId}/note` | `api_key`, `projectId`, `taskId`, `value` |
| `folderProjectsGet` | GET | `/folders/{folderId}/projects` | `api_key`, `folderId` |

## Technical Details

### $fromAI() Function

The `$fromAI()` function is n8n's mechanism for extracting parameters from AI/MCP requests:

```javascript
$fromAI('parameterName', 'Description for AI', 'dataType')
```

Example from workflow:
```javascript
"url": "={{ 'https://www.taskade.com/api/v1/projects/' + $fromAI('projectId', 'The project ID', 'string') }}"
```

### ai_tool Connection Type

All HTTP Request Tool nodes connect to the MCP Trigger using `ai_tool` connection type:

```json
"connections": {
  "workspacesGet": {
    "ai_tool": [
      [
        {
          "node": "MCP Server Trigger",
          "type": "ai_tool",
          "index": 0
        }
      ]
    ]
  }
}
```

### Authentication Flow

1. AI client sends `api_key` parameter
2. Each tool extracts it via `$fromAI('api_key', ...)`
3. Tool formats as: `Bearer {api_key}` in Authorization header
4. Taskade API validates and processes request

## Troubleshooting

### Common Issues

**"Tool not found"**
- Verify the workflow is activated in n8n
- Check that all 21 tools are properly connected to MCP Trigger
- Ensure tool names match exactly (case-sensitive)

**"Missing api_key parameter"**
- AI client must send `api_key` with every request
- Check your MCP client configuration includes the API key
- Verify the key is valid at https://www.taskade.com/settings/password

**"$fromAI is not defined"**
- Ensure you're using n8n v1.0+ with LangChain support
- Update n8n if using older version
- Check that nodes are `httpRequestTool` type, not `httpRequest`

**"Connection type 'ai_tool' not recognized"**
- Verify n8n supports LangChain nodes
- Reimport the workflow JSON
- Check that MCP Trigger is `@n8n/n8n-nodes-langchain.mcpTrigger`

### Testing Individual Tools

Test a single tool by sending MCP request:

```bash
curl -X POST https://your-n8n.com/webhook/taskade-mcp-server \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "workspacesGet",
      "arguments": {
        "api_key": "your_api_key"
      }
    }
  }'
```

## Advanced Configuration

### Custom Tool Descriptions

Edit node descriptions to improve AI understanding:

1. Click on any HTTP Request Tool node
2. Update the "Description" field in node settings
3. Save and reactivate workflow

### Adding Rate Limiting

Add rate limiting to the MCP Trigger:

1. Add a "Rate Limit" node before HTTP tools
2. Configure requests per time window
3. Reconnect via ai_tool connections

### Error Handling

Add error handling nodes:

1. Create an "Error Trigger" node
2. Configure notification (email, Slack, etc.)
3. Link to failed tool executions

## API Documentation

- **Taskade API Docs**: https://developers.taskade.com
- **MCP Protocol**: https://modelcontextprotocol.io
- **n8n LangChain Nodes**: https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.mcptrigger/

## Support

- **Taskade**:
  - Community: https://www.taskade.com/community
  - Email: hello@taskade.com
  - GitHub: https://github.com/taskade/mcp

- **n8n**:
  - Community: https://community.n8n.io
  - Docs: https://docs.n8n.io

## License

This workflow is part of the Taskade MCP project. See LICENSE file for details.

---

**Note**: This workflow requires n8n v1.0+ with LangChain node support. For older n8n versions, use the legacy webhook-based approach.
