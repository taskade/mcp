# Taskade MCP Server - n8n Integration Guide

## Overview

This n8n workflow provides a complete integration between an MCP (Model Context Protocol) server and the Taskade API. It implements all 25 Taskade API endpoints as HTTP Request nodes, routed through a webhook trigger that acts as an MCP server endpoint.

## Architecture

```
┌─────────────────────┐
│  MCP Server Trigger │ ← Receives incoming MCP requests via webhook
│   (Webhook Node)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Route by Tool Name  │ ← Switch node routes to appropriate HTTP endpoint
│   (Switch Node)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   HTTP Request      │ ← 25 HTTP nodes for each Taskade endpoint
│      Nodes          │
│  (21 endpoints)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Respond to Webhook  │ ← Returns formatted response
└─────────────────────┘
```

## Workflow Components

### 1. MCP Server Trigger (Webhook Node)
- **Type**: `n8n-nodes-base.webhook`
- **Path**: `/taskade-mcp`
- **Method**: POST
- **Purpose**: Acts as the entry point for all MCP requests

### 2. Route by Tool Name (Switch Node)
- **Type**: `n8n-nodes-base.switch`
- **Purpose**: Routes requests to the appropriate HTTP endpoint based on the `tool` field in the incoming request
- **Routes 21 different operations**

### 3. HTTP Request Nodes (25 nodes total)

#### Workspace Operations (3 endpoints)
1. **GET Workspaces** - `GET /workspaces`
2. **POST Workspace Create Project** - `POST /workspaces/{workspaceId}/projects`
3. **GET Workspace Folders** - `GET /workspaces/{workspaceId}/folders`

#### Project Operations (5 endpoints)
4. **GET Project** - `GET /projects/{projectId}`
5. **POST Project Create** - `POST /projects`
6. **POST Project Copy** - `POST /projects/{projectId}/copy`
7. **GET Project Blocks** - `GET /projects/{projectId}/blocks`
8. **GET Project Tasks** - `GET /projects/{projectId}/tasks`

#### Task Operations (12 endpoints)
9. **GET Task** - `GET /projects/{projectId}/tasks/{taskId}`
10. **PUT Task Update** - `PUT /projects/{projectId}/tasks/{taskId}`
11. **POST Task Create** - `POST /projects/{projectId}/tasks/`
12. **POST Task Complete** - `POST /projects/{projectId}/tasks/{taskId}/complete`
13. **PUT Task Move** - `PUT /projects/{projectId}/tasks/{taskId}/move`
14. **GET Task Assignees** - `GET /projects/{projectId}/tasks/{taskId}/assignees`
15. **PUT Task Assignees** - `PUT /projects/{projectId}/tasks/{taskId}/assignees`
16. **DELETE Task Assignee** - `DELETE /projects/{projectId}/tasks/{taskId}/assignees/{assigneeHandle}`
17. **GET Task Date** - `GET /projects/{projectId}/tasks/{taskId}/date`
18. **PUT Task Date** - `PUT /projects/{projectId}/tasks/{taskId}/date`
19. **DELETE Task Date** - `DELETE /projects/{projectId}/tasks/{taskId}/date`
20. **PUT Task Note** - `PUT /projects/{projectId}/tasks/{taskId}/note`

#### Folder Operations (1 endpoint)
21. **GET Folder Projects** - `GET /folders/{folderId}/projects`

### 4. Response Handler
- **Type**: `n8n-nodes-base.respondToWebhook`
- **Purpose**: Formats and returns the API response back to the webhook caller

## Installation

### Prerequisites
- n8n instance (self-hosted or cloud)
- Taskade API key (get one at https://www.taskade.com/settings/password)

### Steps

1. **Import the Workflow**
   ```bash
   # In your n8n instance, go to:
   # Workflows → Import from File → Select n8n-taskade-mcp-workflow.json
   ```

2. **Configure Environment Variable**
   Set the `TASKADE_API_KEY` environment variable in your n8n instance:

   For Docker:
   ```bash
   docker run -e TASKADE_API_KEY="your_api_key_here" ...
   ```

   For self-hosted:
   ```bash
   export TASKADE_API_KEY="your_api_key_here"
   ```

3. **Activate the Workflow**
   - Open the workflow in n8n
   - Click "Activate" in the top right

4. **Get Your Webhook URL**
   - Click on the "MCP Server Trigger" node
   - Copy the production webhook URL (e.g., `https://your-n8n.com/webhook/taskade-mcp`)

## Usage

### Request Format

Send POST requests to your webhook URL with the following JSON structure:

```json
{
  "tool": "workspacesGet",
  "params": {}
}
```

Or for operations requiring parameters:

```json
{
  "tool": "taskCreate",
  "params": {
    "projectId": "project-uuid",
    "tasks": [
      {
        "contentType": "text/plain",
        "content": "My new task",
        "placement": "beforeend"
      }
    ]
  }
}
```

### Example Requests

#### 1. Get All Workspaces
```bash
curl -X POST https://your-n8n.com/webhook/taskade-mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "workspacesGet",
    "params": {}
  }'
```

#### 2. Create a Project
```bash
curl -X POST https://your-n8n.com/webhook/taskade-mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "projectCreate",
    "params": {
      "folderId": "folder-uuid",
      "contentType": "text/markdown",
      "content": "# My New Project\n- Task 1\n- Task 2"
    }
  }'
```

#### 3. Create a Task
```bash
curl -X POST https://your-n8n.com/webhook/taskade-mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "taskCreate",
    "params": {
      "projectId": "project-uuid",
      "tasks": [
        {
          "contentType": "text/plain",
          "content": "Complete integration",
          "placement": "beforeend"
        }
      ]
    }
  }'
```

#### 4. Update Task Assignees
```bash
curl -X POST https://your-n8n.com/webhook/taskade-mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "taskPutAssignees",
    "params": {
      "projectId": "project-uuid",
      "taskId": "task-uuid",
      "handles": ["@username1", "@username2"]
    }
  }'
```

## Tool Reference

| Tool Name | Method | Endpoint | Required Params |
|-----------|--------|----------|-----------------|
| `workspacesGet` | GET | `/workspaces` | None |
| `workspaceCreateProject` | POST | `/workspaces/{workspaceId}/projects` | `workspaceId` |
| `workspaceFoldersGet` | GET | `/workspaces/{workspaceId}/folders` | `workspaceId` |
| `projectGet` | GET | `/projects/{projectId}` | `projectId` |
| `projectCreate` | POST | `/projects` | None |
| `projectCopy` | POST | `/projects/{projectId}/copy` | `projectId` |
| `projectBlocksGet` | GET | `/projects/{projectId}/blocks` | `projectId` |
| `projectTasksGet` | GET | `/projects/{projectId}/tasks` | `projectId` |
| `taskGet` | GET | `/projects/{projectId}/tasks/{taskId}` | `projectId`, `taskId` |
| `taskPut` | PUT | `/projects/{projectId}/tasks/{taskId}` | `projectId`, `taskId` |
| `taskCreate` | POST | `/projects/{projectId}/tasks/` | `projectId` |
| `taskComplete` | POST | `/projects/{projectId}/tasks/{taskId}/complete` | `projectId`, `taskId` |
| `taskMove` | PUT | `/projects/{projectId}/tasks/{taskId}/move` | `projectId`, `taskId` |
| `taskAssigneesGet` | GET | `/projects/{projectId}/tasks/{taskId}/assignees` | `projectId`, `taskId` |
| `taskPutAssignees` | PUT | `/projects/{projectId}/tasks/{taskId}/assignees` | `projectId`, `taskId` |
| `taskDeleteAssignees` | DELETE | `/projects/{projectId}/tasks/{taskId}/assignees/{assigneeHandle}` | `projectId`, `taskId`, `assigneeHandle` |
| `taskGetDate` | GET | `/projects/{projectId}/tasks/{taskId}/date` | `projectId`, `taskId` |
| `taskPutDate` | PUT | `/projects/{projectId}/tasks/{taskId}/date` | `projectId`, `taskId` |
| `taskDeleteDate` | DELETE | `/projects/{projectId}/tasks/{taskId}/date` | `projectId`, `taskId` |
| `taskNotePut` | PUT | `/projects/{projectId}/tasks/{taskId}/note` | `projectId`, `taskId` |
| `folderProjectsGet` | GET | `/folders/{folderId}/projects` | `folderId` |

## Configuration Details

### Authentication
All HTTP nodes are configured to use the `TASKADE_API_KEY` environment variable:
- Header: `Authorization: Bearer {{ $env.TASKADE_API_KEY }}`
- Base URL: `https://www.taskade.com/api/v1`

### Parameter Mapping
The workflow uses n8n expressions to map incoming parameters:
- Path parameters: `{{ $json.params.paramName }}`
- Query parameters: Dynamically constructed in the URL
- Body parameters: Mapped from `$json.params` object

### Response Format
All responses are returned as JSON through the "Respond to Webhook" node.

## Troubleshooting

### Common Issues

1. **"TASKADE_API_KEY is not defined"**
   - Ensure the environment variable is set in your n8n instance
   - Restart n8n after setting the variable

2. **"404 Not Found"**
   - Check that the workflow is activated
   - Verify the webhook URL is correct
   - Ensure the `tool` name matches exactly

3. **"Invalid tool name"**
   - Check the spelling of the `tool` field
   - Refer to the Tool Reference table for valid names

4. **"Missing required parameter"**
   - Check the Tool Reference for required parameters
   - Ensure all required fields are in the `params` object

## Development

### Testing the Workflow
1. Use the n8n "Execute Workflow" button to test with manual data
2. Use the "Listen for Test Event" in the webhook node
3. Send test requests using curl or Postman

### Extending the Workflow
To add new endpoints:
1. Add a new condition in the "Route by Tool Name" switch node
2. Create a new HTTP Request node
3. Configure the endpoint, method, and parameters
4. Connect the new node to the response handler

## API Documentation

For complete Taskade API documentation, visit:
- Developer Docs: https://developers.taskade.com
- API Reference: https://developers.taskade.com/reference

## Support

- Taskade Community: https://www.taskade.com/community
- GitHub Issues: https://github.com/taskade/mcp/issues
- Email: hello@taskade.com

## License

This workflow is part of the Taskade MCP project. See LICENSE file for details.
