# Ponti API Backend

Backend API for the Ponti university application, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Clean Architecture**: Organized in layers (controllers, services, repositories, models)
- **TypeScript**: Full TypeScript support with strict type checking
- **Security**: JWT authentication, rate limiting, helmet security headers
- **Validation**: Request validation using Joi schemas
- **Testing**: Jest testing framework with MongoDB Memory Server
- **Logging**: Winston logger with different levels for different environments
- **Code Quality**: ESLint and Prettier for code formatting and linting

## Project Structure

```
src/
├── config/          # Configuration files (database, logger, etc.)
├── controllers/     # REST API controllers
├── middleware/      # Custom middleware functions
├── models/          # Mongoose data models
├── repositories/    # Data access layer
├── services/        # Business logic layer
├── routes/          # API route definitions
├── utils/           # Utility functions and helpers
├── validators/      # Joi validation schemas
└── types/           # TypeScript type definitions

tests/               # Test files
scripts/             # Utility scripts
docs/                # API documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

### Development

Start the development server:
```bash
pnpm dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build the project for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm type-check` - Run TypeScript type checking

### Environment Variables

See `.env.example` for all available environment variables and their descriptions.

### API Documentation

API documentation will be available at `/docs` once implemented.

### Health Checks

- `GET /health` - General health check
- `GET /health/db` - Database connection health check

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code structure and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Run `pnpm lint:fix` and `pnpm format` before committing

### Testing

- Write unit tests for services and utilities
- Write integration tests for API endpoints
- Maintain test coverage above 80%
- Use descriptive test names and organize tests logically

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Commit with descriptive messages
5. Create a pull request

## License

This project is licensed under the ISC License.