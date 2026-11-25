import { describe, expect, it } from 'vitest';

import {
  checkFiles,
  END_MARKER,
  formatSnapshot,
  renderReadme,
  START_MARKER,
  tableNames,
  toSnapshot,
} from './hosted-tools';

const README = [
  '# Tools',
  '',
  START_MARKER,
  '',
  '| Area | Read-only tools | Write tools |',
  '|---|---|---|',
  '| Projects | `list_projects`, `get_project` | `create_project` (in a folder), `copy_project` |',
  '| Tasks | `list_tasks` | `create_task` |',
  '',
  END_MARKER,
  '',
  'More text.',
  '',
].join('\n');

const snapshotOf = (tools: { name: string; readOnly?: boolean }[]) =>
  toSnapshot({ tools: tools.map((tool) => ({ ...tool })) });

const MATCHING = snapshotOf([
  { name: 'list_projects', readOnly: true },
  { name: 'get_project', readOnly: true },
  { name: 'create_project', readOnly: false },
  { name: 'copy_project', readOnly: false },
  { name: 'list_tasks', readOnly: true },
  { name: 'create_task', readOnly: false },
]);

describe('toSnapshot', () => {
  it('sorts the tools by name, keeps only the known fields and sets the count', () => {
    expect(
      toSnapshot({
        tools: [
          { name: 'list_tasks', title: 'List tasks', readOnly: true, inputSchema: {} },
          { name: 'delete_task', destructive: true, openWorld: false },
        ],
      }),
    ).toEqual({
      server: 'https://www.taskade.com/mcp',
      count: 2,
      tools: [
        { name: 'delete_task', destructive: true, openWorld: false },
        { name: 'list_tasks', title: 'List tasks', readOnly: true },
      ],
    });
  });

  it.each([
    ['no tools array', { name: 'x' }, 'no "tools" array'],
    ['an empty list', { tools: [] }, 'has no tools'],
    ['a tool with no name', { tools: [{ title: 'x' }] }, 'has no "name"'],
    ['a name with capitals', { tools: [{ name: 'listTasks' }] }, 'is not lower case'],
    ['a flag that is not a boolean', { tools: [{ name: 'a', readOnly: 'yes' }] }, 'not true'],
    ['a name two times', { tools: [{ name: 'a' }, { name: 'a' }] }, 'two times'],
    ['a wrong count', { count: 3, tools: [{ name: 'a' }] }, 'holds 1 tools'],
    ['another server', { server: 'https://example.com/mcp', tools: [{ name: 'a' }] }, 'names'],
  ])('refuses %s', (_name, data, message) => {
    expect(() => toSnapshot(data)).toThrow(message);
  });
});

describe('renderReadme', () => {
  it('changes nothing when the table matches the snapshot', () => {
    expect(renderReadme(README, MATCHING)).toBe(README);
    expect(checkFiles(formatSnapshot(MATCHING), README)).toEqual([]);
  });

  it('removes a tool that the snapshot does not hold, and keeps the text after a name', () => {
    const snapshot = snapshotOf(MATCHING.tools.filter((tool) => tool.name !== 'copy_project'));
    expect(renderReadme(README, snapshot)).toContain(
      '| Projects | `list_projects`, `get_project` | `create_project` (in a folder) |',
    );
  });

  it('adds a new tool to the row Other, in the column of its readOnly value', () => {
    const snapshot = snapshotOf([
      ...MATCHING.tools,
      { name: 'list_media', readOnly: true },
      { name: 'upload_media' },
    ]);
    const readme = renderReadme(README, snapshot);
    expect(readme).toContain(
      '| Tasks | `list_tasks` | `create_task` |\n| Other | `list_media` | `upload_media` |\n',
    );
    expect(tableNames(readme)).toHaveLength(8);
    expect(renderReadme(readme, snapshot)).toBe(readme);
  });

  it('moves a tool when its readOnly value changes, and drops an empty row', () => {
    const snapshot = snapshotOf(
      MATCHING.tools
        .filter((tool) => !['list_tasks', 'create_task'].includes(tool.name))
        .map((tool) => (tool.name === 'get_project' ? { ...tool, readOnly: false } : tool)),
    );
    const readme = renderReadme(README, snapshot);
    expect(readme).toContain(
      '| Projects | `list_projects` | `get_project`, `create_project` (in a folder), `copy_project` |',
    );
    expect(readme).not.toContain('| Tasks |');
  });
});

describe('checkFiles', () => {
  it('names a tool that the table lists and the snapshot does not hold', () => {
    const snapshot = snapshotOf(MATCHING.tools.filter((tool) => tool.name !== 'create_task'));
    expect(checkFiles(formatSnapshot(snapshot), README)).toEqual([
      'README.md: the table lists create_task, which hosted-tools.json does not hold.',
      'README.md: the table lists 6 tools, and hosted-tools.json holds 5.',
    ]);
  });

  it('names a tool that the snapshot holds and the table does not list', () => {
    const snapshot = snapshotOf([...MATCHING.tools, { name: 'list_media', readOnly: true }]);
    expect(checkFiles(formatSnapshot(snapshot), README)).toEqual([
      'README.md: the table does not list list_media, which hosted-tools.json holds.',
      'README.md: the table lists 6 tools, and hosted-tools.json holds 7.',
    ]);
  });

  it('finds a tool in the wrong column', () => {
    const snapshot = snapshotOf(
      MATCHING.tools.map((tool) =>
        tool.name === 'list_tasks' ? { ...tool, readOnly: false } : tool,
      ),
    );
    expect(checkFiles(formatSnapshot(snapshot), README)).toEqual([
      'README.md: a tool is in the wrong column, a name is in the table two times, or the table format changed.',
    ]);
  });

  it('refuses a snapshot that is not sorted or has a wrong count', () => {
    const text = JSON.stringify({ ...MATCHING, count: 7 }, null, 2);
    expect(checkFiles(text, README)[0]).toContain('holds 6 tools');
    const unsorted = `${JSON.stringify({ ...MATCHING, tools: [...MATCHING.tools].reverse() }, null, 2)}\n`;
    expect(checkFiles(unsorted, README)[0]).toContain('sorted by name');
  });

  it('refuses a README with no markers', () => {
    expect(() => tableNames('# Tools\n')).toThrow('has no table between');
  });
});
