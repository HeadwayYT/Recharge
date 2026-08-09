# Recharge

Recharge is a mobile-first employee wellbeing MVP focused on sleep, recovery, and energy.

The first product slice demonstrates one polished adaptive journey:

Landing -> free-text intake -> pattern extraction -> optional missing-data question -> selected experiment -> Today.

## Product Shape

- No account creation before value.
- No real AI API yet.
- Mock behaviour-engine scenarios live in `lib/recharge.ts`.
- Approved experiments, active experiments, check-ins, learned signals, and next-best interactions are modeled centrally.
- UI screens live in `app/page.tsx`.
- Design tokens and responsive styling live in `app/globals.css`.

## Run Locally

```bash
npm run dev
```

## Validate

```bash
npm run build
npm test
```
