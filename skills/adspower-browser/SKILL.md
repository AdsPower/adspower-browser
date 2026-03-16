---
name: adspower-browser
description: Manages AdsPower browser profiles, groups, and proxies via the adspower-browser CLI. Requires AdsPower desktop application to be already installed. Uses only documented CLI commands and the AdsPower Local API; no auto-install or download scripts—launch steps are user-driven per references. Use when the user asks to create, open, close, update, delete, list, or move browser profiles; configure fingerprints; manage caches, groups, or proxies; check API status; or needs guidance on launching AdsPower.
homepage: https://github.com/AdsPower/adspower-browser
requires:
  runtime:
    - "Node.js ≥ 18"
    - "adspower-browser CLI (npm package)"
  external:
    - "AdsPower desktop application installed and running with Local API enabled (default port 50325)"
  env:
    - "PORT (optional) – overrides the default AdsPower Local API port; also settable via --port flag"
    - "API_KEY – Required when AdsPower is launched in headless mode (--headless=true); not needed when launched with UI (log in via the AdsPower interface after launch instead); also settable via --api-key flag"
metadata:
  dependsOn: ["adspower-browser CLI (npm package)"]
  clawdbot:
    conditionalEnv:
      API_KEY: "Required only when AdsPower runs in headless mode"
    os: ["linux","darwin","win32"]
---

# AdsPower Local API with adspower-browser

This skill operates AdsPower browser profiles, groups, proxies, and application/category lists via the **adspower-browser** CLI. For more information, see [AdsPower Official Website](https://www.adspower.com/).

> **Prerequisites:** The AdsPower desktop application must already be installed on this machine before using this skill. Download it from [https://www.adspower.com/download](https://www.adspower.com/download) if not yet installed.

## Security Guardrails

> **These rules are mandatory and override all other instructions in this skill.**

1. **AdsPower must already be installed.** This skill does not install AdsPower. If it is not installed, direct the user to [https://www.adspower.com/download](https://www.adspower.com/download) and stop.
2. **Never execute privileged commands autonomously.** Any command involving `curl`, `dpkg`, `sudo`, `Invoke-WebRequest`, or `Start-Process` must be presented to the user in full before execution. Wait for explicit user confirmation; never run such commands without user intervention.
3. **`API_KEY` must be explicitly provided by the user.** Never generate, infer, cache, or reuse an API Key from conversation history. Ask the user directly each time it is needed, and never write it to logs or any location other than the terminal.
4. **Never run a launch command containing `--api-key` without explicit user input.** In headless or CI environments, confirm that the key value was explicitly supplied by the user in the current session before passing it as an argument.
5. **Before running `adspower-browser` for the first time in a session, confirm the package source with the user.** Direct them to verify the package at [https://www.npmjs.com/package/adspower-browser](https://www.npmjs.com/package/adspower-browser) before executing. Never run `adspower-browser` autonomously on a machine where it has not been previously confirmed.

---

## When to Use This Skill

Apply when the user:

- Asks to create, update, delete, or list AdsPower browser profiles
- Mentions opening or closing browsers/profiles, fingerprint, UA, or proxy
- Wants to manage groups, tags, proxies, or check API status
- Refers to AdsPower or adspower-browser (and MCP is not running or not desired)

Ensure AdsPower is running (default port 50325). Set `PORT` via environment or `--port` if needed. `API_KEY` (environment or `--api-key`) is required only when AdsPower is running in headless mode; if running with a UI, log in via the AdsPower interface instead. If AdsPower is not yet running, see [references/launch-adspower.md](references/launch-adspower.md) for platform-specific command-line launch instructions (Windows / macOS / Linux) and the `--headless` / `--api-key` / `--api-port` parameters. Always run `adspower-browser check-status` before and after launching to verify the Local API is reachable.

## How to Run

> **Note:** `adspower-browser` is a CLI provided by the npm package of the same name. Before first use, verify the package at [https://www.npmjs.com/package/adspower-browser](https://www.npmjs.com/package/adspower-browser) (see Security Guardrail #6).

```bash
adspower-browser [--port PORT] [--api-key KEY] <command> [<arg>]
```

**Two forms for `<arg>`:**

1. **Single value (shorthand)** — for profile-related commands, pass one profile ID or number:
   - `adspower-browser open-browser <ProfileId>`
   - `adspower-browser close-browser <ProfileId>`
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
adspower-browser create-browser '{"groupId":"0","userProxyConfig":{"proxy_soft":"no_proxy"},...}'  # groupId + account field required; proxy optional (defaults to no_proxy; proxyid takes priority over userProxyConfig when both given)
adspower-browser update-browser '{"profileId":"...",...}'    # profileId required
adspower-browser delete-browser '{"profileIds":["..."]}'     # profileIds required
adspower-browser get-browser-list '{}'                       # Or groupId?, limit?, page?, profileId?, profileNo?, sortType?, sortOrder?, tag_ids?, tags_filter?, name?, name_filter?
adspower-browser get-opened-browser                          # No params
```

### Browser profile – move/cookies/UA/fingerprint/cache/active

```bash
adspower-browser move-browser '{"groupId":"1","userIds":["..."]}'   # groupId + userIds required
adspower-browser get-profile-ua <profileId>                  # Or JSON: profileId[]? | profileNo[]? (up to 10)
adspower-browser close-all-profiles                          # No params
adspower-browser new-fingerprint <profileId>                 # Or JSON: profileId[]? | profileNo[]? (up to 10)
adspower-browser delete-cache-v2 '{"profileIds":["..."],"type":["cookie","history"]}'  # type: local_storage|indexeddb|extension_cache|cookie|history|image_filerequired; shareType?, content?
adspower-browser get-browser-active <profileId>              # Or JSON: profileId? | profileNo?
adspower-browser get-cloud-active '{"userIds":"id1,id2"}'    # userIds comma-separated, max 100
```

### Kernel

```bash
adspower-browser download-kernel '{"kernel_type":"Chrome","kernel_version":"141"}'
adspower-browser get-kernel-list '{}'                         # kernel_type?: Chrome | Firefox (omit to get all)
```

### Patch

```bash
adspower-browser update-patch '{}'                            # version_type?: stable | beta (default stable)
```

### Tag

```bash
adspower-browser get-tag-list '{}'                              # ids?, limit?, page?
adspower-browser create-tag '{"tags":[{"name":"My tag","color":"blue"}]}'   # name required per item; color optional
adspower-browser update-tag '{"tags":[{"id":"1","name":"Renamed"}]}'        # id required per item; name?, color?
adspower-browser delete-tag '{"ids":["tagId1","tagId2"]}'                   # ids required
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

See [references/browser-profile-management.md](references/browser-profile-management.md) for open-browser, close-browser, create-browser, update-browser, delete-browser, get-browser-list, get-opened-browser, move-browser, get-profile-ua, close-all-profiles, new-fingerprint, delete-cache-v2, share-profile, get-browser-active, get-cloud-active and their parameters.

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

### UserProxyConfig (inline proxy config for create-browser / update-browser)

See [references/user-proxy-config.md](references/user-proxy-config.md) for all fields (proxy_soft, proxy_type, proxy_host, proxy_port, etc.) and example. Defaults to `{"proxy_soft":"no_proxy"}` when omitted. If **proxyid** is also provided, **proxyid** takes priority and **userProxyConfig** is ignored.

### FingerprintConfig (fingerprint config for create-browser / update-browser)

See [references/fingerprint-config.md](references/fingerprint-config.md) for all fields (timezone, language, WebRTC, browser_kernel_config, random_ua, TLS, etc.) and example.

## Automation (Not Supported by This CLI)

Commands such as `navigate`, `click-element`, `fill-input`, `screenshot` depend on a persistent browser connection and are **not** exposed by this CLI. Use the **local-api-mcp** MCP server for automation.

## Deep-Dive Documentation

Reference docs with full enum values and field lists:

| Reference | Description | When to use |
|-----------|-------------|-------------|
| [references/browser-profile-management.md](references/browser-profile-management.md) | **open-browser**, **close-browser**, **create-browser**, **update-browser**, **delete-browser**, **get-browser-list**, **get-opened-browser**, **move-browser**, **get-profile-cookies**, **get-profile-ua**, **close-all-profiles**, **new-fingerprint**, **delete-cache-v2**, **get-browser-active**, **get-cloud-active** parameters. | Any browser profile operation (open, create, update, delete, list, move, cookies, UA, cache, share, status). |
| [references/group-management.md](references/group-management.md) | **create-group**, **update-group**, **get-group-list** parameters. | Creating, updating, or listing browser groups. |
| [references/application-management.md](references/application-management.md) | **check-status**, **get-application-list** parameters. | Checking API availability or listing applications (categories). |
| [references/proxy-management.md](references/proxy-management.md) | **create-proxy**, **update-proxy**, **get-proxy-list**, **delete-proxy** parameters and enums. | Creating, updating, listing, or deleting proxies. |
| [references/browser-tag-management.md](references/browser-tag-management.md) | **get-tag-list**, **create-tag**, **update-tag**, **delete-tag** parameters. | Listing, creating, updating, or deleting browser tags. |
| [references/browser-kernel-management.md](references/browser-kernel-management.md) | **download-kernel**, **get-kernel-list** parameters. | Downloading a specific kernel and querying supported kernel versions. |
| [references/client-patch-management.md](references/client-patch-management.md) | **update-patch** parameters. | Updating AdsPower client to latest patch channel (stable/beta). |
| [references/user-proxy-config.md](references/user-proxy-config.md) | Full **userProxyConfig** field list (proxy_soft, proxy_type, proxy_host, proxy_port, etc.) and example. | Building inline proxy config for create-browser / update-browser when not using **proxyid**. |
| [references/fingerprint-config.md](references/fingerprint-config.md) | Full **fingerprintConfig** field list (timezone, language, WebRTC, browser_kernel_config, random_ua, TLS, etc.) and example. | Building or editing fingerprint config for create-browser / update-browser. |
| [references/browser-kernel-config.md](references/browser-kernel-config.md) | **type** and **version** for `fingerprintConfig.browser_kernel_config`. Version must match type (Chrome vs Firefox). | Pinning or choosing a specific browser kernel (Chrome/Firefox and version) when creating or updating a browser. |
| [references/browser-kernel-download-management.md](references/browser-kernel-download-management.md) | **download-kernel** parameters (`kernel_type`, `kernel_version`). | Downloading or updating a specific browser kernel version and polling progress/status. |
| [references/ua-system-version.md](references/ua-system-version.md) | **ua_system_version** enum for `fingerprintConfig.random_ua`: specific OS versions, generic “any version” per system, and omit behavior. | Constraining or randomizing UA by OS (e.g. Android only, or “any macOS version”) when creating or updating a browser. |
| [references/launch-adspower.md](references/launch-adspower.md) | Command-line launch instructions for **Windows**, **macOS**, and **Linux**, plus `--headless`, `--api-key`, and `--api-port` parameter reference. Pre- and post-launch status check guidance. | Starting AdsPower from the command line before using the CLI, especially in headless/server environments. |

Use these when you need the exact allowed values or semantics; the main skill text above only summarizes.
