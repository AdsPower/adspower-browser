# adspower-browser

AdsPower browser automation CLI for AI agents.

## Install CLI (npm)

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

The examples below use `ads` for brevity, but `adspower-browser` and `adspower` work the same way.

```bash
ads start -k <KEY>
```

If the `ADS_API_KEY` environment variable is set, you can start the CLI directly with the following command.

```bash
ads start
```

**Two forms for `<arg>`:**

1. **Single value (shorthand)** — for profile-related commands, pass one profile ID or number:
   - `ads open-browser <ProfileId>`
   - `ads close-browser <ProfileId>`
   - `ads get-profile-cookies <ProfileId>`
   - `ads get-browser-active <ProfileId>`
   - `ads get-profile-ua <ProfileId>` (single ID)
   - `ads new-fingerprint <ProfileId>` (single ID)

2. **JSON string** — full parameters for any command (see Command Reference below):
   - `ads open-browser '{"profileId":"abc123","launchArgs":"..."}'`
   - Commands with no params: omit `<arg>` or use `'{}'`.

## Essential Commands With CLI

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
ads open-browser <profileId>                    # Or JSON: profileId, profileNo?, ipTab?, launchArgs?, clearCacheAfterClosing?, cdpMask?
ads close-browser <profileId>                   # Or JSON: profileId? | profileNo? (one required)
```

### Browser profile – create/update/delete/list

```bash
ads create-browser '{"groupId":"0","proxyid":"random",...}'  # groupId + account field + proxy required
ads update-browser '{"profileId":"...",...}'    # profileId required
ads delete-browser '{"profileIds":["..."]}'     # profileIds required
ads get-browser-list '{}'                       # Or groupId?, limit?, page?, profileId?, profileNo?, sortType?, sortOrder?
ads get-opened-browser                          # No params
```

### Browser profile – move/cookies/UA/fingerprint/cache/share/active

```bash
ads move-browser '{"groupId":"1","userIds":["..."]}'   # groupId + userIds required
ads get-profile-cookies <profileId>             # Or JSON: profileId? | profileNo?
ads get-profile-ua <profileId>                  # Or JSON: profileId[]? | profileNo[]? (up to 10)
ads close-all-profiles                          # No params
ads new-fingerprint <profileId>                 # Or JSON: profileId[]? | profileNo[]? (up to 10)
ads delete-cache-v2 '{"profileIds":["..."],"type":["cookie","history"]}'  # type: local_storage|indexeddb|extension_cache|cookie|history|image_file
ads share-profile '{"profileIds":["..."],"receiver":"email@example.com"}' # receiver required; shareType?, content?
ads get-browser-active <profileId>              # Or JSON: profileId? | profileNo?
ads get-cloud-active '{"userIds":"id1,id2"}'    # userIds comma-separated, max 100
```

### Group

```bash
ads create-group '{"groupName":"My Group","remark":"..."}'   # groupName required
ads update-group '{"groupId":"1","groupName":"New Name"}'    # groupId + groupName required; remark? (null to clear)
ads get-group-list '{}'                         # groupName?, size?, page?
```

### Application (categories)

```bash
ads check-status                                # No params – API availability
ads get-application-list '{}'                   # category_id?, page?, limit?
```

### Proxy

```bash
ads create-proxy '{"proxies":[{"type":"http","host":"127.0.0.1","port":"8080"}]}'  # type, host, port required per item
ads update-proxy '{"proxyId":"...","host":"..."}'   # proxyId required
ads get-proxy-list '{}'                         # limit?, page?, proxyId?
ads delete-proxy '{"proxyIds":["..."]}'        # proxyIds required, max 100
```

### Tag

```bash
ads get-tag-list '{}'  # limit?, page?, ids?
ads create-tag '{"tags":[{"name":"test","color":"darkBlue"}]}'   # name required, color?: darkBlue|blue|purple|red|yellow|orange|green|lightGreen
ads update-tag '{"tags":[{"id":"...","name":"test2","color":"yellow"}]}'                         # id required,name?, color?: darkBlue|blue|purple|red|yellow|orange|green|lightGreen
ads delete-tag '{"ids":["..."]}'        # ids required, max 100
```

### Kernel

```bash
ads get-kernel-list '{"kernel_type":"Chrome"}'  # kernel_type?:Chrome|Firefox
ads download-kernel '{"kernel_type":"Chrome","kernel_version":"..."}'   # kernel_type:Chrome|Firefox required,kernel_version required
```

### Update Patch

```bash
ads update-patch '{"version_type":"stable"}'  # version_type?:stable|beta
```