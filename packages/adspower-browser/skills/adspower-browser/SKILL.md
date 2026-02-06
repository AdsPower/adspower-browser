---
name: adspower-browser
description: Runs AdsPower Local API operations via the adspower-browser CLI (no MCP required). Use when the user asks to create or manage AdsPower browsers, groups, proxies, or check status; run Node CLI commands that call the same handlers as the MCP server.
---

# AdsPower Local API with adspower-browser

The Skills CLI (npx adspower-browser) is the package manager for operate AdsPower browser profiles, groups, proxies, and application/category lists via the **adspower-browser** CLI. 

## When to Use This Skill

Apply when the user:

- Asks to create, update, delete, or list AdsPower browser profiles
- Mentions opening or closing browsers/profiles, fingerprint, UA, or proxy
- Wants to manage groups, proxies, or check API status
- Refers to AdsPower or adspower-browser (and MCP is not running or not desired)

Ensure AdsPower is running (default port 50325). Set `PORT` and `API_KEY` via environment or `--port` / `--api-key` if needed.

## How to Run

```bash
adspower-browser [--port PORT] [--api-key KEY] <command> [<arg>]
```

**Two forms for `<arg>`:**

1. **Single value (shorthand)** — for profile-related commands, pass one profile ID or number:
   - `adspower-browser open-browser <ProfileId>`
   - `adspower-browser close-browser <ProfileId>`
   - `adspower-browser get-profile-cookies <ProfileId>`
   - `adspower-browser get-browser-active <ProfileId>`
   - `adspower-browser get-profile-ua <ProfileId>` (single ID)
   - `adspower-browser new-fingerprint <ProfileId>` (single ID)

2. **JSON string** — full parameters for any command (see Command Reference below):
   - `adspower-browser open-browser '{"profileId":"abc123","launchArgs":"..."}'`
   - Commands with no params: omit `<arg>` or use `'{}'`.

## Essential Commands

### Browser profile – open/close

```bash
adspower-browser open-browser <profileId>                    # Or JSON: profileId, profileNo?, ipTab?, launchArgs?, clearCacheAfterClosing?, cdpMask?
adspower-browser close-browser <profileId>                   # Or JSON: profileId? | profileNo? (one required)
```

### Browser profile – create/update/delete/list

```bash
adspower-browser create-browser '{"groupId":"0","proxyid":"random",...}'  # groupId + account field + proxy required
adspower-browser update-browser '{"profileId":"...",...}'    # profileId required
adspower-browser delete-browser '{"profileIds":["..."]}'     # profileIds required
adspower-browser get-browser-list '{}'                       # Or groupId?, limit?, page?, profileId?, profileNo?, sortType?, sortOrder?
adspower-browser get-opened-browser                          # No params
```

### Browser profile – move/cookies/UA/fingerprint/cache/share/active

```bash
adspower-browser move-browser '{"groupId":"1","userIds":["..."]}'   # groupId + userIds required
adspower-browser get-profile-cookies <profileId>             # Or JSON: profileId? | profileNo?
adspower-browser get-profile-ua <profileId>                  # Or JSON: profileId[]? | profileNo[]? (up to 10)
adspower-browser close-all-profiles                          # No params
adspower-browser new-fingerprint <profileId>                 # Or JSON: profileId[]? | profileNo[]? (up to 10)
adspower-browser delete-cache-v2 '{"profileIds":["..."],"type":["cookie","history"]}'  # type: local_storage|indexeddb|extension_cache|cookie|history|image_file
adspower-browser share-profile '{"profileIds":["..."],"receiver":"email@example.com"}' # receiver required; shareType?, content?
adspower-browser get-browser-active <profileId>              # Or JSON: profileId? | profileNo?
adspower-browser get-cloud-active '{"userIds":"id1,id2"}'    # userIds comma-separated, max 100
```

### Group

```bash
adspower-browser create-group '{"groupName":"My Group","remark":"..."}'   # groupName required
adspower-browser update-group '{"groupId":"1","groupName":"New Name"}'    # groupId + groupName required; remark? (null to clear)
adspower-browser get-group-list '{}'                         # groupName?, size?, page?
```

### Application (categories)

```bash
adspower-browser check-status                                # No params – API availability
adspower-browser get-application-list '{}'                   # category_id?, page?, limit?
```

### Proxy

```bash
adspower-browser create-proxy '{"proxies":[{"type":"http","host":"127.0.0.1","port":"8080"}]}'  # type, host, port required per item
adspower-browser update-proxy '{"proxyId":"...","host":"..."}'   # proxyId required
adspower-browser get-proxy-list '{}'                         # limit?, page?, proxyId?
adspower-browser delete-proxy '{"proxyIds":["..."]}'        # proxyIds required, max 100
```

## Command Reference (full interface and parameters)

All parameter names are camelCase in JSON.

### Browser Profile Management

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
- **userProxyConfig** or **proxyid** (one required): Custom proxy config (see **UserProxyConfig** below) or saved proxy ID / `"random"`.
- **name** (optional, max 100): Account name.
- **platform** (optional): Platform domain, e.g. facebook.com.
- **remark** (optional, max 1500): Remarks.
- **tabs** (optional): URLs to open on startup, e.g. `["https://www.google.com"]`.
- **repeatConfig** (optional): `0` | `2` | `3` | `4`. Account deduplication.
- **ignoreCookieError** (optional): `'0'` | `'1'`. Handle cookie verification failures.
- **ip**, **country**, **region**, **city** (optional).
- **ipchecker** (optional): `'ip2location'` | `'ipapi'`. IP query channel.
- **categoryId** (optional): Use get-application-list to get list.
- **fingerprintConfig** (optional): Browser fingerprint config; see **FingerprintConfig** below.

**update-browser** — Update the browser.

- **profileId** (required): The profile id of the browser to update.
- **platform**, **tabs**, **cookie**, **username**, **password**, **fakey**, **ignoreCookieError** (`'0'`|`'1'`), **groupId**, **name** (max 100), **remark** (max 1500), **country**, **region**, **city**, **ip**, **categoryId**, **userProxyConfig** (see UserProxyConfig), **proxyid**, **fingerprintConfig** (see FingerprintConfig), **launchArgs** (all optional).

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

### Group Management

**create-group** — Create a browser group.

- **groupName** (required): Name of the group to create.
- **remark** (optional): Remark of the group.

**update-group** — Update the browser group.

- **groupId** (required): Numeric string. Id of the group to update; use get-group-list to get list.
- **groupName** (required): New name of the group.
- **remark** (optional, nullable): New remark; set null to clear.

**get-group-list** — Get the list of groups.

- **groupName** (optional): Name to search (like search).
- **size** (optional): Page size, max 100, default 10.
- **page** (optional): Default 1.

### Application Management

**check-status** — Check the availability of the current device API interface (Connection Status).

- No parameters.

**get-application-list** — Get the list of applications (categories).

- **category_id** (optional): Extension category_id.
- **page** (optional): Default 1.
- **limit** (optional): 1–100. Values per page.

### Proxy Management

**create-proxy** — Create a proxy.

- **proxies** (required): Array of proxy configs. Each item:
  - **type** (required): `'http'` | `'https'` | `'ssh'` | `'socks5'`.
  - **host** (required): Proxy host, ipV4/ipV6, e.g. 192.168.0.1.
  - **port** (required): 0–65536, e.g. 8000.
  - **user** (optional): Proxy username.
  - **password** (optional): Proxy password.
  - **proxy_url** (optional): URL used to refresh the proxy.
  - **remark** (optional): Remark/description.
  - **ipchecker** (optional): `'ipinfo'` | `'ip2location'` | `'ipapi'` | `'ipfoxy'` | `'ipidea'`.

**update-proxy** — Update the proxy.

- **proxyId** (required): Unique id after the proxy is added.
- **type** (optional): `'http'` | `'https'` | `'ssh'` | `'socks5'`.
- **host**, **port**, **user**, **password** (optional).
- **proxyUrl** (optional): URL used to refresh the proxy.
- **remark** (optional).
- **ipchecker** (optional): `'ip2location'` | `'ipapi'` | `'ipfoxy'` | `'ipidea'`.

**get-proxy-list** — Get the list of proxies.

- **limit** (optional): 1–200, default 50. Proxies per page.
- **page** (optional): Default 1.
- **proxyId** (optional): Array, e.g. `["proxy1","proxy2"]`.

**delete-proxy** — Delete the proxy/proxies.

- **proxyIds** (required): Array of proxy ids to delete, max 100.

### UserProxyConfig（create-browser / update-browser 内联代理配置）

当使用 **userProxyConfig** 而非 **proxyid** 时，传入如下对象（字段名与 API 一致，多为 snake_case）：

- **proxy_soft** (required): 代理软件类型。`'brightdata'` | `'brightauto'` | `'oxylabsauto'` | `'922S5auto'` | `'ipideeauto'` | `'ipfoxyauto'` | `'922S5auth'` | `'kookauto'` | `'ssh'` | `'other'` | `'no_proxy'`
- **proxy_type** (optional): 代理类型。`'http'` | `'https'` | `'socks5'` | `'no_proxy'`
- **proxy_host** (optional): 代理主机，如 `127.0.0.1`
- **proxy_port** (optional): 代理端口，如 `8080`
- **proxy_user** (optional): 代理用户名
- **proxy_password** (optional): 代理密码
- **proxy_url** (optional): 代理完整 URL，如 `http://127.0.0.1:8080`
- **global_config** (optional): 全局配置。`'0'` | `'1'`，默认 `0`

示例：`"userProxyConfig":{"proxy_soft":"no_proxy","proxy_type":"http","proxy_host":"127.0.0.1","proxy_port":"8080"}`

### FingerprintConfig（create-browser / update-browser 指纹配置）

**fingerprintConfig** 为可选对象，用于时区、语言、WebRTC、内核版本、随机 UA、TLS 等：

- **automatic_timezone** (optional): 自动时区。`'0'` | `'1'`，默认 `0`
- **timezone** (optional): 时区，如 `Asia/Shanghai`
- **language** (optional): 语言列表，如 `["en-US", "zh-CN"]`
- **flash** (optional): Flash。`'block'` | `'allow'`，默认关闭
- **fonts** (optional): 字体列表，如 `["Arial", "Times New Roman"]`
- **webrtc** (optional): WebRTC 模式。`'disabled'` | `'forward'` | `'proxy'` | `'local'`，默认 `disabled`
- **browser_kernel_config** (optional): 浏览器内核
  - **version** (optional): 内核版本，如 `"92"`–`"134"` 或 `"ua_auto"`
  - **type** (optional): `'chrome'` | `'firefox'`，默认 `chrome`
- **random_ua** (optional): 随机 UA
  - **ua_version** (optional): UA 版本字符串数组
  - **ua_system_version** (optional): 系统版本，如 `["Android 9", "iOS 14", "Windows 10", "Windows 11", "Mac OS X 12", "Linux"]`
- **tls_switch** (optional): 是否启用 TLS 配置。`'0'` | `'1'`，默认 `0`
- **tls** (optional): TLS 配置字符串，当 **tls_switch** 为 `'1'` 时可设，如 `"0xC02C,0xC030"`

示例：`"fingerprintConfig":{"timezone":"America/New_York","language":["en-US"],"webrtc":"proxy","browser_kernel_config":{"version":"ua_auto","type":"chrome"}}`

## Common Patterns

### Create and open a browser

```bash
adspower-browser get-group-list '{}'
adspower-browser create-browser '{"groupId":"0","proxyid":"random","username":"user"}'
# Use returned profileId:
adspower-browser open-browser <ProfileId>
# Or with options:
adspower-browser open-browser '{"profileId":"...","launchArgs":"https://example.com"}'
```

### List and manage profiles

```bash
adspower-browser get-browser-list '{}'
adspower-browser get-browser-list '{"groupId":"0","page":1,"limit":50}'
adspower-browser update-browser '{"profileId":"...","name":"My Browser"}'
adspower-browser delete-browser '{"profileIds":["..."]}'
adspower-browser move-browser '{"groupId":"1","userIds":["..."]}'
```

### Groups and proxies

```bash
adspower-browser create-group '{"groupName":"Test","remark":"..."}'
adspower-browser get-group-list '{"groupName":"Test"}'
adspower-browser create-proxy '{"proxies":[{"type":"http","host":"127.0.0.1","port":"8080"}]}'
adspower-browser get-proxy-list '{}'
```

## Automation (Not Supported by This CLI)

Commands such as `navigate`, `click-element`, `fill-input`, `screenshot` depend on a persistent browser connection and are **not** exposed by this CLI. Use the **local-api-mcp** MCP server for automation.

