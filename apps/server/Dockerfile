FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Install all dependencies (workspaces)
RUN npm ci

# Build the server and shared packages
RUN npm run build --workspace=@crm/shared
RUN npm run build --workspace=@crm/server

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/server/package*.json ./apps/server/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled outputs
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=@crm/server"]
