# RPA Process Management

CLI and MCP use the same `rpa-*` names and JSON parameters. These backend operations are forwarded through the AdsPower runtime using its existing port and API Key, not the local RPA Plus port.

## Creation and delivery intent

- When the user requests a new RPA flow or asks to save automation as an RPA flow, generate a valid full flow and use `rpa-create-process` to save it in the client; a downloadable file alone does not complete that request. Explicitly requesting no saving or file/export-only delivery overrides this: deliver the flow files without creating or updating a saved process.
- Use `.json.gz` for the creation tool's `process_file`; `.adspower.gz` is the import/export format. Keep metadata variables/settings consistent with the generated flow. A newly AI-generated flow uses source `ref_type: 8`; other sources retain their actual source type.
- Confirm saving from the successful tool receipt. Identify the saved flow by name (and ID if useful), and end by directing the user to the client's **RPA Plus process list**. Intermediate files need not be delivered unless requested. Do not claim saving succeeded after an error or unknown receipt, or automatically repeat an uncertain write.
- Creating a process does not authorize creating tasks, execution, or debugging. Updating an existing process after draft debugging has a separate saving boundary; follow [Debug](rpa-debug.md) and do not overwrite or create a saved process merely to test a draft.

**rpa-create-process** — Create a process and upload its file in one backend request.

- **batch_id** (optional): Process group ID; defaults to numeric `0` for ungrouped.
- **ref_type** (required): Source type, as a number or numeric string: `0` creation, `1` share, `2` copy, `3` legacy Template Store, `4` legacy RPA migration, `5` paid Template Store template, `6` received copy, `7` new Template Store, `8` AI Agent Local API. Select the actual source; it is not fixed to `8`.
- **ref_id** (optional): String. Template ID identifying the source Template Store template.
- **name** (required): Non-empty process name, up to 100 characters.
- **variable** (optional): Complete global variable objects encoded as a JSON array string; see [Global variables](rpa-variables.md). Maximum 1048576 UTF-8 bytes and 1000 variables; each key is at most 32 characters and each val/value at most 1000 characters.
- **setting** (optional): Process settings encoded as JSON; see [Process settings](rpa-settings.md) for fields, allowed values and defaults.
- **remark** (optional input; always sent): Process remark, up to 200 characters; defaults to an empty string when creating.
- **allow_random_name** (optional): Integer. Defaults to `1` (allow random names); `0` rejects conflicting names, nonzero allows a random name.
- **process_file** (required): Path to a `.json.gz` file accessible to the AdsPower runtime. The file must contain gzip-compressed process JSON with `nodes` and `edges` arrays. The runtime reads this file and uploads it as multipart field process_file along with the other fields in POST `/rpav2/local-api/create-process-by-api`. The CLI/MCP input is a path, not file contents or an OSS URI.
- Omitting **setting** sends the complete default process configuration. Explicit settings are validated and sent without filling missing fields.
- No STS request, separate OSS upload or old create-process endpoint is used. This creates the process definition; it does not execute it.

```bash
ads rpa-create-process '{"ref_type":8,"name":"Example flow","variable":"[]","process_file":"/absolute/path/flow.json.gz"}'
```

**rpa-update-process** — Update process contents with complete metadata.

Use this endpoint when changing the process definition or nodes. If only the name, variables, settings, remark or group changes, use **rpa-update-process-editable-fields** instead.

- **id** (required): Existing process ID.
- **batch_id** (required): Existing process group ID, or numeric `0`; change only when requested.
- **name** (required): Existing non-empty process name, up to 100 characters; change only when requested.
- **variable** (required): Existing complete global variable objects encoded as a JSON array string; see [Global variables](rpa-variables.md). Same limits as creation: at most 1048576 UTF-8 bytes, 1000 variables, key length 32 and val/value length 1000.
- **setting** (required): Existing validated process settings encoded as JSON; see [Process settings](rpa-settings.md). Do not substitute creation defaults for existing settings.
- **remark** (required): Existing process remark, up to 200 characters. Preserve the old remark unless the user explicitly changes or clears it; use an empty string only to preserve an already empty remark or to perform an explicit clear.
- **process_file** (required): Runtime-readable `.json.gz` process file path with gzip-compressed JSON containing nodes and edges arrays, at most 4194304 bytes. Supply the replacement file for content changes. Omission is rejected; use the editable-fields endpoint when contents are unchanged.

Before updating, query **rpa-get-process-list** for the exact ID with `fields:"id,name,batch_id,variable,setting,remark"`. Merge the requested changes into these current values and supply every required metadata field. These are dynamic defaults from the existing process, not hardcoded defaults or a server-side automatic merge. If variables/settings arrive as arrays/objects, JSON-encode them before sending. Do not guess unavailable current values or replace missing information with `[]`, `{}` or an empty remark. Stop if the process cannot be found or its required metadata cannot be read reliably.

```bash
# Read current metadata, then merge only the requested changes before updating.
ads rpa-get-process-list '{"ids":"123","fields":"id,name,batch_id,variable,setting,remark"}'
# The values below illustrate previously read metadata; use the actual current values.
ads rpa-update-process '{"id":"123","batch_id":"0","name":"Existing process","variable":"[]","setting":"{}","remark":"Existing remark","process_file":"/absolute/path/updated.json.gz"}'
```

**rpa-get-template-subscription-info** — Get paid-template subscription information by process ID.

- **id** (required): Non-empty string. Process ID, not a task ID, execution ID, or template ID.
- GET `/rpav2/local-api/get-template-subscription-info-by-api`. Returns the backend subscription information unchanged; do not infer undocumented status meanings or time units.

```bash
ads rpa-get-template-subscription-info '{"id":"123"}'
```

**rpa-get-process-list** — List or query existing RPA processes.

- **ids** (optional): Comma-separated process IDs. Use one ID to query a specific process; there is no separate process detail endpoint in this integration.
- **keyword** (optional): Search keyword.
- **fields** (optional): Comma-separated response fields from this deduplicated allowlist: `id`, `name`, `batch_id`, `remark`, `uri`, `top_time`, `setting`, `variable`, `file_size`. No whitespace, empty entries or unknown fields.
- **batch_id** (optional): Non-empty string. Process group ID.
- **page** (optional): Positive integer, starting at 1.
- **page_size** (optional): One of `10`, `20`, `50`, `100`; defaults to `10`.
- **access_link** (optional): Number `0` (default) or `1`. Set to `1` only when the process file download link is needed.
- **origin** (optional): Fixed string `"0"`; defaults to `"0"`.
- **block_expired_paid_template_process** (optional): Fixed number `1`; defaults to `1`.
- Returns metadata such as IDs, names, variables and settings. Process nodes are stored in the process file referenced by `access_link`; the list itself is not the complete workflow.

**rpa-get-process-list-count** — Count matching processes.

- **ids**, **keyword**, **batch_id**, **page**, **page_size**, **access_link**, **origin**, **block_expired_paid_template_process** (optional): Same types as the list endpoint.
- **fields** is not accepted. The client preserves the backend data object.

**rpa-update-process-editable-fields** — Update process attributes without changing process contents.

Use this endpoint for metadata-only changes. Send the ID and just the attributes being changed; omitted attributes retain their existing values.

- **id** (required): Non-empty string. Process ID.
- **variable** (optional): Complete global variable objects encoded as a JSON array string; see [Global variables](rpa-variables.md); same limits as creation: at most 1048576 UTF-8 bytes and 1000 variables, key length at most 32, and val/value string length at most 1000. Omit to preserve existing variables.
- **setting** (optional): Validated process settings encoded as JSON; see [Process settings](rpa-settings.md). Omit to preserve the existing configuration.
- **remark** (optional): String. Process remark, up to 200 characters.
- **name** (optional): String. Process name, up to 100 characters.
- **batch_id** (optional): Non-empty string. Target process group ID.
- Does not accept workflow nodes, a workflow JSON document, an OSS URI, or a replacement file. Use rpa-create-process for creation; use rpa-update-process to replace an existing process file.

**rpa-delete-process** — Delete processes.

- **ids** (required): Comma-separated process IDs, without spaces or empty entries.

**rpa-copy-process** — Copy one process to a group.

- **id** (required): Non-empty string. Process ID to copy.
- **batch_id** (required): Non-empty string. Target process group ID.

**rpa-move-process** — Move processes to a group.

- **ids** (required): Comma-separated process IDs.
- **batch_id** (required): Non-empty string. Target process group ID.

**rpa-top-process** — Toggle a process between pinned and unpinned.

- **id** (required): Non-empty string. Process ID.

- This endpoint toggles the current state; it does not always pin. A non-empty `top_time` greater than 0 means the process is pinned; calling again unpins it.
- First query `rpa-get-process-list` with `ids` and `fields:"id,name,top_time"`. For a pin request, call only if it is not pinned. For an unpin request, call only if it is pinned. If the desired state already holds, report that without calling the toggle.
- If the process is missing or `top_time` is unavailable or invalid, resolve the current state before toggling; do not guess.
- After a successful call, query the process again to verify the resulting state. Do not automatically retry on a timeout or uncertain response; re-query first, since the previous call may have succeeded and a repeat would reverse it.

```bash
ads rpa-get-process-list '{"page":1,"page_size":10}'
ads rpa-get-process-list '{"ids":"123","access_link":1}'
ads rpa-update-process-editable-fields '{"id":"123","name":"Renamed flow","variable":"[]","setting":"{}"}'
```

### Process file naming

Create/update API inputs require a `.json.gz` file path. RPA Plus UI exports named `.adspower.gz` use the same gzip-compressed flow JSON format; copy or rename a valid exported package to `.json.gz` before passing its path. Renaming an uncompressed JSON file does not create a valid gzip package.
