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

## Database Schema

### Common Schema
- `CM01_AssetType` - Asset type definitions (Gold, Forex, Stocks, etc.)
- `CM02_Asset` - Trading assets (XAUUSD, EURUSD, etc.) with foreign key to CM01

### Trading Setup Schema
- `TB01_Project` - Trading projects
- `TD02_Checklist` - Pre-trade decision checklist items

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
