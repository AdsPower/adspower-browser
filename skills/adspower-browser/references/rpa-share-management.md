# RPA Process Sharing

CLI and MCP use the same `rpa-*` names and JSON parameters. Requests use the same AdsPower runtime port and API Key as browser/group management.

**rpa-create-share** — Create a share code for processes.

- **process_ids** (required): Comma-separated process IDs, without spaces or empty entries.
- **quota** (optional): Number, at most 1000; defaults to 10.
- **expired_time** (optional): Number `1`, `7` or `30`, in days; defaults to `7` days.
- **share_config** (optional): Empty string or `"remark"`; defaults to an empty string. Use `"remark"` to include the process remark in the share.

**rpa-receive-share** — Receive processes using a share code.

- **share_code** (required): String. Share code.
- **batch_id** (optional): Non-empty string. Target process group ID. Omit for the all-groups view; do not send the frontend sentinel `"all"`.

```bash
ads rpa-receive-share '{"share_code":"example-share-code"}'
```
