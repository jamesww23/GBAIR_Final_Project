# Company Wiki MVP – Nexus Dynamics

Role-based AI chatbot over a company knowledge base with vector search, access control, and project overlap detection.

## How to Run

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ with [pgvector](https://github.com/pgvector/pgvector) extension installed
- An OpenAI API key (or compatible endpoint)

### 1. Create the database

```bash
createdb company_wiki_mvp
psql company_wiki_mvp < database/schema.sql
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env and set:
#   DATABASE_URL=postgres://postgres:postgres@localhost:5432/company_wiki_mvp
#   OPENAI_API_KEY=sk-...
```

### 3. Install dependencies

```bash
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 4. Seed the database

```bash
cd server && npm run seed && cd ..
```

This inserts 26 fictional documents (8 projects, 12 policies, 6 comms), chunks them, generates embeddings, and builds the vector index. Takes ~30 seconds depending on API latency.

### 5. Start the server

```bash
cd server && npm start
# Listening on http://localhost:3001
```

### 6. Start the client (separate terminal)

```bash
cd client && npm run dev
# Open http://localhost:5173
```

## Usage

Select a role from the dropdown (Employee, HR, Finance, President). Each role sees different documents based on access control:

| Role      | Access Levels                  |
|-----------|-------------------------------|
| Employee  | GENERAL                       |
| HR        | GENERAL, HR                   |
| Finance   | GENERAL, FINANCE              |
| President | GENERAL, HR, FINANCE, EXEC    |

### Tabs
- **Chat** – Ask questions about the company. Answers cite source documents.
- **Project Overlap** – Enter a new project idea to find similar existing projects.
- **Stock & News** – View mocked external data (also available via chat keywords).

## Example Curls

### Chat

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "x-user-role: PRESIDENT" \
  -d '{"message": "What is Project Horizon about?"}'
```

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "x-user-role: EMPLOYEE" \
  -d '{"message": "Tell me about the remote work policy"}'
```

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "x-user-role: FINANCE" \
  -d '{"message": "What are the latest stock price and news?"}'
```

### Project Overlap

```bash
curl -X POST http://localhost:3001/api/overlap \
  -H "Content-Type: application/json" \
  -H "x-user-role: EMPLOYEE" \
  -d '{"idea": "Build an AI chatbot for internal knowledge search"}'
```

### External Mocks

```bash
curl http://localhost:3001/api/stock
curl http://localhost:3001/api/news
```

## Architecture

```
client (React+Vite :5173) ──proxy──> server (Express :3001)
                                        │
                                        ├─ /api/chat      → embed query → pgvector search (ACL filtered) → LLM
                                        ├─ /api/overlap   → embed idea  → pgvector search (PROJECT only + ACL) → LLM
                                        ├─ /api/stock     → mocked JSON
                                        └─ /api/news      → mocked JSON
                                        │
                                   PostgreSQL 15 + pgvector
```

## Tech Stack

- **Backend:** Node.js 20, Express
- **Database:** PostgreSQL 15 + pgvector (IVFFlat cosine index)
- **Frontend:** React 18, Vite
- **LLM:** OpenAI-compatible API (gpt-4o-mini default)
- **Embeddings:** text-embedding-3-small (1536 dim)
- **Auth:** Mock role via `x-user-role` header
