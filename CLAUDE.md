# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DGG CRM is a volunteer management and CRM system for managing volunteers, events, tickets/reaches, contacts, and group assignments. It features role-based access with admin and regular user modes.

## Tech Stack

- **Frontend**: Next.js 16 with React 19, TypeScript, Mantine 8 UI components, Tailwind CSS 4
- **Backend**: Django 6 with Django REST Framework, PostgreSQL
- **Development**: Docker Compose for containerized development

## Development Commands

### Docker (Recommended)

```bash
# Start full stack
docker compose -f docker-compose.dev.yaml up

# Rebuild containers (if build issues)
docker compose -f docker-compose.dev.yaml down -v
docker compose -f docker-compose.dev.yaml build --no-cache
docker compose -f docker-compose.dev.yaml up

# Run database migrations
docker compose -f docker-compose.dev.yaml run --rm server python manage.py makemigrations
docker compose -f docker-compose.dev.yaml run --rm server python manage.py migrate

# Migrate specific app (e.g., base)
docker compose -f docker-compose.dev.yaml run --rm server python manage.py makemigrations base
docker compose -f docker-compose.dev.yaml run --rm server python manage.py migrate base
```

### Local Development

```bash
# Backend (must use port 8080)
cd Server
python manage.py runserver 8080

# Frontend
cd Application
npm install
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
```

### Environment Variables

- `INSERT_FAKE_DATA=true` - Populate DB with test data on startup
- `CREATE_SUPER_USER=true` - Create admin user (admin/admin@example.com/admin)
- `RUN_CREATE_DB=0` - Skip test data population

## Architecture

### Directory Structure

```
Application/          # Next.js frontend
  app/               # App router pages (contacts, events, groups, tickets, admin, profile)
  components/        # React components (Navbar, PeopleTable, ReachesTable, EventsTable)

Server/              # Django backend
  dggcrm/
    api/             # REST API (views.py, serializer.py, urls.py)
    base/            # Core models (models.py)
    contacts/        # Contact management
    events/          # Event management
    tickets/         # Ticket/reach management
    config/          # Django settings
    fake/            # Test data generation (main.py)
```

### API Routing

Next.js proxies API requests to Django via rewrites in `next.config.ts`:
- `/api/:path*` → Django API
- `/admin/:path*` → Django admin

### Core Models (Server/dggcrm/base/models.py)

- **Person** - Volunteers with Discord ID (`did`) as primary key
- **Group** / **VolunteerInGroup** - Teams with access levels (1=view, 2=edit)
- **GeneralRole** - System-wide access (0=needs approval, 1=organizer, 2=admin)
- **Event** / **EventParticipant** - Event management
- **Reach** / **VolunteerResponse** - Tickets/outreach tasks with responses
- **Tag** / **AssignedTag** - Tagging system for people

### REST API Endpoints (Server/dggcrm/api/urls.py)

Base path: `/api/`
- `/api/people/` - Person CRUD
- `/api/groups/` - Group CRUD
- `/api/events/` - Event CRUD
- `/api/reaches/` - Ticket/reach CRUD
- `/api/tags/` - Tag CRUD
- `/api/volunteer-in-groups/`, `/api/general-roles/`, `/api/event-participants/`, `/api/assigned-tags/`, `/api/volunteer-responses/`

## Database Migration Workflow

When modifying `models.py`:
1. Create migration: `makemigrations` (or `makemigrations <app_name>`)
2. Apply migration: `migrate` (or `migrate <app_name>`)
3. Before merging PRs: combine multiple migration files into a single file by deleting and recreating
