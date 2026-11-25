import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The README lists the tools of the hosted server in a table between two HTML comment markers.
// hosted-tools.json at the repository root is a snapshot of that tool list.
//
//   yarn hosted-tools:check  fails when the table does not match the snapshot. It uses no network.
//   yarn hosted-tools:sync   fetches the public tool list file of the hosted server, writes the
//                            snapshot, and writes the table from the snapshot.
//
// The table keeps its rows and the text after each tool name. `sync` removes a tool that the
// snapshot does not hold, puts a tool in the column of its `readOnly` value, and adds each new
// tool to the row "Other".

export const SERVER = 'https://www.taskade.com/mcp';
export const TOOL_LIST_URL = 'https://www.taskade.com/.well-known/mcp/tools.json';
export const START_MARKER = '<!-- hosted-tools:start -->';
export const END_MARKER = '<!-- hosted-tools:end -->';
export const NEW_TOOL_AREA = 'Other';

export const snapshotPath = fileURLToPath(new URL('../../../hosted-tools.json', import.meta.url));
export const readmePath = fileURLToPath(new URL('../../../README.md', import.meta.url));

const FLAGS = ['readOnly', 'destructive', 'openWorld'] as const;
const TOOL_NAME = /^[a-z][a-z0-9_]*$/;

export type HostedTool = {
  name: string;
  title?: string;
  readOnly?: boolean;
  destructive?: boolean;
  openWorld?: boolean;
};

export type Snapshot = { server: string; count: number; tools: HostedTool[] };

// Reads a tool list and returns the snapshot, sorted by name, with only the known fields.
// Throws with the reason when the list does not have the expected shape.
export const toSnapshot = (data: unknown): Snapshot => {
  const list = data as Record<string, unknown> | null;
  if (list == null || typeof list !== 'object' || !Array.isArray(list.tools)) {
    throw new Error('The tool list has no "tools" array.');
  }
  if (list.server !== undefined && list.server !== SERVER) {
    throw new Error(`The tool list names the server ${String(list.server)}, not ${SERVER}.`);
  }
  const tools = list.tools.map((item: unknown, index: number) => {
    const tool = item as Record<string, unknown> | null;
    if (tool == null || typeof tool !== 'object' || typeof tool.name !== 'string') {
      throw new Error(`Tool ${index} has no "name".`);
    }
    if (!TOOL_NAME.test(tool.name)) {
      throw new Error(`The tool name "${tool.name}" is not lower case letters, digits and "_".`);
    }
    const entry: HostedTool = { name: tool.name };
    if (tool.title !== undefined) {
      if (typeof tool.title !== 'string') {
        throw new Error(`The "title" of ${tool.name} is not a string.`);
      }
      entry.title = tool.title;
    }
    for (const flag of FLAGS) {
      if (tool[flag] !== undefined) {
        if (typeof tool[flag] !== 'boolean') {
          throw new Error(`The "${flag}" of ${tool.name} is not true or false.`);
        }
        entry[flag] = tool[flag] as boolean;
      }
    }
    return entry;
  });
  if (tools.length === 0) {
    throw new Error('The tool list has no tools.');
  }
  tools.sort((a, b) => (a.name < b.name ? -1 : 1));
  const repeated = tools.filter((tool, index) => index > 0 && tools[index - 1].name === tool.name);
  if (repeated.length > 0) {
    throw new Error(`The tool list holds a name two times: ${repeated[0].name}.`);
  }
  if (list.count !== undefined && list.count !== tools.length) {
    throw new Error(
      `The tool list says "count": ${list.count}, but it holds ${tools.length} tools.`,
    );
  }
  return { server: SERVER, count: tools.length, tools };
};

export const formatSnapshot = (snapshot: Snapshot): string =>
  `${JSON.stringify(snapshot, null, 2)}\n`;

type Row = { area: string; columns: [string[], string[]] };

// An item is a tool name in backticks, and the text that follows it up to the next item.
const nameOf = (item: string): string => {
  const match = /^`([a-z][a-z0-9_]*)`/.exec(item);
  if (match == null) {
    throw new Error(`The table item "${item}" does not start with a tool name in backticks.`);
  }
  return match[1];
};

const cellsOf = (line: string): string[] =>
  line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

// Splits the README into the text before the table, the two header lines, the rows, and the
// text after the table.
export const parseReadme = (readme: string) => {
  const start = readme.indexOf(START_MARKER);
  const end = readme.indexOf(END_MARKER);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`README.md has no table between ${START_MARKER} and ${END_MARKER}.`);
  }
  const lines = readme
    .slice(start + START_MARKER.length, end)
    .split('\n')
    .filter((line) => line.trim() !== '');
  if (lines.length < 2 || lines.some((line) => !line.startsWith('|'))) {
    throw new Error('The text between the markers must be one Markdown table and nothing else.');
  }
  const rows: Row[] = lines.slice(2).map((line) => {
    const cells = cellsOf(line);
    if (cells.length !== 3) {
      throw new Error(`The table row "${line}" does not have 3 cells.`);
    }
    const items = (cell: string) => (cell === '' ? [] : cell.split(/, (?=`)/));
    return { area: cells[0], columns: [items(cells[1]), items(cells[2])] };
  });
  rows.forEach((row) => row.columns.flat().forEach(nameOf));
  return {
    before: readme.slice(0, start),
    header: lines.slice(0, 2),
    rows,
    after: readme.slice(end + END_MARKER.length),
  };
};

export const tableNames = (readme: string): string[] =>
  parseReadme(readme).rows.flatMap((row) => row.columns.flat().map(nameOf));

// Returns the README with the table written from the snapshot.
export const renderReadme = (readme: string, snapshot: Snapshot): string => {
  const { before, header, rows, after } = parseReadme(readme);
  const tools = new Map(snapshot.tools.map((tool) => [tool.name, tool]));
  const column = (tool: HostedTool, current: number) =>
    tool.readOnly === undefined ? current : tool.readOnly ? 0 : 1;
  const placed = new Set<string>();
  const kept: Row[] = rows.map((row) => {
    const columns: [string[], string[]] = [[], []];
    row.columns.forEach((items, current) =>
      items.forEach((item) => {
        const tool = tools.get(nameOf(item));
        if (tool != null) {
          placed.add(tool.name);
          columns[column(tool, current)].push(item);
        }
      }),
    );
    return { area: row.area, columns };
  });
  const added = snapshot.tools.filter((tool) => !placed.has(tool.name));
  if (added.length > 0) {
    let other = kept.find((row) => row.area === NEW_TOOL_AREA);
    if (other == null) {
      other = { area: NEW_TOOL_AREA, columns: [[], []] };
      kept.push(other);
    }
    // A new tool with no readOnly value goes in the column of the write tools.
    for (const tool of added) {
      other.columns[tool.readOnly === true ? 0 : 1].push(`\`${tool.name}\``);
    }
  }
  const lines = kept
    .filter((row) => row.columns.flat().length > 0)
    .map((row) => `| ${row.area} | ${row.columns[0].join(', ')} | ${row.columns[1].join(', ')} |`);
  return `${before}${START_MARKER}\n\n${[...header, ...lines].join('\n')}\n\n${END_MARKER}${after}`;
};

// Returns each problem. An empty list means that the snapshot and the table match.
export const checkFiles = (snapshotText: string, readme: string): string[] => {
  let snapshot: Snapshot;
  try {
    snapshot = toSnapshot(JSON.parse(snapshotText));
  } catch (error) {
    return [`hosted-tools.json: ${(error as Error).message}`];
  }
  const problems: string[] = [];
  if (formatSnapshot(snapshot) !== snapshotText) {
    problems.push(
      'hosted-tools.json: the file must hold "server", "count" and the tools sorted by name, as `yarn hosted-tools:sync` writes it.',
    );
  }
  const names = tableNames(readme);
  const known = new Set(snapshot.tools.map((tool) => tool.name));
  const listed = new Set(names);
  for (const name of names.filter((item) => !known.has(item))) {
    problems.push(`README.md: the table lists ${name}, which hosted-tools.json does not hold.`);
  }
  for (const name of [...known].filter((item) => !listed.has(item))) {
    problems.push(`README.md: the table does not list ${name}, which hosted-tools.json holds.`);
  }
  if (names.length !== snapshot.count) {
    problems.push(
      `README.md: the table lists ${names.length} tools, and hosted-tools.json holds ${snapshot.count}.`,
    );
  }
  if (problems.length === 0 && renderReadme(readme, snapshot) !== readme) {
    problems.push(
      'README.md: a tool is in the wrong column, a name is in the table two times, or the table format changed.',
    );
  }
  return problems;
};

const check = () => {
  const problems = checkFiles(readFileSync(snapshotPath, 'utf8'), readFileSync(readmePath, 'utf8'));
  if (problems.length > 0) {
    console.error(
      `${problems.map((problem) => `- ${problem}`).join('\n')}\nCorrect the snapshot or the table, or run \`yarn hosted-tools:sync\`.`,
    );
    process.exit(1);
  }
  const { count } = JSON.parse(readFileSync(snapshotPath, 'utf8')) as Snapshot;
  console.log(`The hosted tool table matches hosted-tools.json (${count} tools).`);
};

const sync = async () => {
  const fail = (reason: string) => {
    console.error(`${reason}\nhosted-tools.json and README.md did not change.`);
    process.exit(1);
  };
  let snapshot: Snapshot;
  try {
    const response = await fetch(TOOL_LIST_URL, { signal: AbortSignal.timeout(30_000) });
    if (response.status !== 200) {
      return fail(`${TOOL_LIST_URL} answered HTTP ${response.status}, not 200.`);
    }
    snapshot = toSnapshot(await response.json());
  } catch (error) {
    return fail(`Could not read ${TOOL_LIST_URL}: ${(error as Error).message}`);
  }
  const readme = renderReadme(readFileSync(readmePath, 'utf8'), snapshot);
  writeFileSync(snapshotPath, formatSnapshot(snapshot));
  writeFileSync(readmePath, readme);
  console.log(`Wrote hosted-tools.json and the README table (${snapshot.count} tools).`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2];
  if (mode === 'check') {
    check();
  } else if (mode === 'sync') {
    sync().catch((error) => {
      console.error(error);
      process.exit(1);
    });
  } else {
    console.error('Usage: tsx packages/server/scripts/hosted-tools.ts <check|sync>');
    process.exit(1);
  }
}
