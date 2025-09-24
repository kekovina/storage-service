# Storage Service

![NestJS](https://img.shields.io/badge/nestjs-%23000000.svg?style=for-the-badge&logo=nestjs&logoColor=ea2864) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) 

This server allows you to create and manage image collections using the rest API.

## How to use

### Docker CLI

```bash
  docker pull kekovina/storage-service:lasets
  docker run -e "BEARER_TOKENS=<TOKENS>" -e ACCEPTED_MIME_TYPES=application/pdf,image/jpeg -v /path/to/data:/app/uploads -d kekovina/storage-service:latest
```

### Docker compose

1. Add `docker-compose.yml`

```yml
---
static-server:
  image: kekovina/storage-service:latest
  container_name: storage-service
  restart: always
  ports:
    - 8081:${APP_PORT:3000}
  environment:
    - BEARER_TOKENS=${BEARER_TOKENS}
    - ACCEPTED_MIME_TYPES=${ACCEPTED_MIME_TYPES}
    - APP_PORT=${APP_PORT}
  volumes:
    - "${path-to-or-anon-volume}:/data/uploads"
```

#### Supported MIME-types

| Type              |
| :---------------- |
| `image/png`       |
| `image/jpeg`      |
| `image/webp`      |
| `image/tiff`      |
| `application/pdf` |
| `video/mp4`       |
| `video/webm`      |
| `video/ogg`       |

#### Environment

| env | description | required | default | example |
| :-- | :-- | :-- | :-- | :-- |
| `BEARER_TOKENS` | array of authorized tokens | + |  | "token1,token2" |
| `ACCEPTED_MIME_TYPES` | accepted mime types |  | `image/png` ,`image/jpeg` , `image/webp` , `image/tiff` , `application/pdf` , `video/mp4` ,`video/webm` ,`video/ogg` |  |
| `APP_PORT` | server port |  | 3000 | 5050 |
| `SWAGGER_ENABLED` | enabling swagger docs |  | 0 | 1 |
| `MAX_FILE_SIZE` | max file size in bytes |  | 5242880(5MB) | 5242880 |

## API Reference

#### Upload item

```http
  POST /{collection}
  Content-Type: multipart/form-data
  Authorization: Bearer {token}

  photo[optimize]:boolean=true // optimization(convert to webp)
  photo[preview]:boolean=true // generate preview(convert to webp)
  photo[previewSize]:number=30-99 // preview size(percent of original image)
```

Files field name will be set as filename on server

If collection doesn`t exists, it will be created.

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

- Video optimization
- Jest tests
