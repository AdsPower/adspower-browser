# RPA Debug

CLI and MCP use the same command names and JSON parameters below.

## Debugging workflow and saving boundary

- When the user asks to debug, use `rpa-start-debug` and inspect `rpa-get-debug-log`. Do not create or run a regular task as a substitute: task and debug contexts can provide different built-in variables and take different branches. Long JSON inputs or a failed debug call do not authorize creating tasks or saving processes.
- Use the profile specified by the user in the current request or established conversation. If none is specified, ask which profile to use; do not pick a test or opened profile yourself. If the user supplies several profiles for this debugging request, use the first in their supplied order. Resolve its actual ID and number for `fbcc_id` and `acc_id`.
- Before retrying a debug run after closing its browser, confirm the target profile has actually closed. A successful `close-browser` response does not mean shutdown is complete: wait briefly and poll `get-opened-browser` until the target profile ID is absent from the opened list, then start the next debug run. Other open profiles do not block this check. If the target remains open or its status cannot be confirmed within a reasonable wait, report the blocker instead of starting another debug run.
- Read the flow and infer the requested functional scope. Determine node IDs from that evidence rather than asking the user for IDs. For an entire flow, start at the first business-action node; for a specific function, use its first business-action node as `start_node_id`, not the `startNode` configuration node. Do not probe the write tool with `{}` to discover parameters; read this reference or the advertised schema.
- For local debugging of one function, preserve the original complete flow and make an independent draft containing the start node and the target function's nodes, including its internal branches and loops. Connect the start node to that function's first business node, remove connections into unrelated functions, and save the complete draft JSON in a local file and provide its absolute path as `process_file`. Determine its ending nodes from the flow; there is no stop-node argument. Account for required variables, settings and inputs without assuming omitted earlier functions ran.
- Example: from `start -> login -> registration -> password reset`, debugging registration uses the draft `start -> registration`, with `start_node_id` set to registration's first business node. After correction, merge the corrected registration subgraph back into a complete local copy: `start -> login -> corrected registration -> password reset`.
- Restore the original incoming/outgoing boundaries when merging, preserve unrelated nodes/configuration, and check references for changed or removed nodes, branches and loops. The complete merged flow is the candidate for saving, never the isolated debug draft. A successful function debug does not prove the full flow has passed.
- A request to fix and continue debugging authorizes draft edits and verification, not overwriting the saved flow, changing its metadata, or creating another saved flow. After verification, report changes, actual results and uncovered scope, then ask whether to update the existing process unless saving was already explicitly authorized. Preserve the original and use the process-management reference for an authorized update.

**rpa-start-debug** — Debug a process from a specified node.

- **start_node_id** (required): Non-empty string. Starting node ID.
- **process_file** (preferred): Absolute local path to a complete Vue Flow JSON or gzip JSON file, at most 32 MiB expanded. The tool reads it immediately before sending the RPA HTTP request; file paths are not sent to the RPA service.
- **process** (legacy): Complete Vue Flow JSON string. Supply exactly one of **process_file**/**process**. For Agent calls, use **process_file** so full flow and JS are not repeated in tool arguments or message history.
- **process_name** (optional): Non-empty string, up to 100 characters. Process name for this debug run.
- **variable** (optional): Complete global variable objects encoded as a JSON array string; see [Global variables](rpa-variables.md); same validation as process creation and update: up to 1048576 UTF-8 bytes and 1000 variables, with each key at most 32 characters and each val/value string at most 1000 characters. Use `"[]"` when there are no variables.
- **setting** (optional): String. Validated process settings encoded as JSON; see [Process settings](rpa-settings.md) for allowed fields and defaults. Omit to use the complete default configuration.
- **fbcc_id** (required): Non-empty string. Profile ID.
- **acc_id** (required): Non-empty string. Profile number; different from **fbcc_id**.
- Returns `{id}`; use this debug ID with **rpa-get-debug-log** and **rpa-cancel-debug**. No **process_id** or stop-node parameter is accepted. Pending or running regular tasks may prevent debugging.

**rpa-get-debug-log** — Get debug status and logs.

- **id** (required): Non-empty string. Debug ID returned by **rpa-start-debug**, not a task, execution record, or profile execution item ID.
- **output_file** (optional): New absolute local file for the complete response. Returns status metadata and the file path instead of full logs; existing files are never overwritten. Omission preserves legacy full output. Agent hosts should set this and inspect only required fragments.
- Returns `id`, `acc_id`, `fbcc_id`, `process_name`, `status`, `end_time`, and full `logs`.

**rpa-cancel-debug** — Cancel a debug run.

- **id** (required): Non-empty string. Debug ID returned by **rpa-start-debug**.

## File-based Agent workflow

- Keep full flows and JS in session files. Inspect a node overview, then only the relevant node/config field or script excerpt. Do not read a single-line full JSON or escaped copy back into the conversation.
- Supply process_file directly; do not print, escape, or paste the file into process. Keep source/draft files while approval, retry, merge or delivery still needs them; the transport does not delete caller files.
- Keep full log responses on disk and return status plus file references. Read bounded pages or filtered error excerpts rather than echoing node configs, scripts and entire logs.
