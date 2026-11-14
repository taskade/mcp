# Taskade

This plugin connects Claude to your [Taskade](https://www.taskade.com) workspace. Its skills tell Claude which Taskade tools to use and what to check before it reports back.

## Skills

- **taskade**: the front door. It reads and changes projects, tasks, AI agents and Taskade Genesis app files, and reads and runs automations.
- **getting-started**: connects Taskade and shows what it can do.
- **import-spreadsheet**: imports a CSV or Excel file into a project and skips duplicates.
- **fix-my-app**: fixes a problem in a Taskade Genesis app, one checked change at a time.
- **app-report**: writes a short status report on your projects and automations.
- **backup-my-app**: copies a Taskade Genesis app into a local folder as readable files.
- **plan-new-app**: plans a new Taskade Genesis app, writes the build request for Taskade EVE with a link that fills it in, and imports real rows after the build.

## How it connects

The plugin uses the hosted Taskade MCP server at `https://www.taskade.com/mcp`. You sign in once with your Taskade account through OAuth. You do not need an API key. MCP access is part of every paid Taskade plan (Starter and up).

## What data it sends

The plugin runs no code of its own. Tool calls go only to `https://www.taskade.com/mcp`. The server reads and writes only the workspaces that your account can access. The backup skill writes files to a local folder (`./taskade-backup/` unless you name another one).

## What it cannot do

The plugin cannot build an app, add fields to a project, or create or edit an automation. Taskade EVE does those jobs inside Taskade. The plugin writes the request for Taskade EVE, and for a new app it gives you a link that fills in the request and starts nothing. You publish an app and connect a domain in Taskade. For who can use an app, Taskade EVE proposes the setting and you apply it.

## Links

- Documentation: [taskade.com/docs/mcp](https://www.taskade.com/docs/mcp)
- Support: [help.taskade.com](https://help.taskade.com/en/)
- Privacy policy: [taskade.com/privacy](https://www.taskade.com/privacy)
- Terms of service: [taskade.com/terms](https://www.taskade.com/terms)
- License: MIT
