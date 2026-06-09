Yes, Madhu. You can keep your **website on GitHub Pages** and deploy your backend API services separately on free or near-free platforms.

Your setup should look like this:

```text
GitHub Pages website
https://mkalaimalai-residence.github.io
        |
        | calls REST APIs
        v
Free API backend
https://home-api.onrender.com or https://api.yourdomain.com
        |
        v
Free PostgreSQL database
Supabase / Neon / Render Postgres
```

## Best free deployment approach

For your use case, I would do this:

| Component    | Free option                                             | Why                                                                                                                                               |
| ------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Website      | **GitHub Pages**                                        | Already working for your static residence website. GitHub Pages supports free public repository hosting and custom domains. ([GitHub Docs][1])    |
| Backend API  | **Render Free Web Service**                             | Simple GitHub-based deployment for FastAPI, Node.js, or Spring Boot. Render supports free web services on its free Hobby workspace. ([Render][2]) |
| Database     | **Supabase Free PostgreSQL**                            | Gives you managed Postgres, Auth, Storage, Edge Functions and APIs. Supabase positions itself as a Postgres development platform. ([Supabase][3]) |
| File storage | **Supabase Storage** or **Cloudflare R2 / MinIO later** | Store PDFs, drawings, renders, invoices, warranties                                                                                               |
| API docs     | **FastAPI Swagger/OpenAPI**                             | Auto-generated API docs                                                                                                                           |
| CI/CD        | **GitHub Actions**                                      | Deploy automatically when you push code                                                                                                           |

## Simple recommended stack

```text
Frontend:
  GitHub Pages
  Static website / React / Vite / Next.js static export

Backend:
  FastAPI
  Python
  REST APIs
  OpenAPI docs

Database:
  Supabase PostgreSQL free tier

Deployment:
  Render free web service
  GitHub connected deployment
```

## Option 1: Easiest free setup

### Use GitHub Pages + Render + Supabase

```text
GitHub Pages
  hosts website

Render
  hosts FastAPI backend

Supabase
  hosts PostgreSQL database and optional file storage
```

This is the easiest and cleanest MVP setup.

### Pros

```text
Easy to deploy
No server management
Connects directly to GitHub
Good for MVP
Works with FastAPI
OpenAPI docs available
```

### Cons

```text
Free backend may sleep when idle
Cold start delay is possible
Free database limits apply
Not ideal for production traffic
```

Render’s free web services are useful for prototypes, but free services can have limitations such as sleeping after inactivity. Render’s documentation confirms free deployment is available for certain service types. ([Render][2])

## Option 2: Fully serverless free setup

### Use GitHub Pages + Cloudflare Workers + Supabase

```text
GitHub Pages
  hosts website

Cloudflare Workers
  hosts lightweight API

Supabase
  hosts PostgreSQL
```

This is good if your APIs are simple CRUD APIs.

### Pros

```text
Very fast
No cold server to manage
Good free tier
Great for lightweight APIs
```

### Cons

```text
Not ideal for heavy Python workloads
FastAPI will not run directly as normal
Better for JavaScript / TypeScript APIs
```

Use this only if you are comfortable building APIs in TypeScript.

## Option 3: GitHub Pages + Supabase only

For the simplest version, you may not need your own backend at all.

```text
GitHub Pages frontend
        |
        v
Supabase generated REST APIs
        |
        v
PostgreSQL tables
```

Supabase can expose APIs directly over Postgres and also provides Auth and Storage. ([Supabase][3])

### Pros

```text
No backend service needed
Fast to build
Great for admin dashboards and simple data entry
Free to start
```

### Cons

```text
Business logic becomes harder
Complex domain rules are harder
Service-to-service architecture not possible
Need careful row-level security
```

For your current stage, this may be the fastest way to create a working API.

## My recommendation for you

Start like this:

```text
Phase 1:
GitHub Pages + Supabase only

Phase 2:
Add FastAPI backend on Render when domain logic grows

Phase 3:
Move to AWS / GCP / Azure when it becomes a real business
```

## Phase 1 architecture

```text
GitHub Pages website
  |
  | JavaScript calls Supabase APIs
  v
Supabase
  - PostgreSQL
  - Auth
  - Storage
  - Row Level Security
```

Use this for:

```text
Projects
Rooms
Documents
Vendors
Quotes
BOQ
Snags
Decisions
Learnings
```

## Phase 2 architecture

```text
GitHub Pages website
  |
  v
FastAPI backend on Render
  |
  v
Supabase PostgreSQL
```

Use FastAPI when you need:

```text
Quote comparison logic
Vendor scoring
Approval workflows
Document processing
AI search
PDF extraction
Complex permissions
Integration with external APIs
```

## Example deployment steps

### Step 1: Keep website on GitHub Pages

Your website stays here:

```text
https://mkalaimalai-residence.github.io
```

GitHub Pages can host from a branch and also supports custom domains. ([GitHub Pages][4])

### Step 2: Create Supabase project

Create tables:

```sql
projects
spaces
documents
vendors
quotes
quote_line_items
boq_line_items
snags
decisions
learnings
```

Enable Row Level Security later when you add login.

### Step 3: Create FastAPI backend

Folder:

```text
home-construction-api
  app
    main.py
    modules
      project
      vendor
      quote
      document
      quality
    shared
      database.py
      config.py
```

### Step 4: Deploy backend to Render

Render can deploy from a Git repository and provide a live HTTPS URL for web services. ([Render][5])

Typical commands:

```text
Build command:
pip install -r requirements.txt

Start command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Step 5: Add CORS in FastAPI

Allow your GitHub Pages website to call your API:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Home Construction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mkalaimalai-residence.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 6: Call API from your website

```javascript
const response = await fetch("https://your-api.onrender.com/projects");
const projects = await response.json();
```

## Best free choices by maturity

| Stage                | Website                   | API                  | Database               |
| -------------------- | ------------------------- | -------------------- | ---------------------- |
| Prototype            | GitHub Pages              | Supabase direct APIs | Supabase Postgres      |
| MVP                  | GitHub Pages              | Render FastAPI       | Supabase Postgres      |
| Better free/low-cost | Cloudflare Pages          | Cloudflare Workers   | Supabase / Neon        |
| Production           | Vercel / Cloudflare / AWS | AWS ECS / Lambda     | AWS RDS / Supabase Pro |

## Important caution

Free tiers are excellent for prototypes, but they are not reliable for production. Railway currently offers a free trial with credits, then paid usage after that, so it may not be truly free long-term. ([Railway][6]) Supabase free projects can be good for MVPs, but watch database, storage and bandwidth limits. ([Supabase][7])

## Final recommendation

Use this now:

```text
GitHub Pages for website
Supabase Free for PostgreSQL and Storage
FastAPI on Render Free for backend API
GitHub Actions for deployment
```

This gives you a working, low-cost platform without over-engineering. Later, when the business becomes serious, move backend and database to a paid managed setup.

[1]: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site?utm_source=chatgpt.com "Configuring a custom domain for your GitHub Pages site"
[2]: https://render.com/docs/free?utm_source=chatgpt.com "Deploy for Free – Render Docs"
[3]: https://supabase.com/?utm_source=chatgpt.com "Supabase | The Postgres Development Platform."
[4]: https://pages.github.com/?utm_source=chatgpt.com "GitHub Pages documentation - GitHub Docs"
[5]: https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026?utm_source=chatgpt.com "Platforms with a real free tier for developers in 2026"
[6]: https://railway.com/pricing?utm_source=chatgpt.com "Pricing"
[7]: https://supabase.com/pricing?utm_source=chatgpt.com "Pricing & Fees"
