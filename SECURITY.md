# Security Policy

## Reporting a Vulnerability

Do not disclose security vulnerabilities publicly. Email [hello@taskade.com](mailto:hello@taskade.com) with details.

## Token Handling

- Store API tokens in environment variables only — never hardcode in source files.
- `.env` files are gitignored — never commit tokens to version control.
- Rotate tokens immediately if compromised.
- Generate tokens at [taskade.com/settings/api](https://www.taskade.com/settings/api).

## Transport Security

- Use HTTPS/TLS for HTTP/SSE mode in production.
- Tokens passed via query parameters in HTTP mode may be logged by proxies or web servers.
- The stdio transport (default for Claude Desktop / Cursor) does not expose tokens over the network.
