# OptiTax Suisse - Résumé fichier par fichier

Ce document décrit l’état actuel du projet OptiTax Suisse, application SaaS Next.js d’optimisation fiscale indicative pour résidents suisses.

## Racine

- `package.json`
  - Déclare l’application `optitax-suisse`.
  - Stack: Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma, NextAuth, Zod, React Hook Form, Recharts, React PDF.
  - Scripts principaux: `dev`, `build`, `typecheck`, `prisma:generate`, `prisma:migrate`, `prisma:seed`.

- `pnpm-lock.yaml`
  - Lockfile pnpm principal du projet.
  - `package-lock.json` a été supprimé pour éviter le mélange npm/pnpm.

- `pnpm-workspace.yaml`
  - Configure les dépendances dont les scripts natifs peuvent être approuvés par pnpm.

- `.env.example`
  - Variables nécessaires: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`.
  - Base exemple: `optitax_suisse`.

- `docker-compose.yml`
  - Lance PostgreSQL 16 en local.
  - Volume: `optitax_postgres`.

- `README.md`
  - Documentation principale: fonctionnalités, installation locale, déploiement Vercel, sécurité, architecture et limites fiscales.

- `RAPPORT_FINAL.md`
  - Rapport synthétique prêt à copier-coller: changements, architecture, lancement, état, limites, décisions produit.

- `RESUME_FICHIER_PAR_FICHIER.md`
  - Ce document.

- `middleware.ts`
  - Ajoute des headers sécurité: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

- `next.config.ts`
  - Configuration Next.js.
  - Active une limite de taille pour Server Actions.

- `tailwind.config.ts`
  - Configuration Tailwind avec dark mode, couleurs CSS variables, radius 8px, ombre premium.

- `postcss.config.js`
  - PostCSS avec Tailwind et Autoprefixer.

- `components.json`
  - Configuration shadcn/ui-style.

- `tsconfig.json`
  - Configuration TypeScript stricte avec alias `@/*`.

- `types/bcryptjs.d.ts`
  - Déclaration locale pour `bcryptjs`, afin d’éviter une dépendance de types externe.

## App Router

- `app/layout.tsx`
  - Layout racine.
  - Métadonnées SEO: OptiTax Suisse, optimisation fiscale suisse, 3e pilier, impôts cantonaux, comparaison fiscale cantons.
  - Injecte `Providers` et `SiteHeader`.

- `app/globals.css`
  - Styles globaux Tailwind.
  - Variables de thème clair/sombre.
  - Utilitaires visuels: grille premium, text balance.

- `app/page.tsx`
  - Landing page premium.
  - Sections: hero, fonctionnement, fonctionnalités, optimisations détectées, pour qui, sécurité, limites fiscales, simulateur rapide, témoignages fictifs, FAQ, footer.
  - CTA vers questionnaire et dashboard.

- `app/questionnaire/page.tsx`
  - Page contenant le questionnaire fiscal.
  - Explique que les données restent côté navigateur dans le prototype.

- `app/dashboard/page.tsx`
  - Page dashboard résultat.
  - Affiche le client dashboard avec score, impôts, recommandations, PDF, comparateur et lead.

- `app/login/page.tsx`
  - Page de connexion.
  - Affiche `LoginForm` et lien vers inscription.

- `app/register/page.tsx`
  - Page création de compte.
  - Affiche `RegisterForm`.

- `app/admin/page.tsx`
  - Admin protégé par rôle `ADMIN`.
  - Affiche leads, simulations et contenus de recommandations.
  - Ajoute filtre par canton et export CSV.

## API routes

- `app/api/auth/[...nextauth]/route.ts`
  - Route NextAuth.
  - Utilise `authOptions`.

- `app/api/register/route.ts`
  - Création utilisateur.
  - Validation Zod.
  - Rate limit simple.
  - Hash mot de passe avec bcrypt.

- `app/api/simulations/route.ts`
  - `POST`: valide le questionnaire, calcule le résultat et sauvegarde la simulation si la base est disponible.
  - `GET`: retourne les simulations de l’utilisateur connecté.

- `app/api/leads/route.ts`
  - Crée un lead avec nom, email, téléphone optionnel, canton, économie estimée, message, consentement explicite.
  - Validation Zod et rate limit.

- `app/api/admin/leads/route.ts`
  - Route admin protégée.
  - Retourne les leads en JSON.
  - Peut exporter en CSV via `?format=csv`.
  - Peut filtrer par canton via `?canton=VD`.

- `app/api/export/pdf/route.tsx`
  - Génère un rapport PDF avec React PDF.
  - Contenu: identité OptiTax Suisse, score, impôts avant/après optimisation, économies, recommandations, checklist, disclaimer.

## Composants layout

- `components/layout/providers.tsx`
  - Fournit `ThemeProvider` pour dark mode.

- `components/layout/site-header.tsx`
  - Header sticky.
  - Logo `OT`, navigation, bouton thème, connexion, CTA simulation.

## Composants auth

- `components/auth/login-form.tsx`
  - Formulaire de connexion client.
  - Utilise `signIn("credentials")`.

- `components/auth/register-form.tsx`
  - Formulaire d’inscription client.
  - Appelle `/api/register`.

## Questionnaire

- `components/questionnaire/tax-questionnaire.tsx`
  - Questionnaire multi-étapes avec barre de progression.
  - Étapes: résidence, famille, enfants, revenus, fortune, immobilier, prévoyance, déductions, entreprise.
  - Sauvegarde automatique côté client dans `localStorage` (`optitax:draft`).
  - Sauvegarde du dernier résultat dans `optitax:last-input` et `optitax:last-result`.
  - Correction anti-crash: la prévisualisation utilise `safeParse`, donc vider temporairement commune ou nombre d’enfants ne casse plus l’interface.
  - Normalise l’âge des enfants depuis un champ texte libre.
  - Affiche des erreurs claires sur commune/NPA, nationalité et nombre d’enfants.

## Dashboard

- `components/dashboard/dashboard-client.tsx`
  - Lit la dernière simulation depuis `localStorage`.
  - Affiche score, impôt avant optimisation, impôt après optimisation, économies possibles.
  - Affiche disclaimer fiscal.
  - Génère PDF via `/api/export/pdf`.
  - Affiche graphique de répartition fiscale.
  - Affiche comparateur cantonal graphique et liste détaillée.
  - Affiche cartes de recommandations avec temps, éligibilité, avertissement, guide.
  - Affiche checklist.
  - Ajoute formulaire lead “Être contacté par un fiscaliste” avec consentement.

## Graphiques

- `components/charts/tax-charts.tsx`
  - `TaxBreakdownChart`: graphique circulaire de répartition.
  - `CantonComparisonChart`: graphique barres comparateur cantonal.

## UI

- `components/ui/button.tsx`
  - Bouton style shadcn avec variantes `default`, `secondary`, `outline`, `ghost`, `swiss`.

- `components/ui/card.tsx`
  - Composants `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

- `components/ui/input.tsx`
  - Input stylé.

- `components/ui/label.tsx`
  - Label Radix.

- `components/ui/progress.tsx`
  - Barre de progression Radix.

- `components/ui/badge.tsx`
  - Badge avec variantes `default`, `secondary`, `outline`, `success`, `warning`.

- `components/ui/separator.tsx`
  - Séparateur Radix.

## Lib

- `lib/constants.ts`
  - Liste des 26 cantons avec coefficients indicatifs.
  - Cantons utilisés dans le comparateur.
  - Plafonds indicatifs 3a.
  - Liens officiels: AFC, ch.ch, calculateur fiscal, OFAS.

- `lib/validators.ts`
  - Schémas Zod.
  - `questionnaireSchema`: valide toutes les données fiscales.
  - Convertit les champs numériques vides en `0`, ce qui évite les crashs pendant la saisie.
  - `leadSchema`: impose le consentement explicite.

- `lib/tax-engine.ts`
  - Moteur fiscal indicatif.
  - Calcule revenu total, fortune, déductions, impôt fédéral indicatif, impôt cantonal/communal indicatif, fortune, église.
  - Génère recommandations personnalisées.
  - Ajoute commentaires TODO pour brancher plus tard les vrais barèmes officiels.
  - Renvoie un `TaxResult` complet: avant/après optimisation, score, breakdown, checklist, comparaison cantonale.

- `lib/auth.ts`
  - Configuration NextAuth avec Credentials Provider.
  - Utilise Prisma Adapter.
  - Ajoute rôle dans JWT et session.

- `lib/prisma.ts`
  - Client Prisma singleton.

- `lib/rate-limit.ts`
  - Rate limit mémoire simple.
  - Suffisant pour prototype, à remplacer par Redis/Upstash en production.

- `lib/utils.ts`
  - `cn` pour classes CSS.
  - Format CHF.
  - Format pourcentage.

## Prisma

- `prisma/schema.prisma`
  - `User`: utilisateur, rôle, comptes, sessions, simulations, leads, admin logs.
  - `Account`, `Session`, `VerificationToken`: modèles NextAuth.
  - `Simulation`: stocke données saisies, résultat estimé, revenu/fortune imposable, impôt, économies, score.
  - `Lead`: nom, email, téléphone, canton, message, économie, consentement, lien simulation possible.
  - `RecommendationContent`: contenu éditable des recommandations.
  - `AdminLog`: base pour audit admin.
  - Enums: `Role`, `LeadStatus`.

- `prisma/seed.ts`
  - Crée un admin `admin@optitax.local`.
  - Seed d’un contenu de recommandation.
  - Seed de deux leads exemple avec consentement.

## Assets

- `public/assets/hero-dashboard.png`
  - Visuel raster local utilisé sur la landing page.

## État du build

Le code source a été corrigé et structuré. L’installation locale `node_modules` est actuellement incohérente parce qu’une installation pnpm a été interrompue sans accès réseau: les dossiers `.pnpm` existent, mais plusieurs paquets principaux n’ont plus leurs fichiers réels.

Réparation recommandée:

```bash
cd outputs/fiscalai-suisse
rm -rf node_modules
pnpm install
pnpm prisma:generate
pnpm typecheck
pnpm build
pnpm dev
```

Une fois les dépendances réinstallées, le projet doit être vérifié avec:

```bash
pnpm typecheck
pnpm build
```

## Priorités suivantes

1. Réinstaller les dépendances et confirmer le build.
2. Intégrer vrais barèmes fiscaux par année, canton et commune.
3. Ajouter tests automatisés du questionnaire et du moteur fiscal.
4. Ajouter récupération de mot de passe.
5. Ajouter consentement explicite avant sauvegarde serveur des simulations complètes.
6. Ajouter paiement Stripe et plans SaaS.
7. Ajouter politique de confidentialité RGPD/LPD.
