# Personal NAS Monorepo

Personal NAS is a self-hosted file management system with a Next.js frontend and a NestJS backend. This repository has been restructured for production-friendly conventions, cleaner boundaries, and easier deployment.

## Projects

- `client`: Next.js 16 (App Router) frontend
- `server`: NestJS API for file operations, media preview, and authentication
- `react-filemanager`: local source for the file manager library/demo

## Architecture

### Client (Next.js)

The client now follows a feature-first structure:

- `app`: route entrypoints and layout
- `src/config`: runtime environment access
- `src/shared`: shared infrastructure (HTTP client, token storage)
- `src/features/auth`: auth API + context
- `src/features/files`: file API + file manager UI + preview utilities

This keeps UI routes thin and pushes business logic into reusable modules.

### Server (NestJS)

The server keeps Nest modules (`auth`, `files`) and adds stronger request/runtime structure:

- DTO validation with `class-validator` + global `ValidationPipe`
- Centralized env/config helpers under `src/common/config`
- Safer file upload flow using disk-based temp storage (better for large files)
- Standardized auth token extraction and guard usage
- Improved Jest config to test source files only

## Key Features

- JWT login/logout/check flow
- Secure file APIs: list, upload, download, delete, rename, create folder
- Path traversal prevention (all paths constrained inside NAS root)
- Image thumbnails with cache (including RAW formats with embedded preview)
- Video streaming with HTTP range support
- Configurable CORS and rate limiting

## Environment Configuration

## Client environment

Use `client/.env` (local) or provide equivalent envs in deployment:

- `NEXT_PUBLIC_APP_NAME`: app title shown in UI metadata
- `NEXT_PUBLIC_API_BASE_URL`: API base used by browser (`/api` recommended)
- `API_PROXY_TARGET`: backend URL for Next.js rewrite proxy
- `NEXT_PUBLIC_DEFAULT_THUMBNAIL_WIDTH`: default thumbnail width

Recommended deployment pattern:

1. Keep `NEXT_PUBLIC_API_BASE_URL=/api`
2. Set `API_PROXY_TARGET` to your backend endpoint (for example `https://api.your-domain.com/api`)

This avoids browser CORS complexity and keeps frontend requests stable.

## Server environment

Use `server/.env` with values similar to `server/.env.example`:

- `PORT`
- `NAS_ROOT_DIR`
- `JWT_SECRET`
- `RATE_LIMIT_MAX`
- `CORS_ORIGIN`
- `UPLOAD_TMP_DIR`
- `THUMB_CACHE_DIR`

`UPLOAD_TMP_DIR` is optional; when omitted, uploads use the OS temp directory outside the repo.

## Local Development

### 1. Backend

```bash
cd server
npm install
npm run start:dev
```

Default: `http://localhost:3000`.

`npm run dev` is kept as a local alias for the same Nest watch mode.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Default: `http://localhost:3001`.

## Scripts

### Server

- `npm run dev`: Nest watch mode alias
- `npm run start:dev`: Nest watch mode
- `npm run build`: Nest CLI build
- `npm start`: start Nest app
- `npm run test`: run Jest tests

### Client

- `npm run dev`: Next dev server
- `npm run build`: production build
- `npm run start`: run production server

## API Summary

All endpoints are under `/api` at runtime.

### Auth

- `POST /api/auth/login`
- `GET /api/auth/check`
- `POST /api/auth/logout`

### Files

- `GET /api/files?path=<path>`
- `POST /api/files/upload`
- `GET /api/files/download?path=<path>&token=<token>`
- `DELETE /api/files`
- `POST /api/files/rename`
- `POST /api/files/folder`

### Images

- `GET /api/images/thumbnail?path=<path>&width=<width>&token=<token>`

## Git and Repository Hygiene

This repository now includes:

- root `.gitignore`
- `client/.gitignore`
- `server/.gitignore`

These ignore build artifacts, node modules, temp files, and private env files so the repository is ready to push to GitHub.

# personal-nas
