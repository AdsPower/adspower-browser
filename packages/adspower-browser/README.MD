# adspower-browser

AdsPower browser automation CLI for AI agents.

## Install CLI (npm)

```bash
npm install -g adspower-browser
```

## Install as Cursor / Agent Skill

Skills live at the repo root. Install with:

```bash
npx skills add AdsPower/adspower-browser
```

- Project scope (default): skill goes to `.cursor/skills/adspower-browser/` (or your agent’s skills dir).
- Global: add `-g` (e.g. `~/.cursor/skills/` for Cursor).

## Usage with AI Agents

Use the CLI in terminal or let the agent run it; the installed skill gives the agent context on when and how to call `adspower-browser` (profiles, groups, proxies, etc.).


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
