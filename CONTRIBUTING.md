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

[taskade/skills](https://github.com/taskade/skills) is the one source of the skills. Send every skill change there, as an issue or a pull request. Do not edit `skills/` or `plugins/taskade/skills/` here. These two folders are a generated copy, and the next sync replaces a change in them. For each release, the script `scripts/sync-mcp.sh` of taskade/skills writes these files here, and a pull request brings them in:

- `skills/` and `plugins/taskade/skills/`
- `plugins/taskade/README.md`
- `.mcp.json` and `assets/logo.png`, at the root and in `plugins/taskade/`
- The plugin version in each manifest, and the description of the Claude Code, Cursor and Codex manifests and of the Claude Code marketplace

The other fields of the manifests and `LICENSE` belong to this repository. In each sync pull request, write the release notes of the new version in `publication.release_notes` of `plugin.json`, and update the `interface` text of `plugin.json` when the skills change what the plugin does. The script prints these fields at the end of each run. When you edit `LICENSE` or a field that both `.claude-plugin/plugin.json` files hold, edit both copies. `yarn test` fails when the copies differ.

## Pull requests

We uses Cchangesets to track and publish new releases.

Therefore, when you submit a change that affects functionality (ie: fixes a bug or adds a new feature) to one of the packages (in the `/packages/` folder), then you will need to create a new Changeset by running the following command:

```bash
yarn changeset
```
