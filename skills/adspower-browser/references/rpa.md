# RPA Function Index

Use this secondary guide only for RPA requests. Select the relevant reference below and load that file before calling any tool in that category; do not read every RPA reference. The linked files contain the command declarations, required/optional parameters, limits, and return semantics.

All RPA CLI commands and MCP tools use the same `rpa-*` names. Select by function rather than service location. The task-creation endpoint creates configuration only. For the default create-and-run workflow, follow task creation with local execution unless the user explicitly asks not to execute; see the task reference.

## Function references

| Requested operation | Exact entry commands | Read before calling |
|---|---|---|
| Execute/cancel tasks; query execution items by task or process | `rpa-add-task`, `rpa-cancel-task`, `rpa-get-task-execute-items` | [Execution management](rpa-execution-management.md) |
| Inspect execution records, statistics or profile logs | `rpa-get-record-list`, `rpa-get-record-detail`, `rpa-get-task-log` | [Execution records and logs](rpa-run-records.md) |
| Enable, query or disable scheduled execution | `rpa-add-plan`, `rpa-get-plan-switch`, `rpa-cancel-plan` | [Plan management](rpa-plan-management.md) |
| Start, inspect or cancel debugging | `rpa-start-debug`, `rpa-get-debug-log`, `rpa-cancel-debug` | [Debug](rpa-debug.md) |
| Read or update thread concurrency | `rpa-get-rpa-config`, `rpa-update-rpa-config` | [Configuration](rpa-config.md) |
| Excel/text, email, 2FA or Google Sheets | `rpa-read-excel-fields`, `rpa-check-email`, `rpa-google-sheets` | [Auxiliary tools](rpa-tools.md) |
| Create, edit or query task configurations and bindings | `rpa-create-task`, `rpa-get-task-list`, `rpa-get-task-runtime-list` | [Task configuration](rpa-task-management.md) |
| Create, list, count or edit processes; query paid-template subscriptions | `rpa-create-process`, `rpa-update-process`, `rpa-get-template-subscription-info` | [Process management](rpa-process-management.md) |
| List/create/rename/delete process groups | `rpa-get-batch-list`, `rpa-create-batch`, `rpa-update-batch`, `rpa-delete-batch` | [Process groups](rpa-group-management.md) |
| Share or receive processes | `rpa-create-share`, `rpa-receive-share` | [Process sharing](rpa-share-management.md) |

For task schedules, read [Schedule rules](rpa-schedule.md) before supplying `schedule_rule`.

For process settings, also read [Process settings](rpa-settings.md) before supplying `setting`.
For global variables, read [Global variables](rpa-variables.md) before supplying `variable`; preserve the complete client variable objects, including their types and editor metadata.

## Tool selection and query discipline

- Keep process creation, draft debugging, task configuration and task execution distinct. Debug requests use the [Debug](rpa-debug.md) workflow, including its draft/save boundary; requests only to start a task stop at the acceptance check in [Execution management](rpa-execution-management.md). The default create-and-run task workflow applies only when task creation itself is requested, not when generating or debugging a process.
- Use exact command names from the selected reference or the currently advertised tool schema. Do not derive a command name from a heading or business noun. In particular, process groups use `batch` commands; there is no `rpa-get-group-list`. Browser `get-group-list` queries browser profile groups, not process groups.
- A reference for one category does not authorize guessing commands in another. When a process-list request also needs group names, read the process-group reference before making that additional call.
- For an unknown-command/tool error, stop and check the reference plus current tool discovery or CLI help. Do not try similarly named tools until one happens to work. Use the actual advertised tool identifier; host wrappers may use underscores or add a provider prefix.
- Issue runtime queries serially and, unless a different limit is established, leave at least one second between calls. On a rate-limit response, wait at least one second before at most one retry of that read-only query with the same arguments. A rate-limit error is not evidence of a wrong route. Do not retry writes automatically.
- For “what RPA processes do I have,” start with the process reference and `rpa-get-process-list`; use matching filters with `rpa-get-process-list-count` if a total is needed. Process-group lookup is optional and uses the group reference and `rpa-get-batch-list` with page starting at 1 and page_size defaulting to 10. State when the answer is only an overview or a partial page; do not imply all processes were retrieved.

## Retrieving all results and choosing page size

All RPA `page_size` parameters accept `10`, `20`, `50`, or `100` and default to `10` when omitted. This fallback is not a fixed page size for bulk retrieval. Honor an explicit page size or result limit requested by the user.

For requests such as "get all processes", "list every task", or another request for a large result set:

1. If the list has a corresponding count tool, query the count first using the same filters and identifiers that the count tool actually accepts. Do not invent count commands or pass list-only fields such as `fields` to a count tool.
2. For a matching total N, choose the smallest supported page size that can hold N: 1-10 -> 10; 11-20 -> 20; 21-50 -> 50; 51 or more -> 100. Examples: 39 -> 50; 78 -> 100. If N is zero, report no results without requesting list pages.
3. Start at page 1. For N > 100, use page_size=100 and retrieve every page (at least ceil(N/100) pages), keeping filters and page size unchanged. Do not claim "all" after retrieving only the first page. If the last expected page is full, check the next page when needed to account for changes since counting; stop on a short or empty page.
4. If no count tool exists, or the count cannot accept all list filters, use page_size=100 for an all-results request unless the user specifies otherwise. Treat a broader count only as an upper bound; retrieve pages until a short or empty page instead of claiming that the count is an exact filtered total. If the count request fails, report that limitation and paginate the available list rather than assuming a zero count.
5. Keep runtime calls serial and follow the rate-limit guidance above. Distinguish a partial result (errors, interruption, or user limit) from a complete retrieval. Counts and lists are separate requests, not an atomic snapshot.

Count pairs: `rpa-get-process-list` / `rpa-get-process-list-count`; `rpa-get-task-list` / `rpa-get-task-list-count`; `rpa-get-task-runtime-list` / `rpa-get-task-runtime-list-count`; `rpa-get-record-list` / `rpa-get-record-count`; `rpa-get-record-items` / `rpa-get-record-items-count`; `rpa-get-task-execute-items` / `rpa-get-task-execute-items-count`. Read the relevant reference for accepted filters and response shapes. Profile-binding counts accept only task_id; process groups have no separate count tool in this project.

## Connection and input conventions

All RPA CLI business arguments are JSON objects; browser profile ID shorthand does not apply. Use `ads <command> --help` or MCP tool discovery for the current schema.

- Local RPA uses `-rp` / `--rpa-port`, or `RPA_PORT`, default `20409`. The local RPA Plus service must be running.
- Remote RPA requests go through the existing AdsPower runtime, using `--port` / `--api-key` like browser/group management. MCP uses `PORT` / `API_KEY`. Do not use `RPA_PORT` for remote backend operations.
- The CLI retains its runtime availability check; ensure the runtime is running before issuing commands.
- For process creation, `process_file` is a `.json.gz` file path readable by the runtime. Its contents must be gzip-compressed process JSON with `nodes` and `edges` arrays. The runtime validates the file and forwards its compressed bytes without compressing it again. The runtime uploads the original bytes and metadata to the single create-process-by-api endpoint; no separate STS workflow is needed.

## Product terminology

Use **profile** for a browser profile, **profile ID** for `fbcc_id` / `fbcc_user_ids`, **profile number** for `acc_id` / `fbcc_user_acc_id`, and **profile group** for browser profile groups. Keep process groups distinct from profile groups. Use **process** for the RPA process definition, **regular task** / **scheduled task** for task types, **execution record** for `record_id` and **execution log** for log contents, and **Template Store** for the template marketplace. Preserve the API's exact parameter names and the proper name **Vue Flow**.

## Select the correct identifier

- A remote **task ID** identifies task configuration; a remote **process ID** identifies a process definition.
- **record_id** identifies one execution. `rpa-add-task` returns it; `rpa-cancel-task` can cancel only that execution using it.
- Local **item_id** identifies one profile execution item; use it for item logs or item cancellation.
- A **debug ID** comes from `rpa-start-debug` and is used only for debug status/log/cancel operations.
- A remote **binding record ID** is used when removing a profile binding; it is different from the profile ID and local item ID.
- A **process group ID** is not a browser profile group ID.

## Operations with side effects

Read the selected command's declaration before executing it. Task submission and debugging execute processes; plan enablement schedules execution. Disabling a local plan also cancels its active executions. Record deletion removes associated execution items and logs. Email reads can mark messages as read; Google Sheets write/clear modify data.

The local service prevents duplicate active runs for the same user/task, but a new run is allowed after completion, failure, or cancellation. Do not automatically resubmit after an uncertain timeout: the previous run may already have finished. Inspect status first.

Keep passwords, TOTP secrets, service-account private keys and OAuth tokens out of responses and logs. Do not assume that remote task deletion cancels local execution or disables local scheduling; use the appropriate local operations when requested.
