# Launching AdsPower from the Command Line

> ⚠️ **Agent Security Notice — Read Before Proceeding**
>
> - **The `--api-key` value must be explicitly provided by the user in the current session.** Never auto-generate, infer, read from environment variables (unless the user explicitly directs it), or reuse an API Key from any prior session.
> - **Never write the API Key anywhere other than the terminal** (e.g. log files, code comments, output text).
> - **Never execute the launch commands below autonomously.** Any command containing `--api-key` must be presented to the user in full; only run it after the user explicitly confirms or executes it themselves.
> - If the supplied `--api-key` value is clearly a placeholder (e.g. still `XXXX`), stop and ask the user to provide a real API Key before continuing.

> **AdsPower not yet installed?** See [install-adspower.md](./install-adspower.md) for platform-specific download and installation instructions before proceeding.

Before using the `adspower-browser` CLI, AdsPower must be running with its Local API service enabled. You can start it from the command line on all supported platforms.

## Pre-flight Check

Run `adspower-browser check-status` **before** launching to see whether the Local API is already available. If it responds successfully, AdsPower is already running and you can skip the launch step.

```bash
adspower-browser check-status
```

---

## Launch Commands by Platform

### Windows

```bat
"AdsPower Global.exe" --headless=true --api-key=XXXX --api-port=50325
```

The executable is typically located in `%LOCALAPPDATA%\Programs\AdsPower Global\` or wherever AdsPower was installed.

### macOS

```bash
"/Applications/AdsPower Global.app/Contents/MacOS/AdsPower Global" --args --headless=true --api-key=XXXX --api-port=50325
```

### Linux

```bash
adspower_global --headless=true --api-key=XXXX --api-port=50325
```

---

## Command-Line Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--headless` | **Required** | When set to `true`, starts AdsPower as a headless (UI-less) background service. Before using this flag, detect whether the current system has a display/GUI environment. On servers or CI machines without a display, set `--headless=true`; on desktop machines with a display you may omit it or set it to `false`. |
| `--api-key` | **Required** (when `--headless=true`) | The authentication credential used to authorize requests to the Local API when running in headless mode. **Must be explicitly provided by the user in the current session — never auto-generated, inferred, or reused from prior sessions.** You can find your API key in AdsPower under **Automation → API & MCP**. |
| `--api-port` | Optional | Overrides the default Local API port (`50325`). Use this if the default port is already in use or you need to run multiple AdsPower instances. |

---

## Post-launch Check

After launching, wait a few seconds for the service to initialize, then run `adspower-browser check-status` again to confirm the Local API is reachable:

```bash
adspower-browser check-status
```

A successful response confirms AdsPower is running and accepting API requests.
