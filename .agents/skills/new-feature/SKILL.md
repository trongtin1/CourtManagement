---
name: new-feature
description: Guide for task analysis, planning, and execution conventions for new features.
---

# New Feature Development Workflow

Follow this procedure when starting work on a new feature:

---

## 1. Context Assessment
- Do not search source code immediately.
- Read `docs/INDEX.md` first to identify target files and architectural dependencies.
- Verify active conventions in `docs/CODING_CONVENTIONS.md`.

---

## 2. Planning Phase
- Draft an implementation plan.
- Outline files to modify/create across the stack:
  - Backend controllers, DTOs, services, repositories.
  - Frontend components, React Query bindings, types.
- List any database migrations or Stored Procedures required.
- Identify dependencies or design impacts (such as multi-facility security isolation).

---

## 3. Review & Approval
- Present the implementation plan to the user.
- Ensure the user explicitly approves before writing code or altering models.

---

## 4. Implementation & Quality Checks
- Execute tasks.
- Keep controllers lean, return standardized `Result<T>` envelopes, and isolate contexts using facility headers.
- Once complete, execute validation runs using `npm run lint` and `npm run format:check`.
