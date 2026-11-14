# Taskade

This plugin connects Claude to your [Taskade](https://www.taskade.com) workspace. Its 7 skills tell Claude which Taskade tools to use and what to check before it reports back.

## Skills

- **taskade**: the front door. It reads and changes projects, tasks, AI agents and Taskade Genesis app files, and reads and runs automations.
- **getting-started**: connects Taskade and shows what it can do.
- **import-spreadsheet**: imports a CSV or Excel file into a project and skips duplicates.
- **fix-my-app**: fixes a problem in a Taskade Genesis app, one checked change at a time.
- **app-report**: writes a short status report on your projects and automations.
- **backup-my-app**: copies a Taskade Genesis app into a local folder as readable files.
- **plan-new-app**: plans a new Taskade Genesis app, creates its projects and AI agent, and writes the build prompt for Taskade EVE.

## How it connects

The plugin uses the hosted Taskade MCP server at `https://www.taskade.com/mcp`. You sign in once with your Taskade account through OAuth. You do not need an API key. MCP access is part of every paid Taskade plan (Starter and up).

## What data it sends

The plugin runs no code of its own. Tool calls go only to `https://www.taskade.com/mcp`. The server reads and writes only the workspaces that your account can access. The backup skill writes files to a local folder (`./taskade-backup/` unless you name another one).

## What it cannot do

The plugin cannot create or edit an automation, build or publish an app, or set who can use an app. Taskade EVE does those jobs inside Taskade. The plugin writes the request for you to paste into Taskade EVE.

## Links

- Documentation: [taskade.com/docs/mcp](https://www.taskade.com/docs/mcp)
- Support: [help.taskade.com](https://help.taskade.com/en/)
- Privacy policy: [taskade.com/privacy](https://www.taskade.com/privacy)
- Terms of service: [taskade.com/terms](https://www.taskade.com/terms)
- License: MIT
