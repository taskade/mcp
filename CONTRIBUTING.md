# Contributing

Thank you for considering to contribute to Taskade's MCP initiative.

If you are interested in proposing a new feature or have found a bug that you'd like to fix, please file a new [issue](https://github.com/taskade/mcp/issues).

# Setup

## Prerequisite

The codebase uses `node >= 20.0.0` and `yarn`. You will need to have these installed on your machine to setup the project correctly.

## Install

Run `yarn install` in the root folder of the project to install all dependencies required by all packages and applications in the monorepo.


## Plugin folders

The Claude plugin directory reads only `plugins/taskade/`. Codex, Cursor, Gemini CLI, Copilot CLI, `npx skills add` and `claude plugin marketplace add taskade/mcp` read the root files (`.claude-plugin/`, `.mcp.json`, `skills/`).

After you edit a skill, `.mcp.json`, `LICENSE` or `assets/logo.png`, copy the change into `plugins/taskade/`. For a skill, run `rsync -a --delete skills/ plugins/taskade/skills/` from the repo root.

When you bump the plugin version, change it in `plugins/taskade/.claude-plugin/plugin.json` too. `yarn test` fails when the two copies differ.

## Pull requests

We uses Cchangesets to track and publish new releases.

Therefore, when you submit a change that affects functionality (ie: fixes a bug or adds a new feature) to one of the packages (in the `/packages/` folder), then you will need to create a new Changeset by running the following command:

```bash
yarn changeset
```
