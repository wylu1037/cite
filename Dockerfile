# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ARG NPM_REGISTRY=https://registry.npmmirror.com
RUN npm install -g pnpm@10 --registry=$NPM_REGISTRY
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc ./
# 跳过生命周期脚本（此时还没有 prisma schema），client 生成放到 builder 阶段
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ./node_modules/.bin/prisma generate && pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# content 打底（compose 里会用卷覆盖，保证 md 改动免重建）
COPY --from=builder /app/content ./content
# 数据库迁移：手写 SQL + 极简执行器；pg 依赖由 standalone 对 adapter-pg 的追踪带进来
COPY --from=builder /app/prisma/migrations ./prisma/migrations
COPY --from=builder /app/scripts ./scripts
EXPOSE 3000
CMD ["node", "server.js"]
