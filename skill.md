---
name: supabase-postgres-best-practices
description: 'Optimize Supabase/Postgres queries, schema designs, migrations, indexes, RLS policies, CRUD flows, UI action safety, fetching/refetching logic, and performance reviews. Use when writing SQL, reviewing slow queries, diagnosing missing indexes, tuning connection usage, designing tables, handling locking or N+1 patterns, or triaging MusikaLokal issues such as broken buttons, disconnected CRUD handlers, stale fetching, Edge Function returned a non-2xx status code, stale router deployments, missing action handlers, hidden invoke error details, schema drift, missing columns, broken nested selects, RLS mismatch, and live database mismatch.'
argument-hint: 'Describe the query, schema, migration, RLS policy, Supabase query, CRUD flow, button/action issue, fetching issue, or Edge Function failure.'
user-invocable: true
license: MIT
metadata:
  author: supabase
  version: "1.4.0"
  organization: Supabase
  date: May 2026
  abstract: Comprehensive Supabase/Postgres performance, schema, migration, RLS, Edge Function, CRUD, UI button, fetching/refetching, and live database diagnostic guide. Includes mandatory MCP live database verification before changing SQL, Supabase queries, migrations, Edge Functions, RLS policies, CRUD handlers, or schema-related application code.
---

# Supabase Postgres, CRUD, Button, Fetching, and Live Database Best Practices

Use this skill for repeatable Supabase/Postgres and MusikaLokal application work where the agent needs to inspect the real database state, verify UI actions, protect CRUD behavior, choose the correct optimization or safety rule, and produce concrete SQL, migrations, query fixes, RLS policies, Edge Function fixes, CRUD fixes, fetching fixes, or review findings.

This skill is especially important for MusikaLokal, where the local repository, migrations, deployed Edge Functions, frontend CRUD code, UI buttons, and live Supabase database may drift from each other.

Many MusikaLokal bugs happen because:

1. A button is still visible but no longer connected to the correct function.
2. A CRUD handler was accidentally broken by an AI edit.
3. The frontend expects a table, column, relationship, enum, RPC, or Edge Function action that does not exist in the live Supabase database.
4. Fetching/refetching is incomplete, so the UI shows stale or missing data.
5. RLS blocks the action even though the UI and query look correct.
6. An Edge Function action exists locally but was not deployed live.
7. TypeScript types or local migrations are newer than the real production database.
8. A UI redesign makes the screen look better but disconnects actions, IDs, handlers, cache invalidation, or error handling.

Do not only make the UI look better. Always verify that the UI action, CRUD handler, fetching/refetching flow, RLS rules, Edge Function logic, and live database contract still work together.

Deploy what is needed and make sure to check the live database state through MCP before writing the final answer. Use environment variables only when needed to access deployment instructions or personal tokens. Prefer workspace-level references and MCP-provided live project state when available.

When runtime testing is not possible, clearly state that the verification was based on code review, MCP checks, lint/typecheck, and available tests, not full manual app testing.

---

# Mandatory Rule: Always Use MCP for Live Database Verification

Before writing, modifying, debugging, or reviewing any SQL, Supabase query, RLS policy, Edge Function database call, RPC, migration, or table-related application code, always use the MCP server to fetch the current live database schema first.

Do not rely only on:

- Local code
- TypeScript types
- Generated schema files
- Old migrations
- Assumptions
- Memory
- Previous conversations

The agent must verify the current live database state before producing the final fix.

## Required MCP Checks

Use MCP to confirm:

1. The target table exists in the live Supabase project.
2. The target columns exist in the live table.
3. Column names match the application code.
4. Column data types match the intended query or code.
5. Nullable values are correct.
6. Default values are correct.
7. Primary keys are correct.
8. Foreign keys and relationships are correct.
9. Indexes exist where performance or joins depend on them.
10. Constraints are correct.
11. Enum values exist when enum columns are involved.
12. RLS is enabled or disabled as expected.
13. RLS policies are correct when auth or access control is involved.
14. RPC functions exist when used.
15. Edge Function actions exist when used.
16. Applied migration history is current when schema drift is suspected.

Never invent or guess table names, column names, relationships, enum values, policies, indexes, RPCs, or Edge Function actions.

If MCP shows that a table, column, relationship, enum, policy, RPC, or action is missing, clearly state that it is missing in the live database and choose one of these paths:

1. Adjust the query/code to match the current live schema.
2. Propose or write a safe migration to add or repair the missing schema.

For MusikaLokal, this rule is mandatory because schema drift can cause:

- `PGRST204`
- PostgREST 400 errors
- Nested select failures
- `Edge Function returned a non-2xx status code`
- Insert/update/delete failures
- Broken CRUD buttons
- Stale UI data
- Missing action handler confusion
- Stale Edge Function deployment issues
- Hidden database errors inside generic invoke failures

---

# Mandatory Rule: Always Verify Buttons and CRUD Actions

After any UI, layout, styling, refactor, or feature change, verify every touched button, icon button, menu item, dropdown item, modal action, bottom sheet action, drawer action, and form submit action.

A button is not considered safe just because it appears on screen.

For every touched action, verify:

1. The button is still visible.
2. The button was not visually destroyed by styling changes.
3. The button is still clickable or tappable.
4. The button still calls the correct handler function.
5. The handler receives the correct ID, object, or payload.
6. The button still works inside lists, cards, modals, bottom sheets, drawers, and dropdown menus.
7. Loading states still work.
8. Disabled states still work.
9. Success states still update the UI.
10. Error states show a clear message.
11. Confirmation dialogs still appear before destructive actions.
12. Modal, bottom sheet, drawer, and dropdown open/close behavior still works.
13. No button was disconnected during AI edits.
14. No old handler, wrong ID, stale state, missing prop, or incorrect prop was introduced.

Check these actions especially:

- Create
- Add
- Submit
- Save
- Edit
- Update
- Delete
- Remove
- Archive
- Restore
- Approve
- Reject
- Cancel
- Close
- View
- Details
- Search
- Filter
- Sort
- Refresh
- Retry
- Load More
- Upload
- Send
- Confirm

For edit, delete, view, approve, reject, archive, and restore actions, always verify that the correct item ID is passed.

Example risk:

```tsx
onPress={() => handleEdit(item.id)}