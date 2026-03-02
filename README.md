# ContactHub - Sales CRM

A modern, responsive CRM application built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Contact Management**: Add, edit, and organize contacts with groups and favorites
- **Company Tracking**: Manage business accounts and relationships
- **Deal Pipeline**: Kanban-style deal management with stages and probabilities
- **Activity Logging**: Track calls, emails, meetings, and notes
- **Task Management**: Organize follow-ups and daily activities
- **Reports Dashboard**: Analytics and performance insights
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Sprint 4 Features

- Deal Detail pages with activity timelines
- Global Activity Feed with filtering
- Tasks & Follow-ups management
- Reports dashboard with aggregated analytics
- Add/Edit Deal slide-over component
- Log Activity modal dialog

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm (not yarn or pnpm)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contact-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Initialize the database:
```bash
npm run dev
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

## Pages

- `/` - Dashboard with overview stats
- `/contacts` - Contact management
- `/companies` - Company accounts
- `/deals` - Deal pipeline (Kanban)
- `/deals/[id]` - Deal detail with activity timeline
- `/activities` - Global activity feed
- `/tasks` - Tasks and follow-ups
- `/reports` - Analytics dashboard
- `/groups` - Contact segmentation
- `/settings` - Import/export and preferences

## API Endpoints

- `GET/POST /api/contacts` - Contact CRUD
- `GET/POST /api/companies` - Company CRUD
- `GET/POST /api/deals` - Deal CRUD
- `GET/POST /api/activities` - Activity logging
- `GET/POST /api/tasks` - Task management
- `GET /api/reports` - Aggregated analytics
- `GET /api/stats` - Dashboard statistics

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Validation**: Zod schemas
- **Icons**: Material Symbols Outlined
- **Font**: Inter via Google Fonts

## Design System

- **Primary Color**: #3c83f6 (blue)
- **Background**: #f5f7f8 (light gray)
- **Surface**: #ffffff (white cards)
- **Border Radius**: rounded-xl (12px)
- **Font**: Inter, system-ui, sans-serif

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── contacts/       # Contact pages
│   ├── companies/      # Company pages
│   ├── deals/          # Deal pages
│   ├── activities/     # Activity feed
│   ├── tasks/          # Task management
│   ├── reports/        # Analytics
│   └── layout.tsx      # Root layout
├── components/         # Reusable UI components
├── lib/               # Utilities and database
└── types/             # TypeScript definitions
```

## Contributing

1. Follow the existing code patterns
2. Use TypeScript strict mode (no `any` types)
3. Implement proper error handling with try/catch
4. Validate API inputs with Zod schemas
5. Use Tailwind CSS for all styling
6. Test responsive design at 320px, 768px, 1280px

## License

MIT License