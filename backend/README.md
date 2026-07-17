<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Trade Journey Backend - A NestJS application for managing trading assets and projects with PostgreSQL database.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Database migrations

Migration SQL files live in [`src/migration/`](src/migration/) and are executed **only one time** each.

- On app startup, the backend runs pending migrations automatically.
- Executed migrations are tracked in Postgres table `public.schema_migrations` by filename.
- To apply migrations manually (without starting the HTTP server):

```bash
cd backend
npm run migrate
```

For production (after build):

```bash
cd backend
npm run build
npm run migrate:prod
```

## API Endpoints

### Asset Management

**Asset Types** (`/asset/type`)
- `GET /asset/type` - List all asset types
- `GET /asset/type/:id` - Get asset type by ID
- `POST /asset/type` - Create new asset type
- `PUT /asset/type` - Update asset type
- `PUT /asset/type/activeStatus` - Toggle asset type active status
- `DELETE /asset/type/:id` - Delete asset type

**Assets** (`/asset`)
- `GET /asset` - List all assets (with joined asset type data)
- `GET /asset/:id` - Get asset by ID
- `POST /asset` - Create new asset
- `PUT /asset` - Update asset
- `PUT /asset/activeStatus` - Toggle asset active status
- `DELETE /asset/:id` - Delete asset

**Projects** (`/project`)
- `GET /project` - List all projects
- `GET /project/:id` - Get project by ID
- `POST /project` - Create new project
- `PUT /project` - Update project
- `PUT /project/activeStatus` - Toggle project active status
- `DELETE /project/:id` - Delete project

### Trading Setup

**Checklist** (`/checklist`)
- `GET /checklist` - List all checklists
- `GET /checklist/:id` - Get checklist by ID
- `POST /checklist` - Create new checklist
- `PUT /checklist` - Update checklist
- `PUT /checklist/activeStatus` - Toggle checklist active status
- `DELETE /checklist/:id` - Delete checklist

**Strategy** (`/strategy`)
- `GET /strategy` - List all strategies (with linked checklists)
- `GET /strategy/:id` - Get strategy by ID
- `POST /strategy` - Create new strategy
- `PUT /strategy` - Update strategy
- `PUT /strategy/activeStatus` - Toggle strategy active status
- `DELETE /strategy/:id` - Delete strategy

**Portfolio** (`/portfolio`)
- `GET /portfolio` - List all portfolios (always joined with Project, Asset + Asset Type, and Strategy)
- `GET /portfolio/:id` - Get portfolio by ID (same joins as above)
- `POST /portfolio` - Create new portfolio. `TD05_CurrentBalance` is automatically set to the provided `initBalance` on creation
- `PUT /portfolio` - Update portfolio (name, project, asset, strategy, init balance, description, active status)
- `PUT /portfolio/activeStatus` - Toggle portfolio active status
- `DELETE /portfolio/:id` - Delete portfolio

Validation on `/portfolio` is enforced via a `ValidationPipe` scoped to `PortfolioController` only, so invalid payloads return `400` (this does not apply to other modules).

### General Setting

**Trade Result / Transaction Status** (`/transaction-status`)
- `GET /transaction-status` - List all transaction statuses (W, L, B, C, P)
- `GET /transaction-status/:id` - Get transaction status by ID
- `POST /transaction-status` - Create new transaction status
- `PUT /transaction-status` - Update transaction status
- `PUT /transaction-status/activeStatus` - Toggle active status

### Transaction

**Transaction** (`/transaction`) - read & create only

- `GET /transaction` - List all transactions (joined with Portfolio name and Transaction Status text/color). Optional query `?portfolioId=<id>` filters by portfolio.
- `GET /transaction/:id` - Get transaction by ID.
- `POST /transaction` - Create a transaction and atomically update the linked portfolio's statistics in a single DB transaction.

Body: `{ portfolioId, amount, fees?, resultValue }` where `resultValue` is one of `W` (win), `L` (loss), `B` (break-even). Any other value (e.g. `C`, `P`) is rejected with `400`.

Create logic (all within one DB transaction):
- The portfolio row is locked with `SELECT ... FOR UPDATE`; a missing portfolio returns `404`.
- `fees` is stored on the transaction row but does not affect the portfolio balance.
- After each create, the portfolio's `CM05_Value` is set to the new transaction's result.
- Win rate is recomputed as `round(win / (win + loss) * 100)` (`0` when there are no W/L trades).

**Win (`W`)**: `currentBalance += amount`; consecutive win `+= 1`; consecutive loss reset to `0`; `sumConsecutiveWin` and `maxProfitAmount` updated to running maxima; total trade `+= 1`; total win `+= 1`; total break-even reset to `0`.

**Loss (`L`)**: rejected with `400` if `currentBalance < amount`; otherwise `currentBalance -= amount`; consecutive loss `+= 1`; consecutive win reset to `0`; `sumConsecutiveLoss` and `maxLossAmount` updated to running maxima; total trade `+= 1`; total loss `+= 1`; total break-even reset to `0`.

**Break-even (`B`)**: `currentBalance` unchanged; total trade `+= 1`; total break-even `+= 1`; `sumTotalBreakEven` updated to running maximum. Consecutive win/loss streaks are left untouched.

Validation on `/transaction` is enforced via a `ValidationPipe` scoped to `TransactionController`.

## Database Schema

### Common Schema
- `CM01_AssetType` - Asset type definitions (Gold, Forex, Stocks, etc.)
- `CM02_Asset` - Trading assets (XAUUSD, EURUSD, etc.) with foreign key to CM01

### Trading Setup Schema
- `TD01_Project` - Trading projects
- `TD02_Checklist` - Pre-trade decision checklist items
- `TD03_Strategy` - Trading strategies (with linked checklists via `TD04_StrategyChecklist`)
- `TD05_Portfolio` - Trading portfolios; each portfolio belongs to one Project (many-per-one), references exactly one Asset (one-per-one), and optionally one Strategy (one-per-one). Accumulates trade statistics (consecutive win/loss streaks, max profit/loss, total trades, win rate, etc.) that are updated when transactions are created.

### Common Schema (Trade Result)
- `CM03_TransactionStatus` - Transaction result definitions (W = win, L = loss, B = break even, C = cancel, P = pending) with a color code used by the frontend.

### Transaction Schema
- `TS01_Transaction` - Recorded trades belonging to a portfolio (`TD05_Id`). Stores `TS01_Amount`, `TS01_Fees`, and `CM03_Value` (the result). Creating a row atomically updates the parent `TD05_Portfolio` statistics.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
