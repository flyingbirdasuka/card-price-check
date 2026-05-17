# Card Price Check

Look up pricing links for Pokémon and Yu-Gi-Oh cards (Japanese), with AI-powered card scanning and Vinted NL price suggestions.

## Features

- **Photo scan** — upload a card photo, Claude AI reads the name and number for you
- **Multi-source links** — PriceCharting, Cardmarket, eBay completed listings
- **My price** — note down the price you found after checking condition
- **Vinted suggestion** — AI suggests a listing price for Vinted Netherlands based on market price + condition
- **History** — all lookups saved to Supabase, exportable as CSV

## Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy (async), Supabase (PostgreSQL)
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **AI**: Claude API (card photo scan + Vinted price suggestion)

## Getting started

### 1. Supabase

Run `supabase/schema.sql` in your Supabase project's SQL editor.

Get your database connection string from: Project Settings → Database → Connection string (URI mode). Replace `[YOUR-PASSWORD]`.

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL and ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev            # runs on :5173
```

## Environment variables

**backend/.env**
```
DATABASE_URL=postgresql+asyncpg://postgres:[password]@db.[ref].supabase.co:5432/postgres
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:8000
```

Get an Anthropic API key at [console.anthropic.com](https://console.anthropic.com).
