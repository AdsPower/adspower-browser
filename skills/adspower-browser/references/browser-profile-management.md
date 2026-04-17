# Browser Profile Management

**open-browser** — Open the browser (environment/profile).

- **profile_id** (optional): Unique profile ID, generated after creating profile.
- **profile_no** (optional): Profile number.
- One of **profile_id** or **profile_no** is required. If both are provided, **profile_id** takes priority.
- **ip_tab** (optional): `'0'` | `'1'`, default 0. Whether to open the IP detection page.
- **launch_args** (optional): Chrome launch args or startup URL.
- **headless** (optional): `'0'` | `'1'`. Launch the browser in headless mode when supported.
- **last_opened_tabs** (optional): `'0'` | `'1'`. Restore the last opened tabs when reopening the profile.
- **proxy_detection** (optional): `'0'` | `'1'`. Open the proxy detection page after launch.
- **password_filling** (optional): `'0'` | `'1'`. Enable filling saved passwords in the launched browser.
- **password_saving** (optional): `'0'` | `'1'`. Enable saving passwords in the launched browser.
- **delete_cache** (optional): `'0'` | `'1'`, default 0.
- **cdp_mask** (optional): `'0'` | `'1'`, default 0. Whether to mask CDP detection.
- **device_scale** (optional): Device scale factor for the launched browser window.

**close-browser** — Close the browser.

- **profile_id** (optional) or **profile_no** (optional): One required. The profile to stop.

**create-browser** — Create a browser.

- **group_id** (required): Numeric string; use `"0"` for Ungrouped. Get list via get-group-list.
- At least one of **username**, **password**, **cookie**, **fakey** (required): Account information.
- **user_proxy_config** (optional, default `{"proxy_soft":"no_proxy"}`): Inline proxy config (see [user-proxy-config.md](user-proxy-config.md)). Ignored when **proxyid** is also provided.
- **proxyid** (optional): Saved proxy ID or `"random"`. Takes priority over **user_proxy_config** when both are given.
- **name** (optional, max 100): Account name.
- **platform** (optional): Platform domain, e.g. facebook.com.
- **remark** (optional, max 1500): Remarks.
- **tabs** (optional): URLs to open on startup, e.g. `["https://www.google.com"]`.
- **repeat_config** (optional): Array of deduplication switches. Each item must be one of `0`, `2`, `3`, or `4`, for example `[0, 2]`.
- **ignore_cookie_error** (optional): `'0'` | `'1'`. Handle cookie verification failures.
- **ip**, **country**, **region**, **city** (optional). Use a lowercase two-letter country code such as `us`, `gb`, or `jp` for **country**.
- **ipchecker** (optional): `'ip2location'` | `'ipapi'` | `'ipfoxy'`. IP query channel.
- **category_id** (optional): Use get-application-list to get list.
- **profile_tag_ids** (optional): Array of tag IDs, max 30 tags per profile.
- **platform_account** (optional): Structured platform account metadata object:
  - **domain_name** (required): Platform domain name, for example `facebook.com`.
  - **login_user** (required): Platform login user, for example a shop username or login email.
  - **password** (optional): Platform account password.
  - **fakey** (optional): 2FA key for online 2FA code generators.
- **fingerprint_config** (optional): Browser fingerprint config; see [fingerprint-config.md](fingerprint-config.md).

**update-browser** — Update the browser.

- **profile_id** (required): The profile id of the browser to update.
- **platform**, **tabs**, **cookie**, **username**, **password**, **fakey**, **ignore_cookie_error** (`'0'`|`'1'`), **group_id**, **name** (max 100), **remark** (max 1500), **country** (lowercase two-letter code such as `us`, `gb`, or `jp`), **region**, **city**, **ip**, **ipchecker** (`'ip2location'` | `'ipapi'` | `'ipfoxy'`), **category_id**, **user_proxy_config** (see [user-proxy-config.md](user-proxy-config.md)), **proxyid**, **fingerprint_config** (see [fingerprint-config.md](fingerprint-config.md)), **launch_args**, **profile_tag_ids** (array, max 30), **platform_account** (`domain_name` 和 `login_user` 必填，`password` / `fakey` 可选), **tags_update_type** (`'1'` replace all tags, `'2'` append and truncate to 30) (all optional).

**delete-browser** — Delete the browser(s).

- **profile_id** (required): Array of profile ids to delete.

**get-browser-list** — Get the list of browsers.

- **group_id** (optional): Numeric string; query by group ID; empty searches all groups.
- **limit** (optional): 1–200, default 50. Profiles per page.
- **page** (optional): Default 1.
- **profile_id** (optional): Array, e.g. `["h1yynkm","h1yynks"]`.
- **profile_no** (optional): Array, e.g. `["123","124"]`.
- **sort_type** (optional): `'profile_no'` | `'last_open_time'` | `'created_time'`.
- **sort_order** (optional): `'asc'` | `'desc'`.

- **tag_ids** (optional): Tag IDs to filter environments by tags.
- **tags_filter** (optional): `'include'` (default) | `'exclude'` for tag match mode.
- **name** (optional): Environment name keyword.
- **name_filter** (optional): `'include'` (default) | `'exclude'` for name match mode.

**get-opened-browser** — Get the list of opened browsers.

- No parameters.

**move-browser** — Move browsers to a group.

- **group_id** (required): Numeric string. Target group id; use get-group-list to get list.
- **user_ids** (required): Array of browser profile ids to move.

**get-profile-cookies** — Query cookies of the specified profile. One profile per request.

- **profile_id** (optional) or **profile_no** (optional): One required.

**get-profile-ua** — Query User-Agent of specified profiles. Up to 10 per request.

- **profile_id** (optional): Array. Or **profile_no** (optional): Array. At least one element required.
- CLI shorthand accepts one token: non-numeric input maps to `profile_id: ["..."]`, numeric input maps to `profile_no: ["..."]`.

**close-all-profiles** — Close all opened profiles on the current device.

- No parameters.

**new-fingerprint** — Generate a new fingerprint for specified profiles. Up to 10 per request.

- **profile_id** (optional): Array. Or **profile_no** (optional): Array.
- CLI shorthand accepts one token: non-numeric input maps to `profile_id: ["..."]`, numeric input maps to `profile_no: ["..."]`.

**delete-cache-v2** — Clear local cache of specific profiles. Ensure no open browsers when using.

- **profile_id** (required): Array of profile ids.
- **type** (required): Array of `'local_storage'` | `'indexeddb'` | `'extension_cache'` | `'cookie'` | `'history'` | `'image_file'`.

**share-profile** — Share profiles via account email or phone. Max 200 per request.

- **profile_id** (required): Array.
- **receiver** (required): Account email or phone number, no area code.
- **share_type** (optional): 1 for email (default), 2 for phone number.
- **content** (optional): Array of `'name'` | `'proxy'` | `'remark'` | `'tabs'`. Shared content.

**get-browser-active** — Get active browser profile information.

- **profile_id** (optional) or **profile_no** (optional): One required.

**get-cloud-active** — Query status of browser profiles by user_ids. Up to 100 per request.

- **user_ids** (required): Comma-separated profile IDs string, max 100. Unique profile ID generated after creating profile.
