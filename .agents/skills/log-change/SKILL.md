---
name: log-change
description: Log a pending documentation modification to the temporary changelog waiting for approval.
---

# Log Change

Use this command when documentation requires modification due to code changes or error corrections.

Follow these steps:

1. **Locate or Create Changelog**:
   Open or create the file `Agents/Lịch sử/Nhật ký thay đổi/YYYY-MM-DD.md` (replace YYYY-MM-DD with the current local date).

2. **Write Change Proposals**:
   Add each proposal as an uncompleted checkbox item `- [ ]`.
   Specify:
   - The exact path to the target document (using a clickable file scheme link).
   - A short description of why it needs to change.
   - The exact lines to modify, structured in diff format.

   Example:
   ```markdown
   - [ ] Target: [CODING_CONVENTIONS.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/CODING_CONVENTIONS.md)
     - Detail: Document the requirement for facility scoping.
     - Change Proposed:
       ```diff
       + All backend queries must check facility scopes using WorkingFacilityId headers.
       ```
   ```

3. **Report to User**:
   Notify the user that the documentation changes have been logged in the pending changelog file and are waiting for their review. Do not modify the original file under `docs/` directly.
