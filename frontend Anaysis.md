Frontend analysis

Current implementation snapshot (2026-09-22)
- The frontend is a Next.js 15 App Router application using TypeScript, React 19, Tailwind CSS v4, and lucide-react.
- The current route set is /, /[propertyID], /[propertyID]/edit, /properties/new, /employees, /employees/new, /suppliers, /suppliers/new, /materials, /materials/new, /expenses, /expenses/new, and /audit-logs.
- app/layout.tsx now renders Navbar, Sidebar, Footer, and GlobalAudioRecorder globally. The dashboard uses a responsive dark neutral/teal operations theme.
- EntityPage is the shared client-side table/detail editor for employees, suppliers, materials, and expenses. RecordForm is the shared create form and supports conditional fields, transitions, and server-action submission.
- The frontend API layer includes properties, employees, suppliers, materials, expenses/categories, audit logs, speech, and stored-audio analysis modules.
- lib/api/client.ts supports query parameters, JSON and FormData bodies, NEXT_PUBLIC_API_URL, and optional NEXT_PUBLIC_API_KEY sent as x-api-key. The default API URL is http://localhost:8000/api.
- The global audio recorder connects the frontend to the backend voice workflow. Responses can include transcription text, Gemini analysis, and the model used.
- Current gaps: the expenses page has placeholder save/delete handlers, and the audit page fetches logs but currently passes an empty array to AuditLogsTable.

Project overview
- The frontend is a Next.js application using the App Router pattern.
- It is organized around a global shell layout plus feature pages under app/.
- The UI is built in TypeScript and uses reusable presentational components and typed API modules.
- The current design direction is a modern dark dashboard focused on operations and portfolio visibility.

Current app structure
- app/layout.tsx
  - global layout with sticky top navigation, left sidebar, and footer
  - wraps all pages in a dark-themed shell with background glows and a fixed-width content area
- app/page.tsx
  - home dashboard showing property summary cards, filter panel, property table, and pagination
  - fetches data using propertiesApi.getAll with filters from searchParams
- app/properties/new/page.tsx
  - server action for creating a property
  - builds the payload using startedIn, endedIn, floorsNumber, area, status, and other form values
  - redirects back to / after successful create
- app/employees/page.tsx
  - displays employee records through EntityPage
  - loads properties for assignment metadata
- app/suppliers/page.tsx
  - displays supplier records with a debt summary card and total debt calculation
- app/materials/*
  - material list and create/edit flows are structured around reusable EntityPage patterns
- app/expenses/*
  - expense-related pages are implemented using the central API layer and reusable entity table UI
- app/audit-logs/*
  - audit log pages follow the same consistent list/detail pattern

Global layout and styling
- The application uses Tailwind-inspired utility classes in the JSX.
- Global styling is defined in app/globals.css.
- The default root layout sets html lang="en" with a dark color scheme and ambient gradient background.
- Navbar, Sidebar, and Footer are global components rendered across all pages.

Reusable frontend system
- components/common/EntityPage.tsx
  - central table/detail/edit workflow for admin entities
  - supports table rows, inline editing, delete confirmation, and save operations
  - includes custom cell rendering for money, statuses, assigned properties, and materials
- components/common/RecordForm.tsx
  - form builder for create/edit screens
  - handles form field definitions and submit actions
- components/layout/Navbar.tsx
  - global navigation for dashboard sections
- components/layout/Sidebar.tsx
  - quick action links to add employees, suppliers, materials, and expenses
- components/layout/Footer.tsx
  - footer content for the dashboard shell

Property module state
- components/properties/ShowProperties.tsx
  - renders property rows and property-specific UI elements
- components/properties/FilterProperties.tsx
  - supports search and filters for status, date range, area range, and sort order
- components/properties/AddApartmentForm.tsx
  - apartment creation/edit support
- components/properties/ApartmentsList.tsx
  - apartment overview for a property

API layer
- lib/api/client.ts
  - central fetch wrapper for backend calls
  - adds JSON content type by default, handles query params, and throws API errors with backend payloads
  - defaults the API base to http://localhost:8000/api unless NEXT_PUBLIC_API_URL is provided
- lib/api/properties.ts
  - property-related API functions: getAll, getById, getEmployees, create, update, delete
  - also exposes apartment submodule helpers
- lib/api/employees.ts
  - employee CRUD functions
- lib/api/suppliers.ts
  - supplier CRUD and debt queries
- lib/api/materials.ts
  - material CRUD functions
- lib/api/expenses.ts
  - daily expense and category operations
- lib/api/audit.ts
  - audit log retrieval

Data flow pattern
- Server components fetch data from the backend using async functions at the page level.
- The page loads params from searchParams and converts them into typed filters.
- The response is normalized to rows and passed into EntityPage or a feature-specific component.
- For create/update actions, server functions call the relevant API function and then redirect or refresh the page.

Frontend/backend contract conventions
- Request payloads are mostly camelCase on the frontend and mapped to Prisma field names on the backend.
- Example mappings include:
  - startedIn -> started_in
  - endedIn -> ended_in
  - floorsNumber -> floors_number
  - experienceYears -> experience_years
  - expenseCategoryId -> expense_category_id
- Response data from Prisma commonly contains nested records (employees, materials, categories, properties), which the UI renders in tables and chips.

Recent changes reflected in the codebase
- Migration from a more legacy route-based frontend structure to the App Router architecture.
- Consolidation into reusable entity tables and shared forms.
- Stronger property relationship handling, especially for property-to-employee and property-to-apartment linking.
- API client centralization with a consistent fetch wrapper and typed module exports.
- Global dashboard styling and a dark operations-focused design system.
- Server-side property creation and redirect flow using Next.js server actions.
- Use of searchParams-driven filters for property lists and supplier filtering.

Current implementation notes
- The project currently prioritizes dashboard and CRUD workflows over full feature-specific standalone forms for every entity.
- The design uses generic dynamic tables instead of a dedicated component per resource in many places.
- Several pages rely on the EntityPage pattern for quick consistent editing and deletion flows.
- The codebase is structured to support further expansion into more detailed pages for expenses, materials, and audit views without duplicating page-level logic.

Key technical stack
- Next.js
- TypeScript
- React
- Tailwind-like utility classes
- custom fetch layer for REST calls
- Prisma-backed backend API on a separate service

Important environment settings
- Backend expects DATABASE_URL and optionally API_KEY.
- Frontend expects NEXT_PUBLIC_API_URL for the backend endpoint, with a default of http://localhost:8000/api.
- Local development normally runs the backend and Next.js app separately, with the frontend calling the backend over HTTP on localhost.
