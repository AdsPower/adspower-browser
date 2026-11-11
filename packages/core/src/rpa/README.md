# RPA 接口组织与扩展

RPA 按服务来源组织。本地服务使用 `http://127.0.0.1:<rpaPort>/api/rpav2`；远程后端接口放在独立 remote 模块，但和环境、分组管理一样通过 AdsPower runtime 转发，复用 getApiClient()/getLocalApiBase() 和 --port/--api-key，不使用本地 RPA Plus 端口或新增 token 配置。

## 当前目录

```text
packages/core/src/rpa/
  index.ts                RPA 总导出
  schedule.ts             任务调度规则类型、字段校验及时间限制
  settings.ts             流程设置类型、默认配置和字段校验；创建省略时填默认值，更新省略时保留原配置
  local/
    index.ts              本地 RPA 公共导出
    api.ts                从统一 CONFIG 读取并校验本地端口
    handlers.ts           本地 HTTP 请求与响应处理
    schemas.ts            本地参数校验
    types.ts              从 Schema 推导的参数类型
    tools.ts              CLI/MCP 共用的工具清单、描述、Schema、handler 和只读标记
  remote/
    index.ts              远程 RPA 公共导出
    api.ts                26 个 *-by-api 路径和现有 runtime 请求客户端
    handlers.ts           远程接口调用
    schemas.ts            远程参数校验
    types.ts              参数类型
    tools.ts              CLI/MCP 共用远程工具清单
packages/adspower-browser/src/
  rpa/local.ts            本地 RPA CLI 配置适配
  rpa/remote.ts           远程 RPA CLI 配置适配
  cliRpa.ts               CLI RPA 合并入口
packages/local-api-mcp/src/
  rpa/local.ts            本地 RPA MCP 注册适配
  rpa/remote.ts           远程 RPA MCP 注册适配
  rpa/types.ts            两类注册器共用的传输类型
  utils/toolRegister.ts   MCP 总注册入口，复用现有 Zod 4 校验路径
```

`constants/config.ts` 继续集中管理端口和环境变量。core 总入口导出 `rpaLocalHandlers`、`rpaLocalSchemas`、`rpaLocalTools` 以及参数类型；既有 `rpaHandlers`、`rpaSchemas` 导入保留为兼容别名。旧的内部文件路径不再使用。

## 本地接口扩展顺序

1. 核对本地服务 router、controller、service 的 HTTP 方法、参数、返回值和副作用。
2. 在 `local/schemas.ts` 添加 Schema，在 `local/types.ts` 推导输入类型。
3. 在 `local/handlers.ts` 添加请求，使用 `getRpaApiBase()`，不得将端口写死或自动重试下发任务。
4. 在 `local/tools.ts` 添加工具定义。CLI 自动合并同名命令，MCP 自动注册 `rpa-<name>`。
5. 有读写两种模式的工具以可能写入处理，例如 Google Sheets；读取邮件可能标记已读，也不能标记为纯只读。
6. 更新 core 与 MCP 合约测试、Skills 对应的 `references/rpa-*.md` 接口参考文档。

## 远程接口

`remote/` 已接入用户指定的 26 个映射，只调用 `/rpav2/local-api/*-by-api`。不调用旧的 `/rpav2/task`、`/rpav2/process`、`/rpav2/batch` 或 `/rpav2/share` 路径。HTTP 方法和业务字段沿用已核对的前端契约；GET 使用 query，POST 使用 body，core 请求超时为 30000 毫秒，不自动重试写入。

CLI 在 `src/rpa/remote.ts` 适配，由 `cliRpa.ts` 与本地命令合并。CLI/MCP 都使用 `rpa-*` 名称。远程组、任务配置、流程、分享的 Skills 分别位于 `references/rpa-*.md`，按原有接口参数文档格式维护。

运行时负责远程后端地址和登录鉴权，core 仅复用现有 runtime 端口和 API Key。分享参数已按确认规则校验：quota 默认 10、最大 1000；expired_time 为 1/7/30 天、默认 7；share_config 为空字符串或 remark、默认空字符串。

CLI/MCP 的所有 RPA 工具统一使用 `rpa-*` 前缀。`tools/list` 的只读/破坏性标记是行为提示，不替代参数校验或调用授权。

## 配置与边界

- CLI 显式 `-rp` / `--rpa-port` 或 MCP 进程 `--rpa-port` 优先，其次 `RPA_PORT`，默认 `20409`。
- 浏览器 Local API 的 `PORT` / `--port` 与 RPA 端口独立。
- 当前仅开放 `thread` 并发配置，字符串形式 `1–100`。
- 当前 26 个本地接口已提供 CLI/MCP；status、download、OAuth callback 按需求未接入。
- `task/add` 返回本次执行的 record_id；`task/cancel` 传 record_id 只取消这一次执行，传 task_id 取消该任务的活动执行，两者必须且只能提供一个。不新增数据库表或 request_id。同一用户同一任务已有 WAIT/START/DOING 记录时返回已有 record_id；同一服务内并发下发共用一次入队结果，执行结束后允许新运行。它是活动执行防重，不是跨执行生命周期的永久幂等；下发超时不自动重试。

- 创建流程通过 create-process-by-api 一次上传完成；process_file 在 CLI/MCP 中为 runtime 可访问的 .json.gz 路径，文件内容为包含 nodes、edges 数组的 gzip 压缩流程 JSON，校验后原样上传，runtime 转成 multipart 后端请求。付费模板订阅查询已接入 get-template-subscription-info-by-api；涉及流程内容更改时使用 update-process-by-api，id、batch_id、name、variable、setting、remark、process_file 全部必填；先查询当前信息，未修改项沿用旧值，不填创建默认值。必须上传替换文件（最大4MB）；仅改属性使用 update-process-editable-fields-by-api。创建流程 remark 默认空字符串且始终发送；独立 OSS 凭据接口不接入。

## Runtime 转发层

`mix_client/src/localAPI/constant/rpaRemoteRoutes.ts` 维护同一组 26 条路由与入参规则。`handler/rpaRemoteHandler.ts` 经过现有 BaseHandler 身份/API Key 校验，再由请求级 `model/rpaRemoteModel.ts` 复用 BaseModel 的后端鉴权、请求来源和请求格式处理；不接受任意 URL。新增路由也加入现有 Local API 限流列表。

更改 runtime 路由后，需要构建 mix_client，并同步生成的 main bundle 到 `packages/adspower-browser/cwd/lib/main.min.js`。已运行的 runtime 需重启才能载入新路由。远程后端 *-by-api 的生产可用性和未确认字段语义仍需真实后端联调。

## Skills 索引维护

主 `SKILL.md` 只链接 `references/rpa.md` 二级功能指南，再由该指南按功能分类索引到 `rpa-*.md` 参数文档。新增功能分类时更新二级索引，不在主 Skill 重复列举 RPA 接口。

## 流程和日志文件传输

`rpa-start-debug` 支持 `process_file`（绝对路径，JSON / gzip JSON，解压后最多 32 MiB），与旧 `process` 字符串互斥。只有 HTTP 发送边界才读取展开的流程，接口仍收到原来的 process 字段；不更改 RPA 服务协议，不回显正文，不删除调用者文件。

get-debug-log、get-task-log、get-record-detail、get-record-items、get-task-execute-items 支持可选 output_file。指定时完整响应以独占创建方式写入文件，返回状态与文件引用；列表摘要最多 10 项。省略时维持原有完整输出。文件参数只由工具消费，不发送给 RPA 接口。文件模式的临时写入不改变远端接口只读属性。
