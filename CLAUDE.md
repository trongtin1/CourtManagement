# CLAUDE.md — Court Management System

> Main Docs Index → `docs/INDEX.md` · AI Agent Rules → `AGENTS.md` · Coding Style → `docs/CODING_CONVENTIONS.md`

---

## 1. System Overview & Tech Stack
This repository is a **sports court booking and facility management system**.
- **Backend**: C# ASP.NET Core (.NET 10.0), Entity Framework Core (EF Core 10.0.7), SQL Server, Serilog, Unit of Work, Stored Procedures.
- **Frontend**: Vite + React 19, TypeScript, Ant Design v6, Tailwind CSS v4, Redux Toolkit (RTK), React Query v5.

---

## 2. Slash Commands (Skills)

| Command | Usage / Purpose |
|---|---|
| `/new-feature <mô tả>` | Guide the process of building new features under Clean Architecture conventions. |
| `/add-module <tên>` | Add a new C# entity module (Domain $\rightarrow$ Application $\rightarrow$ Infrastructure $\rightarrow$ API) and React page. |
| `/log-change <mô tả>` | Log pending documentation changes to `Agents/Lịch sử/Nhật ký thay đổi/YYYY-MM-DD.md`. |
| `/merge-docs` | Parse pending changelogs and merge approved updates to the official files in `docs/`. |
| `/end-session` | Check code compliance, write session summary report, and update onboarding training file. |

---

## 3. Verify After All Code Modifications

Run these commands from the root directory to validate build stability and code quality:

```bash
npm run lint          # Run React ESLint quality checks
npm run format:check  # Verify Prettier code formatting compliance
npm run build         # Compile both C# solution binaries and Vite frontend assets
```

If you need to fix formatting issues automatically:
```bash
npm run format        # Run Prettier write formatter
```

---

## 4. Token Savings Rules & Constraints

To prevent unnecessary context bloat, always adhere to these rules:
- **Do not scan directories blindly**: Read the indexes (`docs/INDEX.md`) first to target search paths.
- **Never read the following paths**:
  - `**/node_modules/` or package lockfiles (`package-lock.json`).
  - `**/bin/`, `**/obj/`, `**/dist/`, or compilation folders.
  - `.git/` or metadata directories.
- **Scope Query Searches**: When using code graph tools, always target specific project paths (`projectPath`) for backend versus frontend search contexts.

---

## 5. Core Development Principles

- **Logging standard**: All backend logging statements must use Vietnamese and declare a local `loggingHeader` (e.g. `const string loggingHeader = "Tạo khu vực"`). Ensure the logging statements and return statements are structured inside scoped braces.
- **Security Check**: Database operations must enforce facility scoping using `X-Facility-Id` header evaluation and `CanAccessFacility(facilityId)` validation checks.
- **Write Operations**: Always wrap frontend mutations with React Query custom hooks and ensure write mutations execute with `idempotent: true` enabled.
