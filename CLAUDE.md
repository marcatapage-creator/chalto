@AGENTS.md

## Avant chaque `git push origin main`

Lis RECETTE.md et rappelle à l'utilisateur les flux critiques à valider manuellement avant de pousser. Ne pousse jamais sans avoir affiché ce rappel. Si l'utilisateur confirme que la recette est ok, pousse. Sinon, attends sa confirmation.

---

## Domaine métier

**Chalto** est un SaaS pour professionnels du BTP (architectes, artisans, entrepreneurs).

Fonctionnalités core :
- Gestion de projets multi-phase : cadrage → conception → validation → chantier → réception → clôture
- Documents : draft → sent → approved/rejected, avec threads de commentaires
- Génération de CCTP (Cahier des Clauses Techniques) via Claude Opus 4.7
- Collaboration : contributeurs/prestataires avec tokens temporaires
- Validation clients : approbation/rejet de documents par lien tokenisé
- Notifications temps réel (Supabase Realtime)
- Emails transactionnels (Resend)

Enums métier dans `src/types/index.ts` : `DOCUMENT_STATUS`, `PROJECT_PHASE`, `AUTHOR_ROLE`, `TASK_STATUS`.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19, TypeScript 5 |
| Base de données / Auth | Supabase (PostgreSQL + JWT) |
| Styling | Tailwind CSS 4 + shadcn/ui (radix-nova) |
| Animations | Framer Motion |
| Formulaires | React Hook Form + Zod |
| Emails | Resend |
| IA | Anthropic SDK — claude-opus-4-7 |
| Rate limiting | Upstash Redis |
| Monitoring | Sentry + Vercel Analytics |
| Tests | Vitest (unit) + Playwright (E2E) |

---

## Structure des répertoires

```
src/
├── app/
│   ├── (auth)/           # login, register
│   ├── (dashboard)/      # pages auth-protégées (layout SSR avec redirect)
│   ├── api/              # ~15 Route Handlers
│   ├── blog/             # articles statiques
│   ├── validate/         # validation publique par token
│   ├── invite/           # acceptation invitation
│   ├── onboarding/       # setup post-signup
│   └── demo/
├── components/
│   ├── ui/               # shadcn/ui + composants motion réutilisables
│   ├── projects/         # domaine métier projets (composants lourds)
│   ├── dashboard/
│   └── contacts/, documents/, settings/, validate/
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # navigateur (use client)
│   │   ├── server.ts     # SSR/Server Components (cookies)
│   │   └── admin.ts      # service role (API routes back-office)
│   ├── api-schemas.ts    # schémas Zod de tous les endpoints
│   ├── utils.ts          # cn(), initials(), isChantierPhase()
│   ├── email.ts          # templates Resend
│   └── rate-limit.ts     # Upstash wrappers
├── hooks/
│   ├── use-realtime-channel.ts   # Supabase Realtime
│   └── use-notifications.ts
└── types/
    ├── index.ts          # constantes et types métier
    └── supabase.ts       # types générés Supabase
```

---

## Conventions de code

**Fichiers** : `kebab-case.tsx` pour tout.
**Composants** : PascalCase. `"use client"` si state/events/animations. Server Component par défaut sinon.
**Constantes** : `SCREAMING_SNAKE_CASE` pour enums, dictionnaires labels en `*_LABEL`.
**Alias** : `@/*` → `src/*` (tsconfig).

**Formatting (Prettier)** :
- Pas de semi-colon
- Double quotes
- Tab width 2
- Trailing comma: es5
- Print width: 100

Le pre-commit hook (Husky + lint-staged) formate automatiquement `*.ts` et `*.tsx`.

---

## Clients Supabase — choisir le bon

| Contexte | Import |
|----------|--------|
| `"use client"` (browser) | `import { createClient } from "@/lib/supabase/client"` |
| Server Component / Route Handler | `import { createClient } from "@/lib/supabase/server"` (async, cookies) |
| Opérations admin / service role | `import { createAdminClient } from "@/lib/supabase/admin"` |

---

## Variables d'environnement requises

Validées au démarrage dans `src/instrumentation.ts` :

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Optionnelles : `ANTHROPIC_API_KEY`, `BASE_URL` (Playwright CI).

---

## Validation des données API

Tous les schémas Zod sont centralisés dans `src/lib/api-schemas.ts`. Ne pas créer de schémas inline dans les route handlers — les ajouter dans ce fichier.

---

## Tests

```bash
# Unit (Vitest)
npm run test           # run once
npm run test:watch     # watch mode

# E2E (Playwright) — l'app doit tourner (npm run dev)
npm run test:e2e       # tous les tests headless
npm run test:e2e:ui    # interface graphique (debug)
npx playwright test tests/mon-test.spec.ts  # fichier unique
npx playwright test --headed               # voir le navigateur
```

Coverage minimum : 72% lignes, 65% branches.
Auth E2E persistée dans `e2e/.auth/user.json`.

---

## Fichiers clés à lire avant de modifier un domaine

| Domaine | Fichier |
|---------|---------|
| Types métier globaux | `src/types/index.ts` |
| Schémas API | `src/lib/api-schemas.ts` |
| Auth / protection routes | `src/app/(dashboard)/layout.tsx` |
| Génération IA (CCTP) | `src/app/api/generate-document/route.ts` |
| Composant projet principal | `src/components/projects/project-page-client.tsx` |
| Composant tâches (complexe) | `src/components/projects/project-tasks.tsx` |
