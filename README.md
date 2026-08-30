# EnvEvidence

> *Explore the environmental evidence behind every place.*

---

## Overview

EnvEvidence is an evidence-backed environmental discovery and intelligence platform. It answers a single, disciplined core question:

> **What reliable environmental evidence exists about this place, issue, or environmental condition, what does it show, how strong is the evidence, what has changed, and what do we still not know?**

Rather than presenting an opinionated environmental score or a single headline number, EnvEvidence surfaces the underlying evidence — with full provenance, confidence levels, methodology notes, and transparent data gaps — so users can form their own informed judgments.

The platform covers **7 environmental domains**:

| Domain | Scope |
|--------|-------|
| **Water** | Water quality, dissolved oxygen, pH, heavy metals, contaminants, groundwater, surface water, drinking water safety |
| **Air** | PM2.5, PM10, NO₂, SO₂, O₃, CO, AQI, emissions, indoor air quality |
| **Carbon & Climate** | CO₂ emissions, greenhouse gases, climate projections, carbon intensity, temperature trends |
| **Plastic & Microplastic** | Microplastic concentration, plastic waste generation, polymer types, nanoplastics |
| **Chemical & Pollution** | Persistent organic pollutants, heavy metals, pesticides, industrial effluents, soil contamination |
| **Industrial Environment** | Factory emissions, EIA reports, industrial effluent monitoring, compliance status |
| **Research** | Scholarly publications, preprints, theses, academic datasets, institutional research |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix primitives) |
| Database | PostgreSQL via Prisma ORM (Supabase-hosted) |
| Validation | Zod 4 (input validation on all API routes) |
| Icons | Lucide React |
| State | Zustand (client-side navigation) |
| Fonts | Geist Sans + Geist Mono (via `next/font/google`) |

No paid dependencies are required for basic operation. The platform is designed as a **free-first architecture**: it runs without any paid API keys, though optional integrations (WAQI, OpenAlex, Crossref) enhance data coverage.

---

## Architecture

### Routing (App Router)

All routes use the Next.js App Router with proper file-based routing:

| Route | Purpose |
|-------|---------|
| `/` | Homepage — domain overview, search entry point |
| `/search` | Full-text search across locations, evidence, research, topics |
| `/location/[slug]` | Location Intelligence page — evidence, data gaps, timeline, summary for a specific place |
| `/evidence/[id]` | Evidence Detail — full provenance view of a single evidence record |
| `/environment/[domain]` | Environmental Domain page (water, air, carbon-climate, plastic-microplastic, chemical-pollution, industrial) |
| `/research` | Research Discovery — scholarly publications and academic datasets |
| `/sources` | Source Registry — all data sources with licensing, coverage, and health status |
| `/methodology` | Methodology — how evidence is collected, validated, and classified |
| `/professional` | Professional Intelligence — services, custom reports, inquiry form |
| `/legal` | Responsible Use — legal disclaimers, data policies, ethical guidelines |
| `/topics` | Topic explorer — cross-cutting environmental topics |
| `/admin` | Admin Dashboard — source health, verification status, data freshness, ingestion logs (password-protected) |

### API Routes

All API routes live under `src/app/api/` and are protected by Zod validation schemas:

| Endpoint | Method | Validation | Description |
|----------|--------|------------|-------------|
| `/api/search` | GET | `q`, `type`, `location`, `category` | Full search across all content types |
| `/api/locations` | GET | `slug`, `country`, `type` | Location lookup and listing |
| `/api/evidence/[id]` | GET | `id` (max 100 chars) | Single evidence record with full provenance |
| `/api/sources` | GET | — | Source registry listing |
| `/api/research` | GET | `q`, `topic` | Research items search |
| `/api/data-gaps` | GET | `location`, `category` | Data gap records by location or category |
| `/api/inquiry` | POST | `name`, `email`, `organization`, `serviceType`, `message` | Professional inquiry submission |

### Free-First Architecture

The platform operates without requiring any paid API keys. Optional integrations that add data coverage:

- **WAQI (World Air Quality Index)** — Real-time and historical air quality data
- **OpenAlex** — Scholarly publication metadata (free, no key required; email for polite pool)
- **Crossref** — DOI metadata and citation data (free, mailto for rate limits)

Without any of these configured, the platform still runs fully with seeded or manually ingested data.

---

## Getting Started

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **bun** as package manager
- A **Supabase** account (free tier sufficient) for PostgreSQL hosting

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/envevidence.git
cd envevidence

# 2. Copy the environment template
cp .env.example .env

# 3. Configure your Supabase PostgreSQL connection string in .env
#    DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# 4. Install dependencies
npm install

# 5. Generate Prisma client
npx prisma generate

# 6. Push the schema to your database
npx prisma db push

# 7. Start the development server
npm run dev
```

The application will be available at **http://127.0.0.1:3000**.

---

## Environment Variables

All configuration is done through environment variables. Copy `.env.example` to `.env` and fill in values.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string. Must point to a Supabase (or any PostgreSQL) database. Format: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Canonical site URL used for sitemap generation, Open Graph meta tags, and Twitter cards. Example: `https://envevidence.com` |
| `ADMIN_PASSWORD` | No | Simple password gate for the `/admin` route. If not set, defaults to `admin`. Set a strong value in production. |
| `WAQI_API_KEY` | No | API key for the World Air Quality Index. Enables real-time air quality data ingestion. Get a key at [waqi.info](https://waqi.info). |
| `OPENALEX_EMAIL` | No | Email address for the OpenAlex polite access pool. Not required — OpenAlex is free without a key — but provides higher rate limits. |
| `CROSSREF_MAILTO` | No | Email address for Crossref API polite pool. Used for DOI metadata lookups and citation data. |

Example `.env` file:

```env
# Database (PostgreSQL / Supabase)
DATABASE_URL="postgresql://postgres:mysecretpassword@db.abc123.supabase.co:5432/postgres"

# Site URL (for sitemap, canonical URLs, SEO)
NEXT_PUBLIC_SITE_URL="https://envevidence.com"

# Admin Password (simple auth for admin routes)
ADMIN_PASSWORD="your-strong-password-here"

# Optional: WAQI (World Air Quality Index)
# WAQI_API_KEY="your-waqi-token"

# Optional: OpenAlex (Scholarly Metadata)
# OPENALEX_EMAIL="your-email@example.com"

# Optional: Crossref (DOI Metadata)
# CROSSREF_MAILTO="your-email@example.com"
```

---

## Database

### Schema Overview

The Prisma schema defines **13 models** that form the complete evidence pipeline:

| Model | Purpose |
|-------|---------|
| `Location` | Geographic entities — cities, regions, water bodies, industrial facilities. Supports hierarchical parent/child relationships. |
| `EvidenceRecord` | Core data unit. Stores the measured/observed value, full provenance (source, methodology, dates), confidence level, verification status, and licensing. |
| `Source` | Source registry. Tracks data providers, API endpoints, licenses, commercial use terms, update frequency, geographic/temporal coverage, ingestion method, and health status. |
| `ResearchItem` | Scholarly publications — title, authors, DOI, abstract, journal, topic, and language. |
| `DataGap` | Explicit documentation of what is *not* known — availability, recency, geographic/temporal/parameter coverage, and source diversity. |
| `IntelligenceSummary` | AI-assisted or human-authored synthesis for a location: what we know, what changed, what matters, and what we don't know. |
| `TimelineEvent` | Chronological environmental events linked to locations and categories. |
| `UpdateLog` | Ingestion tracking — records added, updated, rejected, validation errors, and timing for each data source sync. |
| `User` | User accounts with roles (viewer, admin, etc.) and saved locations/research/evidence. |
| `Order` | Inquiries and service orders — tracks type, payment status, and notes. |
| `KnowledgeArticle` | Long-form knowledge content — articles, guides, explanations linked to categories, locations, and topics. |
| `EnvironmentalCategory` | The 7 environmental domains with multilingual names, icons, colors, and sort order. |
| `Parameter` | Specific measurable parameters (e.g., "PM2.5", "dissolved oxygen", "microplastic concentration") linked to a category. |

### Key Design Decisions

- **Every `EvidenceRecord`** carries full provenance: source, DOI, methodology, measurement method, observation date, retrieval date, license, commercial use status, attribution requirements, and a processing history field.
- **Confidence levels** (`HIGH`, `MEDIUM`, `LOW`, `UNVERIFIED`) are discrete tiers — not arbitrary numeric percentages.
- **Evidence types** distinguish between `measured`, `reported`, `estimated`, `modeled`, and `inferred` data.
- **Demo isolation**: All models include an `isDemo` boolean field, ensuring development fixtures can never be confused with verified production data.
- **Indexes** are defined on all commonly queried fields (slug, country, type, confidence, verificationStatus, etc.).

### Migration Commands

```bash
# Development: push schema changes directly (no migration files)
npx prisma db push

# Development: create and apply migration files (preferred for team work)
npx prisma migrate dev --name describe-your-change

# Production: apply all pending migrations (no interactive prompts)
npx prisma migrate deploy

# Reset database (destroys all data)
npx prisma migrate reset

# Regenerate the Prisma client after schema changes
npx prisma generate

# Open the database browser (if using Prisma Studio)
npx prisma studio
```

---

## Project Structure

```
.
├── .env.example                # Environment variable template
├── AGENTS.md                   # Permanent engineering rules for AI agents
├── README.md                   # This file
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
├── eslint.config.mjs            # ESLint configuration
├── components.json              # shadcn/ui component registry
├── Caddyfile                   # Caddy reverse-proxy config (optional)
├── prisma/
│   └── schema.prisma              # Database schema (13 models)
├── public/
│   ├── logo.svg                   # Site logo
│   ├── manifest.json              # PWA web app manifest
│   └── robots.txt                 # Static robots.txt (supplemented by app/robots.ts)
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout — SEO metadata, Open Graph, fonts
│   │   ├── page.tsx                  # Homepage controller
│   │   ├── globals.css               # Global styles, Tailwind base, theme tokens
│   │   ├── sitemap.ts                # Dynamic sitemap.xml generation
│   │   ├── robots.ts                 # Dynamic robots.txt generation
│   │   ├── search/page.tsx           # Search page
│   │   ├── location/[slug]/page.tsx # Location Intelligence page
│   │   ├── evidence/[id]/page.tsx    # Evidence Detail page
│   │   ├── environment/[domain]/page.tsx # Environmental Domain pages
│   │   ├── research/page.tsx          # Research Discovery page
│   │   ├── sources/page.tsx           # Source Registry page
│   │   ├── methodology/page.tsx       # Methodology page
│   │   ├── professional/page.tsx      # Professional Intelligence page
│   │   ├── legal/page.tsx             # Responsible Use / Legal page
│   │   ├── topics/page.tsx            # Topics explorer page
│   │   ├── admin/page.tsx             # Admin Dashboard (password-protected)
│   │   └── api/
│   ├── search/route.ts           # Search API (Zod-validated)
│   ├── locations/route.ts         # Locations API (Zod-validated)
│   ├── evidence/[id]/route.ts    # Evidence detail API
│   ├── sources/route.ts           # Source registry API
│   ├── research/route.ts          # Research search API (Zod-validated)
│   ├── data-gaps/route.ts         # Data gaps API
│   └── inquiry/route.ts          # Professional inquiry API (Zod-validated)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Site header with navigation and language switcher
│   │   │   └── Footer.tsx             # Site footer with links and legal
│   │   ├── home/
│   │   │   └── HomePage.tsx           # Homepage component — domain cards, search, intro
│   │   ├── search/
│   │   │   └── SearchView.tsx         # Search results view
│   │   ├── location/
│   │   │   └── LocationView.tsx       # Location Intelligence view
│   │   ├── evidence/
│   │   │   └── EvidenceDetail.tsx      # Evidence detail with full provenance
│   │   ├── research/
│   │   │   └── ResearchView.tsx        # Research discovery view
│   │   ├── admin/
│   │   │   └── AdminView.tsx          # Admin dashboard component
│   │   ├── common/
│   │   │   ├── SourcesView.tsx        # Source registry view
│   │   │   ├── MethodologyView.tsx    # Methodology page view
│   │   │   ├── KnowledgeView.tsx      # Knowledge base view
│   │   │   ├── LegalView.tsx          # Legal / Responsible Use view
│   │   │   └── TopicsView.tsx         # Topics explorer view
│   │   ├── professional/
│   │   │   └── ProfessionalView.tsx    # Professional Intelligence view
│   │   └── ui/                     # 50+ shadcn/ui components (Button, Card, Dialog, Table, etc.)
│   ├── lib/
│   │   ├── db.ts                    # Prisma database client (singleton pattern)
│   │   ├── i18n.ts                  # Multilingual translation system (6 languages)
│   │   ├── types.ts                 # TypeScript type definitions (all domain types)
│   │   └── utils.ts                 # Utility functions (cn, formatting, etc.)
│   ├── data/
│   │   └── demo/
│   │       └── locations.ts            # Isolated development fixtures (clearly labeled as NOT real data)
│   ├── store/
│   │   └── navigation.ts            # Zustand navigation state store
│   └── hooks/
│       ├── use-toast.ts             # Toast notification hook
│       └── use-mobile.ts            # Mobile viewport detection hook
```

---

## Data Philosophy

EnvEvidence is built on a set of non-negotiable principles:

### Data Without Traceable Sources Has Low Value

Every evidence record must trace back to an identifiable source. If the source is unknown, undocumented, or unverifiable, the record is marked `UNVERIFIED` — not hidden, not smoothed over, but presented honestly with its limitations visible.

### Never Fabricate Evidence

AI is used in the platform for three purposes only:
- **Summarization** — condensing long evidence records into readable intelligence summaries
- **Classification** — categorizing evidence into domains, types, and confidence tiers
- **Translation** — rendering content into multiple languages while preserving scientific accuracy

AI is **never** used as a source of truth. No environmental measurement, concentration value, or research finding is generated by AI. The `isAIGenerated` flag on `IntelligenceSummary` records makes this transparent.

### Evidence vs. Inference

The platform maintains a strict distinction between:
- **Evidence**: Directly measured or officially reported data with known methodology
- **Inference**: Derived, modeled, or estimated values that may be useful but carry additional uncertainty

Evidence types are tracked per record: `measured`, `reported`, `estimated`, `modeled`, `inferred`. These are displayed with distinct visual treatment throughout the UI.

### Confidence Framework

Confidence is expressed as one of four discrete levels — not arbitrary percentages:

| Level | Meaning |
|-------|---------|
| **HIGH** | Multiple independent sources, verified methodology, recent data, peer-reviewed or from authoritative institutions |
| **MEDIUM** | Single authoritative source or multiple lesser sources, reasonable methodology, data may be somewhat dated |
| **LOW** | Limited sources, uncertain methodology, old data, or significant gaps in provenance |
| **UNVERIFIED** | Source unconfirmed, methodology unknown, or data not yet reviewed by the platform |

### Data Gaps Are Features, Not Bugs

One of the platform's key differentiators is making data gaps explicit and prominent. For every location and domain, EnvEvidence documents:
- What data is available and how recent it is
- Geographic coverage limitations
- Temporal coverage gaps
- Parameter coverage gaps
- Source diversity (or lack thereof)
- Measurement frequency

**An absence of evidence is not evidence of absence.** When no reliable data exists for a location or parameter, the platform says so clearly rather than defaulting to averages, estimates, or silence.

---

## Multilingual Support

EnvEvidence supports **6 languages** with a built-in translation system:

| Code | Language | Script | Direction |
|------|----------|--------|-----------|
| `en` | English | Latin | LTR |
| `bn` | বাংলা | Bengali | LTR |
| `zh` | 中文 | Hanzi | LTR |
| `ja` | 日本語 | Kanji/Hiragana/Katakana | LTR |
| `ar` | العربية | Arabic | **RTL** |
| `ru` | Русский | Cyrillic | LTR |

### Design Principles

- **Arabic RTL support**: The layout automatically switches to right-to-left for Arabic, including navigation, text alignment, and UI components.
- **Scientific terms preserved**: Chemical names (PM2.5, NO₂, dissolved oxygen, pH), units (μg/L, mg/L, µm), and measurement values are always kept in English/Latin script regardless of the selected language.
- **Translation does not alter scientific meaning**: The i18n system is designed so that translation keys map to semantically equivalent phrases, not approximate translations.
- **Client-side locale switching**: Language is selected via the header language switcher and persisted in `localStorage`.

---

## Source / Provenance Architecture

Every piece of environmental data in EnvEvidence passes through a structured pipeline:

```
Source Registration
    ↓
Data Ingestion (API, dataset, manual entry)
    ↓
Validation (Zod schemas, type checks, range checks)
    ↓
Normalization (units, coordinates, dates, terminology)
    ↓
Provenance Attachment (source, DOI, methodology, license, dates)
    ↓
Verification (automated checks + human review)
    ↓
Database Storage (with isDemo, confidence, quality flags)
    ↓
Publication (visible on the platform with full transparency)
    ↓
Intelligence (summaries, timelines, data gap analysis)
```

### Source Registry

Every data source is registered as a `Source` record with:
- **Identity**: name, provider, URL, API endpoint
- **Licensing**: license type, commercial use terms, attribution requirements
- **Coverage**: geographic coverage, temporal coverage, data categories
- **Reliability**: reliability notes, update frequency
- **Health**: status (`active`/`degraded`/`error`), last successful fetch, next scheduled update, error count, last failure reason
- **Tracking**: linked `UpdateLog` records showing every ingestion attempt

---

## SEO / Generative Engine Optimization (GEO)

EnvEvidence is built for both traditional search engines and AI-powered answer engines:

### Implemented

- **Dynamic metadata**: Title, description, keywords, and template-based titles (`%s | EnvEvidence`) via Next.js `Metadata` API
- **Open Graph**: `og:title`, `og:description`, `og:type`, `og:site_name`, `og:url` on all pages
- **Twitter Cards**: `summary_large_image` card with title and description
- **Sitemap**: Dynamically generated at `/sitemap.xml` covering all static pages, domain pages, and (in production) all locations and evidence records
- **Robots.txt**: Dynamically generated at `/robots.txt` — allows all crawlers except on `/admin` and `/api/` routes
- **Semantic HTML**: Proper `<article>`, `<header>`, `<main>`, `<nav>`, `<section>`, `<footer>` elements throughout
- **Skip-to-content link**: Accessible skip link for keyboard navigation
- **PWA manifest**: `/manifest.json` for progressive web app support
- **Canonical URLs**: Set via `NEXT_PUBLIC_SITE_URL` and `metadataBase`

### Ready for Extension

- **Structured data (JSON-LD)**: The page architecture supports adding `@type` schemas for `Dataset`, `Organization`, and `WebPage` entities
- **Hreflang tags**: The i18n system supports adding `alternate` links for each locale
- **Dynamic location pages**: When production data is ingested, `/location/[slug]` pages with unique, indexable content will be added to the sitemap

---

## Deploying to Vercel

### Steps

1. **Push to GitHub**: Ensure your code is on a GitHub repository (public or private).

2. **Connect to Vercel**: Go to [vercel.com](https://vercel.com), click "Add New Project", and import your repository.

3. **Set environment variables** in the Vercel project settings:
   - `DATABASE_URL` — your Supabase PostgreSQL connection string
   - `NEXT_PUBLIC_SITE_URL` — your production URL (e.g., `https://envevidence.com`)
   - `ADMIN_PASSWORD` — a strong password for the admin route
   - `WAQI_API_KEY`, `OPENALEX_EMAIL`, `CROSSREF_MAILTO` — optional integrations

4. **Deploy**: Vercel will automatically detect Next.js, install dependencies, and build.

5. **Post-deploy migration**: After the first deployment, run the Prisma migration against your production database:
   ```bash
npx prisma migrate deploy
   ```
   Alternatively, set up a Vercel build command that includes migration:
   ```json
   {
     "buildCommand": "npx prisma generate && npx prisma migrate deploy && next build"
   }
   ```

6. **Verify**: Visit your Vercel URL and confirm the site loads correctly.

---

## Connecting Supabase

EnvEvidence uses Supabase for managed PostgreSQL hosting. Here's how to set it up:

1. **Create a Supabase project**: Go to [supabase.com](https://supabase.com) and create a new project (free tier is sufficient).

2. **Get the connection string**: In your Supabase project dashboard, go to **Settings → Database → Connection string → URI**. It will look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

3. **Set as DATABASE_URL**: Add this connection string to your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   ```

4. **Run migrations**: Push the Prisma schema to create all tables:
   ```bash
   npx prisma db push
   ```

5. **Verify**: Use Prisma Studio to browse your database:
   ```bash
   npx prisma studio
   ```

---

## Security

- **Environment variables never committed**: `.env` is in `.gitignore`. Only `.env.example` (with placeholder values) is in version control.
- **Zod input validation**: Every API route validates all input parameters with Zod schemas. Malformed or oversized inputs are rejected with `400` status codes.
- **Admin route protection**: The `/admin` page requires a password (configured via `ADMIN_PASSWORD`). Failed attempts show an error but reveal no system information.
- **No exposed server secrets**: All API keys (`WAQI_API_KEY`, `ADMIN_PASSWORD`) are server-side only. The `NEXT_PUBLIC_` prefix is used only for the site URL, which is intentionally public.
- **SQL injection prevention**: All database queries use Prisma's parameterized query builder. Raw SQL is not used anywhere in the codebase.
- **API route isolation**: The `robots.txt` configuration blocks all crawlers from `/api/` routes.
- **No user authentication on public routes**: The platform is read-only for visitors. Authentication (when implemented) will use Supabase Auth.

---

## Legal & Ethical

### Data Integrity

- **No fabricated data**: Every environmental measurement, research finding, or data point presented on the platform traces to a real, identifiable source. The platform will display "no data available" rather than generate plausible-looking numbers.
- **Public sources only**: Only data from publicly accessible sources, open government datasets, published research, and open APIs is used. No proprietary or paywalled data is ingested without proper licensing.
- **License compliance**: Every source's license terms, commercial use restrictions, and attribution requirements are tracked in the `Source` model and displayed on evidence records.

### Interpretation

- **Proximity is not causation**: The presence of an industrial facility near a location does not prove that facility is causing pollution. Such associations are presented as contextual information, not evidence of harm.
- **Data gaps are not evidence of absence**: The fact that no data exists for a parameter at a location does not mean that parameter is safe or within limits. The platform explicitly flags these gaps.
- **Not professional advice**: EnvEvidence provides environmental information and intelligence. It does not constitute legal, medical, engineering, or regulatory advice. Users should consult qualified professionals for decisions with health, safety, or legal implications.

---

## How to Add a New Source

To register a new data source in the platform:

1. **Create a `Source` record** in the database with all metadata: name, provider, URL, API endpoint, license, commercial use terms, geographic/temporal coverage, update frequency, and ingestion method.

2. **Create an ingestion function** (in a new file under `src/lib/sources/` or similar) that fetches data from the source's API or dataset. The function should handle pagination, rate limits, and error conditions.

3. **Validate** incoming data against Zod schemas that match the source's data structure. Reject records that fail validation and log the reasons in an `UpdateLog` record.

4. **Normalize** data to EnvEvidence's standard format: convert units, standardize coordinates, parse dates, and map the source's terminology to EnvEvidence categories and parameters.

5. **Store with provenance**: Create `EvidenceRecord` entries that link back to the `Source` record and include all available provenance fields (DOI, methodology, measurement method, collection date, etc.).

6. **Create an `UpdateLog`** record documenting the ingestion run: records added, updated, rejected, validation errors, and timing.

---

## How to Add a New Environmental Parameter

To add a new measurable parameter (e.g., "per- and polyfluoroalkyl substances (PFAS) concentration"):

1. **Identify or create the `EnvironmentalCategory`** the parameter belongs to (e.g., `chemical-pollution`).

2. **Create a `Parameter` record** linked to that category:
   - `slug`: URL-safe identifier (e.g., `pfas-concentration`)
   - `name`: Human-readable name
   - `unit`: Standard measurement unit (e.g., "ng/L")
   - `description`: What the parameter measures and why it matters

3. **Ingest data** from appropriate sources, creating `EvidenceRecord` entries linked to the new `Parameter`.

4. **Update data gap assessments** for locations where this parameter is now tracked (or where it remains unavailable).

---

## Demo Data

The `src/data/demo/` directory contains isolated development fixtures for testing the UI during development. These fixtures:

- Are clearly labeled with `isDemo: true` on every record
- Include prominent comments: `"NOT REAL ENVIRONMENTAL DATA"` and `"NEVER present this as verified environmental data"`
- Are only loaded when no real database data is available
- Should never be shipped to production or presented as real evidence

In production, demo records are filtered out by the `isDemo` flag on all queries.

---

## Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client (alias for npx prisma generate)
npm run db:push      # Push schema to database (alias for npx prisma db push)
npm run db:migrate   # Create and apply migration (alias for npx prisma migrate dev)
npm run db:migrate:deploy  # Apply pending migrations (alias for npx prisma migrate deploy)
npm run db:reset     # Reset database (alias for npx prisma migrate reset)
```

Note: `npm run db:generate` also runs automatically as a `postinstall` hook.

---

## License

MIT
