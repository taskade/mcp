FROM node:20-slim

LABEL maintainer="Taskade <support@taskade.com>"
LABEL description="Taskade MCP Server — 62+ AI tools for project management via Model Context Protocol"
LABEL org.opencontainers.image.source="https://github.com/taskade/mcp"
LABEL org.opencontainers.image.licenses="MIT"

RUN npm install -g @taskade/mcp-server

ENTRYPOINT ["taskade-mcp-server"]
