# adspower-browser (ClawHub skill)

Skill for managing AdsPower browser profiles, groups, and proxies via the **adspower-browser** CLI. No MCP required.

## What it does

- Create, update, delete, list, open, and close AdsPower browser profiles
- Configure fingerprints (timezone, language, WebRTC, TLS, UA, browser kernel)
- Manage caches, groups, and proxies; check Local API status
- Guide on installing and launching AdsPower (Windows, macOS, Linux)

## Requirements

- **Node.js ≥ 18**
- **adspower-browser** CLI（npm package）
- **AdsPower** desktop app installed and running with Local API enabled (default port 50325)
- **Optional:** `PORT` to override API port; `API_KEY` when AdsPower is run in headless mode

## How to use

1. Install this skill via ClawHub into your OpenClaw workspace.
2. Ensure AdsPower is running and the Local API is reachable (e.g. run `adspower-browser check-status`).
3. In conversation, ask the agent to create profiles, open/close browsers, manage groups or proxies, or get install/launch guidance. The agent will use the instructions in `SKILL.md` to run the CLI.

Full command reference, parameters, and security guardrails are in **SKILL.md**. Detailed parameter docs are in the `references/` folder.

## Trust and security

This skill does not auto-install or download anything. It only instructs the agent to run the `adspower-browser` CLI. All install and launch steps are user-driven; see SKILL.md for Security Guardrails and Trust Statement.
