# syntax=docker/dockerfile:1

# ---------- Etapa 1: dependencias de producción ----------
FROM node:22-alpine AS deps
WORKDIR /app

# package*.json antes que el código para aprovechar la caché de capas
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Etapa 2: imagen final, solo lo necesario para ejecutar ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src

# Carpeta de logs con permisos para el usuario sin privilegios
RUN mkdir -p logs && chown node:node logs

USER node

EXPOSE 3000

CMD ["node", "src/server.js"]
