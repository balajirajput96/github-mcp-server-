# Build dependencies and TypeScript output before omitting development tooling.
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# Keep the runtime image limited to compiled code and production dependencies.
FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S mcp -u 1001
USER mcp

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
