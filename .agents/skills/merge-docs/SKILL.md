---
name: merge-docs
description: Parse pending documentation changelogs and apply them to the target docs.
---

# Merge Docs

Use this skill to sync approved documentation changes into the primary documents in `docs/`.

Follow these instructions:

1. **Locate Pending Changes**:
   Scan all Markdown files under `Agents/Lịch sử/Nhật ký thay đổi/` sorted by date.
   Identify all checkbox items marked as incomplete `- [ ]`.

2. **Apply Modifications**:
   - For each `- [ ]` item, open the target document path (e.g. `docs/CODING_CONVENTIONS.md`).
   - Locate the specified lines and apply the proposed changes (additions, deletions, or modifications) carefully.
   - Maintain documentation formatting and link structures.

3. **Verify Links**:
   Ensure all relative links are verified and valid.

4. **Mark as Merged**:
   Once the modification is applied successfully, update the checkbox in the changelog file to `- [x]` (completed).

5. **Conflict Resolution**:
   If there are conflicting changes or the target lines have drifted significantly, pause execution and ask the user for confirmation.
