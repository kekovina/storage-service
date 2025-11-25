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
| `image/gif`       |
| `image/bmp`       |
| `image/tiff`      |
| `image/svg+xml`   |
| `application/pdf` |
| `video/mp4`       |
| `video/webm`      |
| `video/ogg`       |

#### Environment

| env | description | required | default | example |
| :-- | :-- | :-- | :-- | :-- |
| `BEARER_TOKENS` | array of authorized tokens | + |  | ["token1", "token2"] |
| `ACCEPTED_MIME_TYPES` | accepted mime types |  | `image/png` ,`image/jpeg` , `image/webp`, `image/svg+xml` , `image/tiff`, `image/gif`, `image/bmp` , `application/pdf` , `video/mp4` ,`video/webm` ,`video/ogg` |  |
| `APP_PORT` | server port |  | 3000 | 5050 |
| `SWAGGER_ENABLED` | enabling swagger docs |  | 0 | 1 |
| `MAX_FILE_SIZE` | max file size in bytes |  | 5242880(5MB) | 5242880 |

## API Reference

#### Upload item

```http
  POST /{collection}
  Content-Type: multipart/form-data
  Authorization: Bearer {token}

  // Photo options
  photo[optimize]:boolean=false // optimization(convert to webp) - NOT supported for SVG
  photo[preview]:boolean=false // generate preview(convert to webp) - NOT supported for SVG
  photo[previewSize]:number=30-99 // preview size(percent of original image)
  photo[keepOriginalFilename]:boolean=false // keep original filename

  // Video options
  video[optimize]:boolean=false // optimization(convert GIF to WebM)
  video[keepOriginalFilename]:boolean=false // keep original filename

  // Default options (for other file types)
  default[keepOriginalFilename]:boolean=false // keep original filename

  // Global option (applies to all file types)
  keepOriginalFilename:boolean=false // keep original filename for all file types
```

**Notes:**
- By default, uploaded files are saved with a hashed filename (SHA-256 based). Set `keepOriginalFilename=true` to preserve the original filename.
- **SVG files cannot be optimized or converted to WebP.** Attempting to use `photo[optimize]=true` or `photo[preview]=true` with SVG files will result in an error with code `SVG_OPTIMIZATION_NOT_SUPPORTED`.
- **GIF files can be optimized to WebM format** using `video[optimize]=true`. This uses FFmpeg to convert animated GIFs to more efficient WebM videos.

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

- ✅ Video optimization (GIF to WebM conversion)
- Jest tests
