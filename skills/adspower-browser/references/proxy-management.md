# Proxy Management

**create-proxy** — Create a proxy.

- Provide a top-level JSON array of proxy configs. Each item:
  - **type** (required): `'http'` | `'https'` | `'ssh'` | `'socks5'`.
  - **host** (required): Proxy host, ipV4/ipV6, e.g. 192.168.0.1.
  - **port** (required): 0–65536, e.g. 8000.
  - **user** (optional): Proxy username.
  - **password** (optional): Proxy password.
  - **proxy_url** (optional): URL used to refresh the proxy.
  - **remark** (optional): Remark/description.
  - **ipchecker** (optional): `'ipinfo'` | `'ip2location'` | `'ipapi'` | `'ipfoxy'`.

**update-proxy** — Update the proxy.

- **proxy_id** (required): Unique id after the proxy is added.
- **type** (optional): `'http'` | `'https'` | `'ssh'` | `'socks5'`.
- **host**, **port**, **user**, **password** (optional).
- **proxy_url** (optional): URL used to refresh the proxy.
- **remark** (optional).
- **ipchecker** (optional): `'ipinfo'` | `'ip2location'` | `'ipapi'` | `'ipfoxy'`.

**get-proxy-list** — Get the list of proxies.

- **limit** (optional): 1–200, default 50. Proxies per page.
- **page** (optional): Default 1.
- **proxy_id** (optional): Array, e.g. `["proxy1","proxy2"]`.

**delete-proxy** — Delete the proxy/proxies.

- **proxy_id** (required): Array of proxy ids to delete, max 100.
