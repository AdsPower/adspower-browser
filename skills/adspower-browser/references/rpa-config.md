# RPA Config

CLI and MCP use the same command names and JSON parameters below.

**rpa-get-rpa-config** — Get the local RPA task thread concurrency.

- **keys** (optional): Only `'thread'` is supported; defaults to `'thread'`.
- Returns a key/value object, e.g. `{"thread":"3"}`.

**rpa-update-rpa-config** — Update the local RPA task thread concurrency.

- **thread** (required): String representing an integer from `1` to `100`, e.g. `"10"`. Numbers, fractions, and strings with leading zeros are not accepted.
- Other configuration keys are not exposed.
