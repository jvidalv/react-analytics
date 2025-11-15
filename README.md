# React Analytics

Privacy-first analytics platform for React applications. Track user behavior, monitor errors, and gain insights without compromising privacy.

## Open Source

This project is open source and self-hostable. Built with modern web technologies and designed for developers who want full control over their analytics data.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/jvidalv/react-analytics.git
cd react-analytics/web

# Install dependencies
yarn install

# Start PostgreSQL database
yarn db

# Push database schema
yarn db:push

# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **PostgreSQL** - Primary database (via Docker)
- **Drizzle ORM** - Type-safe database queries
- **NextAuth** - Authentication with Google OAuth
- **Stripe** - Payment processing
- **Tailwind CSS** - Styling
- **Zod** - Schema validation

## Analytics Package

This monorepo includes the `@jvidalv/react-analytics` package in `packages/analytics`. This is the open source npm package that enables analytics tracking in React applications.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
DATABASE_URL=postgresql://admin:admin@localhost:5434/expofast_local_db
AUTH_SECRET=your-secret-key
```

### OAuth Providers (Google & GitHub)

For authentication, configure at least one OAuth provider:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Optional Variables

```env
# Stripe (only required if using payment features)
STRIPE_SECRET_KEY=your-stripe-key
```

## License

MIT License - feel free to use this project for personal or commercial purposes.
