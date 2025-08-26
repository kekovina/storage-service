# Указываем версию на этапе сборки
FROM node:22-alpine AS build

ARG VERSION=dev
ENV VERSION=$VERSION

WORKDIR /app

COPY package.json ./package.json
RUN npm pkg set scripts.prepare="echo 'skip prepare'"
RUN npm install

COPY . .
RUN npm run build

# Финальный образ
FROM node:22-alpine

ARG VERSION=dev
ENV VERSION=$VERSION
LABEL org.opencontainers.image.version=$VERSION

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json

RUN npm pkg set scripts.prepare="echo 'skip prepare'"
RUN npm install --production

CMD ["node", "dist/index.js"]
