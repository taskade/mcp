import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

// The Claude plugin directory reads only `plugins/taskade/`. Codex, Cursor, Gemini CLI,
// Copilot CLI, `npx skills add` and the root marketplace read the root files. These tests
// keep the two copies the same and keep the folder inside the rules of the directory check.

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const pluginDir = join(repoRoot, 'plugins/taskade');

const copiedFiles = ['.mcp.json', 'LICENSE', 'assets/logo.png'];

const fixCommands = [
  'Run these commands from the repo root to sync plugins/taskade/:',
  '  rsync -a --delete skills/ plugins/taskade/skills/',
  ...copiedFiles.map((file) => `  cp ${file} plugins/taskade/${file}`),
].join('\n');

const sharedManifestFields = [
  'name',
  'version',
  'description',
  'author',
  'homepage',
  'repository',
  'license',
  'keywords',
  'documentationUrl',
  'supportUrl',
  'privacyPolicyUrl',
  'termsOfServiceUrl',
];

const allowedExtensions = new Set([
  '.md',
  '.txt',
  '.json',
  '.yaml',
  '.yml',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
]);

const refusedFileNames = new Set(['package.json', 'package-lock.json', 'npm-shrinkwrap.json']);

type Entry = { path: string; isSymlink: boolean; isDirectory: boolean };

function walk(dir: string, prefix = ''): Entry[] {
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const path = prefix === '' ? name : `${prefix}/${name}`;
      const stat = lstatSync(join(dir, name));
      const entry = { path, isSymlink: stat.isSymbolicLink(), isDirectory: stat.isDirectory() };
      return entry.isDirectory ? [entry, ...walk(join(dir, name), path)] : [entry];
    });
}

function filesIn(dir: string) {
  return walk(dir)
    .filter((entry) => !entry.isDirectory)
    .map((entry) => entry.path);
}

function readManifest(dir: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(dir, '.claude-plugin/plugin.json'), 'utf8'));
}

describe('plugins/taskade (the Claude directory plugin folder)', () => {
  it('holds the same skills as the root skills/ folder', () => {
    const rootFiles = filesIn(join(repoRoot, 'skills'));
    const pluginFiles = filesIn(join(pluginDir, 'skills'));
    expect(pluginFiles, `The skill file lists differ.\n${fixCommands}\n`).toEqual(rootFiles);

    const changed = rootFiles.filter(
      (file) =>
        !readFileSync(join(repoRoot, 'skills', file)).equals(
          readFileSync(join(pluginDir, 'skills', file)),
        ),
    );
    expect(changed, `These skill files differ from the root copy.\n${fixCommands}\n`).toEqual([]);
  });

  it('holds the same .mcp.json, LICENSE and logo as the repo root', () => {
    const changed = copiedFiles.filter(
      (file) => !readFileSync(join(repoRoot, file)).equals(readFileSync(join(pluginDir, file))),
    );
    expect(changed, `These files differ from the root copy.\n${fixCommands}\n`).toEqual([]);
  });

  it('has the same manifest metadata as the root .claude-plugin/plugin.json', () => {
    const rootManifest = readManifest(repoRoot);
    const pluginManifest = readManifest(pluginDir);
    const changed = sharedManifestFields.filter(
      (field) => JSON.stringify(rootManifest[field]) !== JSON.stringify(pluginManifest[field]),
    );
    expect(
      changed,
      'These fields differ between .claude-plugin/plugin.json and plugins/taskade/.claude-plugin/plugin.json. Edit both files.',
    ).toEqual([]);
  });

  it('holds only file types that the Claude directory accepts', () => {
    const problems = walk(pluginDir).flatMap((entry) => {
      const name = basename(entry.path);
      if (entry.isSymlink) {
        return [`${entry.path}: symbolic link (commit a regular file)`];
      }
      if (entry.isDirectory) {
        const nested = entry.path !== '.claude-plugin' && name === '.claude-plugin';
        return nested || name === '.claude' ? [`${entry.path}: folder is not allowed`] : [];
      }
      if (entry.path.startsWith('.claude-plugin/') && entry.path !== '.claude-plugin/plugin.json') {
        return [`${entry.path}: .claude-plugin/ can hold only plugin.json`];
      }
      if (refusedFileNames.has(name)) {
        return [`${entry.path}: package manager file is not allowed`];
      }
      const extension = extname(name).toLowerCase();
      if (extension === '' ? name !== 'LICENSE' : !allowedExtensions.has(extension)) {
        return [`${entry.path}: file type is not allowed`];
      }
      return [];
    });
    expect(
      problems,
      'plugins/taskade/ can hold only Markdown, text, JSON, YAML, image files and LICENSE.',
    ).toEqual([]);
  });
});
