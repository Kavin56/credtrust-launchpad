FROM node:18-slim AS builder
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npx prisma generate --schema=prisma/admin.schema.prisma
RUN npx prisma generate --schema=prisma/agent.schema.prisma
RUN npm run build

FROM node:18-slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production --ignore-scripts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/serviceAccountKey.json ./serviceAccountKey.json
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
