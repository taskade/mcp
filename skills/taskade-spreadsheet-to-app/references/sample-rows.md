# Sample rows

Sample rows show an app working before the real data is in. Use these steps each time you write, mark or remove sample rows. The mark goes in a field, never in the row title.

## 1. Pick the marker field

Call `list_fields` on the project. For each field, read its name (`data.displayName` or `data.title`), its type (`data.type`) and `data.constraints`.

- A field named `Sample` with the type `string` (Text) and no `data.constraints.unique`: use it.
- No field named `Sample`: add it with `set_field` (`name: "Sample"`, `type: "string"`) after a "yes".
- A field named `Sample` of another type, or a unique one: use the first free name of `Sample row`, `Sample row 2`, `Sample row 3`. Add it with `set_field` the same way. Tell the owner in one line: "Your project has a Sample field already, so the samples get a new Text field, Sample row."

After a new field, call `list_fields` again for its id. The name that you picked is the marker name. Use it in every step below.

## 2. Write and mark the rows

- Use made-up names, `example.com` emails and 555 phone numbers. Never copy a real row into a sample.
- Show the rows in a table, and write them after a "yes".
- For new rows, call `create_task` with a `fields` object that holds the row's values and the marker. The key of the marker is the name from step 1, and its value is `"Sample"`: for example `{ "Sample row": "Sample" }`.
- For sample rows that exist with no mark, call `set_task_field_value` on each row with the id of the marker field from step 1 and the value `"Sample"`.
- Record the task id and the title of each sample row: the ids that `create_task` returns, or the ids of the rows that you marked. Keep the list in the chat, or in the log file if the client can write files.
- Call `read_project` and make sure that each recorded row shows the marker.

## 3. Remove the rows

Offer this after the real rows are in.

- Start from the recorded list of sample task ids. If you did not write the rows (for example, the samples that come with a copied app kit), call `read_project` and let the owner pick the rows. The rows that the owner picks are the list.
- Show a table of each row on the list: its task id, its title and the rows nested under it. A delete also removes the nested rows.
- After a "yes" for that exact table, call `delete_task` for each task id on the list, and for no other id.
- Call `read_project`. Make sure that no deleted id shows and that every other row is still there. Report each row that is still there.

The marker field stays in the project. To remove the column too, the owner deletes the field in Taskade.
