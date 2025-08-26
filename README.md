# Fastify Static Server

![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![RollupJS](https://img.shields.io/badge/RollupJS-ef3335?style=for-the-badge&logo=rollup.js&logoColor=white)

This server allows you to create and manage image collections using the rest API.

## How to use

### Docker CLI

```bash
  docker pull kekovina/fastify-static-server:latest
  docker run --env "BEARER_TOKENS=<TOKENS>" -v /path/to/data:/ststic-data/static -d kekovina/fastify-static-server:latest
```

### Docker compose

1. Add `docker-compose.yml`

```yml

---
static-server:
  image: kekovina/fastify-static-server:latest
  container_name: static-server
  restart: always
  ports:
    - 8081:3000
  environment:
    - BEARER_TOKENS=${BEARER_TOKENS}
  volumes:
    - "${path-to}:/static-data/static"
```

#### Environment

| env             | description                | default | example              |
| :-------------- | :------------------------- | :------ | :------------------- |
| `BEARER_TOKENS` | array of authorized tokens | -       | ["token1", "token2"] |
| `PORT`          | server port                | 3000    | 5050                 |

## API Reference

#### Upload item

```http
  POST /{collection}
  Content-Type: multipart/form-data
  Authorization: Bearer {token}
```

Files field name will be set as filename on server

If collection doesn`t exists, it will be created.

Available mime types:

| Type            |
| :-------------- |
| `image/png`     |
| `image/jpeg`    |
| `image/gif`     |
| `image/webp`    |
| `image/svg+xml` |

#### Get item

```http
  GET /{collection}/{filename}
```

#### Get items from collection

```http
  GET /{collection}
  Authorization: Bearer {token}
```

#### Get all collections

```http
  GET /collections
  Authorization: Bearer {token}
```

#### Drop item

```http
  DELETE /{collection}/{filename}
  Authorization: Bearer {token}
```

#### Drop collection

```http
  DELETE /{collection}
  Authorization: Bearer {token}
```

## Roadmap

- Image optimization
- Jest tests
