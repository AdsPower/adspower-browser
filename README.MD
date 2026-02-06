# AdsPower LocalAPI MCP Server

A Model Context Protocol server that AdsPower browser LocalAPI. This server enables LLMs to interact with AdsPower browser profiles using the v2 API, including creating, updating, deleting profiles, managing groups, and automating browser operations.


## Usage with Claude Desktop

Talk to LLMs to create browser: `Create an Android UA browser using Chrome 134`

![Claude desktop](https://github.com/AdsPower/local-api-mcp-typescript/blob/main/assets/claude-use.png)

Talk to LLMs to create browser: `Help me with random UA, random fingerprint, random cookie generation, create 3 browsers, use 134 cores, and open them`

![Claude desktop](https://github.com/AdsPower/local-api-mcp-typescript/blob/main/assets/claude-open.gif)

## How to use?

### Requirements

- [AdsPower](https://www.adspower.com/?source=github)

- Node version 18 or greater

### Installation

To use with Claude Desktop, add the server config:

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json` On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

#### MacOS / Linux
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

#### Windows
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

### Configuration Parameters

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

![Claude desktop MCP](https://github.com/AdsPower/local-api-mcp-typescript/blob/main/assets/claude-installed.png)

or use in Cursor
![Cursor](./assets/cursor.png)

### Adding the adspower-browser Skill

Use the **adspower-browser** skill so the AI can operate AdsPower via the CLI without the MCP server. Add it in your editor as follows:

| Environment   | How to add |
|---------------|-------------|
| **Cursor**   | `npx skills add adspower-browser` |
| **Claude Code** | `npx skills add adspower-browser` |
| **GPT / Codex** | If your setup supports [add-skill](https://github.com/vercel-labs/add-skill): `npx skills add adspower-browser`. Otherwise copy the skill from `packages/adspower-browser/skills/adspower-browser/` into your agent’s skills directory (e.g. `~/.codex/skills/adspower-browser/`). |

## Development

```bash
# clone
git clone https://github.com/AdsPower/local-api-mcp-typescript.git
cd local-api-mcp-typescript

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
    "args": ["<Replace Your Project Path>/local-api-mcp-typescript/packages/local-api-mcp/build/index.js"]
  }
}
```

## Components

### Tools

#### Browser Profile Management

- **open-browser**
  - Open the browser (both environment and profile mean browser)
  - Inputs:
    - `profileNo` (string, optional): The profile number of the browser to open (priority given to profileId when both provided)
    - `profileId` (string, required): Unique profile ID, generated after creating profile
    - `ipTab` (enum, optional): Whether to open the IP detection page ('0' | '1'), default 0
    - `launchArgs` (string, optional): Chrome launch args or startup URL
    - `clearCacheAfterClosing` (enum, optional): Whether to clear cache after closing ('0' | '1'), default 0
    - `cdpMask` (enum, optional): Whether to mask CDP detection ('0' | '1'), default 0

- **close-browser**
  - Close the browser
  - Inputs:
    - `profileId` (string, optional): The profile id of the browser to stop (either profileId or profileNo must be provided)
    - `profileNo` (string, optional): The profile number of the browser to stop

- **create-browser**
  - Create a browser
  - Required Inputs:
    - `groupId` (string): The group id for the browser, numeric string (use "0" for Ungrouped)
    - At least one of: `username`, `password`, `cookie`, or `fakey` (account information)
    - At least one of: `userProxyConfig` or `proxyid` (proxy configuration)
  - Optional Inputs:
    - `platform` (string): Platform domain (e.g., "facebook.com")
    - `name` (string, max 100 chars): Account name
    - `remark` (string, max 1500 chars): Remarks to describe the account
    - `username` (string): Platform account username
    - `password` (string): Platform account password
    - `cookie` (string): Cookie data in JSON or Netscape format
    - `fakey` (string): 2FA key for online 2FA code generators
    - `tabs` (string[]): URLs to open on startup
    - `userProxyConfig` (object): Custom proxy configuration (see UserProxyConfig)
    - `proxyid` (string): Saved proxy ID or "random" for random selection
    - `repeatConfig` (array): Account deduplication settings (0, 2, 3, or 4)
    - `ignoreCookieError` (enum): Handle cookie verification failures ('0' | '1')
    - `ip` (string): IP address
    - `country` (string): Country/Region (e.g., "CN")
    - `region` (string): Region
    - `city` (string): City
    - `ipchecker` (enum): IP query channel ('ip2location' | 'ipapi')
    - `categoryId` (string): Application category ID (use get-application-list to get list)
    - `fingerprintConfig` (object, optional): Browser fingerprint configuration (see FingerprintConfig)

- **update-browser**
  - Update the browser
  - Required Inputs:
    - `profileId` (string): The profile id of the browser to update
  - Optional Inputs:
    - `platform` (string): Platform domain (e.g., "facebook.com")
    - `tabs` (string[]): URLs to open on startup
    - `name` (string, max 100 chars): Profile name
    - `remark` (string, max 1500 chars): Profile remarks
    - `username` (string): Platform account username
    - `password` (string): Platform account password
    - `fakey` (string): 2FA key
    - `cookie` (string): Cookie data
    - `ignoreCookieError` (enum): Handle cookie verification failures ('0' | '1')
    - `groupId` (string): Group id (numeric string)
    - `country` (string): Country/Region
    - `region` (string): Region
    - `city` (string): City
    - `ip` (string): IP address
    - `categoryId` (string): Category ID (use get-application-list to get list)
    - `userProxyConfig` (object): Proxy configuration
    - `proxyid` (string): Proxy ID
    - `fingerprintConfig` (object): Fingerprint configuration
    - `launchArgs` (string): Browser startup parameters (Chromium command-line switches)

- **delete-browser**
  - Delete the browser
  - Inputs:
    - `profileIds` (string[]): The profile ids of the browsers to delete (required)

- **get-browser-list**
  - Get the list of browsers
  - Inputs:
    - `groupId` (string, optional): Query by group ID; numeric string, empty searches all groups
    - `limit` (number, optional): Profiles per page (range 1–200, default 50)
    - `page` (number, optional): Page number for results (default 1)
    - `profileId` (string[], optional): Query by profile ID (e.g., ["h1yynkm","h1yynks"])
    - `profileNo` (string[], optional): Query by profile number (e.g., ["123","124"])
    - `sortType` (enum, optional): Sort field ('profile_no' | 'last_open_time' | 'created_time')
    - `sortOrder` (enum, optional): Sort order ('asc' | 'desc')

- **get-opened-browser**
  - Get the list of opened browsers
  - No inputs required

- **move-browser**
  - Move browsers to a group
  - Inputs:
    - `groupId` (string): The target group id (numeric string, use get-group-list to get list)
    - `userIds` (string[]): The profile ids to move (required)

- **get-profile-cookies**
  - Query and return cookies of the specified profile. Only one profile per request.
  - Inputs:
    - `profileId` (string, optional): The profile id (either profileId or profileNo must be provided)
    - `profileNo` (string, optional): The profile number

- **get-profile-ua**
  - Query and return the User-Agent of specified profiles. Up to 10 profiles per request.
  - Inputs:
    - `profileId` (string[], optional): The profile id array (either profileId or profileNo must be provided with at least one element)
    - `profileNo` (string[], optional): The profile number array

- **close-all-profiles**
  - Close all opened profiles on the current device
  - No inputs required

- **new-fingerprint**
  - Generate a new fingerprint for specified profiles. Up to 10 profiles per request.
  - Inputs:
    - `profileId` (string[], optional): The profile id array (either profileId or profileNo must be provided)
    - `profileNo` (string[], optional): The profile number array

- **delete-cache-v2**
  - Clear local cache of specific profiles. For account security, ensure no open browsers when using this interface.
  - Inputs:
    - `profileIds` (string[]): The profile ids array (required)
    - `type` (array, required): Types of cache to clear: 'local_storage', 'indexeddb', 'extension_cache', 'cookie', 'history', 'image_file'

- **share-profile**
  - Share profiles via account email or phone number. Max 200 profiles per request.
  - Inputs:
    - `profileIds` (string[]): The profile ids array (required)
    - `receiver` (string): Receiver's account email or phone number, no area code (required)
    - `shareType` (number, optional): Share type (1 for email default, 2 for phone number)
    - `content` (array, optional): Shared content: 'name', 'proxy', 'remark', 'tabs'

- **get-browser-active**
  - Get active browser profile information
  - Inputs:
    - `profileId` (string, optional): The profile id (either profileId or profileNo must be provided)
    - `profileNo` (string, optional): The profile number

- **get-cloud-active**
  - Query the status of browser profiles by user_id, up to 100 profiles per request. If "Multi device mode" is enabled, specific statuses cannot be retrieved.
  - Inputs:
    - `userIds` (string): Profile IDs to check, comma-separated (max 100)

#### Group Management

- **create-group**
  - Create a browser group
  - Inputs:
    - `groupName` (string): The name of the group to create (required)
    - `remark` (string, optional): The remark of the group

- **update-group**
  - Update the browser group
  - Inputs:
    - `groupId` (string): The id of the group to update, numeric string (required)
    - `groupName` (string): The new name of the group (required)
    - `remark` (string | null, optional): The new remark of the group, set null to clear

- **get-group-list**
  - Get the list of groups
  - Inputs:
    - `groupName` (string, optional): The name of the group to search (like search)
    - `size` (number, optional): Page size (max 100, default 10)
    - `page` (number, optional): Page number (default 1)

#### Application Management

- **check-status**
  - Check the availability of the current device API interface (Connection Status)
  - No inputs required

- **get-application-list**
  - Get the list of applications (categories)
  - Inputs:
    - `category_id` (string, optional): Extension category_id
    - `page` (number, optional): Page number (default 1)
    - `limit` (number, optional): Items per page (range 1–100)

#### Proxy Management

- **create-proxy**
  - Create a proxy
  - Inputs:
    - `proxies` (array, required): Array of proxy configs, each with:
      - `type` (enum): 'http' | 'https' | 'ssh' | 'socks5'
      - `host` (string): Proxy host (ipV4/ipV6, e.g. 192.168.0.1)
      - `port` (string): Port (0–65536)
      - `user` (string, optional): Proxy username
      - `password` (string, optional): Proxy password
      - `proxy_url` (string, optional): URL used to refresh the proxy
      - `remark` (string, optional): Remark/description
      - `ipchecker` (enum, optional): 'ipinfo' | 'ip2location' | 'ipapi' | 'ipfoxy' | 'ipidea'

- **update-proxy**
  - Update the proxy
  - Inputs:
    - `proxyId` (string): The unique id after the proxy is added (required)
    - `type` (enum, optional): 'http' | 'https' | 'ssh' | 'socks5'
    - `host` (string, optional): Proxy host
    - `port` (string, optional): Port (0–65536)
    - `user` (string, optional): Proxy username
    - `password` (string, optional): Proxy password
    - `proxyUrl` (string, optional): URL used to refresh the proxy
    - `remark` (string, optional): Remark/description
    - `ipchecker` (enum, optional): 'ip2location' | 'ipapi' | 'ipfoxy' | 'ipidea'

- **get-proxy-list**
  - Get the list of proxies
  - Inputs:
    - `limit` (number, optional): Proxies per page (range 1–200, default 50)
    - `page` (number, optional): Page number (default 1)
    - `proxyId` (string[], optional): Query by proxy ID (e.g. ["proxy1","proxy2"])

- **delete-proxy**
  - Delete the proxy
  - Inputs:
    - `proxyIds` (string[]): The proxy ids to delete (required, max 100)

#### Automation

- **connect-browser-with-ws**
  - Connect the browser with the ws url
  - Inputs:
    - `wsUrl` (string): The ws url from open-browser response `ws.puppeteer` (required)
    - `userId` (string, optional): The browser id to connect
    - `serialNumber` (string, optional): The serial number of the browser to connect

- **open-new-page**
  - Open a new page
  - No inputs required

- **navigate**
  - Navigate to the url
  - Inputs:
    - `url` (string): The url to navigate to (required)

- **screenshot**
  - Get the screenshot of the page
  - Inputs:
    - `savePath` (string, optional): The path to save the screenshot
    - `isFullPage` (boolean, optional): Whether to capture full page

- **get-page-visible-text**
  - Get the visible text content of the page
  - No inputs required

- **get-page-html**
  - Get the html content of the page
  - No inputs required

- **click-element**
  - Click the element
  - Inputs:
    - `selector` (string): The selector of the element to click (required)

- **fill-input**
  - Fill the input
  - Inputs:
    - `selector` (string): The selector of the input to fill (required)
    - `text` (string): The text to fill in the input (required)

- **select-option**
  - Select the option
  - Inputs:
    - `selector` (string): The selector of the option to select (required)
    - `value` (string): The value of the option to select (required)

- **hover-element**
  - Hover the element
  - Inputs:
    - `selector` (string): The selector of the element to hover (required)

- **scroll-element**
  - Scroll the element (simulates user scrolling, e.g. to find element at bottom of page)
  - Inputs:
    - `selector` (string): The selector of the element to scroll (required)

- **press-key**
  - Press the key
  - Inputs:
    - `key` (string): The key to press, e.g. "Enter" (required)
    - `selector` (string, optional): The selector of the element to press the key on

- **evaluate-script**
  - Evaluate the script
  - Inputs:
    - `script` (string): The script to evaluate, e.g. "document.querySelector('#username').value = 'test'" (required)

- **drag-element**
  - Drag the element
  - Inputs:
    - `selector` (string): The selector of the element to drag (required)
    - `targetSelector` (string): The selector of the element to drag to (required)

- **iframe-click-element**
  - Click the element in the iframe
  - Inputs:
    - `selector` (string): The selector of the element to click (required)
    - `iframeSelector` (string): The selector of the iframe (required)

### Advanced Configuration Types

#### UserProxyConfig
- `proxy_soft` (enum, required): Proxy soft type ('brightdata', 'brightauto', 'oxylabsauto', '922S5auto', 'ipideeauto', 'ipfoxyauto', '922S5auth', 'kookauto', 'ssh', 'other', 'no_proxy')
- `proxy_type` (enum, optional): Proxy type ('http', 'https', 'socks5', 'no_proxy')
- `proxy_host` (string, optional): Proxy host (e.g. 127.0.0.1)
- `proxy_port` (string, optional): Proxy port (e.g. 8080)
- `proxy_user` (string, optional): Proxy username
- `proxy_password` (string, optional): Proxy password
- `proxy_url` (string, optional): Proxy URL (e.g. http://127.0.0.1:8080)
- `global_config` (enum, optional): Global config ('0' | '1'), default 0

#### FingerprintConfig
- `automatic_timezone` (enum, optional): Automatic timezone ('0' | '1'), default 0
- `timezone` (string, optional): Timezone (e.g. Asia/Shanghai)
- `language` (string[], optional): Languages (e.g. ["en-US", "zh-CN"])
- `flash` (enum, optional): Flash ('block' | 'allow'), default disabled
- `fonts` (string[], optional): Font list (e.g. ["Arial", "Times New Roman"])
- `webrtc` (enum, optional): WebRTC ('disabled' | 'forward' | 'proxy' | 'local'), default disabled
- `browser_kernel_config` (object, optional):
  - `version` (string, optional): Browser version (e.g. "92"–"134" or "ua_auto")
  - `type` (enum, optional): Browser type ('chrome' | 'firefox'), default chrome
- `random_ua` (object, optional):
  - `ua_version` (string[], optional): User agent versions
  - `ua_system_version` (enum[], optional): e.g. ["Android 9", "iOS 14", "Windows 10", "Mac OS X 12", "Linux"]
- `tls_switch` (enum, optional): TLS switch ('0' | '1'), default 0
- `tls` (string, optional): TLS config (e.g. "0xC02C,0xC030" when tls_switch is 1)