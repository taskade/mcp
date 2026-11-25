---
name: taskade-markdown
description: Write a Markdown or CSV file that Taskade turns into a clean project, and tell the user how to bring it in. Writing the file needs no Taskade account and no MCP connection. Use when the user asks for a plan, checklist, outline or task list "for Taskade", wants to move notes from another app into Taskade, or asks which Markdown Taskade keeps. For rows with duplicate checks in a project that exists, use taskade-spreadsheet-to-app. For a new app, use taskade-build-app. Not for an export of a Taskade project (the front door taskade reads it).
---

# Write Markdown for Taskade

Taskade reads Markdown into a project. Each list item becomes a row, and rows nest under their heading or parent item. Write only what survives the import, then give the user the steps in "Import it".

## Requirements

- Write the file: nothing. No account, no connection.
- Bring it in: a Taskade account. The paste path and the **Import CSV** tab work on any plan and use no AI credits.

## What Taskade makes

| You write | Taskade makes |
|---|---|
| `# Title` as the first line | The project name with `create_project`. A heading row when you paste. |
| `#` and `##` headings | Heading rows. The lines below nest under them. |
| `###` to `######` | A bold row. Nothing nests under it. |
| `- item`, indented `- sub` | Bullet rows, nested |
| `1. item` | Numbered rows |
| `- [ ] task`, `- [x] task` | Checkbox rows, open or done |
| `**bold**`, `*italic*`, `[text](url)`, a bare URL | The same style or link |
| `#word` inside a row | Text that Taskade shows as a tag |
| `~~text~~` at the start of a row | A done row. The strike style goes. |
| Table | One plain row for each table row, header included |
| Code block, `` `code` ``, `> quote` | Plain rows or plain text, no code or quote style |
| `![alt](url)` | The alt text only. The picture does not import. |
| Front matter, `---` rule, HTML, footnotes | Nothing |

```markdown
# Website launch

## Before launch
- [ ] Write the home page copy #content
  - [ ] Hero section
  - [ ] Pricing section
- [x] Buy the domain
- [ ] Test on a phone with the [QA list](https://example.com/qa)

## Launch day
1. Publish the site
2. Send the announcement email
```

## Import it

Paste (keeps the file as written):

1. In the Taskade sidebar, click **+** next to Projects, then **Start Blank**.
2. Copy the Markdown as raw text from a plain text editor.
3. Click an empty row in the List view and paste.

CSV (for columns):

1. Click **+** next to Projects, then **Import**, then the **Import CSV** tab.
2. Drop the `.csv` file.
3. Click the header of the column that holds the row names. It becomes the **Primary** column.
4. Click the gear on each other column to set its **Column Type**: Text, Select or Number.
5. Click **Import**. The project opens in the Table view, named after the file.

The **Import with AI** tab also takes `.md` files and **Paste Text & Markdown**. An AI model rewrites the text first, and the import uses AI credits.

## With a connection

- `create_project` and `create_task` come from the hosted Taskade MCP server, which works on every paid Taskade plan and not on Free. With no Taskade tools in your tool list, the import steps above do the job.
- `create_project` takes a `spaceId` and the Markdown as `content`. It returns the new project id. Pass `view` (`list`, `table`, `board`, `calendar` or `mindmap`) to open the project in that view.
- To add Markdown under an existing project, use `create_task`. It reads each task's content as Markdown by default. One call takes at most 20 tasks. For a full file, use `create_project`.

## Known problems

- With `create_project`, lines next to each other join into one row. A paste makes each line its own row. Use list items to be safe.
- Do not wrap the file in a ```` ```markdown ```` fence. Paste and `create_project` turn each line of the fence into a plain row.
- Copy raw text, not a rendered preview. Taskade reads formatted text as HTML, not as Markdown.
- A reference-style link `[text][ref]` loses its text. Write links inline.
- `# word` with a space is a heading. Write a tag as `#word`.
- Dates, assignees, mentions and custom fields do not come in through Markdown. A CSV brings in Text, Select and Number columns. Set dates and assignees in Taskade after the import.
- A CSV can hold 5,000 rows and 5 MB at most. Each column that you do not set becomes a Text field.

## Check

- After a paste or a CSV import, compare the rows, the nesting and the done boxes with the file.
- After `create_project`, call `read_project` on the new id. Make sure that the name, the row count and the checkbox states match the file. The `# Title` line is the project name, not a row.
- After `create_task`, call `read_project`, and make sure that each new row is there.

## Scope

- Rows with duplicate checks and field values in an existing project: use `taskade-spreadsheet-to-app`.
- A new app with data, agents and automations: use `taskade-build-app`.
- This skill does not change or delete rows that exist.
