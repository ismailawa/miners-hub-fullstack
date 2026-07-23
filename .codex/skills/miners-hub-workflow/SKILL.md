---
name: miners-hub-workflow
description: Enforce the Miners Hub development workflow. Use this skill for any implementation, bug fix, refactor, documentation update, architecture change, database change, API change, UI/UX change, test task, sprint task, or project planning task in the Miners Hub repository.
---

# Miners Hub Workflow Guidelines

When asked to implement a feature, fix a bug, refactor code, update docs, or perform any development task for the Miners Hub project, follow this workflow.

## 1. Review Project Documentation

Before modifying code, configuration, database migrations, UI, or project documentation, read the relevant Miners Hub specification documents:

- `docs/Miners_Hub_PRD.md`
- `docs/Miners_Hub_System_Architecture.md`
- `docs/Miners_Hub_Database_Schema.md`
- `docs/Miners_Hub_API_Contracts.md`
- `docs/Miners_Hub_UI_UX_Specification.md`

If a task touches database structure, use `docs/Miners_Hub_Database_Schema.md` as the schema reference and cross-check proposed architecture decisions in `docs/Miners_Hub_System_Architecture.md`.

If a task touches backend routes, DTOs, frontend API clients, WebSockets, or integration contracts, read `docs/Miners_Hub_API_Contracts.md`.

If the task touches product behavior, roadmap, roles, compliance, traceability, GIS, marketplace, logistics, laboratory, investor, escrow, KYC, AI, or mobile/PWA work, read the relevant sections from the Miners Hub docs before implementation.

## 2. Locate the Task in the Sprint Checklist

Open `docs/sprints_tasks.md` before implementation.

Identify the sprint, story, and task that most closely match the user's request. Prefer the smallest specific task. If no matching task exists, add a new unchecked task under the closest sprint/story with a concise description.

Use these task states:

- `[ ]` Not started
- `[/]` In progress
- `[x]` Completed
- `[!]` Blocked

## 3. Mark the Task In Progress

Before editing implementation files, update `docs/sprints_tasks.md` and change the selected task from `[ ]` to `[/]`.

If the task was missing, add it as `[/]` under the closest matching story.

Never start implementation work before the sprint checklist reflects the task as in progress.

## 4. Implement According to Miners Hub Standards

Follow the existing repository architecture:

- Frontend: `miners-hub-frontend`, Next.js, React, TypeScript, Tailwind CSS.
- Backend: `miners-hub-backend`, NestJS, TypeScript, TypeORM, PostgreSQL.
- Integrations already present: MetaMap-style KYC, Flutterwave escrow/payments, SignNow contracts, Cloudinary/media uploads, Socket.IO chat, AI endpoints.

Use existing modules, DTO patterns, entities, services, controllers, API clients, components, dashboard layouts, and styling conventions before introducing new abstractions.

For Miners Hub feature work, align with the documented modules:

- Miner Registry
- GIS Mine Mapping
- Licensing and Compliance
- Production Reporting
- Buyer Marketplace
- Logistics Management
- Laboratory Integration
- Mineral Passport and Traceability
- Environmental Monitoring
- Revenue Analytics
- Investor Portal
- Mobile/PWA field workflows

For UI work, follow `docs/Miners_Hub_UI_UX_Specification.md`:

- Build role-aware operational dashboards, not marketing-style app screens.
- Surface verification, review, payment, escrow, compliance, and traceability status clearly.
- Use tables, split-detail views, timelines, steppers, status chips, upload states, and confirmation flows where appropriate.
- Preserve accessibility, responsive behavior, clear empty/loading/error states, and low-bandwidth-friendly interactions.

For backend work, follow `docs/Miners_Hub_System_Architecture.md`:

- Keep domain logic inside focused NestJS modules.
- Use DTO validation and role-aware authorization.
- Keep webhook handlers idempotent.
- Record audit logs for regulated, payment, compliance, document, and admin actions.
- Use migrations for database changes.
- Prefer PostGIS-compatible modeling for mine site geography when GIS work begins.

## 5. Verify

Run targeted validation appropriate to the change:

- Backend: unit, integration, e2e, build, or lint commands as relevant.
- Frontend: build, lint, typecheck, or focused manual verification as relevant.
- Documentation-only changes: inspect generated docs and check links/headings.

If validation cannot run, record the reason in the final response and do not mark the task complete unless the work itself is complete and only external validation is unavailable.

## 6. Mark the Task Completed or Blocked

After implementation and verification:

- Change the task in `docs/sprints_tasks.md` from `[/]` to `[x]` when complete.
- Change it to `[!]` only when genuinely blocked by missing decisions, unavailable credentials, inaccessible services, or user input that cannot be inferred safely.

If the task creates follow-up work, add new `[ ]` tasks in the relevant sprint/story.

## Critical Rules

- Never skip reading the Miners Hub docs before Miners Hub development work.
- Never skip updating `docs/sprints_tasks.md`.
- Never mark a task `[x]` before the implementation is complete.
- Do not invent completed capabilities. Distinguish current implementation from planned Miners Hub roadmap features.
- Keep changes scoped to the user request and Miners Hub architecture.
