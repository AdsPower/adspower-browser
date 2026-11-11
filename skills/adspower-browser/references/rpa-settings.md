# RPA Process Settings

Use this contract for `setting` in `rpa-create-process`, `rpa-update-process`, `rpa-update-process-editable-fields`, and `rpa-start-debug`. It is a JSON-encoded configuration string with known fields, not arbitrary JSON. Unknown fields and invalid types or values are rejected. Switches use strings, not booleans.

| Field | Type and allowed values | Default | Meaning |
|---|---|---|---|
| `exceptHandle` | `'skip'` or `'interrupt'` | `'skip'` | Continue after an error or interrupt the process. An operation's own error handling overrides the process default. |
| `close_browser` | `'auto'` or `'manual'` | `'auto'` | Close the browser automatically after completion or leave it open for manual closure. |
| `save_tab` | `'0'` or `'1'` | `'0'` | Clear or preserve tabs after completion. |
| `use_headless` | `'true'` or `'false'` | `'false'` | Run the browser without a graphical interface. |
| `disable_password_filling` | `'true'` or `'false'` | `'false'` | Disable autofill of saved accounts and passwords. |
| `clear_cache_after_closing` | `'true'` or `'false'` | `'false'` | Clear browser cache when closing. |
| `enable_password_saving` | `'true'` or `'false'` | `'false'` | Allow the browser to save login passwords. |
| `launch_args` | String, up to 300 characters | `''` | Browser launch arguments, one per line. |
| `task_timeout` | Integer from 0 to 864000, seconds | `0` | Task timeout; 0 disables the timeout. |
| `delay_exec` | Integer from 0 to 1440, minutes | `0` | Delay before execution; 0 means no delay. |

- Creation: omitting the entire `setting` field sends the complete default configuration shown below. Explicit settings (including `{}`) are validated and sent as supplied, without filling missing fields.
- Metadata-only updates (`rpa-update-process-editable-fields`): omit `setting` to preserve the existing configuration. Supplied settings are validated and passed through without inserting defaults; this does not guarantee backend field-by-field merge behavior.
- Content updates (`rpa-update-process`): `setting` is required. Read and preserve the existing settings unless the user requests a change; creation defaults are not used.
- Debugging: omitting `setting` sends the complete default configuration, just like creation. Explicit settings are validated and sent as supplied.
- Core exports `RpaSettings` (complete configuration), `RpaSettingsInput` (partial configuration), `DEFAULT_RPA_SETTINGS`, `rpaSettingsObjectSchema`, and `rpaSettingsJsonSchema`.

Default configuration before JSON encoding:

```json
{
  "exceptHandle": "skip",
  "close_browser": "auto",
  "save_tab": "0",
  "use_headless": "false",
  "disable_password_filling": "false",
  "clear_cache_after_closing": "false",
  "enable_password_saving": "false",
  "launch_args": "",
  "task_timeout": 0,
  "delay_exec": 0
}
```

Example CLI update:

```bash
ads rpa-update-process '{"id":"123","setting":"{\"exceptHandle\":\"interrupt\",\"task_timeout\":300}"}'
```

Source: `mix_fe_plus/src/views/auto/rpaPlus/taskFlow/components/settingForm.vue` and `utils/processStore.ts`.
