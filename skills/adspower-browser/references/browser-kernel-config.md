# Browser kernel config

Used under **fingerprintConfig** → **browser_kernel_config**. Version and type must match: only versions valid for the chosen type are allowed.

## type (optional)

| Value     | Default  |
|----------|----------|
| `chrome` | default  |
| `firefox`| —        |

## version (optional)

Default: `"ua_auto"`.

### Chrome

`92`, `99`, `102`, `105`, `108`, `111`, `114`, `115`, `116`, `117`, `118`, `119`, `120`, `121`, `122`, `123`, `124`, `125`, `126`, `127`, `128`, `129`, `130`, `131`, `132`, `133`, `134`, `135`, `136`, `137`, `138`, `139`, `140`, `141`, `142`, `143`, `144`, `ua_auto`

### Firefox

`100`, `107`, `114`, `120`, `123`, `126`, `129`, `132`, `135`, `138`, `141`, `144`, `ua_auto`

## Example

`"browser_kernel_config": { "version": "ua_auto", "type": "chrome" }`
