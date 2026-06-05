# Security Policy

## Reporting a Vulnerability

**Please report security issues privately — do not open a public issue or PR.**

- Preferred: open a [GitHub private security advisory](https://github.com/taskade/mcp/security/advisories/new) (Security → Report a vulnerability).
- Or email [hello@taskade.com](mailto:hello@taskade.com) with details and reproduction steps.

We aim to acknowledge reports within **3 business days** and to provide a remediation
timeline after triage. Please give us a reasonable window to ship a fix before any
public disclosure. We're happy to credit reporters who request it.

## Token Handling

- Store API tokens in environment variables only — never hardcode them in source files.
- `.env` files are gitignored — never commit tokens to version control.
- Rotate tokens immediately if compromised.
- Generate tokens at [taskade.com/settings/api](https://www.taskade.com/settings/api).

## Transport Security

- The stdio transport (default for Claude Desktop / Cursor / VS Code) does not expose tokens over the network.
- Use HTTPS/TLS for any HTTP-based transport in production.
- The HTTP/SSE transport currently passes the token as an `access_token` URL query parameter, which proxies and servers may log. Until a header-based transport is available, prefer **stdio** (token via the `TASKADE_API_KEY` environment variable), especially in production.

## Never Commit Secrets

This is a public repository. Never commit:

```
.env, .env.*            # environment files
*.key, *.pem            # private keys / certificates
*credentials*, *secret* # credential dumps
.mcpregistry_*          # MCP registry auth tokens
```

`.env*` files (except `.env.example`) and `.mcpregistry_*` are gitignored and excluded from the npm package; the key/credential patterns above are **not** auto-ignored, so sanity-check your staged changes before committing:

```bash
git diff --cached | grep -iE "(token|key|secret|password|credential)" | grep -v placeholder
```

If you accidentally commit a secret: **do not push** (or if already pushed, rotate the
credential immediately), then remove it from history and notify a maintainer. See
[GitHub: removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## Privacy

Taskade's data practices are described in the [Taskade Privacy Policy](https://www.taskade.com/privacy).
The MCP server sends requests only to the Taskade public API (`https://www.taskade.com/api/v1`)
using the token you provide; it does not send your data to other third-party services. (In
HTTP/SSE mode the token travels in the request URL and may be logged — prefer stdio.)
