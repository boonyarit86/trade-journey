# Trade Journey Frontend

A **Vite + React 19 + TypeScript** application for managing trading assets and projects. Built with Ant Design, React Query, and feature-based architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests
npm run test

# Run e2e tests (requires Playwright - see below)
npm run test:e2e

# Build for production
npm run build

# Lint code
npm run lint
```

## Tech Stack

- **React 19** - UI library
- **TypeScript 6** - Type safety
- **Vite 8** - Build tool and dev server
- **Ant Design 6** - UI component library
- **React Router 7** - Client-side routing
- **TanStack Query 5** - Server state management
- **Axios** - HTTP client
- **Vitest** - Unit testing framework
- **Testing Library** - React component testing
- **Playwright** - End-to-end browser testing

## Features

### Asset Management
- **Asset Types**: Manage categories like Gold, Forex, Stocks, Crypto
- **Asset Items**: Manage specific trading instruments (XAUUSD, EURUSD, etc.)
- Full CRUD operations with active/inactive status toggle
- Joined queries showing asset type names with assets

### Project Management
- Create and manage trading projects
- Track project status and metadata
- Full CRUD operations

### Trading Setup
- **Checklist**: Pre-trade decision checklist management
  - Create custom checklist items (e.g., "Without emotional", "Trading in specific time")
  - Mark items as required or optional
  - Toggle active/inactive status
  - Full CRUD operations with modal forms
- **Strategy**: Trading strategy management
  - Create strategies with name, risk/reward ratio, risk per trade %, and description
  - Link one or many checklists to each strategy via multi-select
  - Toggle active/inactive status
  - Full CRUD operations; strategy queries always include linked checklists

### Testing
- Comprehensive unit tests for API services
- Component tests with React Testing Library
- All tests passing with proper mocks and cleanup
- Playwright e2e tests for the Strategy feature (`e2e/strategy.spec.ts`)

## API Integration

The frontend connects to the NestJS backend API. Make sure the backend is running on the configured API URL (default: check `VITE_API_URL` in environment).

### Environment Variables

Create a `.env` file in the frontend folder:

```env
VITE_API_URL=http://localhost:3000
```

## Folder Structure

```
src/
├── main.tsx                 # App entry point
├── app/                     # App shell and providers
├── routes/                  # Router configuration
│   ├── index.tsx           # Route definitions
│   └── config.ts           # Menu configuration
├── pages/                   # Page components
│   ├── DashboardPage.tsx
│   ├── ProjectPage.tsx
│   ├── AssetTypePage.tsx
│   ├── AssetItemPage.tsx
│   ├── ChecklistPage.tsx
│   └── StrategyPage.tsx
├── features/                # Feature modules
│   ├── auth/               # Authentication
│   ├── dashboard/          # Dashboard
│   ├── project/            # Project management
│   ├── checklist/          # Trading checklist
│   ├── strategy/           # Trading strategy (with checklist links)
│   ├── asset/
│   │   ├── assetType/     # Asset type CRUD
│   │   └── assetItem/     # Asset item CRUD
│   └── tasks/              # Task management
├── e2e/                     # Playwright end-to-end tests
├── layout/                  # Layout components
├── shared/ui/              # Reusable UI components
└── test/                   # Test configuration
```

## Development Notes

### Code Organization
- Feature-based folder structure keeps related code together
- Each feature has its own components, services, types, and tests
- Shared UI components live in `shared/ui/`
- API services use Axios with proper error handling
- React Query manages server state with automatic caching and refetching

### Testing Strategy
- Unit tests for API services with mocked Axios
- Component tests with React Testing Library
- Mock data fixtures for consistent testing
- All Ant Design components properly mocked for jsdom environment
- Tests run in isolated forks for proper cleanup
- Playwright e2e tests require a running dev server and backend

### Playwright Setup (E2E)

After `npm install`, install Playwright browsers once:

```bash
npx playwright install chromium
```

Then run e2e tests (starts dev server automatically):

```bash
npm run test:e2e
```

> Note: If `npm install` fails due to root-owned `node_modules`, fix permissions first:
> `sudo chown -R $(whoami):staff node_modules`

## License

Private / educational use — adjust as needed for your project.
