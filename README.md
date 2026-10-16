# 部门知识库

fumadocs 文档站 + 极简后台 + 站内 Ask AI（向量检索 + 内网 LLM 带引用回答）。

- 前台 `/docs`：无登录（内网边界），中文全文搜索
- 后台 `/admin`：账号登录，md 在线编辑 / 草稿发布 / 版本历史（git）/ 一键回滚 / 图片上传 / 侧栏配置
- 问答 `/ask`：基于站内已发布文档的 RAG 问答，带引用来源

## 内容在哪、怎么存

`content/` 是内容根目录（部署时挂到 `data/content` 卷）：

- `docs/` 已发布文档（`.md` / `.mdx`），`drafts/` 草稿，`media/` 图片
- 该目录本身是 git 仓库：每次发布/回滚自动提交，版本历史就是 git 历史
- 侧栏由各目录的 `meta.json` 控制（标题、排序、图标），后台「侧栏配置」可视化编辑
- 发布即生效，无需重建镜像

## 本地开发

```bash
pnpm install
pnpm dev          # 默认 http://localhost:3000
```

- 无数据库、无 AI 配置也能跑：问答降级为检索直出，embedding 走 mock 伪向量
- 需要真环境时复制 `.env.example` 为 `.env` 填值（见下）
- 类型检查：`pnpm types:check`

## 内网部署（Ubuntu + docker compose）

```bash
# 1) 依赖：docker + compose 插件（无需 Node）
# 2) 准备配置
cp .env.example .env
#    改 ADMIN_PASSWORD / SESSION_SECRET（≥32 字符）；AI 端点已内置默认值
# 3) 种子内容（首次）
mkdir -p data/content && cp -r content/* data/content/
# 4) 启动
docker compose up -d --build
```

- web 监听 `:3000`（先 IP+端口访问）；db 是 pgvector 容器，数据在卷 `pgdata`，不对外映射端口
- **启动时自动执行迁移**（`scripts/migrate.mjs` 按序执行 `prisma/migrations/*.sql`，含建表和 pgvector 扩展）
- 若服务器无外网：本机 `docker compose build` 后 `docker save` 镜像拷入 `docker load`；节点镜像也可同样方式预载

### 部署后 5 分钟验证清单

```bash
docker compose exec web node scripts/check-ai.mjs   # 核对 embedding 实际维度、LLM 回复（不碰数据库）
```

1. 浏览器打开 `http://<ip>:3000/docs`：五个板块、中文搜索可用
2. `/admin` 登录 → 「重建索引」：应显示 文档 N（更新 N）/ 分块 M，且无失败
3. `/ask` 问一个文档里有的问题：答案带 `[n]` 引用，下方列出来源链接
4. `/admin` 新建一篇草稿 → 发布 → 站点即时可见 → 回滚验证

> 若 `check-ai` 报 `EMBEDDING_DIM` 不一致：改 `.env` 的 `EMBEDDING_DIM`，并同步
> `prisma/schema.prisma` 与 `prisma/migrations/` 里 `vector(N)` 的 N，再重新 `docker compose up -d --build` 与重建索引。

## AI 配置

| 变量 | 说明 |
| --- | --- |
| `OPENAI_API_BASE` / `OPENAI_API_KEY` / `LLM_MODEL_NAME` | 内网 vLLM 网关（dsv4）。网关不校验 key 时填 `EMPTY` |
| `EMBEDDING_API_URL` | **完整接口地址**，含 `/v1/embeddings`（Qwen3-Embedding-8B，原生 4096 维） |
| `EMBEDDING_MODEL_NAME` / `EMBEDDING_DIM` | 模型名与输出维度，必须与数据库 `vector(N)` 一致 |

- 不配 LLM：问答自动降级为「检索片段直出」；不配 embedding：用 mock 伪向量（仅联调，不要用于生产检索）
- 4096 维超过 pgvector hnsw 索引对 `vector` 类型的 2000 维上限，当前规模用顺序扫描；日后若截断维度到 ≤2000 可补索引
- **重建索引是手动动作**：后台按钮触发，按文件 hash 增量跳过；发布/删除文档后点一下即可
- 接口已在 `lib/rag/` 抽象，日后换本地模型只需改 provider 分支

## 备份与恢复

```bash
# 内容（唯一不可丢的资产；md 本身就是纯文本 + git 历史）
tar czf kb-content-$(date +%F).tgz data/content

# 数据库（丢了也能从 content 完整重建：重建索引即可）
docker compose exec db pg_dump -U kb kb > kb-db-$(date +%F).sql
```

恢复：内容直接解包回 `data/content`；数据库 `psql < 备份.sql` 或直接空库 + 重建索引。

## 升级

```bash
git pull && docker compose up -d --build
```

内容在卷里不受影响；新迁移会在容器启动时自动执行。

## 常见问题

- **发布后站点没变化？** 正常情况即时生效；确认改的是 `docs/`（草稿不会上站）
- **问答找不到答案？** 先确认该文档已发布且重建过索引；检索按文档去重，每篇最多两块
- **后台密码忘了？** 改 `.env` 的 `ADMIN_PASSWORD` 重启 web 即可
- **侧栏顺序不对？** 后台「侧栏配置」调 `meta.json`，保存即生效
