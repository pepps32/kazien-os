# Kaizen OS v0.4 — Google-ready combined source

This folder combines the complete Kaizen OS v0.4 site with the secure Google OAuth backend routes.

## Included
- Existing Kaizen OS app files and assets
- `api/google/login.js`
- `api/google/callback.js`
- `api/google/status.js`
- `api/google/logout.js`
- `api/google/calendar.js`
- `api/google/tasks.js`
- `api/_lib/google.js`
- Vercel routing updated so `/api/*` is not rewritten to the single-page app

## Required Vercel environment variables
These should already be configured in the Vercel project:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `KAIZEN_SESSION_SECRET`

Expected redirect URI:
`https://kaizenosv04-1.vercel.app/api/google/callback`

Expected JavaScript origin in Google Cloud:
`https://kaizenosv04-1.vercel.app`

## Important
No Google secret or OAuth token is included in this ZIP.

The backend routes are present, but the current v0.4 front-end still needs the next UI wiring step for a visible Connect Google button and automatic two-way sync calls.
