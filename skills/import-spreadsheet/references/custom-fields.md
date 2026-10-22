# Custom fields in a Taskade project

Read this before you map spreadsheet columns or write a field value. A custom field turns a row (a task) into a record. Typed fields let the user's app, filters, charts and automations use the value. Text that only looks like a date or a number cannot go on a calendar or into a sum.

## Read the fields first

Call `list_fields` on the project. Each item has an `id` (for example `@ksm01`) and a `data` object. `data.type` is the field type, and `data.displayName` (or `data.title`) is the name the user sees. For a Select field, `data.options` holds the options: each option has an `id` and a `name`.

`read_project` also shows the fields in its header and the value of each row. It shows Text, Number, Select and Date values only. For the other types, `list_fields` is the only place to see the field.

## What this server can write

`set_task_field_value` writes three field types:

| Field (in Taskade) | `data.type` | Send as `value` | Refused when |
|---|---|---|---|
| Text | `string` | Text. Blank text is refused. | The field is unique and another row already has the same value |
| Number | `number` | A JSON number, never a string. `1200`, not `"1,200"` or `"$1,200"`. | The value is not a number |
| Select | `Select` | The option `id`, never the option name | The id is not one of the field's options ("Invalid option id.") |

Every other type is refused with "Field type X cannot be set through this API". The ids `note`, `created`, `updated` and `completed` are not custom fields: a write to them is refused with "Not a custom field".

A Number field can show its value as a currency or a percent. The format belongs to the field, so send only the number.

To clear a value, call `delete_task_field_value`. It fails if the row has no value for that field.

## Other parts of a row

These are not custom fields. Each has its own tool:

| Part of the row | Tool | Notes |
|---|---|---|
| Title (the task text) | `create_task`, `update_task` | At most 2,000 characters. Send `contentType: "text/plain"` for imported text, so that `#`, `*` or `-` at the start stay plain text. |
| Note | `set_task_note` | One line only: the note is refused if it has a line break. Join the lines with a space or ` / `. |
| Date of the task | `set_task_date` | Sets the task's own date (a start, and an end for a range), not a Date custom field. The time zone defaults to the user's account time zone. |
| Assignee | `assign_task` | By Taskade handle (for example `janedoe`), not by name or email |
| Done | `complete_task` | A recurring task moves its date forward instead of closing |

## Field types this server cannot write

| Field (in Taskade) | What it holds | What to do with the column |
|---|---|---|
| Date | A day, with an optional time | Ask Taskade EVE to fill it, or put the value in the note |
| Event | A start and an end date | Same as Date |
| Relationship | A link to a row in another project | Ask Taskade EVE to link the rows after the import |
| Rating | A star score | Ask Taskade EVE, or put it in the note |
| Media | Files and images | Upload in Taskade. A file URL can go in the note. |
| Password | A hashed secret | Never import passwords. Leave the column out. |
| Time Tracking | Timers and time entries | Leave it out |
| Yes or no (`boolean`), person (`Assign`), and system fields (`Timestamp`, `TimestampAt`, `TimestampAuthor`) | A flag, a person, or a time that Taskade records | Leave it out, or put the value in the note |

For each column of this kind, give the user three choices: leave it empty, put the value in the note, or ask Taskade EVE in that workspace to fill the field from the note after the import.

## Pick the right type (for advice to the user)

When the user asks which field to add in Taskade:

- Use Select, not Text, for a fixed set of values (stage, category, priority). A Select can become board columns, a filter and an automation condition. Text collects typos.
- Use Number, not Text, for anything to add up or chart. Text "1200" does not sum.
- Use Date, not Text, for anything that belongs on a calendar.
- Use Relationship, not a copied name, when one record belongs to another (an invoice to a customer). A copied name must be changed in every row when the customer changes it.

This server cannot add a field or an option. The user adds it in Taskade, or asks Taskade EVE to add it. Then call `list_fields` again for the new id.
