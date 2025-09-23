# CP Project — Application Overview

This document is a concise orientation for a new technical assistant joining the CP project. It describes the app, architecture, common workflows, tools used, environment variables (redacted), deployment and security features, and recommended next steps.

## Quick summary

- App name: IODD (Internal Open Data Directory / Community Project)
- Location in repo: `client/iodd-New-02` (frontend client), `server3/s32_iodd-data-api` (API/backend)
- Stack: Vanilla JS frontend (client) + Node.js backend (API); MySQL database; simple static HTML pages augmented with client-side JS.

## High-level architecture

1. Frontend: `client/iodd-New-02`
   - Static HTML files in the project root (index.html, member pages, admin pages).
   - Client-side JS files live alongside HTML (e.g., `main.js`, `member-list-client.js`).
   - Builds: no modern bundler detected; files are served as static assets.

2. Backend/API: `server3/s32_iodd-data-api`
   - Node.js-based API server (see `package.json` inside `server3/s32_iodd-data-api` and top-level `server3` package).
   - Connects to a MySQL database.
   - Environment configuration lives in `server3/s32_iodd-data-api/api/.env`.

3. Database: MySQL
   - Connection settings are provided via environment variables. Production credentials are NOT stored here in the docs — see `.env` in the API for the current values (redacted below).

## Important environment variables (redacted)

The following keys are present in `server3/s32_iodd-data-api/api/.env` — values should be treated as secrets and stored in a secrets manager for production.

- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
- Server_Port or PORT
- Remote_API_URL, Local_API_URL

(Example snippet from `.env` has been redacted.)

## Common developer workflows

1. Local backend start
   - cd into `server3/s32_iodd-data-api` and run `npm install` (once).
   - Set up `.env` in `server3/s32_iodd-data-api/api/` with local DB credentials and `Server_Port`.
   - Run `npm start` to launch the API. If there are errors about a specific file and line number (e.g., "line 17"), open the referenced file and inspect the code.

2. Frontend serve
   - The frontend is static. You can open `client/iodd-New-02/index.html` in a browser or serve the directory with a static server such as `http-server` or the API when configured.

3. Debugging tips
   - Use console.log in client JS files and Node stack traces for server-side issues.
   - Confirm environment variables are loading correctly (check `process.env` in Node startup code).

## Tools used

- Node.js and npm — server runtime and package management.
- MySQL (remote host) — data store.
- Lightweight editors (VS Code) — development.
- Utilities: `http-server` for quick static serving, `mysql` CLI for DB inspection.

## Security features and practices

- Credentials: Currently stored in `server3/s32_iodd-data-api/api/.env` for local development. For production, use a secrets manager (Vault, AWS Secrets Manager) or environment variables set by the host.
- DB access: Use least-privilege DB users; restrict network access to DB from the API host only.
- Transport: Use HTTPS for production `Remote_Host` (the repo references `https://iodd.com`).
- Logging: Avoid writing secrets to logs. Redact or omit credentials in any log output.
- Input validation: Server endpoints should validate and sanitize inputs to prevent SQL injection.
- Backups: Maintain regular DB backups and retain them securely.

## Common failure modes

- Missing or malformed `.env` — server fails early with missing DB host or port.
- Port conflicts — ensure `Server_Port` isn't in use.
- Database credential or network errors — check DB host reachability and credentials.

## Onboarding checklist for the new assistant

1. Clone the repo and open it in VS Code.
2. Inspect `client/iodd-New-02` and run the static pages locally.
3. Inspect `server3/s32_iodd-data-api` and review `package.json` and `api/` folder.
4. Create a local `.env` in `server3/s32_iodd-data-api/api/` with dev credentials (ask the team or use a secrets management step).
5. Run `npm install` and `npm start` in the API folder; fix any startup errors (note line numbers in stack traces).
6. Run a smoke test: open a member list page and confirm API calls succeed.

## Next steps and recommendations

- Move production secrets out of the repo and into a secrets manager.
- Add automated tests for critical server routes (unit/integration) and for the frontend where possible.
- Add a README in `server3/s32_iodd-data-api` with explicit start instructions and required env vars.
- Add a lint or CI check for obvious issues before merging.

---

If you want, I can also:
- Create a `README.md` in `server3/s32_iodd-data-api` listing exact env vars and startup commands.
- Run the API locally and fix the "line 17" startup error you mentioned earlier — I can reproduce and patch it.

