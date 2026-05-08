# ReplyAI

**AI-powered review reply generator for small businesses.**

Paste any customer review and get 3 professional reply variations instantly — tailored to your business type, chosen tone, and the customer's sentiment.

## Features

- **Smart Detection** — Automatically detects if a review is Positive, Negative, or Neutral
- **5 Tones** — Professional, Friendly, Apologetic, Empathetic, or Enthusiastic
- **27 Business Types** — Restaurant, Cafe, Salon, Clinic, Retail, E-commerce, and more
- **3 Variations** — Get 3 different reply drafts to choose from
- **Copy to Clipboard** — One click to copy any reply
- **Regenerate** — Click to get a fresh set of variations
- **Rate Limiting** — 10 requests per hour per browser to prevent abuse
- **Admin Panel** — Switch AI providers and monitor daily usage at `/admin`

## Tech Stack

- React 19 + TypeScript
- TanStack Router + TanStack Start (SSR)
- Tailwind CSS v4
- Convex (serverless backend + real-time database)
- AI providers: Groq, Google Gemini, Anthropic Claude, OpenAI

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

This will create a new Convex project and print your deployment URL. Copy it.

### 3. Configure environment

```bash
cp .env.example .env.development.local
```

Edit `.env.development.local` and set `VITE_CONVEX_URL` to your Convex deployment URL.

### 4. Set your AI provider key

You only need one. Groq is free and recommended to start:

```bash
npx convex env set GROQ_API_KEY your_groq_key_here
```

Get a free key at [console.groq.com](https://console.groq.com).

Other supported providers:
```bash
npx convex env set GEMINI_API_KEY     your_key  # Free — 1,500 req/day
npx convex env set ANTHROPIC_API_KEY  your_key  # Paid
npx convex env set OPENAI_API_KEY     your_key  # Paid
```

### 5. Set admin password

```bash
npx convex env set ADMIN_PASSWORD your_secure_password
```

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Visit [http://localhost:3000/admin](http://localhost:3000/admin) to select the active AI provider.

## Deployment

```bash
npm run build
node .output/server/index.mjs
```

## Legal

- [Terms of Service](/terms)
- [Privacy Policy](/privacy)
