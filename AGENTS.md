# Court Management System - AI Agent Guide

Welcome, AI Agent! This guide serves as a map and instruction set to navigate, understand, and develop in the Court Management System codebase.

---

## 1. Quick Overview
This project is a sports court booking and facility management system supporting multiple facilities, court areas, pricing rules, combo services, payments, and system configurations.

### Tech Stack
- **Backend**: C# ASP.NET Core (.NET 10.0), Entity Framework Core (EF Core 10.0.7), SQL Server, Serilog, AutoMapper, Polly.
- **Frontend**: Vite + React 19, TypeScript, Ant Design v6, Tailwind CSS v4, Redux Toolkit (RTK), React Query v5, Day.js, Axios.
- **Database Logic**: Standard CRUD via Entity Framework Core, complex/high-performance operations via raw SQL Stored Procedures.

---

## 2. Reading Priority
Before jumping into source code, always read these documentation files:
1. `docs/INDEX.md` — The main documentation entry point.
2. `docs/FOLDER_STRUCTURE.md` — Project structures and layout maps.
3. `docs/CODING_CONVENTIONS.md` — Code style, logging conventions, and API structures.
4. `docs/CHECKLIST_REVIEW.md` — Quality checks before merging or testing.

---

## 3. The Agents/ Memory System
We utilize the `Agents/` folder directory to store session handovers and changes between different AI Agent runs:

```
Agents/
├── Khởi động/
│   └── Huấn luyện AI kế nhiệm.md   # Read first on onboarding to learn the current session state.
└── Lịch sử/
    ├── Biên bản phiên làm việc/     # YYYY-MM-DD.md — Summaries of completed work sessions.
    └── Nhật ký thay đổi/            # YYYY-MM-DD.md — Document changes logged and waiting for review.
```

---

## 4. Agent Commands & Workflow

| Situation / Request | Slash Command |
|---|---|
| Develop new feature | `/new-feature <description>` |
| Scaffold backend + frontend module | `/add-module <name>` |
| Request documentation updates | `/log-change <description>` |
| Sync approved documentation updates | `/merge-docs` |
| Conclude development session | `/end-session` |

### Key Workflow Rules:
1. **Never edit files in `docs/` directly**: Always call `/log-change` to write changes into `Agents/Lịch sử/Nhật ký thay đổi/`. Use `/merge-docs` to apply them after user approval.
2. **End-of-Session Handover**: Always run `/end-session` to generate the work session report and update `Huấn luyện AI kế nhiệm.md`. This is critical for next-agent onboarding.

---

## 5. Core System Architectures & Patterns

### 1. Backend Clean Architecture
- **Domain**: Pure business entities (e.g. `Bookings.cs`, `Courts.cs`, `User.cs`). Relies on nothing.
- **Application**: DTOs, service interfaces/implementations (e.g. `AreaService.cs`), AutoMapper profiles. Relies on Domain.
- **Infrastructure**: AppDbContext, migration scripts, repository implementations, custom SQL stored procedures (e.g. `003_sp_GetCourtSlotAvailability.sql`), and transaction boundary management (Unit of Work). Relies on Application and Domain.
- **API**: Controllers (e.g. `BookingController.cs`), custom Middlewares (e.g. `ExceptionMiddleware.cs`), and bootstrapping. Relies on Application and Infrastructure.

### 2. Frontend Feature-based Layout
All code in `ClientApp/src` is organized into:
- **`features/`**: Redux/React Query queries and mutations, API client setups, types (e.g. `src/features/areas/`).
- **`pages/`**: UI pages that coordinate features and render layouts (e.g. `src/pages/areas/AreasPage.tsx`).
- **`components/`**: Reusable generic layout or form elements.

### 3. Key Integration & Request Patterns
When writing code or calling APIs, respect these architectural requirements:
- **Response Wrapper**: All controller endpoints return a standardized `Result<T>` containing `StatusCode`, `IsSuccess`, `Message`, and `Data`.
- **Database Interceptor**: `AuditInterceptor` automatically captures creator/modifier auditor metadata.
- **Logging Standards**: All logging statements inside backend services use Vietnamese logs prefixed with a local operation header (e.g. `const string loggingHeader = "Lấy danh sách khu vực"`).
- **Idempotent Requests**: Frontend Axios instances include an automatic UUID `Idempotency-Key` header generator for write operations when `idempotent: true` is supplied in the request config.
- **Facility Scoping**: Query context is partitioned using the `X-Facility-Id` header (automatically attached by the Axios interceptor) and evaluated using `CanAccessFacility(facilityId)` on the backend.
