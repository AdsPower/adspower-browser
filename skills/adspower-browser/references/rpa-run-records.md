# RPA Run Records

CLI and MCP use the same command names and JSON parameters below.

**rpa-get-record-list** — List RPA execution records.

- **filter** (optional): JSON string. See Filter below; uses execution record fields.
- **page** (optional): Positive integer, default `1`.
- **page_size** (optional): One of `10`, `20`, `50`, `100`; default `10`.
- Returns an array containing `id` (execution record ID), `task_id`, `task_name`, `process_id`, `process_name`, `task_type`, `profile_count`, `status`, `start_time`, and `end_time`.

**rpa-get-record-count** — Count RPA execution records.

- **filter** (optional): JSON string. Same filter format and execution record fields as **rpa-get-record-list**.
- Returns `{count}`.

**rpa-get-record-detail** — Get one run's status and statistics.

- **id** (required): Non-empty string. Local execution record ID (`record_id`), not a task ID.
- Returns run identity, status, times, `count`, `success_count`, `fail_count`, and `cancel_count`.

**rpa-get-record-items** — List profile execution items within one run.

- **id** (required): Non-empty string. Local execution record ID (`record_id`).
- **filter** (optional): JSON string. See Filter below; uses profile execution item fields.
- **page** (optional): Positive integer, default `1`.
- **page_size** (optional): One of `10`, `20`, `50`, `100`; default `10`.
- Returns an array containing `id` (profile execution item ID), `fbcc_id`, `acc_id`, `status`, times, and full `logs`.

**rpa-get-record-items-count** — Count profile execution items within one run.

- **id** (required): Non-empty string. Local execution record ID (`record_id`).
- **filter** (optional): JSON string. Same filter format and item fields as **rpa-get-record-items**.
- Returns a number, not `{count}`.

**rpa-get-task-log** — Get one profile execution item's status and logs.

- **id** (required): Non-empty string. Profile execution item ID (`item_id`), not a task ID or execution record ID.
- Returns `id`, `acc_id`, `fbcc_id`, `process_name`, `status`, `end_time`, and full `logs`. Returns `{}` when not found. No cursor or limit parameters.

**rpa-delete-record** — Delete a local execution record and its associated execution items and logs.

- **id** (required): Non-empty string. Local execution record ID (`record_id`), not a task ID or profile execution item ID.
- Does not delete the remote task definition or cancel a running task.

## Filter

**filter** is a JSON string containing:

- **and** (optional): Array of conditions; all must match.
- **or** (optional): Array of conditions; any may match.

Each condition:

- **field** (required): One of the allowed fields below.
- **op** (required): `'like'` | `'eq'` | `'='` | `'ne'` | `'!='` | `'gt'` | `'>'` | `'gte'` | `'>='` | `'lt'` | `'<'` | `'lte'` | `'<='` | `'in'` | `'not_in'` | `'is_null'` | `'is_not_null'`.
- **val** (required): String, number, boolean, null, or an array of strings/numbers. Also include it for null checks, e.g. `null`.

Allowed execution record fields: `id`, `task_id`, `task_name`, `process_id`, `process_name`, `task_type`, `profile_count`, `status`, `start_time`, `end_time`, `create_time`, `update_time`.

Allowed profile execution item fields: `id`, `record_id`, `task_id`, `process_id`, `process_name`, `fbcc_id`, `acc_id`, `status`, `start_time`, `end_time`, `create_time`, `update_time`.

Example:

```bash
ads rpa-get-record-list '{"filter":"{\"and\":[{\"field\":\"task_id\",\"op\":\"eq\",\"val\":\"123\"}]}","page":1,"page_size":10}'
```
