FROM node:22-slim AS builder
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npx prisma generate --schema=prisma/admin.schema.prisma
RUN npx prisma generate --schema=prisma/agent.schema.prisma
RUN npm run build

FROM node:22-slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npx prisma generate --schema=prisma/admin.schema.prisma
RUN npx prisma generate --schema=prisma/agent.schema.prisma
COPY --from=builder /app/node_modules/@credtrust ./node_modules/@credtrust
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
