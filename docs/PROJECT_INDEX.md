# Project Index: broken-loop-brewing

Generated: 2026-03-09

## 📁 Project Structure

```text
.
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ components/
│  ├─ pages/
│  ├─ hooks/
│  ├─ contexts/
│  ├─ utils/
│  ├─ data/
│  ├─ types/
│  └─ config/
├─ api/
│  ├─ server.ts
│  ├─ lib/
│  │  ├─ services/
│  │  ├─ auth/
│  │  ├─ routes/
│  │  ├─ types/
│  │  └─ utils/
├─ lib/
│  ├─ services/
│  ├─ auth/
│  ├─ types/
│  └─ utils/
├─ public/
│  └─ data/ (JSON + markdown content for beers, food, events, styles)
├─ docs/ (architecture, auth, deployment, CSS, performance, env vars, etc.)
├─ scripts/ (content-generation and extraction tools)
└─ config & root files (tsconfig*.json, vercel.json, package.json, .prettierrc.json, .env.example)
```

## 🚀 Entry Points

- **Frontend app**: `src/main.tsx` – Vite React bootstrap and router mounting point.
- **Frontend shell**: `src/App.tsx` – top-level application layout and route composition.
- **API server**: `api/server.ts` – Node/Vercel entry for backend routes and services.
- **Build content**: `scripts/build-content-data.js` – prebuild step to aggregate markdown content into JSON.

## 📦 Core Modules

### Frontend application (`src/`)

- **Routing and pages**: `src/pages/*.tsx` – individual pages for home, beers, food, events, admin, FAQ, debug, style guide, responsive tests, etc.
- **Shared layout & UI**:
  - `src/App.tsx`, `src/components/Header/Header.tsx`, `src/components/Footer/Footer.tsx`
  - Section components like `HeroSection`, `OnTapSection`, `EventsSection`, `FoodSection`, `InstagramSection`
  - Utility UI such as `Button`, `Toast`, `InfoTabs`, `RouteLoader`, `ScrollToTop`, `ComingSoonSplash`, `MobileActionButtons`, `BusinessHoursModal`, `BusinessHoursTooltip`, `BeerCard`, `EventCard`, `FoodCard`, `AgeVerificationModal`, `ResponsiveTemplate`
- **State & context**:
  - `src/contexts/AuthContext.tsx` – authentication state and provider.
  - `src/contexts/ToastContext.tsx` – toast/notification system.
  - Hooks in `src/hooks/` – data fetching and derived state:
    - `useBeers`, `useBeersOptimized`, `useOptimizedBeers`, `useOptimizedBeerStyles`
    - `useFood`, `useOptimizedFood`, `useEvents`, `useBusinessStatus`
    - `useViewportConstraints`, `useOptimizedEvents`, `useAgeVerificationSettings`
- **Data and utilities**:
  - `src/data/` – brewery information and style-guide markdown.
  - `src/utils/api/` – API clients (`apiClient`, `authClient`, `devApiClient`, `mockData`).
  - `src/utils/*Loader.d.ts` – typed content loaders (beer, food, styles, events).
  - `src/utils/businessHours.ts`, `src/utils/styleSorting.ts`.
  - `src/config/auth.ts` – frontend auth configuration.
  - `src/types/` – shared type declarations for CSS modules and auth.

### Backend API (`api/`)

- **Server entry**:
  - `api/server.ts` – main server/handler entry used for local dev and deployment.
- **Routes**:
  - `api/lib/routes/contentRoutes.ts` – HTTP routes for content management and retrieval.
- **Auth & security**:
  - `api/lib/auth/config.ts` / `.d.ts` – auth configuration.
  - `api/lib/auth/jwt.ts` – JWT helpers.
  - `api/lib/auth/password.ts` – password hashing and verification.
  - `api/lib/auth/rateLimiter.ts` – request rate limiter.
  - `api/lib/auth/middleware.ts` – auth-related middleware.
- **Services**:
  - `api/lib/services/BeerService.ts` – CRUD and lookup logic for beers.
  - `api/lib/services/AdminService.ts` – admin account and auth logic.
  - `api/lib/services/FileService.ts` – file handling and uploads.
  - `api/lib/services/GitHubService.ts` – GitHub integration for content workflows.
  - `api/lib/services/ContentManagerService.ts` – higher-level content management operations.
  - `api/lib/services/ValidationService.ts` – request and payload validation helpers.
  - `api/lib/services/ConflictResolutionService.ts` – handles conflicting content updates.
- **Types & utilities**:
  - `api/lib/types/Beer.ts`, `api/lib/types/Admin.ts`, `api/lib/types/ContentManager.ts`.
  - `api/lib/utils/validation.ts` – schema and validation helpers.
  - `api/lib/utils/dropdowns.ts` – dropdown option generation for the admin UI.
  - `api/lib/utils/markdown.ts` – markdown parsing/HTML conversion for content.
  - `api/lib/utils/businessStatus.ts` – business open/closed state based on hours.
  - `api/lib/config/dropdowns.json` – backing config for dropdown utilities.

### Shared Node library (`lib/`)

- Mirrors much of `api/lib/` for use outside the API module:
  - Services: `lib/services/*.ts` (BeerService, AdminService, FileService, GitHubService).
  - Auth: `lib/auth/*` (config, jwt, password, rateLimiter, middleware).
  - Types: `lib/types/*.ts` (Beer, Admin) plus JS and d.ts builds.
  - Utils: `lib/utils/{validation,dropdowns,markdown}.ts`.
- Provides reusable, typed modules that can be imported by both API handlers and tooling.

### Content & data (`public/data` and `src/data`)

- **Public JSON data**:
  - `public/data/beers.json`, `public/data/beer-styles.json`
  - `public/data/food.json`, `public/data/events.json`, `public/data/business-status.json`
  - `public/data/age-verification.json`
- **Markdown content**:
  - Beer styles, beers, food, and event descriptions under `public/data/**` and `src/data/**`.
  - Templates in `public/data/templates/` and `src/data/templates/` for structured content authoring.

### Tooling & scripts (`scripts/`)

- Content and style extraction/build tools:
  - `scripts/build-content-data.js` – aggregates markdown content into JSON for runtime.
  - `scripts/extract-bjcp-*.cjs` / `.js` – BJCP style guide extraction utilities.
  - `scripts/extract-style-content.js`, `scripts/extract-styles-content.cjs`, `scripts/extract-all-styles.cjs`, `scripts/extract-bjcp-final.cjs`.
  - `scripts/kellerbier-test.cjs`, `scripts/test-patterns.cjs`.
- Auth helper:
  - `scripts/generatePasswordHash.js` – utility for generating bcrypt password hashes.

## 🔧 Configuration

- **Root configs**:
  - `package.json` – workspace metadata, dev/build/lint/format scripts, shared dependencies (React, Vite, TypeScript, Vercel, auth and markdown tooling).
  - `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` – TypeScript compiler options for app and Node targets.
  - `vercel.json` – deployment configuration for Vercel (routing, functions).
  - `.prettierrc.json` – Prettier formatting standards.
  - `.env.example` – documented environment variables for local and deployed environments.
- **API configs**:
  - `api/package.json` – API-specific scripts and dependencies.
  - `api/tsconfig.json` – TS config for API build.
  - `api/lib/config/dropdowns.json` – dropdown configuration for content/admin UIs.
  - `api/foundational-test-results.json`, `api/comprehensive-test-report.json` – stored API test results and reports.
- **Content configs**:
  - `lib/config/dropdowns.json` – shared dropdown configuration.
  - JSON content under `public/data/` – primary content sources consumed at runtime.

## 📚 Documentation

- **Root & components**:
  - `README.md` – high-level project overview and getting started.
  - `src/components/Button/README.md` – button component usage and examples.
  - `src/components/InfoTabs/README.md` – InfoTabs component API and patterns.
  - `src/data/templates/README.md` and `public/data/templates/README.md` – content templating guidance.
- **Docs folder (`docs/`)**:
  - `AUTHENTICATION_SETUP.md`, `QUICK_START_AUTH.md` – auth configuration, flows, and quick start.
  - `API_DOCUMENTATION.md` – API endpoints, payloads, and usage.
  - `ENVIRONMENT_VARIABLES.md` – env var reference for frontend and API.
  - `DEPLOYMENT_SOLUTION.md`, `PRODUCTION_DEPLOYMENT_CHECKLIST.md` – deployment architecture and production readiness.
  - `CSS_CUSTOM_PROPERTIES.md`, `CSS_VARIABLES_QUICK_REFERENCE.md` – design tokens and CSS variable usage.
  - `RESPONSIVE_DESIGN_STANDARDS.md`, `BREAKPOINT_STANDARDIZATION_SUMMARY.md` – responsive and breakpoint standards.
  - `PRETTIER_GUIDE.md` – formatting and code style conventions.
  - `PERFORMANCE_OPTIMIZATION_SUMMARY.md` – performance tuning summary and techniques.
  - `DEBUG_INFO_TABS.md` – debugging tools and InfoTabs diagnostics.
  - `github_integration.md`, `github-crud-system.md`, `github-crud-setup.md` – GitHub CRUD integration and automation.
  - `CURSOR_RULES_CONSOLIDATION_SUMMARY.md` – overview of Cursor rule configuration.
- **API-specific docs**:
  - `api/TEST_INVESTIGATION_REPORT.md` – detailed investigation notes and findings for API tests.

## 🧪 Test Coverage

- **Unit tests**: 0 dedicated `tests/**/*.{ts,js,py}` files detected.
- **Integration tests**: 0 `*.test.*` / `*.spec.*` files detected in the main workspace.
- **Reports**: API-level test result JSON files live under `api/` (`foundational-test-results.json`, `comprehensive-test-report.json`).
- **Coverage status**: Test harness and reports exist for the API; dedicated test files for the frontend have not yet been detected in this scan.

## 🔗 Key Dependencies

- **Runtime**:
  - `react`, `react-dom` – React 19 application core.
  - `react-router-dom` – client-side routing.
  - `@phosphor-icons/react` – icon set for UI.
  - `@octokit/rest` – GitHub API client.
  - `bcryptjs` – password hashing.
  - `jsonwebtoken` – JWT-based authentication.
  - `formidable` – file uploads and multipart parsing.
  - `gray-matter`, `remark`, `remark-html` – markdown parsing and HTML conversion.
  - `slugify` – URL-safe slug generation.
  - `uuid` – unique ID generation.
- **Tooling**:
  - `vite`, `@vitejs/plugin-react` – dev server and bundler.
  - `typescript`, `typescript-eslint`, `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` – TypeScript and linting.
  - `prettier`, `markdownlint-cli` – code and markdown formatting.
  - `concurrently` – run API and Vite dev servers together.
  - `vercel`, `vite-plugin-vercel`, `@vercel/node`, `@vercel/analytics` – deployment and analytics.
  - `rollup-plugin-visualizer` – bundle analysis.

## 📝 Quick Start

1. **Install dependencies**  
   - From the project root: `npm install`  
   - Then: `cd api && npm install`

2. **Run the app locally**  
   - From the project root: `npm run dev`  
   - This starts both the Vite frontend and the Node API; open the printed localhost URL (typically `http://localhost:5173`).

3. **Verify code quality**  
   - Run `npm run lint` to check for linting issues.  
   - Optionally run the API test workflows referenced in `api/foundational-test-results.json` and `api/comprehensive-test-report.json` for backend verification.

