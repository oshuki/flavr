# Backend

Flavr Backend - API Proxy & Security Layer

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
# Then start dev server
npm run dev
```

Server läuft auf: `http://localhost:3000`

---

## 📁 Structure

```
backend/
├── src/
│   ├── index.ts          # Main server (Hono + Express)
│   └── index.test.ts     # Unit tests
├── dist/                 # Compiled TypeScript (gitignored)
├── coverage/             # Test coverage (gitignored)
├── .env.local            # Local secrets (gitignored)
├── .env.example          # Environment template
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript config
├── vitest.config.ts      # Test config
├── TESTING.md            # Test documentation
└── README.md             # This file
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server (requires build) |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Open Vitest web UI |
| `npm run test:coverage` | Generate coverage report |

---

## 🔌 API Endpoints

### `/health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-16T...",
  "service": "flavr-backend"
}
```

### `POST /api/claude`
Proxy to Claude API (Anthropic)

**Request:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1000,
  "messages": [
    { "role": "user", "content": "Deine Nachricht" }
  ]
}
```

### `GET /api/image-proxy`
Proxy for external images (Pollinations.ai)

**Query params:**
- `url` - Image URL to proxy

**Allowed hosts:**
- `image.pollinations.ai`

### `POST /api/bring/*`
Placeholder for Bring API integration

---

## 🔐 Environment Variables

See `.env.example` for all required variables:

```bash
# Required
CLAUDE_API_KEY=sk-ant-...
SENTRY_DSN_BACKEND=https://...

# Optional
PORT=3000
NODE_ENV=development
```

---

## 🧪 Testing

See [TESTING.md](./TESTING.md) for complete testing guide.

**Quick test:**
```bash
npm test
```

---

## 🚀 Deployment

### Railway.app (Recommended)

1. Create Railway project
2. Connect GitHub repo
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

**Environment variables needed:**
- `CLAUDE_API_KEY`
- `SENTRY_DSN_BACKEND`
- `PORT` (Railway provides this)
- `NODE_ENV=production`

See [DEPLOYMENT.md](../DEPLOYMENT.md) for full guide.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Hono (fast web framework)
- **Adapter:** Express (for local dev)
- **TypeScript:** Full type safety
- **Testing:** Vitest + c8 coverage
- **Monitoring:** Sentry
- **Dev Tools:** tsx (TypeScript runner)

---

## 📚 Learn More

- [Hono Documentation](https://hono.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Sentry Node.js Guide](https://docs.sentry.io/platforms/node/)
