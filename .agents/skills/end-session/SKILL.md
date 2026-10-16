---
name: end-session
description: Conclude the current development session by running verification tests and writing summaries.
---

# End Session

Always execute this command at the end of a session before stopping. Follow these steps:

---

## Step 1: Run Quality Checks
Execute the quality assurance pipeline to make sure formatting and builds remain clean:
```bash
npm run lint          # Checks linter compliance
npm run format:check  # Verifies formatting compliance
npm run build         # Validates compile success
```
Verify that there are no errors in execution. If errors occur, resolve them before proceeding.

---

## Step 2: Update Next-Agent Onboarding Guide
Open `Agents/Khởi động/Huấn luyện AI kế nhiệm.md`.
Overwrite the **TL;DR (Trạng thái hiện tại)** block at the top with:
- **Trạng thái**: Current documentation status, lint status, and number of open backlog tasks.
- **Đang làm**: Current tasks in progress or "Không có" (none).
- **Module/tính năng mới trong phiên này**: Summarize modules, entities, services, or UI components added during the session.
- **Còn mở**: List remaining tasks that require follow-up.

Ensure you do not delete other reference sections in the document.

---

## Step 3: Write Session Report
Create a session report file in `Agents/Lịch sử/Biên bản phiên làm việc/YYYY-MM-DD.md` (or append to it if a file for today already exists).
Include:
- **Tên AI**: The name or identity of the agent.
- **Tóm tắt công việc**: High-level summary of work accomplished.
- **Tệp thay đổi/tạo mới**: Matrix of files modified or created during the session.
- **Ghi chú cho AI kế nhiệm**: Critical context, lessons learned, or troubleshooting findings.

---

## Step 4: Backlog Management
Verify that tasks completed in the current session are marked off in the active backlog, and any new tasks or blockers are registered.
