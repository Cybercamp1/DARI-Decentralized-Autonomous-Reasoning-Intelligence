# AI Startup Simulator

Single-page “mission control” dashboard where **5 AI agents stream live** (word-by-word) while simulating an AI startup across **5 automatic rounds**.

## Tech

- **Frontend**: React + Tailwind + Recharts (Vite)
- **Backend**: Node + Express
- **AI**: **Ollama** (local, no key — all five agents use your machine), **Groq** (free API), **OpenAI-compatible** (LM Studio), or **Gemini**. Configure `AI_PROVIDER` in `backend/.env` (see `.env.example`).
- **Streaming**: Server-Sent Events (SSE) over **POST** `/api/simulate`
- **State**: Zustand

## AI backends (pick one)

1. **Ollama (local — powers all agent roles)** — install [Ollama](https://ollama.com), then **`ollama pull llama3.2:3b`** (until you pull, you’ll see **404 model not found**). Run **`ollama list`** and set **`OLLAMA_MODEL`** in `backend/.env` to the **exact** name shown (often `llama3.2:3b`). With the backend running, **`GET http://localhost:8787/api/ollama/tags`** returns the same list. In `backend/.env`:
   - `AI_PROVIDER=ollama`
   - `OLLAMA_MODEL=llama3.2:3b`
   - `OLLAMA_MAX_CONCURRENT=1` recommended on laptops (Round 2 otherwise starts up to 4 chats; increase only if your GPU/RAM can handle it).

2. **Groq (cloud, free tier)** — key from [Groq Console](https://console.groq.com/keys). In `backend/.env`:
   - `AI_PROVIDER=groq`
   - `GROQ_API_KEY=...`

3. **LM Studio / OpenAI-compatible** — enable the local server, then:
   - `AI_PROVIDER=openai_compatible`
   - `OPENAI_BASE_URL=http://127.0.0.1:1234/v1` (or your server’s `/v1` URL)
   - `OPENAI_MODEL=` the id shown in LM Studio

4. **Gemini** — [Google AI Studio](https://aistudio.google.com/apikey), `AI_PROVIDER=gemini`, `GEMINI_API_KEY=...`. Default model is **`gemini-2.5-flash`** (`gemini-1.5-flash` often returns **404** on current APIs). Try **`gemini-2.5-flash-lite`** or **`gemini-flash-latest`** if needed.

5. **`AI_PROVIDER=auto`** — uses **Groq if `GROQ_API_KEY` is set**; else Gemini if a Gemini key exists; else **Ollama**. To keep a Gemini key in `.env` but **skip** it: `DISABLE_GEMINI=1`.

## Project structure

```
backend/
  server.js
  routes/simulate.js
  agents/
    ceo.js
    designer.js
    developer.js
    marketer.js
    finance.js
  utils/
    orchestrator.js
    llm.js
    sse.js
  .env.example

frontend/
  index.html
  vite.config.js
  tailwind.config.js
  postcss.config.js
  src/
    App.jsx
    main.jsx
    styles.css
    components/
      TopBar.jsx
      AgentPanel.jsx
      AgentAvatar.jsx
      StatusBadge.jsx
      MetricsDashboard.jsx
      RevenueChart.jsx
      InteractionFeed.jsx
      VerdictCard.jsx
      TypingIndicator.jsx
      ConnectionLines.jsx
    hooks/
      useSimulation.js
    utils/
      agentConfig.js
      formatters.js
```

## Setup

### 1) Backend env

Copy the example env file and add your key:

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` (see **`backend/.env.example`**). For fully local runs, use **`AI_PROVIDER=ollama`** and install Ollama + pull a model.

### 2) Install deps

```bash
cd backend
npm install

cd ..\frontend
npm install
```

### 3) Run

In two terminals:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Open the frontend at:

- `http://localhost:5173`

Backend runs at:

- `http://localhost:8787`

## API

### `POST /api/simulate`

Streams SSE events.

Body:

```json
{ "idea": "string", "speed": 1 }
```

Speed can be `1`, `2`, or `5`.

Event payloads are JSON and sent as SSE `data:` lines, e.g.:

```json
{ "type": "agent_token", "agent": "designer", "token": "hello", "round": 2 }
```

The backend may also emit:

```json
{ "type": "llm_provider", "provider": "gemini" }
```
