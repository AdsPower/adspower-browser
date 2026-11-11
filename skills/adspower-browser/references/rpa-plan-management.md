# RPA Plan Management

CLI and MCP use the same command names and JSON parameters below.

**rpa-add-plan** — Register and enable an existing scheduled RPA task locally.

- **task_id** (required): String. Existing RPA task ID with its schedule already configured.
- Does not create or edit a task's scheduling rule.

**rpa-get-plan-switch** — Query which scheduled tasks are enabled locally.

- **task_ids** (required): Comma-separated task IDs, e.g. `"123,456"`. No spaces or empty entries.
- Returns `{open_tasks: string[]}` containing the enabled task IDs.

**rpa-cancel-plan** — Disable a scheduled task and cancel its current active executions.

- **task_id** (required): String. Scheduled task ID.
- This also cancels the task's active executions; it is not limited to stopping future scheduling.
