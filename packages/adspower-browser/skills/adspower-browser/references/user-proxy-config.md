# UserProxyConfig (inline proxy config for create-browser / update-browser)

When using **userProxyConfig** instead of **proxyid**, pass the following object (field names match the API, mostly snake_case):

- **proxy_soft** (required): Proxy software type. `'brightdata'` | `'brightauto'` | `'oxylabsauto'` | `'922S5auto'` | `'ipfoxyauto'` | `'922S5auth'` | `'kookauto'` | `'ssh'` | `'other'` | `'no_proxy'`
- **proxy_type** (optional): Proxy type. `'http'` | `'https'` | `'socks5'` | `'no_proxy'`
- **proxy_host** (optional): Proxy host, e.g. `127.0.0.1`
- **proxy_port** (optional): Proxy port, e.g. `8080`
- **proxy_user** (optional): Proxy username
- **proxy_password** (optional): Proxy password
- **proxy_url** (optional): Full proxy URL, e.g. `http://127.0.0.1:8080`
- **global_config** (optional): Global config. `'0'` | `'1'`, default `0`

Example: `"userProxyConfig":{"proxy_soft":"no_proxy","proxy_type":"http","proxy_host":"127.0.0.1","proxy_port":"8080"}`
