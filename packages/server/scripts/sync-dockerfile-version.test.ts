import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  dockerfilePath,
  packageJsonPath,
  pinDockerfileVersion,
  readPinnedVersion,
} from './sync-dockerfile-version';

describe('Dockerfile version pin', () => {
  it('installs the version of packages/server/package.json', () => {
    const { version } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    // If this fails, run `yarn tsx packages/server/scripts/sync-dockerfile-version.ts`
    // from the repo root. `yarn changeset:version` runs it for a release.
    expect(readPinnedVersion(readFileSync(dockerfilePath, 'utf8'))).toBe(version);
  });

  it('replaces only the version of the pinned install', () => {
    const DOCKERFILE = 'FROM node:24\nRUN npm install -g @taskade/mcp-server@0.2.0\n';
    expect(pinDockerfileVersion(DOCKERFILE, '0.2.1')).toBe(
      'FROM node:24\nRUN npm install -g @taskade/mcp-server@0.2.1\n',
    );
  });

  it('fails when the Dockerfile has no pinned install', () => {
    expect(() => pinDockerfileVersion('RUN npm install -g @taskade/mcp-server\n', '0.2.1')).toThrow(
      'no pinned',
    );
  });
});
