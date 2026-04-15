# local-api-mcp E2E 参数验证（快速参考）

（仓库根目录的 `docs/` 被 `.gitignore` 忽略，故使用说明放在本目录。）

## 根目录命令

```bash
# 仅跑 e2e 契约文件（含 MCP stdio + 可选真实 Local API 用例）
pnpm test:e2e:local-api-mcp
```

等价于：

```bash
pnpm exec vitest run --config vitest.config.ts packages/local-api-mcp/tests/e2e-tool-validation/e2e-tools-parameter-validation.contracts.test.ts
```

## 包内命令

在 `packages/local-api-mcp` 目录下：

```bash
pnpm test:e2e:local-api-mcp
```

实际会调用 workspace 根目录的同名脚本。

## 先构建 MCP

stdio 子进程加载的是 `packages/local-api-mcp/build/index.js`，跑 e2e 前建议：

```bash
pnpm --filter local-api-mcp-typescript run build
```

## 真实 Local API（可选）

默认仅跑不依赖 AdsPower 的契约；以下环境变量打开「真实 API」用例块：

| 变量 | 说明 |
|------|------|
| `ADSP_MCP_E2E_ENABLED=1` | 打开 `describe.skipIf` 下的真实 API 测试 |
| `PORT` | Local API 端口（core 默认 `50326`），需与本机 AdsPower 一致 |
| `API_KEY` | 若 Local API 启用了鉴权则设置 |

示例：

```bash
pnpm --filter local-api-mcp-typescript run build
ADSP_MCP_E2E_ENABLED=1 PORT=50325 pnpm test:e2e:local-api-mcp
```

`readE2EEnv` 测试使用 `ADSP_LOCAL_API_BASE_URL` 与 `ADSP_MCP_E2E_ENABLED`；MCP 子进程访问 Local API 仍以 **`PORT` / `API_KEY`** 为准（见 `packages/core/src/constants/config.ts`）。

## Vitest 收集范围

`vitest.config.ts` 已包含：

- `packages/*/tests/*contracts.test.ts`
- `packages/local-api-mcp/tests/e2e-tool-validation/*.contracts.test.ts`

因此 `pnpm test:contracts` 也会收集该 e2e 文件；`test:e2e:local-api-mcp` 仅缩小到该文件便于回归。
