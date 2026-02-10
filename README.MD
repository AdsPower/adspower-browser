# AdsPower cli & MCP

# Adding the adspower-browser Skill

Use the **adspower-browser** skill so the AI can operate AdsPower via the CLI without the MCP server. Add it in your editor as follows:

| Environment   | How to add |
|---------------|-------------|
| **Cursor**   | `npx skills add AdsPower/adspower-browser` |
| **Claude Code** | `npx skills add AdsPower/adspower-browser` |
| **GPT / Codex** | If your setup supports [add-skill](https://github.com/vercel-labs/add-skill): `npx skills add AdsPower/adspower-browser`. Otherwise copy the skill from `skills/adspower-browser/` into your agent’s skills directory (e.g. `~/.codex/skills/adspower-browser/`). |

## AdsPower LocalAPI MCP Server

A Model Context Protocol server that AdsPower browser LocalAPI. This server enables LLMs to interact with AdsPower browser profiles using the v2 API, including creating, updating, deleting profiles, managing groups, and automating browser operations.


### Usage with Claude Desktop

Talk to LLMs to create browser: `Create an Android UA browser using Chrome 134`

![Claude desktop](https://github.com/AdsPower/adspower-browser/blob/main/assets/claude-use.png)

Talk to LLMs to create browser: `Help me with random UA, random fingerprint, random cookie generation, create 3 browsers, use 134 cores, and open them`

![Claude desktop](https://github.com/AdsPower/adspower-browser/blob/main/assets/claude-open.gif)

### How to use?

#### Requirements

- [AdsPower](https://www.adspower.com/?source=github)

- Node version 18 or greater

#### Installation

To use with Claude Desktop, add the server config:

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json` On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

##### MacOS / Linux
```bash
{
  "mcpServers": {
    "adspower-local-api": {
      "command": "npx",
      "args": ["-y", "local-api-mcp-typescript"]
    }
  }
}
```

##### Windows
```bash
{
  "mcpServers": {
    "adspower-local-api": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "local-api-mcp-typescript"]
    }
  }
}
```

#### Configuration Parameters

The MCP server supports configuration through command-line arguments or environment variables.

#### Port Configuration

The port parameter specifies the AdsPower Local API port. Default is `50325`.

**Priority order:**
1. Command-line argument `--port` (highest priority)
2. Environment variable `PORT` (medium priority)
3. Default value `50325` (lowest priority)

**Examples:**

Using command-line argument:
```json
{
  "mcpServers": {
    "adspower-local-api": {
      "command": "npx",
      "args": ["-y", "local-api-mcp-typescript", "--port", "50325"]
    }
  }
}
```

Using environment variable:
```json
{
  "mcpServers": {
    "adspower-local-api": {
      "command": "npx",
      "args": ["-y", "local-api-mcp-typescript"],
      "env": {
        "PORT": "50325"
      }
    }
  }
}
```

#### API Key Configuration

The API key is used for authentication with the AdsPower API. It will be sent as `Authorization: Bearer <api-key>` header in requests.

**Priority order:**
1. Command-line argument `--api-key` (highest priority)
2. Environment variable `API_KEY` (medium priority)
3. No default value (if not provided, requests will not include the API key header)

**Examples:**

Using command-line argument:
```json
{
  "mcpServers": {
    "adspower-local-api": {
      "command": "npx",
      "args": ["-y", "local-api-mcp-typescript", "--api-key", "your-api-key-here"]
    }
  }
}
```

Using environment variable:
```json
{
  "mcpServers": {
    "adspower-local-api": {
      "command": "npx",
      "args": ["-y", "local-api-mcp-typescript"],
      "env": {
        "API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### Combined Configuration

You can use both parameters together. Command-line arguments will override environment variables:

```json
{
  "mcpServers": {
    "adspower-local-api": {
      "command": "npx",
      "args": ["-y", "local-api-mcp-typescript", "--port", "50326", "--api-key", "new-key"],
      "env": {
        "PORT": "50325",
        "API_KEY": "old-key"
      }
    }
  }
}
```

In this example, the server will use `port: 50326` and `apiKey: new-key` (command-line arguments override environment variables).

![Claude desktop MCP](https://github.com/AdsPower/adspower-browser/blob/main/assets/claude-installed.png)

or use in Cursor
![Cursor](./assets/cursor.png)

## Development

```bash
# clone
git clone https://github.com/AdsPower/adspower-browser.git
cd adspower-browser

# install (monorepo)
pnpm install

# build all packages
pnpm run build
```

For local MCP development, point Claude Desktop to the MCP package:

```json
"mcpServers": {
  "adspower-local-api": {
    "command": "node",
    "args": ["<Replace Your Project Path>/adspower-browser/packages/local-api-mcp/build/index.js"]
  }
}
```
