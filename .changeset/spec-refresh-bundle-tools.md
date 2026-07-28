---
'@taskade/mcp-server': minor
---

Refresh the vendored v1 OpenAPI spec (14 months stale) and enable Genesis space-bundle tools: `bundleExport` (export a space as a SpaceBundleData v1 JSON bundle — agents, automations, projects, templates, apps) and `bundleImport` (install a bundle into a workspace) — 66 → 68 tools. The refreshed spec also updates several existing tool schemas from a year of API evolution (richer Date descriptions, new agent persona enums, nullable agent fields, pagination-cursor tweaks). Twelve malformed root-relative `$ref`s in the upstream-generated YAML were patched to absolute pointers so the spec dereferences cleanly. The raw ZIP/`.tsk` and media binary endpoints (`bundleExportZip`, `bundleImportZip`, `mediaUpload`, `mediaDownload`, `mediaDownloadAll`) are not enabled — they exchange raw binary payloads and need a handwritten wrapper.
