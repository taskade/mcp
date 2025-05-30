# Contributing

Thank you for considering to contribute to Taskade's MCP initiative.

If you are interested in proposing a new feature or have found a bug that you'd like to fix, please file a new [issue](https://github.com/taskade/mcp/issues).

# Setup

## Prerequisite

The codebase uses `node >= 20.0.0` and `yarn`. You will need to have these installed on your machine to setup the project correctly.

## Install

Run `yarn install` in the root folder of the project to install all dependencies required by all packages and applications in the monorepo.


## Pull requests

We uses Cchangesets to track and publish new releases.

Therefore, when you submit a change that affects functionality (ie: fixes a bug or adds a new feature) to one of the packages (in the `/packages/` folder), then you will need to create a new Changeset by running the following command:

```bash
yarn changeset
```
