# ContactHub - Sales CRM

A modern, full-featured Customer Relationship Management (CRM) system built with Next.js 15, TypeScript, and SQLite. ContactHub helps you manage contacts, companies, deals, activities, and tasks all in one place.

## Features

### Core CRM Functionality
- **Contacts Management**: Full CRUD operations with favorites, job titles, and company associations
- **Companies**: Track business accounts with industry, website, and contact relationships
- **Deals Pipeline**: Kanban-style deal management with stages, values, and probability tracking
- **Activities**: Log calls, emails, meetings, and notes with automatic stage change tracking
- **Tasks**: Create and manage follow-ups with priority levels and due dates
- **Dashboard**: Comprehensive CRM overview with metrics, recent activities, and pipeline visualization

### Data Management
- **Groups**: Organize contacts into custom groups
- **CSV Import/Export**: Bulk contact operations
- **Search & Filtering**: Find contacts, companies, and deals quickly
- **Pagination**: Handle large datasets efficiently

### User Experience
- **Responsive Design**: Mobile-first approach with breakpoints at 320px, 768px, and 1280px
- **Modern UI**: Clean interface using Tailwind CSS and Material Symbols icons
- **Real-time Updates**: Instant feedback on all operations
- **Sidebar Navigation**: Easy access to all CRM modules

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS
- **Validation**: Zod schemas
- **Icons**: Google Material Symbols Outlined
- **Font**: Inter

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ibuzzardo/contact-hub.git
cd contact-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The SQLite database is automatically initialized on first run. The database file (`contacts.db`) will be created in the project root.

## API Endpoints

### Contacts
- `GET /api/contacts` - List contacts with search, filter, and pagination
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/[id]` - Get contact details
- `PUT /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact
- `PATCH /api/contacts/[id]/favorite` - Toggle favorite status

### Companies
- `GET /api/companies` - List companies with computed metrics
- `POST /api/companies` - Create new company
- `GET /api/companies/[id]` - Get company details
- `PUT /api/companies/[id]` - Update company
- `DELETE /api/companies/[id]` - Delete company

### Deals
- `GET /api/deals` - List deals with stage filtering
- `POST /api/deals` - Create new deal with tags
- `GET /api/deals/[id]` - Get deal details
- `PUT /api/deals/[id]` - Update deal and tags
- `DELETE /api/deals/[id]` - Delete deal
- `PATCH /api/deals/[id]/stage` - Update deal stage (creates activity)

### Activities
- `GET /api/activities` - List activities with filtering
- `POST /api/activities` - Create new activity

### Tasks
- `GET /api/tasks` - List tasks with status filtering
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `PATCH /api/tasks/[id]/complete` - Toggle task completion

### Groups
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create new group
- `PUT /api/groups/[id]` - Update group
- `DELETE /api/groups/[id]` - Delete group

### Dashboard
- `GET /api/stats` - Get CRM dashboard statistics

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   ├── companies/           # Company pages
│   ├── contacts/            # Contact pages
│   ├── deals/               # Deal pipeline
│   ├── favorites/           # Favorites page
│   ├── groups/              # Groups management
│   ├── settings/            # Settings page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Dashboard
├── components/              # Reusable components
├── lib/
│   ├── db.ts               # Database setup
│   ├── schemas.ts          # Zod validation schemas
│   └── utils.ts            # Utility functions
└── types/
    └── index.ts            # TypeScript interfaces
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check

### Code Quality

- **TypeScript**: Strict mode enabled, no `any` types allowed
- **ESLint**: Next.js recommended configuration
- **File Naming**: kebab-case for files, PascalCase for components
- **Path Aliases**: Use `@/` instead of relative imports
- **Error Handling**: All async functions have try/catch blocks

### Database Schema

The application uses SQLite with the following main tables:
- `contacts` - Contact information with company associations
- `companies` - Business account details
- `deals` - Sales opportunities with stages and values
- `deal_tags` - Tags associated with deals
- `activities` - Interaction history
- `tasks` - Follow-up items and reminders
- `groups` - Contact organization

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

Required environment variables:
- `NEXT_PUBLIC_BASE_URL` - Base URL for API calls (default: http://localhost:3000)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `npm run typecheck && npm run lint`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

**ContactHub** - Streamline your sales process with modern CRM tools.