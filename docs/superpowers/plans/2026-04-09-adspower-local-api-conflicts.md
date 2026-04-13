# AdsPower Local API Conflicts

本表仅保留代码对齐完成后仍未彻底消除、且值得后续运行时确认的真实残留项。

| commandName | postmanContract | currentCodeBehavior | whyItLooksConflicting | implementationDecision | followUp |
| --- | --- | --- | --- | --- | --- |
| get-opened-browser | `GET /api/v1/browser/local-active` | contract 常量、handler、CLI README、skill references 现均使用 v1 | 周边浏览器状态接口大多已迁到 `browser-profile` v2，`local-active` 仍停留在 v1，版本不对称仍值得怀疑 | 继续保留 v1，因为当前仓内契约源与附属文档已全部一致指向 v1 | 合并后对真实 AdsPower 实例做一次运行时验证，确认 v1 仍为官方可用入口 |
| get-cloud-active | Postman 文档仅展示 `user_ids`，未充分说明其最终值形态 | schema、handler、CLI README、skill references 当前统一为单个 `user_ids` 字符串，示例采用逗号分隔多个 id | 对外命名已收敛，但字符串与数组哪一种才是官方稳定形态仍缺少运行时证据 | 暂时保留 `user_ids` 字符串方案，因为当前实现、README 与 skill 文档已一致 | 合并后对真实 AdsPower 实例验证逗号分隔字符串是否为官方接受形态 |
| create-proxy | Postman 文档要求顶层代理数组 | core schema、handler、CLI README、skill references 现已统一为顶层数组；但 `local-api-mcp` 仍保留 `{ "proxies": [...] }` 兼容包装 | MCP SDK 在当前版本下对根数组工具 schema 的注册结果不可靠，直接暴露顶层数组会静默降级成对象 schema | core/CLI 继续使用顶层数组以对齐 Postman；MCP 工具层暂保留 `proxies` 兼容包装，并单独记录为剩余差异 | 后续升级或替换 MCP SDK schema 注册路径后，再验证并移除 `proxies` 兼容包装 |

## 已收敛说明

- `open-browser` 的 `profile_id`/`profile_no`、`launch_args` 及相关 snake_case 字段已在 schema、serializer、CLI 与测试中统一。
- `create-browser` / `update-browser` 的 `platform_account`、`ipchecker`、`fingerprint_config.browser_kernel_config.version=latest` 已对齐。
- `get-cloud-active`、`get-group-list`、`update-proxy`、`get-proxy-list`、`delete-proxy` 的对外参数名已统一为 Postman 风格，并有对应 contract tests 覆盖。
- README 与 skill references 中此前遗留的对外参数命名分歧已收敛，不再单列为冲突。
