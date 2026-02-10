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