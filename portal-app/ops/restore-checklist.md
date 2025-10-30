# WESR Triquest — Restore checklist

**Scope:** Restore Supabase data from `backups/<timestamp>/` JSON files.

1. **Freeze writes**: Disable provider & learner access (maintenance mode / firewall).
2. **Identify snapshot**: Pick a backup folder timestamp (e.g., `2025-10-30T10-12-30-000Z`).
3. **Create scratch project (optional)**: Test import in a staging Supabase project.
4. **Truncate target tables (order matters)**:
   - attempts, billing_usage, override_logs, audit_logs
   - certificates
   - classes
   - questions
   - tr_sections
   - providers, provider_users
   - roles (if needed)
   - admin_config (rarely needed)
5. **Import JSON** in dependency order using Supabase SQL or REST:
   - Use Postgres `\copy` for CSVs **or** a Node script to upsert JSON row arrays.
6. **Re-enable RLS** if you disabled it temporarily.
7. **Sanity checks**:
   - Admin → TR Sections present
   - Admin → Questions count matches
   - Provider → Classes visible
   - Exam → Can blueprint & submit
   - Verify → Existing certificates resolve
8. **Unfreeze**: Re-open the portal; monitor logs.
9. **Post-mortem**: Record cause, impact, and process improvements.
