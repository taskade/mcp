import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The root Dockerfile installs one pinned version of @taskade/mcp-server. A new pin
// changes the Dockerfile, so a registry that builds the image from this repo installs
// the new release and does not reuse a cached layer of an old one. The root script
// `changeset:version` runs this file after `changeset version`, so the release pull
// request carries the new pin.

const PINNED_PACKAGE = /@taskade\/mcp-server@[0-9A-Za-z.+-]+/;

export const dockerfilePath = fileURLToPath(new URL('../../../Dockerfile', import.meta.url));
export const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url));

export const readPinnedVersion = (dockerfile: string): string | undefined =>
  dockerfile.match(PINNED_PACKAGE)?.[0].slice('@taskade/mcp-server@'.length);

export const pinDockerfileVersion = (dockerfile: string, version: string): string => {
  if (readPinnedVersion(dockerfile) === undefined) {
    throw new Error('The Dockerfile has no pinned @taskade/mcp-server@<version> install');
  }
  return dockerfile.replace(PINNED_PACKAGE, `@taskade/mcp-server@${version}`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { version } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  writeFileSync(
    dockerfilePath,
    pinDockerfileVersion(readFileSync(dockerfilePath, 'utf8'), version),
  );
  console.log(`Dockerfile pinned to @taskade/mcp-server@${version}`);
}
