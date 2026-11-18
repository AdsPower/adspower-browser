# RPA Execution Management

For Agent log inspection, pass **output_file** (a new absolute local JSON path) to `rpa-get-task-log`, `rpa-get-record-detail`, `rpa-get-record-items`, or `rpa-get-task-execute-items`. The tool saves the complete response, including embedded logs, and returns bounded metadata plus the path. This parameter is consumed locally and not sent to the RPA service. Without it, legacy full output is unchanged. Read only needed pages/fields from the saved file.

CLI and MCP use the same command names and JSON parameters below.

## Submission acceptance versus completion

For a request only to execute/start an existing task, submit with `rpa-add-task`, then query `rpa-get-record-detail` once using the returned `record_id` (read [Execution records](rpa-run-records.md)). A first status of `WAIT` confirms queued execution; `START` or `DOING` confirms startup/in-progress execution. Report that state and stop checking. Do not poll for another transition, fetch node logs, or proactively ask whether to keep tracking.

If the first query already returns a terminal status, report it as observed. Queued/running does not mean successfully completed. Submission/query errors or unknown status require evidence-based handling, not a success claim or resubmission. Continue monitoring only when the user asks to wait for completion, track execution, obtain final results, or diagnose an execution problem; honor that requested scope and the query rate limits.

**rpa-add-task** — Submit an existing RPA task to the local service for execution.

- **task_id** (required): String. Existing remote task ID.
- Returns `{record_id: string}`. This is the execution ID for this submission; use it to query the run or cancel only this execution. This executes an existing task; it does not create a task definition.
- If the same local user and task already have a WAIT, START, or DOING run, returns its existing record_id without creating another run. Simultaneous submissions to the same service share one submission result.
- A new run is allowed after the previous run completes, fails, or is cancelled. This prevents duplicate active runs; it is not permanent request-key idempotency. Do not automatically resubmit after an uncertain timeout if the previous run may already have finished.

**rpa-cancel-task** — Cancel one execution or all active executions of a task.

- **record_id** (optional): Positive integer string. Execution ID returned by **rpa-add-task**; cancels only this run and its profile execution items.
- **task_id** (optional): Non-empty string. Task ID; cancels all current active runs of the task.
- Provide exactly one of **record_id** or **task_id**. Execution records are scoped to the current local user.

```bash
ads rpa-add-task '{"task_id":"123"}'
# Use the record_id returned above:
ads rpa-cancel-task '{"record_id":"42"}'
```

**rpa-get-latest-execution** — Get the most recent execution status for each task.

- **task_ids** (required): Comma-separated task IDs, e.g. `"123,456"`. No spaces or empty entries.
- Returns an array containing `task_id`, `latest_start_time`, and `latest_status`. It does not return a execution record ID or identify the execution from a particular submission.

**rpa-get-task-execute-items** — List profile execution items across runs, by task or process.

- **task_id** (optional): String. Task ID.
- **process_id** (optional): String. Process ID; queries execution items across tasks using this process.
- **page** (optional): Positive integer, starting at `1`; defaults to `1` on the service.
- **page_size** (optional): One of `10`, `20`, `50`, `100`; defaults to `10`.
- At least one of **task_id** or **process_id** is required. If both are provided, the service uses **task_id**.
- Returns an array of profile execution items with `id` (item ID), `fbcc_id`, `acc_id`, `status`, times, and full `logs`.

**rpa-get-task-execute-items-count** — Count profile execution items across runs, by task or process.

- **task_id** (optional): String. Task ID.
- **process_id** (optional): String. Process ID.
- At least one of **task_id** or **process_id** is required. If both are provided, the service uses **task_id**.
- Returns `{count}`.

**rpa-cancel-task-items** — Cancel specified profile execution items.

- **ids** (required): Comma-separated profile execution item IDs, e.g. `"99,100"`. No spaces or empty entries. These are item IDs, not task IDs or execution record IDs.
