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
  - **ipchecker** (optional): `'ip2location'` | `'ipapi'` | `'ipfoxy'`.

**update-proxy** — Update the proxy.

- **proxy_id** (required): Unique id after the proxy is added.
- **type** (optional): `'http'` | `'https'` | `'ssh'` | `'socks5'`.
- **host**, **port**, **user**, **password** (optional).
- **proxy_url** (optional): URL used to refresh the proxy.
- **remark** (optional).
- **ipchecker** (optional): `'ip2location'` | `'ipapi'` | `'ipfoxy'`.

**get-proxy-list** — Get the list of proxies.

- **limit** (optional): 1–200, default 50. Proxies per page.
- **page** (optional): Default 1.
- **proxy_id** (optional): Array, e.g. `["proxy1","proxy2"]`.

**delete-proxy** — Delete the proxy/proxies.

- **proxy_id** (required): Array of proxy ids to delete, max 100.

**get-dynamic-proxy-traffic** — Query and return dynamic proxy traffic for the current team, including available traffic, traffic package expiration dates, and daily traffic consumption for the current month or a specified date range.

查询并返回当前团队动态代理的流量信息，包括可用流量、流量包到期日期，以及本月或指定日期范围内的每日流量消耗情况。

- Calls `POST /api/v2/proxy/dynamic-proxy-traffic`.
- **start_date** (optional): String in `YYYY-MM-DD` format. Defaults to the first day of the current month in the Local API.
- **end_date** (optional): String in `YYYY-MM-DD` format. Defaults to the current date in the Local API.
- Omit dates to use the Local API defaults; return the API data without assuming a response structure.

```bash
ads get-dynamic-proxy-traffic
ads get-dynamic-proxy-traffic '{"start_date":"2026-10-01","end_date":"2026-10-20"}'
```
