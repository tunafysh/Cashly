# Cashly

A modern financial management application built with Next.js, featuring transaction tracking, budgeting, subscriptions management, and intelligent AI-powered insights through Model Context Protocol (MCP) integration.

## Features

- **Transaction Management** - Track income and expenses with detailed categorization
- **Budget Planning** - Set and monitor spending budgets across categories
- **Subscription Tracking** - Manage recurring subscriptions and get alerts
- **Summary Dashboard** - Get comprehensive financial summaries and insights
- **Category Management** - Organize transactions with custom categories
- **User Profiles** - Multi-account support with profile management
- **AI Integration** - Natural language parsing and MCP server integration for intelligent analysis
- **Export Functionality** - Export transaction data to CSV/Excel
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Prerequisites

- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **PostgreSQL** 12+ database
- Environment variables configured (see below)

## Environment Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Database Configuration
PGHOST=localhost
PGPORT=5432
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=cashly

# Auth Configuration
NEXTAUTH_URL=http://localhost:3000

# MCP Configuration (optional)
MCP_SERVER_URL=http://localhost:3001
```

To generate a secure `NEXTAUTH_SECRET`:

```bash
NEXTAUTH_SECRET=$(openssl rand -base64 32) >> .env.local
```

## Installation & Setup

1. **Install dependencies:**

```bash
pnpm install
```

> [!NOTE]
> you can use npm but pnpm is really preferred cuz it's just better there's no discussion.

2. **Setup the database:**

First, ensure PostgreSQL is running and create the database:

```bash
createdb cashly
```

Then run migrations:

```bash
pnpm run db:push  # or use drizzle-kit
```

3. **Start the development server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter
- `pnpm format` - Format code with Biome

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes (auth, categories, transactions, etc.)
│   ├── app/            # Main application pages (dashboard, budget, transactions, etc.)
│   ├── login/          # Authentication pages
│   └── signup/
├── components/         # React components
│   ├── elements/       # Page-specific components
│   └── ui/             # Reusable UI components (shadcn-based)
├── db/                 # Database configuration
│   ├── queries/        # Database query functions
│   └── schema/         # Drizzle ORM schema definitions
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and helpers
```

## Technology Stack

- **Framework:** Next.js 16 with React 19
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** NextAuth v5
- **Styling:** Tailwind CSS with shadcn/ui components
- **Charts:** Recharts
- **Code Quality:** Biome (linting & formatting)
- **AI Integration:** Model Context Protocol (MCP)

## Development

### Code Quality

This project uses Biome for linting and formatting. Run checks with:

```bash
pnpm lint      # Check for issues
pnpm format    # Auto-format code
```

### Database Migrations

When modifying the database schema, use Drizzle Kit:

```bash
drizzle-kit push:pg      # Apply migrations to database
drizzle-kit studio      # Open Drizzle Studio to view/manage data
```

## Deployment

The application is configured for deployment on Vercel. Push to your repository and connect it to Vercel for automatic deployments.

Ensure all environment variables are set in your Vercel project settings.

## Contributing

Please follow the existing code style and run `pnpm format` before committing changes.
