# Kaizen OS v0.4 — Daily-Use Beta

Kaizen OS is the living operating system for Pepp + Luke. v0.4 is deployment-ready for Vercel and installable as a home-screen PWA.

## What works now
- Today command center, calendar layers, tasks, meetings, workspaces, people, tools, Luke shell.
- Kaizen-first task/event creation with a provider-neutral sync queue.
- Personal + Kaizen locked as the default write calendar identity.
- Mike Intake and Monday quick launch.
- Full-screen PWA metadata, app icon set, iPhone home-screen support, service-worker cache/offline shell.
- Vercel configuration included.

## Deploy to Vercel
1. Import this folder/repository into Vercel.
2. Framework preset: **Other**. No build command. Output directory: project root.
3. Deploy. Vercel provides HTTPS automatically.
4. Open the deployed URL in Safari on iPhone.
5. Tap Share → Add to Home Screen → Add.

## Important sync status
Google Calendar and Google Tasks are **not live yet**. The front end queues changes, but real two-way sync requires Google OAuth and secure server-side API routes. Never place Google client secrets or refresh tokens in browser JavaScript.

## v0.5 target
Secure Google sign-in + Calendar/Tasks two-way sync, conflict handling, and real account mapping.
