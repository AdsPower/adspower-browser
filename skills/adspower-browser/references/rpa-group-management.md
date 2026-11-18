# RPA Process Group Management

CLI and MCP use the same `rpa-*` names and JSON parameters. These requests use the existing AdsPower runtime port and API Key. Process groups are separate from browser profile groups.

The API calls process groups batches. Use the exact batch command names below; do not substitute group in a tool name or use browser group management.

**rpa-get-batch-list** — List process groups.

- **page** (required): Positive integer, starting at `1`.
- **page_size** (optional): One of `10`, `20`, `50`, `100`; defaults to `10`. Process groups per page.

**rpa-create-batch** — Create a process group.

- **name** (required): String. New group name, up to 30 characters.

**rpa-update-batch** — Rename a process group.

- **id** (required): Non-empty string. Process group ID.
- **name** (required): String. New group name, up to 30 characters.

**rpa-delete-batch** — Delete process groups.

- **ids** (required): Comma-separated process group IDs, without spaces or empty entries.
- Do not assume whether processes are moved or deleted with the group; the backend's group deletion behavior must be confirmed before relying on a cascade.

```bash
ads rpa-get-batch-list '{"page":1,"page_size":10}'
ads rpa-create-batch '{"name":"Example flows"}'
```
