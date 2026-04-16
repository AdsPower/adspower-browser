# local-api-mcp E2E 参数验证（快速参考）

（仓库根目录的 `docs/` 被 `.gitignore` 忽略，故使用说明放在本目录。）

## 根目录命令

```bash
# 默认轻量真实回归（自动开启 ADSP_MCP_E2E_ENABLED=1，不启用高副作用工具）
pnpm test:e2e:local-api-mcp

# 显式轻量（等价于默认）
pnpm test:e2e:local-api-mcp:light

# 全量真实回归（自动开启 ADSP_MCP_E2E_ENABLED=1，启用高副作用工具）
pnpm test:e2e:local-api-mcp:full

# 一键开启真实 E2E（自动带 ADSP_MCP_E2E_ENABLED=1）
pnpm test:e2e:local-api-mcp:light:real
pnpm test:e2e:local-api-mcp:full:real

# 带每条测试用例输出（排查“长时间无输出”时推荐）
pnpm test:e2e:local-api-mcp:light:verbose
pnpm test:e2e:local-api-mcp:full:verbose
pnpm test:e2e:local-api-mcp:light:real:verbose
pnpm test:e2e:local-api-mcp:full:real:verbose
```

等价于：

```bash
ADSP_MCP_E2E_ENABLED=1 ADSP_MCP_E2E_HIGH_IMPACT=0 ADSP_LOCAL_API_MIN_INTERVAL_MS=1000 pnpm exec vitest run --config vitest.config.ts packages/local-api-mcp/tests/e2e-tool-validation/e2e-tools-parameter-validation.contracts.test.ts
```

## 包内命令

在 `packages/local-api-mcp` 目录下：

```bash
pnpm test:e2e:local-api-mcp
pnpm test:e2e:local-api-mcp:light
pnpm test:e2e:local-api-mcp:full
pnpm test:e2e:local-api-mcp:light:verbose
pnpm test:e2e:local-api-mcp:full:verbose
pnpm test:e2e:local-api-mcp:light:real
pnpm test:e2e:local-api-mcp:full:real
pnpm test:e2e:local-api-mcp:light:real:verbose
pnpm test:e2e:local-api-mcp:full:real:verbose
```

实际会调用 workspace 根目录的同名脚本。

## 先构建 MCP

stdio 子进程加载的是 `packages/local-api-mcp/build/index.js`，跑 e2e 前建议：

```bash
pnpm --filter local-api-mcp-typescript run build
```

## 真实 Local API（可选）

默认脚本已经开启真实 API（`ADSP_MCP_E2E_ENABLED=1`）；以下变量用于理解和覆写行为：

| 变量 | 轻量 | 全量 | 说明 |
|------|------|------|------|
| `ADSP_MCP_E2E_ENABLED=1` | 脚本内置 | 脚本内置 | 打开 `describe.skipIf` 下的真实 API 测试 |
| `ADSP_MCP_E2E_HIGH_IMPACT` | `0`（默认） | `1` | 高副作用工具 gate（如 `new-fingerprint/delete-cache-v2/share-profile`） |
| `PORT` | 可选 | 可选 | Local API 端口（core 默认 `50325`），需与本机 AdsPower 一致 |
| `API_KEY` | 可选 | 可选 | 若 Local API 启用了鉴权则设置 |
| `ADSP_LOCAL_API_MIN_INTERVAL_MS` | `1000`（脚本内置） | `1000`（脚本内置） | 请求最小间隔；测试超时会动态放宽 |

示例（也可直接用上面的 `*:real` 脚本）：

```bash
pnpm --filter local-api-mcp-typescript run build
PORT=50325 pnpm test:e2e:local-api-mcp:light

pnpm --filter local-api-mcp-typescript run build
PORT=50325 pnpm test:e2e:local-api-mcp:full
```

`readE2EEnv` 测试使用 `ADSP_LOCAL_API_BASE_URL` 与 `ADSP_MCP_E2E_ENABLED`；MCP 子进程访问 Local API 仍以 **`PORT` / `API_KEY`** 为准（见 `packages/core/src/constants/config.ts`）。

## Vitest 收集范围

`vitest.config.ts` 已包含：

- `packages/*/tests/*contracts.test.ts`
- `packages/local-api-mcp/tests/e2e-tool-validation/*.contracts.test.ts`

因此 `pnpm test:contracts` 也会收集该 e2e 文件；`test:e2e:local-api-mcp` 仅缩小到该文件便于回归。
