# Release Process

This document describes the release workflow for Taskade MCP packages.

## Overview

| Package | npm Name | Changelog |
|---------|----------|-----------|
| Server | `@taskade/mcp-server` | [CHANGELOG](../packages/server/CHANGELOG.md) |
| OpenAPI Codegen | `@taskade/mcp-openapi-codegen` | [CHANGELOG](../packages/openapi-codegen/CHANGELOG.md) |

## Automated Release (GitHub Actions)

Releases are automated via [Changesets](https://github.com/changesets/changesets).

### Workflow

1. **Create changeset** for your changes:
   ```bash
   pnpm changeset
   ```

2. **Commit** the changeset file with your PR

3. **Merge to main** — CI creates a "Release PR" with version bumps

4. **Merge Release PR** — CI publishes to npm

### CI Secrets Required

| Secret | Purpose | Required By |
|--------|---------|-------------|
| `GITHUB_TOKEN` | Create PRs, push tags | changesets/action |
| `NPM_TOKEN` | Publish to npm registry | npm publish |

## Manual Release (Force)

For emergency releases, use the "Force Release" workflow:

1. Go to Actions → Force Release
2. Click "Run workflow"
3. Select branch (usually `main`)
4. Workflow publishes current version to npm

## Local Development Release

For testing packages locally before publishing:

```bash
pnpm install

pnpm run build

pnpm pack --pack-destination ./dist
```

## Version Strategy

This monorepo uses **independent versioning** (per `lerna.json`):

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking | Major | 0.x.x → 1.0.0 |
| Feature | Minor | 0.0.x → 0.1.0 |
| Fix | Patch | 0.0.1 → 0.0.2 |

## Pre-Release Checklist

- [ ] All tests pass locally
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run lint` passes
- [ ] `pnpm audit` shows no critical vulnerabilities
- [ ] CHANGELOG updated via changeset
- [ ] Security review for sensitive changes

## Rollback Procedure

If a bad release is published:

1. **Deprecate** the bad version:
   ```bash
   npm deprecate @taskade/mcp-server@X.Y.Z "Critical bug, use X.Y.Z+1"
   ```

2. **Publish fix** with patch version bump

3. **Unpublish** only if within 72 hours and no downloads:
   ```bash
   npm unpublish @taskade/mcp-server@X.Y.Z
   ```

## Security Considerations

- Never include API tokens in published packages
- Verify `.npmignore` excludes sensitive files
- Run `npm pack --dry-run` to inspect package contents before publish
