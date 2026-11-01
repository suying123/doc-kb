# 文档知识库管理系统（doc-kb）

Day 15–21 实战项目：用 **Vue 3 + TypeScript + Pinia + Vue Router + MSW** 实现一个可登录、可增删改查、带处理状态机与轮询进度的文档知识库管理后台。

界面不追求花哨，重点在于把「类型系统 / 组合式函数 / 状态管理 / 路由守卫 / 异步竞态 / 权限控制」这些工程能力真正落到代码里。

---

## 功能清单

- 登录 / 退出，token 与用户信息持久化到 localStorage
- 路由守卫：未登录跳转登录页并携带 `redirect`；角色不匹配跳 404
- RBAC 权限：管理员（增删改）、编辑者（增改）、只读（仅查看）
- 文档列表：分页、关键词搜索、状态筛选、按标题 / 大小 / 创建时间排序
- 文档详情：元信息展示、标签、状态说明、失败原因
- 文档状态机：`pending → processing → ready / failed`
- 处理进度轮询：`setTimeout` 递归，解析完成后自动停止
- 新建 / 编辑文档：表单校验、防重复提交；删除与批量删除二次确认
- 全局 Toast 提示、空状态、错误状态、404 页面
- 全量 Mock 后端（MSW 拦截 fetch），无需启动任何服务

---

## 技术栈

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| Vue | 3.5.x | `<script setup lang="ts">`、Composition API |
| TypeScript | 5.9.x | strict 模式、`verbatimModuleSyntax` |
| Vite | 8.x | 开发与构建 |
| Vue Router | 5.x | 路由守卫、路由懒加载 |
| Pinia | 4.x | Setup Store 写法 |
| MSW | 3.x | Mock Service Worker |
| vue-tsc | 3.x | 单文件组件类型检查 |

> TypeScript 固定在 `~5.9.3`：当前 `vue-tsc` 尚不兼容 TypeScript 7（原生预览版）的包导出结构。等你日后升级时，先确认 vue-tsc 的兼容范围。

---

## 快速开始

```bash
cd D:\study\doc-kb
pnpm install
pnpm dev
```

打开终端提示的地址（默认 <http://localhost:5173>）。若端口被占用，Vite 会自动切换端口，以终端输出为准。

### 演示账号

密码统一为 `123456`，登录页可点击账号卡片自动填充。

| 邮箱 | 姓名 | 角色 | 权限 |
| --- | --- | --- | --- |
| admin@demo.com | 张三 | 管理员 | 查看、新建、编辑、删除、解析 |
| editor@demo.com | 李四 | 编辑者 | 查看、新建、编辑、解析 |
| viewer@demo.com | 王五 | 只读 | 仅查看 |

### 常用脚本

```bash
pnpm dev            # 启动开发服务器
pnpm lint           # ESLint 检查
pnpm lint:fix       # ESLint 自动修复
pnpm format         # Prettier 格式化
pnpm format:check   # 只检查格式，不改文件
pnpm typecheck      # vue-tsc 类型检查
pnpm test           # Vitest 单次运行
pnpm test:watch     # Vitest 监听模式
pnpm test:coverage  # 生成覆盖率报告（coverage/）
pnpm build          # 类型检查 + 生产构建
pnpm preview        # 预览构建产物
```

---

## 目录结构

```
doc-kb/
├─ public/
│  └─ mockServiceWorker.js      # MSW 生成的 Service Worker
├─ src/
│  ├─ api/                      # 接口层：只负责发请求
│  │  ├─ http.ts                # fetch 封装、超时、token 注入、401 回调
│  │  ├─ auth.ts
│  │  └─ documents.ts
│  ├─ components/               # 通用组件
│  │  ├─ AppLayout.vue          # 侧边栏 + 顶栏 + RouterView
│  │  ├─ DataTable.vue          # 文档表格（选择 / 排序 / 行点击）
│  │  ├─ DocForm.vue            # 新建 / 编辑弹窗
│  │  ├─ DocStatus.vue          # 状态徽标 + 进度条
│  │  ├─ ModalDialog.vue        # 通用弹窗（defineModel）
│  │  ├─ Pagination.vue         # 分页器
│  │  ├─ EmptyState.vue
│  │  ├─ ErrorState.vue
│  │  └─ ToastHost.vue
│  ├─ composables/              # 可复用逻辑
│  │  ├─ useTable.ts            # 分页表格 + requestId 竞态保护
│  │  ├─ usePolling.ts          # setTimeout 递归轮询
│  │  ├─ useDebounceFn.ts       # 防抖
│  │  └─ usePermission.ts       # 角色判断
│  ├─ directives/
│  │  └─ permission.ts          # v-permission 指令
│  ├─ mocks/                    # Mock 后端
│  │  ├─ db.ts                  # 内存数据（43 条文档）
│  │  ├─ handlers.ts            # 接口实现
│  │  └─ browser.ts
│  ├─ router/index.ts           # 路由表 + 守卫 + RouteMeta 类型扩展
│  ├─ stores/
│  │  ├─ auth.ts                # token / user / login / logout
│  │  └─ toast.ts
│  ├─ types/index.ts            # 全局类型：Doc、DocStatus、PageResult…
│  ├─ utils/format.ts           # 文件大小、时间格式化
│  ├─ views/
│  │  ├─ LoginView.vue
│  │  ├─ DocListView.vue
│  │  ├─ DocDetailView.vue
│  │  └─ NotFoundView.vue
│  ├─ App.vue
│  ├─ main.ts
│  └─ style.css
├─ index.html
├─ tsconfig.json
└─ vite.config.ts
```

分层纪律：`views` 只做展示与交互编排，数据请求走 `api`，跨页状态放 `stores`，复用逻辑放 `composables`。不要在组件里直接 `fetch`。

---

## 关键实现说明

### 1. 类型是接口契约

`src/types/index.ts` 定义了 `Doc`、`DocStatus`、`PageResult<T>`、`ApiResponse<T>` 等。接口层 `request<T>` 是泛型函数，调用方拿到的返回值天然带类型，改字段时编译器会帮你找出所有受影响的位置。

`DocStatus` 是字符串字面量联合类型，`DocStatus.vue` 里用 `switch` 做穷尽判断，新增状态时 TypeScript 会提示遗漏分支。

### 2. useTable：分页 + 竞态保护

快速切换筛选条件时，先发出的慢请求可能后返回，覆盖掉新结果。`useTable` 内部维护递增的 `requestId`，只接受最后一次请求的响应。

```ts
const current = ++requestId
const res = await fetcher(...)
if (current !== requestId) return
```

### 3. usePolling：setTimeout 递归而不是 setInterval

`setInterval` 会在请求未完成时继续堆叠，导致请求风暴。这里每次任务结束后再排下一次，并在组件卸载时 `clearTimeout`。

### 4. defineModel：组件双向绑定

`ModalDialog`、`DocForm`、`Pagination` 都用 `defineModel` 声明 `v-model`，父组件写起来和原生组件一致：

```vue
<ModalDialog v-model:visible="showDelete" ... />
<Pagination :page="page" :total-pages="totalPages" @update:page="setPage" />
```

### 5. 权限的两层控制

- 逻辑层：`usePermission()` 返回 `canEdit` / `canDelete`，控制按钮是否渲染、请求是否发起
- 视图层：`v-permission="['admin']"` 指令可直接移除无权限的 DOM 节点

注意：前端权限只是体验优化，真实项目必须由后端再次校验。

### 6. 状态机驱动 UI

详情页根据 `doc.status` 计算提示文案与操作按钮：

| 状态 | 页面提示 | 可用操作 |
| --- | --- | --- |
| pending | 尚未解析 | 开始解析 |
| processing | 自动刷新进度 | 无（等待） |
| ready | 解析完成 | 重新解析 |
| failed | 展示失败原因 | 重试解析 |

---

## 工程约束与测试

项目从 Day 22 起补上了工程基线，避免「本地能跑、改一行就崩」。

- **ESLint 9**：`eslint.config.js`（flat config），接入 `typescript-eslint`、`eslint-plugin-vue`，并声明浏览器全局变量
- **Prettier 3**：`.prettierrc.json` 统一风格，`format:check` 可在 CI 中拦截未格式化代码
- **Vitest 5 + happy-dom + Vue Test Utils**：配置在 `vitest.config.ts`
- **GitHub Actions**：`.github/workflows/ci.yml`，依次执行 install → lint → format:check → typecheck → test → build

当前共 **26 个测试**，重点覆盖：

| 文件 | 验证内容 |
| --- | --- |
| `utils/format.test.ts` | 文件大小、日期格式化的边界值 |
| `composables/useTable.test.ts` | 分页、搜索重置、**竞态保护（慢请求不覆盖新结果）**、错误态 |
| `composables/usePolling.test.ts` | 立即执行、按间隔重复、完成停止、失败继续、卸载清理 |
| `composables/usePermission.test.ts` | admin / editor / viewer / 未登录四种权限 |
| `components/DocStatus.test.ts` | 四种状态文案、进度条显示与 0–100 裁剪 |
| `components/Pagination.test.ts` | 区间文案、前后翻页事件、首尾禁用、省略号 |

其中竞态测试和轮询清理测试最值得反复读，它们验证的正是 Agent 开发里最容易出问题的异步边界。

---

## Mock 说明

- 开发环境（`import.meta.env.DEV`）会自动启动 MSW，无需配置
- 生产构建默认不启用；如需启用，设置 `VITE_USE_MOCK=true` 后再构建
- 数据保存在内存中，**刷新页面会重置**（登录态除外）
- 处理进度是模拟的：每次查询 `GET /api/docs/:id` 推进 25%，四次后变为已就绪
- 想改数据量或账号，编辑 `src/mocks/db.ts`

首次克隆项目后如果缺少 `public/mockServiceWorker.js`，执行：

```bash
npx msw init public/ --save
```

---

## 已知限制与下一步

当前是纯前端 + Mock 的完整闭环，刻意没有做：

- 真实后端与数据库（可作为下一步：Node + Fastify/NestJS + PostgreSQL）
- 文件上传与解析（真实 RAG 链路：上传 → 切分 → 向量化 → 检索）
- 数据持久化（刷新重置）
- 单元测试与端到端测试

建议的练习顺序：

1. 把 `handlers.ts` 换成真实后端，保持 `api/` 层签名不变，体会接口契约的价值
2. 给 `useTable` 和 `usePolling` 补 Vitest 单元测试
3. 增加「批量解析」与「按标签筛选」，练习数组操作与查询参数设计
4. 把列表页改造成「文档 → 切片 → 检索结果」三段式，接入第 7 周的 RAG 内容
