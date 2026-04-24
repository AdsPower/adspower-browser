---
name: adspower-browser
description: "AdsPower profile operation via adspower-browser CLI. open/launch/start browser or profile, environment, config profile, AdsPower; create/update/delete/list profiles; groups, tags, proxies; kernel download/list; client patch; API check-status. User phrases like open environment or map to commands such as open-browser."
---

# AdsPower Local API with adspower-browser

The Skills CLI (npx adspower-browser) is the package manager for operate AdsPower browser profiles, groups, proxies, 
and application/category lists via the **adspower-browser** CLI. For more infomation about out product and services, 
visit [AdsPower Official Website](https://www.adspower.com/).

## Install CLI

```bash
npm install -g adspower-browser
```

After installation, you can use any of these equivalent commands:

```bash
adspower-browser
adspower
ads
```

`adspower-browser` is the original command name. `adspower` and `ads` are aliases that point to the same CLI entry.

## When to Use This Skill

Apply when the user:

- Asks to create, update, delete, or list AdsPower browser profiles
- Says 打开环境、配置文件、profile、AdsPower 等意指**启动已有**浏览器环境 → 使用 `open-browser`（CLI 或 MCP）；完整说法与工具映射见 [references/tool-intent-map.md](references/tool-intent-map.md)
- Mentions opening or closing browsers/profiles, fingerprint, UA, or proxy
- Wants to manage groups, tags, proxies, or check API status
- Refers to AdsPower or adspower-browser (and MCP is not running or not desired)

Ensure AdsPower is running (default port `50325`). Pass `--port` / `--api-key` when needed, or set the `ADS_API_KEY` environment variable before running `start`.

The CLI itself supports launching the AdsPower application via API key. If the AdsPower client is installed, AdsPower headless mode can also be launched via API key.

## How to Run

The examples below use `ads` for brevity, but `adspower-browser` and `adspower` work the same way.

```bash
ads start -k <KEY>
```

If the `ADS_API_KEY` environment variable is set, you can start the CLI directly with:

```bash
ads start
```

General command form:

```bash
ads <command> [<arg>] [--port PORT] [--api-key KEY]
```

AdsPower client headless mode:
```bash
AdsPower Global：
Windows设备下： "AdsPower Global.exe" --headless=true --api-key=your_api_key --api-port=50325
MacOS设备下："/Applications/AdsPower Global.app/Contents/MacOS/AdsPower Global" --args --headless=true --api-key=your_api_key --api-port=50325
Linux设备下：adspower_global --headless=true --api-key=your_api_key --api-port=50325
```

**Two forms for `<arg>`:**

1. **Single value (shorthand)** — for profile-related commands, pass one profile ID or number:
   - `ads open-browser <profile_id>`
   - `ads close-browser <profile_id>`
   - `ads get-profile-cookies <profile_id>`
   - `ads get-browser-active <profile_id>`
   - `ads get-profile-ua <profile_id>` (single ID; a numeric token is treated as `profile_no`)
   - `ads new-fingerprint <profile_id>` (single ID; a numeric token is treated as `profile_no`)

2. **JSON string** — full parameters for any command (see Command Reference below):
   - `ads open-browser '{"profile_id":"abc123","launch_args":"..."}'`
   - Commands with no params: omit `<arg>` or use `'{}'`.

## Essential Commands With AI Agents

You can use `ads -h` or `ads <command> -h` to view the specific parameters.

### Start and stop CLI

```bash
ads start -k <KEY>                    # Start the adspower runtime
ads stop                              # Stop the adspower runtime
ads restart                           # Restart the adspower runtime
ads status                            # Get the status of the adspower runtime
```

### Browser profile – open/close

```bash
ads open-browser <profile_id>                    # Or JSON: profile_id, profile_no?, ip_tab?, launch_args?, headless?, last_opened_tabs?, proxy_detection?, password_filling?, password_saving?, cdp_mask?, delete_cache?, device_scale?
ads close-browser <profile_id>                   # Or JSON: profile_id? | profile_no? (one required)
```

### Browser profile – create/update/delete/list

```bash
ads create-browser '{"group_id":"0","user_proxy_config":{"proxy_soft":"no_proxy"},...}'  # group_id + account field required; proxy optional (defaults to no_proxy; proxyid takes priority over user_proxy_config when both given)
ads update-browser '{"profile_id":"...",...}'    # profile_id required
ads delete-browser '{"profile_id":["..."]}'     # profile_id required
ads get-browser-list '{}'                       # Or group_id?, limit?, page?, profile_id[]?, profile_no[]?, sort_type?, sort_order?, tag_ids?, tags_filter?, name?, name_filter?
ads get-opened-browser                          # No params
```

### Browser profile – move/cookies/UA/fingerprint/cache/share/active

```bash
ads move-browser '{"group_id":"1","user_ids":["..."]}'   # group_id + user_ids required
ads get-profile-cookies <profile_id>             # Or JSON: profile_id? | profile_no?
ads get-profile-ua <profile_id>                  # Or JSON: profile_id[]? | profile_no[]? (up to 10); numeric shorthand maps to profile_no[]
ads close-all-profiles                          # No params
ads new-fingerprint <profile_id>                 # Or JSON: profile_id[]? | profile_no[]? (up to 10); numeric shorthand maps to profile_no[]
ads delete-cache-v2 '{"profile_id":["..."],"type":["cookie","history"]}'  # type: local_storage|indexeddb|extension_cache|cookie|history|image_file
ads share-profile '{"profile_id":["..."],"receiver":"email@example.com"}' # receiver required; share_type?, content?
ads get-browser-active <profile_id>              # Or JSON: profile_id? | profile_no?
ads get-cloud-active '{"user_ids":"id1,id2"}'    # user_ids comma-separated, max 100
```

### Kernel

```bash
ads download-kernel '{"kernel_type":"Chrome","kernel_version":"141"}'
ads get-kernel-list '{}'                         # kernel_type?: Chrome | Firefox (omit to get all)
```

### Patch

```bash
ads update-patch '{}'                            # version_type?: stable | beta (default stable)
```

### Tag

```bash
ads get-tag-list '{}'                              # ids?, limit?, page?
ads create-tag '{"tags":[{"name":"My tag","color":"blue"}]}'   # name required per item; color optional
ads update-tag '{"tags":[{"id":"1","name":"Renamed"}]}'        # id required per item; name?, color?
ads delete-tag '{"ids":["tagId1","tagId2"]}'                   # ids required
```

### Group

```bash
ads create-group '{"group_name":"My Group","remark":"..."}'   # group_name required
ads update-group '{"group_id":"1","group_name":"New Name"}'    # group_id + group_name required; remark? (null to clear)
ads get-group-list '{}'                         # group_name?, page_size?, page?
```

### Application (categories)

```bash
ads check-status                                # No params – API availability
ads get-application-list '{"category_id":"123","page":1,"limit":20}'
```

### Proxy

```bash
ads create-proxy '[{"type":"http","host":"127.0.0.1","port":"8080"}]'  # top-level array; type, host, port required per item
ads update-proxy '{"proxy_id":"proxy-1","proxy_url":"https://refresh.example.com"}'
ads get-proxy-list '{}'                         # limit?, page?, proxy_id[]?
ads delete-proxy '{"proxy_id":["..."]}'        # proxy_id required, max 100
```

## Command Reference (full interface and parameters)

### Browser Profile Management

See [references/browser-profile-management.md](references/browser-profile-management.md) for open-browser, close-browser, create-browser, update-browser, delete-browser, get-browser-list, get-opened-browser, move-browser, get-profile-cookies, get-profile-ua, close-all-profiles, new-fingerprint, delete-cache-v2, share-profile, get-browser-active, get-cloud-active and their parameters.

### Group Management

See [references/group-management.md](references/group-management.md) for create-group, update-group, and get-group-list parameters.

### Application Management

See [references/application-management.md](references/application-management.md) for check-status and get-application-list parameters.

### Proxy Management

See [references/proxy-management.md](references/proxy-management.md) for create-proxy, update-proxy, get-proxy-list, and delete-proxy parameters.

### Tag Management

See [references/browser-tag-management.md](references/browser-tag-management.md) for get-tag-list, create-tag, update-tag, and delete-tag parameters.

### Kernel Management

See [references/browser-kernel-management.md](references/browser-kernel-management.md) for download-kernel and get-kernel-list parameters.

### Patch Management

See [references/client-patch-management.md](references/client-patch-management.md) for update-patch parameters.

### user_proxy_config (inline proxy config for create-browser / update-browser)

See [references/user-proxy-config.md](references/user-proxy-config.md) for all fields (proxy_soft, proxy_type, proxy_host, proxy_port, etc.) and example. Defaults to `{"proxy_soft":"no_proxy"}` when omitted. If **proxyid** is also provided, **proxyid** takes priority and **user_proxy_config** is ignored.

### fingerprint_config (fingerprint config for create-browser / update-browser)

See [references/fingerprint-config.md](references/fingerprint-config.md) for all fields (timezone, language, WebRTC, browser_kernel_config, random_ua, TLS, etc.) and example.

## Automation (Not Supported by This CLI)

Commands such as `navigate`, `click-element`, `fill-input`, `screenshot` depend on a persistent browser connection and are **not** exposed by this CLI. Use the **local-api-mcp** MCP server for automation.

## Deep-Dive Documentation

Reference docs with full enum values and field lists:

| Reference | Description | When to use |
|-----------|-------------|-------------|
| [references/tool-intent-map.md](references/tool-intent-map.md) | MCP/CLI 工具名与中英 **intent**、**triggers** 对照表（与 `toolIntentMetadata.ts` 同源）。 | 根据用户自然语言选择对应 CLI 命令或 MCP 工具（尤其 `open-browser`）。 |
| [references/browser-profile-management.md](references/browser-profile-management.md) | **open-browser**, **close-browser**, **create-browser**, **update-browser**, **delete-browser**, **get-browser-list**, **get-opened-browser**, **move-browser**, **get-profile-cookies**, **get-profile-ua**, **close-all-profiles**, **new-fingerprint**, **delete-cache-v2**, **share-profile**, **get-browser-active**, **get-cloud-active** parameters. | Any browser profile operation (open, create, update, delete, list, move, cookies, UA, cache, share, status). |
| [references/group-management.md](references/group-management.md) | **create-group**, **update-group**, **get-group-list** parameters. | Creating, updating, or listing browser groups. |
| [references/application-management.md](references/application-management.md) | **check-status**, **get-application-list** parameters. | Checking API availability or listing applications (categories). |
| [references/proxy-management.md](references/proxy-management.md) | **create-proxy**, **update-proxy**, **get-proxy-list**, **delete-proxy** parameters and enums. | Creating, updating, listing, or deleting proxies. |
| [references/browser-tag-management.md](references/browser-tag-management.md) | **get-tag-list**, **create-tag**, **update-tag**, **delete-tag** parameters. | Listing, creating, updating, or deleting browser tags. |
| [references/browser-kernel-management.md](references/browser-kernel-management.md) | **download-kernel**, **get-kernel-list** parameters. | Downloading a specific kernel and querying supported kernel versions. |
| [references/client-patch-management.md](references/client-patch-management.md) | **update-patch** parameters. | Updating AdsPower client to latest patch channel (stable/beta). |
| [references/user-proxy-config.md](references/user-proxy-config.md) | Full **user_proxy_config** field list (proxy_soft, proxy_type, proxy_host, proxy_port, etc.) and example. | Building inline proxy config for create-browser / update-browser when not using **proxyid**. |
| [references/fingerprint-config.md](references/fingerprint-config.md) | Full **fingerprint_config** field list (timezone, language, WebRTC, browser_kernel_config, random_ua, TLS, etc.) and example. | Building or editing fingerprint config for create-browser / update-browser. |
| [references/browser-kernel-config.md](references/browser-kernel-config.md) | **type** and **version** for `fingerprint_config.browser_kernel_config`. Version must match type (Chrome vs Firefox). | Pinning or choosing a specific browser kernel (Chrome/Firefox and version) when creating or updating a browser. |
| [references/browser-kernel-download-management.md](references/browser-kernel-download-management.md) | **download-kernel** parameters (`kernel_type`, `kernel_version`). | Downloading or updating a specific browser kernel version and polling progress/status. |
| [references/ua-system-version.md](references/ua-system-version.md) | **ua_system_version** enum for `fingerprint_config.random_ua`: specific OS versions, generic “any version” per system, and omit behavior. | Constraining or randomizing UA by OS (e.g. Android only, or “any macOS version”) when creating or updating a browser. |

Use these when you need the exact allowed values or semantics; the main skill text above only summarizes.
