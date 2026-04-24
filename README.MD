# AdsPower Skill & MCP & CLI

## adspower-browser Skill

Claude Code/Codex/Cursor/OpenCode/Gemini GL

```bash
npx skills add https://github.com/adspower/adspower-browser --skill adspower-browser
```

OpenClaw(小龙虾)
```bash
npx clawhub@latest install adspower-browser --force
```

Hermes agent(爱马仕)
```bash
hermes skills install https://github.com/AdsPower/adspower-browser/blob/main/skills/adspower-browser --force
```


## AdsPower CLI

The AdsPower CLI is completely isolated from the AdsPower client, runs independently, and does not share local caches/kernels, etc. However, the CLI also supports headless mode for operating the AdsPower client.

```bash
npm install -g adspower-browser # 安装

ads start -k <KEY>                    # 启动 adspower
ads stop                              # 停止 adspower
ads restart                           # 重启 adspower
ads status                            # 查询 adspower 运行状态
ads get-browser-list                  # 获取配置文件列表
... #查看 https://github.com/AdsPower/adspower-browser/blob/main/packages/adspower-browser/README.MD
```


AdsPower client headless mode:
```bash
AdsPower Global：
Windows： "AdsPower Global.exe" --headless=true --api-key=your_api_key --api-port=50325
MacOS："/Applications/AdsPower Global.app/Contents/MacOS/AdsPower Global" --args --headless=true --api-key=your_api_key --api-port=50325
Linux：adspower_global --headless=true --api-key=your_api_key --api-port=50325
```


### AdsPower MCP

Claude Code: 
```bash
claude mcp add adspower-local-api -e PORT="50325" -e API_KEY="your_api_key" -- npx -y local-api-mcp-typescript
```

Codex:
```bash
codex mcp add --env PORT="50325" --env API_KEY="your_api_key" adspower-local-api -- npx -y local-api-mcp-typescript
```

Cursor: Go to Cursor Settings -> MCP -> Add New MCP Server, and then paste the following content:
```json
{
  "mcpServers": {
    "adspower-local-api": {
      "command": "npx",
      "args": ["-y", "local-api-mcp-typescript"],
      "env": {
        "PORT": "50325",
        "API_KEY": "your_api_key"
      }
    }
  }
}
```

OpenCode: update `~/.config/opencode/opencode.json`
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "adspower-local-api": {
      "command": "npx",
      "args": ["-y", "local-api-mcp-typescript"],
      "env": {
        "PORT": "50325",
        "API_KEY": "your_api_key"
      }
    }
  }
}
```

### How to use?

#### Requirements

- [AdsPower](https://www.adspower.com/?source=github)

- Node version 18 or greater

#### Version Compatibility

Some APIs are introduced incrementally by AdsPower client version.  
If the client has not been upgraded to a version that includes a specific API, requests may return `Not found`.

When this happens:
- Upgrade AdsPower client to the latest patch version first.
- Then retry the same command/API.


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
