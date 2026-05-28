# user_proxy_config (inline proxy config for create-browser / update-browser)

Used to configure an inline proxy for **create-browser** / **update-browser**. For **create-browser**, include either **proxyid** or **user_proxy_config**. If the user does not specify a proxy when creating a browser profile, set **user_proxy_config** to `{"proxy_soft":"no_proxy"}`. For **update-browser**, include this config only when changing the profile proxy. If **proxyid** is also provided, **proxyid** takes priority and this config is ignored. Field names match the API (snake_case):

- **proxy_soft** (required): Proxy software type. `'brightdata'` | `'brightauto'` | `'oxylabsauto'` | `'922S5auto'` | `'ipfoxyauto'` | `'922S5auth'` | `'kookauto'` | `'ssh'` | `'other'` | `'no_proxy'`
- **proxy_type** (optional): Proxy type. `'http'` | `'https'` | `'socks5'` | `'no_proxy'`
- **proxy_host** (optional): Proxy host, e.g. `127.0.0.1`
- **proxy_port** (optional): Proxy port, e.g. `8080`
- **proxy_user** (optional): Proxy username
- **proxy_password** (optional): Proxy password
- **proxy_url** (optional): Full proxy URL, e.g. `http://127.0.0.1:8080`
- **global_config** (optional): Global config. `'0'` | `'1'`, default `0`

Example: `"user_proxy_config":{"proxy_soft":"no_proxy","proxy_type":"http","proxy_host":"127.0.0.1","proxy_port":"8080"}`
