FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/client/ ./apps/client/

# Install dependencies
RUN npm ci

# Build the client
# (Ensure Vite knows about the API URL if needed, we'll pass it in docker-compose)
RUN npm run build --workspace=@crm/client

FROM nginx:alpine
# Copy built assets to Nginx
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
# Copy custom nginx config if we had one for routing, for now default is fine 
# or we can write a simple one inline to support React Router SPA fallback
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
