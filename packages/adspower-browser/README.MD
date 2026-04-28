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
   - `ads open-browser <profile_id>`
   - `ads close-browser <profile_id>`
   - `ads get-profile-cookies <profile_id>`
   - `ads get-browser-active <profile_id>`
   - `ads get-profile-ua <profile_id>` (single ID; a numeric token is treated as `profile_no`)
   - `ads new-fingerprint <profile_id>` (single ID; a numeric token is treated as `profile_no`)

2. **JSON string** — full parameters for any command (see Command Reference below):
   - `ads open-browser '{"profile_id":"abc123","launch_args":"..."}'`
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

## Use CLI in Docker

copy the [`docker-compose.yml`](./docker-compose.yml)

```bash
docker-compose -f ./docker-compose.yml up -d

docker-compose exec adspower-cli /bin/bash
```