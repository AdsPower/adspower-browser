# RPA Tools

CLI and MCP use the same command names and JSON parameters below.

**rpa-read-excel-fields** — Parse Excel column names usable as variables.

- **file_path** (required): Non-empty string. Excel file path accessible to the computer running RPA.
- Returns `{variable_list: string[]}` from the first row, filtered to valid variable names; does not return the full workbook.

**rpa-read-text-list** — Read a text file as a list of lines.

- **file_path** (required): Non-empty string. Text file path accessible to the computer running RPA.
- Trims each line and ignores empty lines. Returns `{list: string[]}`.

**rpa-check-email** — Read and filter email messages through IMAP.

- **user** (required): Non-empty string. Email login account.
- **password** (required): Non-empty string. Password or app password; still required when OAuth fields are supplied.
- **imapHost** (required): Non-empty string. IMAP server address.
- **port** (optional): String. IMAP port; default `993` in the mail service.
- **status** (optional): String. IMAP status filter, converted to uppercase; default `'UNSEEN'`.
- **subject** (optional): String. Subject filter.
- **from** (optional): String. Sender filter.
- **mailTo** (optional): String. Recipient filter.
- **dateType** (optional): `'today'` | `'yestoday'` | `'7days'` | `'30days'`. The spelling `'yestoday'` is required by the existing service.
- **keyword** (optional): String. Email TEXT search keyword.
- **reg** (optional): String. Regular expression for extracting content.
- **timeout** (optional): String. IMAP connection timeout in milliseconds; defaults to `"30000"` (30 seconds) on the service.
- **tls** (optional): `'0'` | `'1'`. `'1'` enables TLS; enabled by default.
- **seen** (optional): `'0'` | `'1'`. `'1'` marks fetched messages as read; disabled by default.
- **isJunk** (optional): `'0'` | `'1'`. `'1'` enables junk-folder queries; disabled by default.
- **clientId**, **clientSecret**, **refreshToken** (optional): Strings. OAuth client ID, client secret, and refresh token. All three must be provided to attempt OAuth.
- Returns parsed email data, including available sender, recipient, subject, date, content, and extracted values. Do not echo credentials in responses.

**rpa-get-two-fa** — Generate a TOTP 2FA code.

- **secret** (required): Non-empty string. TOTP secret; do not echo it in responses or logs.
- Returns `{code}`.

**rpa-google-sheets** — Read, write, or clear a Google Sheets worksheet.

- **sheetId** (required): Non-empty string. Spreadsheet ID.
- **sheetName** (required): Non-empty string. Worksheet name.
- **type** (optional): `'read'` | `'write'` | `'clear'`; defaults to `'read'`.
- **apiKey** (optional): String. Service-account configuration encoded as JSON, containing `private_key`, `client_email`, and `client_id`; not a plain API key.
- **isKey** (optional): `'0'` | `'1'`; defaults to `'1'`. For read, `'0'` returns a two-dimensional array; `'1'` uses the first row as object keys.
- **range** (optional): String. A1 range, e.g. `'A1:C10'`; omission uses the worksheet range.
- **template** (required for write; otherwise optional): String. A two-dimensional array encoded as JSON, e.g. `'[["name"],["Alice"]]'`.
- **rangeType** (optional): `'append'` | `'custom'`; defaults to `'append'`. For write, `'append'` appends to the worksheet without using **range** to restrict the append position; `'custom'` writes to **range**.
- Write and clear modify data. Returns `{res}`; write/clear may return `{}` when the service omits an undefined result.
