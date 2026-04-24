# AdsPower Local API Contract Matrix

本矩阵用于对齐 **已接入 Local API 的 handler**（不含 `automation.ts` 的浏览器自动化指令）。主真值来源：AdsPower Postman 集合导出（`documenter.gw.postman.com/api/collections/45822952/2sB2x5JDXn`，`versionTag=latest`）。对照实现：`packages/core/src/constants/api.ts`、`packages/core/src/handlers/*.ts`（除 `automation.ts`）、`packages/core/src/types/schemas.ts`、`packages/core/src/utils/requestBuilder.ts`。暴露面参考 `packages/local-api-mcp/src/utils/toolRegister.ts`、`packages/adspower-browser/README.MD`、`skills/adspower-browser/`。

**说明：**
- `docParams` 直接使用 Postman 文档中的对外参数原名，不做 camelCase 改写。
- `codeParams` 描述当前仓库真实暴露的外部参数名或实际序列化行为。
- `name_mismatch` 仅表示“当前对外参数名与 Postman 原名不一致”。

| commandName | handlerFile | method | path | requestPosition | docParams | codeParams | diffType | decision | riskNote |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| check-status | `packages/core/src/handlers/application.ts` | GET | `/status` | none | 无参数 | 无参数 | none | 保持现状 | 无 |
| get-application-list | `packages/core/src/handlers/application.ts` | GET | `/api/v2/category/list` | query | `category_id`, `limit`, `page` | `category_id`, `page`, `limit` → query `category_id`, `page`, `limit` | constraint_mismatch | 保持 Postman 原名 `category_id`、`limit`、`page`；按文档修正 `limit` 范围与描述 | 当前键名已与 Postman 一致，剩余问题主要是约束范围 |
| open-browser | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/start` | body | `profile_id`, `profile_no`, `ip_tab`, `launch_args`, `headless`, `last_opened_tabs`, `proxy_detection`, `password_filling`, `password_saving`, `cdp_mask`, `delete_cache`, `device_scale` | 当前对外使用 `profileId`, `profileNo`, `ipTab`, `launchArgs`, `clearCacheAfterClosing`, `cdpMask` | name_mismatch, missing_param, shape_mismatch, constraint_mismatch | 对外参数名改为 Postman 原名，并补全文档已有字段 | 若文档允许仅 `profile_no` 启动，需同步调整校验 |
| close-browser | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/stop` | body | `profile_id`, `profile_no` | 当前对外使用 `profileId`, `profileNo` | name_mismatch | 对外参数名改为 `profile_id`, `profile_no` | 无 |
| create-browser | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/create` | body | `group_id`, `username`, `password`, `cookie`, `fakey`, `name`, `platform`, `remark`, `user_proxy_config`, `proxyid`, `repeat_config`, `ignore_cookie_error`, `tabs`, `ip`, `country`, `region`, `city`, `ipchecker`, `category_id`, `profile_tag_ids`, `fingerprint_config`, `platform_account` | 当前对外使用混合命名：`groupId`, `userProxyConfig`, `repeatConfig`, `ignoreCookieError`, `categoryId`, `profileTagIds`, `fingerprintConfig` 等 | name_mismatch, missing_param, constraint_mismatch, shape_mismatch | 对外参数名全面收敛到 Postman 原名，并补齐缺失嵌套结构 | `requestBuilder` 当前仍承担部分字段重命名 |
| update-browser | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/update` | body | `profile_id` 及创建接口的同类字段，另含 `launch_args`, `tags_update_type` | 当前对外使用 `profileId`, `launchArgs`, `tagsUpdateType` 等混合命名 | name_mismatch, missing_param | 对外参数名全面收敛到 Postman 原名，并补齐文档字段 | 与 `create-browser` 共享映射逻辑需一并调整 |
| delete-browser | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/delete` | body | `profile_id[]` | 当前对外使用 `profileIds` → `profile_id` | name_mismatch | 对外参数名改为 `profile_id`（数组） | 无 |
| get-browser-list | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/list` | body | `group_id`, `limit`, `page`, `profile_id[]`, `profile_no[]`, `sort_type`, `sort_order`, `tag_ids`, `tags_filter`, `name`, `name_filter` | 当前对外混用 `groupId`, `profileId`, `profileNo`, `sortType`, `sortOrder` 与 `tag_ids`, `tags_filter`, `name_filter` | name_mismatch | 全部对外参数名收敛到 Postman 原名 | README 与 skill 文档也需同步 |
| get-opened-browser | `packages/core/src/handlers/browser.ts` | GET | `/api/v1/browser/local-active` | none | 无参数 | 无参数 | none | 保持 Postman 已发布的 v1 路径 | v1 与 v2 并存属已发布契约现状 |
| move-browser | `packages/core/src/handlers/browser.ts` | POST | `/api/v1/user/regroup` | body | `user_ids`, `group_id` | 当前对外使用 `userIds`, `groupId` | name_mismatch | 对外参数名改为 `user_ids`, `group_id` | 无 |
| get-profile-cookies | `packages/core/src/handlers/browser.ts` | GET | `/api/v2/browser-profile/cookies` | query | `profile_id`, `profile_no` | 当前对外使用 `profileId`, `profileNo` → query `profile_id`, `profile_no` | name_mismatch | 对外参数名改为 `profile_id`, `profile_no` | Postman query 键已确认 |
| get-profile-ua | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/ua` | body | `profile_id[]`, `profile_no[]` | 当前对外使用 `profileId[]`, `profileNo[]` | name_mismatch | 对外参数名改为 `profile_id`, `profile_no` | 无 |
| close-all-profiles | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/stop-all` | body | 空对象 | 空对象 | none | 保持 | 无 |
| new-fingerprint | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/new-fingerprint` | body | `profile_id[]`, `profile_no[]` | 当前对外使用 `profileId[]`, `profileNo[]` | name_mismatch | 对外参数名改为 `profile_id`, `profile_no` | 无 |
| delete-cache-v2 | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/delete-cache` | body | `profile_id[]`, `type[]` | 当前对外使用 `profileIds`, `type` | name_mismatch | 对外参数名改为 `profile_id`, `type` | 无 |
| share-profile | `packages/core/src/handlers/browser.ts` | POST | `/api/v2/browser-profile/share` | body | `profile_id[]`, `receiver`, `share_type`, `content[]` | 当前对外使用 `profileIds`, `receiver`, `shareType`, `content` | name_mismatch | 对外参数名改为 `profile_id`, `receiver`, `share_type`, `content` | 无 |
| get-browser-active | `packages/core/src/handlers/browser.ts` | GET | `/api/v2/browser-profile/active` | query | `profile_id`, `profile_no` | 当前对外使用 `profileId`, `profileNo` → `profile_id`, `profile_no` | name_mismatch | 对外参数名改为 `profile_id`, `profile_no` | Postman query 键已确认；重复条目不构成契约冲突 |
| get-cloud-active | `packages/core/src/handlers/browser.ts` | POST | `/api/v1/browser/cloud-active` | body | `user_ids` | 当前对外使用 `user_ids`（逗号分隔字符串）→ `user_ids` | shape_mismatch | 保持 `user_ids` 字段名，并进一步确认其字符串/数组形态 | 需运行时验证 |
| create-group | `packages/core/src/handlers/group.ts` | POST | `/api/v1/group/create` | body | `group_name`, `remark` | 当前对外使用 `groupName`, `remark` | name_mismatch | 对外参数名改为 `group_name`, `remark` | 无 |
| update-group | `packages/core/src/handlers/group.ts` | POST | `/api/v1/group/update` | body | `group_id`, `group_name`, `remark` | 当前对外使用 `groupId`, `groupName`, `remark` | name_mismatch | 对外参数名改为 `group_id`, `group_name`, `remark` | 无 |
| get-group-list | `packages/core/src/handlers/group.ts` | GET | `/api/v1/group/list` | query | `group_name`, `page`, `page_size` | 当前对外使用 `groupName`, `size`, `page` → `group_name`, `page_size`, `page` | name_mismatch, constraint_mismatch | 对外参数名改为 `group_name`, `page`, `page_size`；同时补齐 `code === 0` 校验 | Postman query 键已确认；`page_size` 范围需按文档收紧 |
| create-proxy | `packages/core/src/handlers/proxy.ts` | POST | `/api/v2/proxy-list/create` | body | 顶层数组，元素含 `type`, `host`, `port`, `user`, `password`, `proxy_url`, `remark`, `ipchecker` | core/CLI 对外已使用顶层数组，handler 也直接发送顶层数组；仅 MCP 工具层仍保留 `proxies[]` 兼容包装 | shape_mismatch | core/CLI 保持顶层数组对齐 Postman；MCP 层暂保留兼容包装直到 SDK 可稳定支持根数组工具 schema | MCP 层后续需随 SDK 升级一并收敛 |
| update-proxy | `packages/core/src/handlers/proxy.ts` | POST | `/api/v2/proxy-list/update` | body | `proxy_id`, `type`, `host`, `port`, `user`, `password`, `proxy_url`, `remark`, `ipchecker` | 当前对外使用 `proxyId`, `proxyUrl` | name_mismatch, constraint_mismatch | 对外参数名改为 `proxy_id`, `proxy_url`，并统一 `ipchecker` 枚举 | `update` schema 无 `ipinfo`，`create` 有 |
| get-proxy-list | `packages/core/src/handlers/proxy.ts` | POST | `/api/v2/proxy-list/list` | body | `proxy_id[]`, `limit`, `page` | 当前对外使用 `proxyId[]`, `limit`, `page` | name_mismatch, constraint_mismatch | 对外参数名改为 `proxy_id`, `limit`, `page` | Postman 示例中的 `limit`/`page` 为字符串形态 |
| delete-proxy | `packages/core/src/handlers/proxy.ts` | POST | `/api/v2/proxy-list/delete` | body | `proxy_id[]` | 当前对外使用 `proxyIds` → `proxy_id` | name_mismatch | 对外参数名改为 `proxy_id`（数组） | 无 |
| get-tag-list | `packages/core/src/handlers/tag.ts` | POST | `/api/v2/browser-tags/list` | body | `ids[]`, `page`, `limit` | `ids`, `limit`, `page` | none | 保持当前对外参数名 | 以 POST body 为准 |
| create-tag | `packages/core/src/handlers/tag.ts` | POST | `/api/v2/browser-tags/create` | body | `tags[]`（`name`, `color`） | `tags[]` | none | 保持当前对外参数名 | 无 |
| update-tag | `packages/core/src/handlers/tag.ts` | POST | `/api/v2/browser-tags/update` | body | `tags[]`（`id`, `name`, `color`） | `tags[]` | none | 保持当前对外参数名 | 无 |
| delete-tag | `packages/core/src/handlers/tag.ts` | POST | `/api/v2/browser-tags/delete` | body | `ids[]` | `ids` | none | 保持当前对外参数名 | 无 |
| download-kernel | `packages/core/src/handlers/kernel.ts` | POST | `/api/v2/browser-profile/download-kernel` | body | `kernel_type`, `kernel_version` | 当前对外已使用 `kernel_type`, `kernel_version` | none | 保持当前对外参数名 | 无 |
| get-kernel-list | `packages/core/src/handlers/kernel.ts` | GET | `/api/v2/browser-profile/kernels` | query | `kernel_type`（省略时返回全部） | 当前对外使用 `kernel_type` → query `kernel_type` | none | 保持当前对外参数名 | Postman 已确认 `kernel_type` 为可选 query |
| update-patch | `packages/core/src/handlers/patch.ts` | POST | `/api/v2/browser-profile/update-patch` | body | `version_type` | 当前对外已使用 `version_type` | none | 保持当前对外参数名 | 无 |

## 未纳入矩阵的范围

- **自动化浏览器工具**（`connect-browser-with-ws`, `open-new-page`, `navigate`, `screenshot` 等）：对应 `automation.ts`，不属于 Local API HTTP 契约矩阵。
- **Postman 中存在但未在本仓库接入的接口**：不新增行；后续若接入再扩表。

