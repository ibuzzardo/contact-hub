# ContactHub

A modern, full-stack contact management application built with Next.js 15, TypeScript, and SQLite.

## Features

### Core Functionality
- **Contact Management**: Create, read, update, and delete contacts
- **Group Organization**: Organize contacts into custom groups
- **Favorites**: Mark important contacts as favorites
- **Search & Filter**: Find contacts by name, email, or company
- **Sorting**: Sort contacts by name, date, or company

### Data Management
- **CSV Import**: Bulk import contacts from CSV files
- **CSV Export**: Export all contacts to CSV format
- **Data Validation**: Comprehensive input validation with Zod

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Professional CRM-style interface with Material Symbols icons
- **Real-time Updates**: Optimistic UI updates for better user experience
- **Dashboard**: Overview with statistics and recent activity

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS with custom design system
- **Validation**: Zod for schema validation
- **Icons**: Google Material Symbols
- **Font**: Inter from Google Fonts

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

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

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── contacts/          # Contact pages
│   ├── groups/            # Groups page
│   ├── favorites/         # Favorites page
│   ├── settings/          # Settings page
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
├── lib/                   # Utilities and database
└── types/                 # TypeScript type definitions
```

## API Endpoints

### Contacts
- `GET /api/contacts` - List contacts with pagination, search, and filters
- `POST /api/contacts` - Create a new contact
- `GET /api/contacts/[id]` - Get contact details
- `PUT /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact
- `PATCH /api/contacts/[id]/favorite` - Toggle favorite status
- `GET /api/contacts/export` - Export contacts as CSV
- `POST /api/contacts/import` - Import contacts from CSV

### Groups
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/[id]` - Get group details
- `DELETE /api/groups/[id]` - Delete group

### Statistics
- `GET /api/stats` - Get dashboard statistics

## Database Schema

### Contacts Table
- `id` - Primary key
- `name` - Contact name (required)
- `email` - Email address (required, unique)
- `phone` - Phone number (optional)
- `company` - Company name (optional)
- `job_title` - Job title (optional)
- `group_id` - Foreign key to groups table (optional)
- `notes` - Additional notes (optional)
- `favorite` - Favorite flag (0 or 1)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Groups Table
- `id` - Primary key
- `name` - Group name (required, unique)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Features in Detail

### Dashboard
- Welcome message with time-based greeting
- Statistics cards showing total contacts, groups, favorites, and new contacts this week
- Recent contacts table with quick actions
- Quick access to import and add contact functions

### Contact Management
- Grid and list view modes
- Advanced search across name, email, and company fields
- Filter by group and favorite status
- Sort by name (A-Z, Z-A), date (newest, oldest), and company
- Colored avatar initials based on contact name
- Favorite toggle with optimistic updates

### CSV Import/Export
- Import contacts from CSV with validation and error reporting
- Export all contacts to CSV with proper formatting
- Sample CSV template download
- Support for all contact fields including groups

### Responsive Design
- Mobile-first approach with breakpoints at 320px, 768px, and 1280px
- Collapsible sidebar on mobile devices
- Responsive grid layouts that adapt to screen size
- Touch-friendly interface elements

## Development

### Code Quality
- TypeScript strict mode enabled
- Comprehensive error handling with try/catch blocks
- Zod validation for all API inputs
- Consistent code formatting and naming conventions

### Performance
- Server-side rendering where appropriate
- Optimistic UI updates for better user experience
- Efficient database queries with proper indexing
- Image optimization and lazy loading

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
