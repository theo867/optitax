# OptiTax Suisse

Application web SaaS d'optimisation fiscale pour résidents suisses.

## Fonctionnalités

- Landing page SEO: optimisation fiscale suisse, réduire ses impôts en Suisse, 3e pilier, rachat LPP, fiscalité suisse, impôts cantonaux.
- Questionnaire multi-étapes: résidence, famille, enfants, revenus, fortune, immobilier, prévoyance, déductions, entreprise.
- Reconnaissance NPA/commune/canton avec `3280 → Morat / Murten → FR` et structure extensible.
- Sauvegarde des réponses côté client pour éviter de perdre une simulation en cours.
- Moteur de règles: 3e pilier, rachat LPP, déductions oubliées, immobilier, placements, dividendes, indépendant, succession, frais médicaux et comparaison cantonale.
- Dashboard: score fiscal, impôts avant/après optimisation, économies potentielles, graphiques Recharts, checklist.
- Comparateur: Zoug, Schwytz, Nidwald, Obwald, Lucerne, Valais, Vaud, Genève, Fribourg, Berne, Zurich.
- Formulaire lead avec consentement explicite pour futur fiscaliste partenaire.
- Compte utilisateur: inscription, connexion NextAuth, historique de simulations via API.
- Admin: leads, simulations, contenus de recommandations, modèle d'audit.
- Export PDF personnalisé.
- Prisma + PostgreSQL, Zod, React Hook Form, Tailwind, shadcn/ui-style, dark mode.

## Important fiscal

Les calculs livrés sont volontairement estimatifs. Les coefficients cantonaux du fichier `lib/constants.ts` et la formule de `lib/tax-engine.ts` servent à démontrer le produit. Avant production, ils doivent être remplacés par des barèmes officiels maintenus par année, canton et commune, idéalement validés par un expert fiscal suisse.

## Installation locale

```bash
cd outputs/fiscalai-suisse
cp .env.example .env
docker compose up -d
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Ouvrir ensuite `http://localhost:3000`.

Compte admin seed:

- Email: `admin@optitax.local`
- Mot de passe: `ChangeMe123!`

Changez ces valeurs avant toute mise en ligne.

## Déploiement Vercel

1. Créer une base PostgreSQL compatible Prisma: Vercel Postgres, Neon, Supabase ou autre.
2. Ajouter les variables d'environnement:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `ADMIN_EMAIL`
3. Lancer en local ou CI:

```bash
npm ci
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run build
```

4. Déployer sur Vercel.
5. Ajouter un provider email transactionnel pour la récupération de mot de passe.

## Sécurité et conformité

Déjà inclus:

- Validation serveur Zod sur les entrées sensibles.
- NextAuth pour session et protection admin.
- Hash de mot de passe avec bcrypt.
- Limitation simple de requêtes en mémoire pour routes publiques.
- Headers de sécurité dans `middleware.ts`.
- Données personnelles isolées dans Prisma.

À ajouter pour production:

- Rate limiting persistant Redis ou Upstash.
- Journal d'audit admin.
- Bannière cookies si tracking.
- Politique de confidentialité RGPD/LPD.
- Chiffrement applicatif des payloads fiscaux très sensibles.
- Double authentification pour administrateurs.
- Vraie récupération de mot de passe par email.

## Architecture

```text
app/
  api/
    auth/[...nextauth]/route.ts
    export/pdf/route.tsx
    leads/route.ts
    register/route.ts
    simulations/route.ts
    admin/leads/route.ts
  admin/page.tsx
  dashboard/page.tsx
  login/page.tsx
  questionnaire/page.tsx
  register/page.tsx
components/
  auth/
  charts/
  dashboard/
  layout/
  questionnaire/
  ui/
lib/
  auth.ts
  constants.ts
  prisma.ts
  rate-limit.ts
  tax-engine.ts
  utils.ts
  validators.ts
prisma/
  schema.prisma
  seed.ts
public/assets/
```

## Tester les comptes

PostgreSQL doit être démarré et les migrations doivent avoir été appliquées.

1. Ouvrir `/register`, saisir un nom, un email et un mot de passe de 10 caractères minimum.
2. Après création, la connexion est automatique et le nom ou l'email apparaît dans le header.
3. Utiliser `Déconnexion`, puis ouvrir `/login` et reprendre les mêmes identifiants.
4. L'administration n'apparaît que pour un compte dont le rôle Prisma est `ADMIN`.

Le compte administrateur de démonstration est créé par le seed. Changez immédiatement son mot de passe avant toute exposition publique.

## Données NPA suisses

L'échantillon se trouve dans `lib/swiss-postal-codes.ts`. Il contient plusieurs grandes villes et le cas obligatoire `3280` pour Morat / Murten, canton de Fribourg. Pour une mise en production, remplacez `SWISS_LOCALITIES` par un import versionné du répertoire officiel des localités de la Poste suisse. Conservez le type `SwissLocality` et la fonction `findSwissLocalities` afin de ne pas modifier le questionnaire.

## Tester le PDF

1. Compléter le questionnaire et ouvrir le dashboard.
2. Cliquer sur `Rapport PDF`.
3. Vérifier le logo, les quatre indicateurs, les recommandations, la checklist, le disclaimer et la pagination.
4. Le fichier téléchargé s'appelle `rapport-optitax-suisse.pdf`.

## Variables d'environnement

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/optitax_suisse?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
ADMIN_EMAIL="admin@optitax.local"
```

## Routes principales

- `/`: landing page.
- `/questionnaire`: saisie fiscale multi-étapes.
- `/dashboard`: résultat, recommandations, PDF, lead.
- `/login` et `/register`: compte utilisateur.
- `/admin`: espace admin protégé par rôle `ADMIN`.
- `/api/simulations`: sauvegarde et historique.
- `/api/leads`: création de lead avec consentement.
- `/api/export/pdf`: export PDF.

## Prochaines améliorations recommandées

- Importer les barèmes cantonaux et communaux par année.
- Ajouter un moteur de versioning fiscal par année fiscale.
- Connecter les administrations cantonales ou documents officiels en sources.
- Ajouter un mode professionnel pour avocat fiscaliste avec commentaires sur rapport.
- Ajouter paiements Stripe et plans SaaS.
- Ajouter consentement explicite avant sauvegarde complète des simulations côté serveur.
- Ajouter récupération de mot de passe et double authentification admin.
