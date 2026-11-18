# RPA Task Management

CLI and MCP use the same `rpa-*` names and JSON parameters below. Requests use the same AdsPower runtime port and API Key as browser/group management (`--port` / `--api-key`, or MCP `PORT` / `API_KEY`). They do not use `--rpa-port` or `RPA_PORT`.

**rpa-create-task** — Create an regular or scheduled task configuration.

- **name** (optional): Non-empty string, up to 64 characters. Defaults to `RPA_TASK_<current timestamp in milliseconds>`, generated at request time.
- **process_id** (required): Positive integer. Process ID.
- **exec_type** (optional): Number. `1` regular task (default) or `2` scheduled task.
- **exec_sort** (optional): Number. `1` ordered (default) or `2` random profile order; not serial/parallel execution.
- **exec_priority** (optional): Number. `0` normal (default) or `1` priority execution.
- **fbcc_user_ids** (required): Comma-separated profile IDs, without spaces or empty entries.
- **schedule_rule** (optional for regular tasks, required for scheduled tasks): Validated schedule JSON string; regular tasks default to `"{}"`. Read [Schedule rules](rpa-schedule.md) for the fixed fields, allowed values, units and frequency-specific requirements.
- The endpoint creates configuration only and returns `data.id`. Default agent workflow for regular tasks: after successful creation, call local **rpa-add-task** with that ID to execute immediately, unless the user explicitly asks to create only or not execute immediately. Do not add an immediate-execution field to the request.
- For scheduled tasks, call **rpa-add-plan** after creation to enable the configured schedule unless the user asks to leave it disabled. This registers scheduling; it does not run the task immediately.
- Treat creation and execution/enabling as separate results. If the second call fails or times out, retain and report the created task ID and do not repeat creation. Do not claim the task ran unless submission succeeded; submission is not completion.

**rpa-update-task** — Update a task configuration.

- **id** (required): Non-empty string. Task ID.
- **name**, **process_id**, **exec_type**, **exec_sort**, **exec_priority** (required): Same value constraints as creation (name up to 64 characters), without creation defaults.
- **fbcc_user_ids** (optional): Same ID format as creation.
- **schedule_rule** (optional for regular tasks, required for scheduled tasks): Same validated schedule format; existing start times may be retained on updates.
- This is not a single-field PATCH. Read the current task detail when needed, then supply the complete task write fields.

**rpa-delete-task** — Delete task configurations.

- **ids** (required): Comma-separated task IDs, not local execution IDs.
- Remote deletion is not a substitute for local execution cancellation or disabling a local plan.

**rpa-get-task-list** — List task configurations.

- **exec_type** (optional): Number. `1` regular or `2` scheduled; omission queries all tasks.
- **name** (optional): Task name filter.
- **fbcc_user_ids** (optional): Comma-separated profile IDs.
- **fbcc_user_acc_id** (optional): Comma-separated profile numbers containing only digits, e.g. `"123,456"`; no whitespace or empty entries.
- **process_name** (optional): Process name filter.
- **page** (optional): Positive integer, starting at 1.
- **page_size** (optional): One of `10`, `20`, `50`, `100`; defaults to `10`.

**rpa-get-task-list-count** — Count matching task configurations.

- **exec_type**, **name**, **fbcc_user_ids**, **fbcc_user_acc_id**, **process_name**, **page**, **page_size** (optional): Same query parameters as **rpa-get-task-list**.
- The existing backend uses `data.total` for the count; the client preserves the backend data object.

**rpa-get-task-detail** — Get task configuration details.

- **ids** (required): Comma-separated task IDs; use one ID for a single task.
- Existing consumers read `data.list[]`, including execution type, order, priority, schedule, and profile bindings. These are configuration details, not local execution records.

**rpa-get-task-runtime-list** — List profiles bound to a task.

- **task_id** (required): Non-empty string. Task ID.
- **fbcc_user_ids** (optional): Comma-separated profile IDs.
- **fbcc_user_name** (optional): Profile name filter.
- **fbcc_user_batch_id** (optional): Browser profile group ID, not a process group ID.
- **fbcc_user_acc_id** (optional): Comma-separated digit-only profile numbers, e.g. `"123,456"`.
- **page** (optional): Positive integer, starting at 1.
- **page_size** (optional): One of `10`, `20`, `50`, `100`; defaults to `10`.

**rpa-get-task-runtime-list-count** — Count profiles bound to a task.

- **task_id** (required): Non-empty string. Task ID.
- Does not accept the list endpoint's other filters or pagination fields.

**rpa-add-task-runtime** — Bind profiles to a task.

- **task_id** (required): Non-empty string. Task ID.
- **fbcc_user_ids** (required): Comma-separated profile IDs.

**rpa-delete-task-runtime** — Remove profile bindings from a task.

- **task_id** (required): Non-empty string. Task ID.
- **ids** (required): Comma-separated binding record IDs from the remote binding list, not profile IDs or local execution item IDs.

```bash
ads rpa-create-task '{"name":"Example task","process_id":123,"exec_type":1,"exec_sort":1,"exec_priority":0,"fbcc_user_ids":"11,12","schedule_rule":"{}"}'
ads rpa-get-task-detail '{"ids":"456"}'
ads rpa-get-task-runtime-list '{"task_id":"456","page":1,"page_size":10}'
```
