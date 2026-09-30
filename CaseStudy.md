# REC Company — Case Study

> A full-stack operational, financial, and AI-powered management platform for real estate and contracting companies.

---

## 1. Project Overview

**REC Company Management System** is a centralized platform designed to help real estate and contracting companies manage operational, financial, and supplier-related activities through a unified digital environment.

The system combines a modern web dashboard with a secure backend, PostgreSQL database, and an AI assistant capable of understanding text and Arabic voice commands and executing application operations through a collection of dedicated tools.

### Project Role

**Role:** Full-Stack Developer  
**Developer:** Adel Ahmed Al-Boshy

### Responsibilities

- Frontend architecture and UI development
- Backend and REST API development
- Database architecture
- Authentication and API security
- Financial workflows
- AI agent integration
- Arabic voice-processing pipeline
- Audit logging
- API and database optimization

### Repository

[REC Company GitHub Repository](https://github.com/adel307/Properties-company-system-Frontend)

---

# 2. The Business Problem

Real estate and contracting companies manage large amounts of interconnected information:

- Properties
- Projects
- Suppliers
- Employees
- Expenses
- Payments
- Debts
- Operational records

When these workflows are fragmented across different tools, several problems appear.

### 2.1 Fragmented Operations

Operational information can become distributed across multiple screens, spreadsheets, or systems, making it difficult to obtain a complete picture of a project.

### 2.2 Financial Complexity

Tracking supplier payments, project expenses, outstanding debts, and remaining balances becomes increasingly difficult as transaction volume grows.

### 2.3 Slow Information Retrieval

Administrators frequently need quick answers such as:

- How much has been spent on a project?
- How much remains to be paid?
- What are the outstanding supplier debts?
- What payments were recently recorded?

Traditional navigation can make these simple questions unnecessarily time-consuming.

### 2.4 Security Requirements

Because the platform handles financial and operational information, it requires:

- Strong authentication
- Protected API routes
- Request-rate control
- Input validation
- Activity tracking
- Database-level auditing

---

# 3. Project Goals

The project was designed around five primary goals:

1. Centralize operational and financial management.
2. Provide a modern administrative dashboard.
3. Secure sensitive APIs and financial operations.
4. Make business information easier to access.
5. Introduce AI-powered text and Arabic voice interaction.

The AI component was designed not simply as a chatbot, but as an interaction layer capable of invoking application functionality.

---

# 4. Solution

REC addresses these challenges through a layered architecture.

```text
                    ┌──────────────────────┐
                    │       User/Admin     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Next.js Frontend   │
                    │ React + TypeScript   │
                    └──────────┬───────────┘
                               │
                         JWT / API
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Security Middleware  │
                    │ JWT + Rate Limiting  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Node.js / Express    │
                    │ REST API + AI Agent  │
                    └───────┬───────┬──────┘
                            │       │
                            │       ▼
                            │  ┌───────────────┐
                            │  │ Gemini Agent  │
                            │  └───────┬───────┘
                            │          │
                            │     Function Calls
                            │          │
                            │          ▼
                            │  ┌───────────────┐
                            │  │ 38 Tool APIs  │
                            │  └───────┬───────┘
                            │          │
                            ▼          ▼
                    ┌──────────────────────┐
                    │      PostgreSQL      │
                    │ Views / Indexes /     │
                    │ Triggers / Auditing  │
                    └──────────────────────┘

Voice Input
     │
     ▼
Groq Whisper Large v3
     │
     ▼
Arabic Text
     │
     ▼
Gemini AI Agent
```

---

# 5. Technology Decisions

## Frontend

### Next.js 15

Next.js provides the foundation for the application interface and routing architecture.

It was selected to support:

- Modern React architecture
- App Router
- Component-based development
- Scalable application structure
- Server-side capabilities where required

### React 19

React provides the component model used to build the dashboard and interactive interfaces.

### TypeScript

TypeScript improves maintainability by introducing static typing across the frontend codebase.

### Tailwind CSS

Tailwind CSS is used to build a consistent and responsive interface using reusable utility classes.

---

# 6. Backend Architecture

The backend is built using:

- Node.js
- Express
- Prisma ORM
- PostgreSQL

The backend exposes RESTful endpoints responsible for:

- Authentication
- Properties
- Projects
- Suppliers
- Expenses
- Payments
- Debts
- AI operations

The API layer separates routing, controllers, business logic, middleware, and database access to keep responsibilities organized.

---

# 7. Database Architecture

PostgreSQL serves as the primary data layer.

The database design uses several mechanisms to support performance and traceability.

## Database Views

Views are used for complex read operations and aggregated financial information.

For example, financial dashboards can retrieve calculated information without requiring the frontend to reconstruct complex database relationships.

## Indexes

Indexes improve lookup performance for frequently queried fields.

This is particularly important for:

- Dates
- Supplier records
- Project records
- Payment records
- Financial queries

## Triggers

Database triggers are used to automatically record important data modifications.

This creates an audit trail without relying entirely on application-level logging.

---

# 8. AI Architecture

One of the most distinctive parts of REC is its AI interaction layer.

Instead of limiting AI functionality to conversational responses, the system allows the model to interact with application functionality through tools.

## AI Stack

| Component | Technology | Responsibility |
|---|---|---|
| Speech-to-Text | Groq Whisper Large v3 | Convert Arabic voice to text |
| AI Agent | Google Gemini | Understand requests and select tools |
| Tool Layer | 38 application tools | Execute business operations |
| Database | PostgreSQL | Store and retrieve data |

---

# 9. Voice Interaction Pipeline

The voice assistant follows this workflow:

```text
User speaks Arabic
        ↓
Audio Recording
        ↓
Groq Whisper Large v3
        ↓
Arabic Transcription
        ↓
Google Gemini
        ↓
Intent / Tool Selection
        ↓
Application Tool
        ↓
Database Operation
        ↓
Result
        ↓
AI Response
```

### Example

A user can ask:

> "ما إجمالي المصروفات الخاصة بالمشروع؟"

The request is converted to text, interpreted by Gemini, mapped to the appropriate application tool, and processed against the database.

The result is then returned to the user.

---

# 10. AI Tool Architecture

The AI agent is connected to **38 application tools**.

These tools allow the assistant to interact with application data instead of simply generating text.

Examples of capabilities include:

- Searching records
- Retrieving project information
- Reading financial data
- Creating records
- Updating records
- Querying supplier information
- Retrieving debt information

### Destructive Operations

Operations that can permanently remove data require explicit confirmation from the user before execution.

This creates an additional safety layer between AI-generated decisions and destructive database operations.

---

# 11. Security Architecture

Security was treated as a system-level concern rather than a single authentication feature.

## JWT Authentication

Protected endpoints require a valid JSON Web Token.

The token is provided using:

```http
Authorization: Bearer <JWT_TOKEN>
```

The backend validates the token before processing protected operations.

## Rate Limiting

Rate limiting is applied to sensitive endpoints to control request frequency and reduce abuse.

Potentially sensitive areas include:

- Authentication
- Financial APIs
- Payment operations
- AI endpoints
- Voice processing

## Environment Variables

Secrets and credentials are stored through environment variables rather than hard-coded in the application.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="your-secure-secret"
GOOGLE_API_KEY="your-google-api-key"
GROQ_API_KEY="your-groq-api-key"
```

---

# 12. Audit Trail

Financial and operational systems require traceability.

REC uses PostgreSQL triggers to record changes such as:

```text
INSERT
UPDATE
DELETE
```

The audit system can preserve information such as:

- Operation type
- Affected record
- Previous values
- New values
- Related metadata

This provides a historical record of database changes.

---

# 13. Key Features

## Property Management

Centralized management of property-related information.

## Project Management

Organize project information and connect projects with financial and operational records.

## Supplier Management

Manage suppliers and their associated financial information.

## Expense Management

Record and retrieve expenses associated with operational activities.

## Payment Tracking

Track payments, remaining balances, and payment status.

## Debt Management

Monitor outstanding supplier and project-related obligations.

## AI Assistant

Use natural-language requests to retrieve or manipulate application data.

## Arabic Voice Commands

Interact with the system using Arabic speech.

## Audit Logging

Automatically record important database modifications.

## Secure APIs

Protect sensitive operations through authentication and rate limiting.

---

# 14. Example User Journey

Consider an administrator who wants to know the current supplier debt.

### Traditional Workflow

```text
Open dashboard
      ↓
Navigate to suppliers
      ↓
Search supplier
      ↓
Open financial information
      ↓
Review transactions
      ↓
Calculate remaining amount
```

### AI Workflow

```text
Ask the AI assistant
      ↓
"ما إجمالي ديون الموردين؟"
      ↓
Gemini understands the request
      ↓
Selects the appropriate tool
      ↓
Database query
      ↓
Financial result
```

The AI layer therefore acts as an alternative interaction method for existing business functionality.

---

# 15. Engineering Challenges

## Challenge 1 — Connecting AI to Real Application Data

A generic chatbot cannot reliably answer questions about private application data.

### Solution

The AI agent was connected to application-specific tools using function calling.

This allows Gemini to select predefined operations rather than directly manipulating the database.

---

## Challenge 2 — Arabic Voice Processing

Voice interaction introduces additional processing requirements:

```text
Audio → Speech Recognition → Text → AI → Tool → Database
```

### Solution

Groq Whisper Large v3 was integrated as the speech-to-text layer before sending the resulting Arabic text to the AI agent.

---

## Challenge 3 — Protecting AI Operations

Allowing AI to execute application actions introduces a potential risk when the requested operation changes or deletes data.

### Solution

The tool layer separates AI intent from actual application execution.

Destructive operations require explicit confirmation before execution.

---

## Challenge 4 — Financial Query Performance

Financial dashboards can require multiple joins and aggregations.

### Solution

PostgreSQL Views and indexes are used to simplify repeated queries and improve access to frequently required financial information.

---

## Challenge 5 — Auditability

Application-level logs alone may not capture every database modification.

### Solution

PostgreSQL triggers provide database-level auditing for important data changes.

---

# 16. Engineering Principles

Several principles guided the implementation:

### Separation of Concerns

Frontend, backend, AI, security, and database responsibilities are separated into dedicated layers.

### Security by Design

Authentication and request protection are considered part of the architecture rather than an afterthought.

### AI as an Application Layer

The AI assistant does not replace the application's business logic.

Instead, it interacts with predefined application tools.

### Database-Level Integrity

Important auditing and performance mechanisms are implemented close to the data layer.

### Explicit User Control

Destructive AI operations require confirmation before execution.

---

# 17. Simplified Data Flow

```mermaid
flowchart TD
    A[User] --> B[Next.js Dashboard]

    B --> C{Interaction Type}

    C -->|Text| D[AI Agent]
    C -->|Voice| E[Groq Whisper]

    E --> D

    D --> F[Google Gemini]

    F --> G[Tool Selection]

    G --> H[Application Tool]

    H --> I[Express API]

    I --> J[Prisma ORM]

    J --> K[(PostgreSQL)]

    K --> L[Result]

    L --> M[AI Response]
    M --> A
```

---

# 18. Project Impact

The architecture provides a unified technical foundation for:

- Centralized operational management
- Financial tracking
- Supplier management
- Secure API access
- AI-assisted data interaction
- Arabic voice interaction
- Automated auditing

The most significant architectural addition is the AI tool layer, which connects natural-language interaction with existing application functionality.

---

# 19. Future Development

Potential future improvements include:

- Role-Based Access Control (RBAC)
- More advanced financial analytics
- Real-time notifications
- AI-generated financial reports
- Automated financial summaries
- Advanced dashboard visualizations
- Expanded multilingual support
- Mobile application
- More granular audit monitoring
- AI-assisted anomaly detection

---

# 20. Production Readiness Checklist

Before production deployment:

- [ ] Configure a strong `JWT_SECRET`
- [ ] Configure production PostgreSQL
- [ ] Configure Gemini credentials
- [ ] Configure Groq credentials
- [ ] Configure CORS
- [ ] Enable appropriate rate limits
- [ ] Validate all API inputs
- [ ] Protect environment variables
- [ ] Run Prisma migrations
- [ ] Test authentication
- [ ] Test financial operations
- [ ] Test AI tools
- [ ] Test voice processing
- [ ] Test destructive-operation confirmation
- [ ] Verify audit logging
- [ ] Review database indexes
- [ ] Run production build
- [ ] Perform API security testing

---

# 21. Conclusion

REC Company demonstrates how a modern full-stack architecture can combine traditional business management systems with AI-powered interaction.

The platform brings together:

```text
Modern Frontend
      +
Secure REST API
      +
PostgreSQL
      +
Financial Workflows
      +
AI Tool Calling
      +
Arabic Voice Processing
      +
Database Auditing
```

The result is an architecture designed around centralized management, secure data access, AI-assisted interaction, and traceable business operations.

---

# 👨‍💻 Developer

## Adel Ahmed Al-Boshy

**Full-Stack Developer & CS/AI Student from Cairo, Egypt 🇪🇬**

- GitHub: https://github.com/adel307
- LinkedIn: https://linkedin.com/in/adel-ahmed-20b956379
- Portfolio: https://adel307.github.io/portfulio/

---

## 🔗 Project

**GitHub Repository:**  
https://github.com/adel307/Properties-company-system-Frontend

---

<p align="center">
  Built with Next.js · React · TypeScript · Node.js · Express · Prisma · PostgreSQL · Gemini · Groq
</p>
