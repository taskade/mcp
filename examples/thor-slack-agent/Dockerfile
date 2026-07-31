# Thor — Slack AI agent (Socket Mode: dials out, no inbound ports)
FROM node:20-slim

WORKDIR /app

# Install deps first for better layer caching.
COPY package.json ./
RUN npm install

# Build.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Pre-install the Taskade MCP server so Thor doesn't fetch it on each cold start.
RUN npm install -g @taskade/mcp-server
ENV TASKADE_MCP_COMMAND=taskade-mcp-server
ENV TASKADE_MCP_ARGS=

# Socket Mode means Thor connects OUT to Slack, so no port is exposed.
CMD ["node", "dist/index.js"]
