# Browser Profile Management

**open-browser** — Open the browser (environment/profile).

- **profileId** (required): Unique profile ID, generated after creating profile.
- **profileNo** (optional): Profile number; priority given to profileId when both provided.
- **ipTab** (optional): `'0'` | `'1'`, default 0. Whether to open the IP detection page.
- **launchArgs** (optional): Chrome launch args or startup URL.
- **clearCacheAfterClosing** (optional): `'0'` | `'1'`, default 0.
- **cdpMask** (optional): `'0'` | `'1'`, default 0. Whether to mask CDP detection.

**close-browser** — Close the browser.

- **profileId** (optional) or **profileNo** (optional): One required. The profile to stop.

**create-browser** — Create a browser.

- **groupId** (required): Numeric string; use `"0"` for Ungrouped. Get list via get-group-list.
- At least one of **username**, **password**, **cookie**, **fakey** (required): Account information.
- **userProxyConfig** or **proxyid** (one required): Custom proxy config (see [user-proxy-config.md](user-proxy-config.md)) or saved proxy ID / `"random"`.
- **name** (optional, max 100): Account name.
- **platform** (optional): Platform domain, e.g. facebook.com.
- **remark** (optional, max 1500): Remarks.
- **tabs** (optional): URLs to open on startup, e.g. `["https://www.google.com"]`.
- **repeatConfig** (optional): `0` | `2` | `3` | `4`. Account deduplication.
- **ignoreCookieError** (optional): `'0'` | `'1'`. Handle cookie verification failures.
- **ip**, **country** (see [country-code.md](country-code.md)), **region**, **city** (optional).
- **ipchecker** (optional): `'ip2location'` | `'ipapi'`. IP query channel.
- **categoryId** (optional): Use get-application-list to get list.
- **fingerprintConfig** (optional): Browser fingerprint config; see [fingerprint-config.md](fingerprint-config.md).

**update-browser** — Update the browser.

- **profileId** (required): The profile id of the browser to update.
- **platform**, **tabs**, **cookie**, **username**, **password**, **fakey**, **ignoreCookieError** (`'0'`|`'1'`), **groupId**, **name** (max 100), **remark** (max 1500), **country** (see [country-code.md](country-code.md)), **region**, **city**, **ip**, **categoryId**, **userProxyConfig** (see [user-proxy-config.md](user-proxy-config.md)), **proxyid**, **fingerprintConfig** (see [fingerprint-config.md](fingerprint-config.md)), **launchArgs** (all optional).

**delete-browser** — Delete the browser(s).

- **profileIds** (required): Array of profile ids to delete.

**get-browser-list** — Get the list of browsers.

- **groupId** (optional): Numeric string; query by group ID; empty searches all groups.
- **limit** (optional): 1–200, default 50. Profiles per page.
- **page** (optional): Default 1.
- **profileId** (optional): Array, e.g. `["h1yynkm","h1yynks"]`.
- **profileNo** (optional): Array, e.g. `["123","124"]`.
- **sortType** (optional): `'profile_no'` | `'last_open_time'` | `'created_time'`.
- **sortOrder** (optional): `'asc'` | `'desc'`.

**get-opened-browser** — Get the list of opened browsers.

- No parameters.

**move-browser** — Move browsers to a group.

- **groupId** (required): Numeric string. Target group id; use get-group-list to get list.
- **userIds** (required): Array of browser profile ids to move.

**get-profile-cookies** — Query cookies of the specified profile. One profile per request.

- **profileId** (optional) or **profileNo** (optional): One required.

**get-profile-ua** — Query User-Agent of specified profiles. Up to 10 per request.

- **profileId** (optional): Array. Or **profileNo** (optional): Array. At least one element required.

**close-all-profiles** — Close all opened profiles on the current device.

- No parameters.

**new-fingerprint** — Generate a new fingerprint for specified profiles. Up to 10 per request.

- **profileId** (optional): Array. Or **profileNo** (optional): Array.

**delete-cache-v2** — Clear local cache of specific profiles. Ensure no open browsers when using.

- **profileIds** (required): Array of profile ids.
- **type** (required): Array of `'local_storage'` | `'indexeddb'` | `'extension_cache'` | `'cookie'` | `'history'` | `'image_file'`.

**share-profile** — Share profiles via account email or phone. Max 200 per request.

- **profileIds** (required): Array.
- **receiver** (required): Account email or phone number, no area code.
- **shareType** (optional): 1 for email (default), 2 for phone number.
- **content** (optional): Array of `'name'` | `'proxy'` | `'remark'` | `'tabs'`. Shared content.

**get-browser-active** — Get active browser profile information.

- **profileId** (optional) or **profileNo** (optional): One required.

**get-cloud-active** — Query status of browser profiles by user_id. Up to 100 per request.

- **userIds** (required): Comma-separated profile IDs string, max 100. Unique profile ID generated after creating profile.
