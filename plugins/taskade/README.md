<!-- Generated from taskade/skills version 0.7.0 by scripts/sync-mcp.sh. Edit the plugin in taskade/skills, not here. -->

# Taskade

This plugin connects Claude to your [Taskade](https://www.taskade.com) workspace. Its skills tell Claude which Taskade tools to use and what to check before it reports back.

## Install

In Claude Code, run this command:

```sh
/plugin install taskade --marketplace taskade/skills
```

An older version of Claude Code needs two commands:

```sh
claude plugin marketplace add taskade/skills
claude plugin install taskade@taskade-skills
```

Then run `/mcp`, select **taskade** and sign in.

## Skills

- **taskade**: the front door. It connects Taskade, shows what is in the workspace, reads and changes projects, tasks, fields, AI agents and Taskade Genesis app files, picks the project view that answers a question, and reads, runs and turns automations on or off.
- **taskade-build-app**: plans a new Taskade Genesis app, writes the build request for Taskade EVE with a link that fills it in, and checks the build against the plan.
- **taskade-spreadsheet-to-app**: turns a CSV or Excel file into a project or app, with sample rows first and the real rows after a yes, and skips duplicates.
- **taskade-fix-app**: fixes a problem in a Taskade Genesis app, one checked change at a time, and proves it for a visitor, the owner and a signed-in member.
- **taskade-report**: writes a one-screen status report on your projects and automations.
- **taskade-check-app**: checks the pages, lists and automations of your apps, each as pass, fail or not checked, with the fix. It changes nothing.
- **taskade-fix-first-screen**: makes the first screen show the result at once on a phone, with one first action that saves with 0 AI credits and marked sample rows.
- **taskade-secure-app**: checks who can sign in and which lists are private, reads who can use each list, and sets the sign-up with your yes (or names the 2 settings to confirm in Taskade).
- **taskade-fix-flows**: makes your automations work, with a preview and your yes before each change.
- **taskade-clone-kit**: copies an app kit and makes it yours in 3 steps.
- **taskade-publish-app**: backs up an app, walks you through Publish in Taskade, publishes a kit version, and names the way back.
- **taskade-build-agent**: creates or tunes an AI agent with instructions that you approve, the projects and files that it must know, and a few test questions.
- **taskade-repo-to-project**: turns the plan of a code repository into a Taskade project, and updates it on a later run with no duplicate.
- **taskade-markdown**: writes a Markdown or CSV file that Taskade imports as a clean project. It needs no connection.

## How it connects

The plugin uses the hosted Taskade MCP server at `https://www.taskade.com/mcp`. You sign in once with your Taskade account through OAuth. You do not need an API key. MCP access is part of every paid Taskade plan (Starter and up). The skill `taskade-markdown`, the view advice of `taskade`, and the plan and build request of `taskade-build-app` work with no connection. You need a Taskade account to import a file, to change a view or to start a build.

## What data it sends

The plugin runs no code of its own. Tool calls go only to `https://www.taskade.com/mcp`. The server reads and writes only the workspaces that your account can access. The `taskade-publish-app` skill writes its backup to a local folder (`./taskade-backup/` unless you name another one). The `taskade-repo-to-project` skill reads the local repository and, when the GitHub CLI is signed in, the open GitHub issues. It sends no source code to Taskade.

## What you do in Taskade

Taskade EVE builds an app, creates an automation, and adds or removes its steps inside Taskade. The plugin writes the request for Taskade EVE, and for a new app it gives you a link that fills in the request and starts nothing. You publish an app, choose who can use it, turn an automation On or Off (or let the skills do it with your yes), and connect a domain in Taskade. Taskade EVE can propose who can use the app.

## Links

- Documentation: [taskade.com/docs/mcp](https://www.taskade.com/docs/mcp)
- Support: [help.taskade.com](https://help.taskade.com/en/)
- Privacy policy: [taskade.com/privacy](https://www.taskade.com/privacy)
- Terms of service: [taskade.com/terms](https://www.taskade.com/terms)
- License: MIT
