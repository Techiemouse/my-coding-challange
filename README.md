# Frontend Engineer Challenge

> **Please do not fork this repository.**

Start by reading [CHALLENGE.md](./CHALLENGE.md).

## Getting started

Requires Node 24.

```sh
npm install
npm run generate
npm run dev
```

## Key files

| Path             | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| `openapi.yaml`   | API spec                                                                       |
| `src/generated/` | Typed client and `createParty()`, generated from the spec (`npm run generate`) |
| `src/mocks/`     | Mock Service Worker handlers — requests appear in the Network tab              |

## Scripts

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `npm run dev`      | Start dev server                            |
| `npm run generate` | Regenerate typed client from `openapi.yaml` |
| `npm test`         | Run tests                                   |
| `npm run build`    | Type-check and build                        |
