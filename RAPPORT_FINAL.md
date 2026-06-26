# Rapport final - OptiTax Suisse

## Résumé des changements

- Renommage produit: FiscalAI Suisse devient OptiTax Suisse dans l'interface, les metadata, le PDF, le README, l'admin et les variables d'exemple.
- Correction du crash questionnaire: la prévisualisation utilise maintenant une validation tolérante pendant la frappe. Effacer temporairement la commune ou le nombre d'enfants ne fait plus tomber l'application.
- Ajout d'une sauvegarde automatique côté navigateur avec `localStorage` (`optitax:draft`).
- Questionnaire enrichi: commune ou NPA, âge des enfants, repas, autres actifs, dettes, statut immobilier, frais professionnels.
- Moteur fiscal enrichi: impôt avant/après optimisation, recommandations avec priorité, difficulté, temps de mise en œuvre, éligibilité et avertissement.
- Dashboard amélioré: métriques avant/après, disclaimer, comparaison cantonale en graphique et liste mobile, recommandations plus détaillées, formulaire lead avec consentement.
- PDF amélioré: nom OptiTax Suisse, avant/après optimisation, recommandations détaillées et avertissements.
- Prisma amélioré: Lead avec téléphone, message, consentement, lien simulation; ajout `AdminLog`.
- Admin amélioré: filtre canton et export CSV des leads.
- README mis à jour pour OptiTax Suisse.

## Architecture actuelle

Pages principales:

- `/`: landing page premium SEO.
- `/questionnaire`: questionnaire fiscal multi-étapes.
- `/dashboard`: résultat fiscal, recommandations, checklist, comparateur, PDF, lead.
- `/login`: connexion NextAuth.
- `/register`: création de compte.
- `/admin`: espace admin protégé.

Composants principaux:

- `components/questionnaire/tax-questionnaire.tsx`: parcours multi-étapes, validation, sauvegarde locale.
- `components/dashboard/dashboard-client.tsx`: dashboard, PDF, lead, comparaison cantonale.
- `components/charts/tax-charts.tsx`: graphiques Recharts.
- `components/layout/site-header.tsx`: navigation et dark mode.
- `components/ui/*`: composants style shadcn/ui.

Fichiers importants:

- `lib/tax-engine.ts`: moteur fiscal indicatif.
- `lib/validators.ts`: schémas Zod.
- `lib/constants.ts`: cantons, coefficients indicatifs, liens officiels.
- `lib/auth.ts`: configuration NextAuth.
- `prisma/schema.prisma`: modèles User, Simulation, Lead, RecommendationContent, AdminLog.
- `app/api/*`: routes API.

API routes:

- `POST /api/register`: création utilisateur.
- `GET/POST /api/simulations`: historique et sauvegarde simulation.
- `POST /api/leads`: création lead avec consentement.
- `GET /api/admin/leads`: leads JSON ou CSV, protégé admin.
- `POST /api/export/pdf`: rapport PDF.
- `/api/auth/[...nextauth]`: NextAuth.

## Comment lancer le projet

```bash
cd outputs/fiscalai-suisse
pnpm install
cp .env.example .env
docker compose up -d
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

Variables nécessaires:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/optitax_suisse?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
ADMIN_EMAIL="admin@optitax.local"
```

Compte admin seed:

- Email: `admin@optitax.local`
- Mot de passe: `ChangeMe123!`

Erreurs possibles:

- Si `node_modules` a été interrompu ou corrompu, supprimer le dossier `node_modules` puis relancer `pnpm install`.
- Si Prisma signale un client obsolète, relancer `pnpm prisma:generate`.
- Si PostgreSQL n'est pas lancé, exécuter `docker compose up -d`.

## Ce qui marche déjà

- Landing page premium avec sections produit, FAQ, sécurité, limites fiscales.
- Questionnaire multi-étapes avec progression, retour, sauvegarde locale et validation.
- Correction du crash sur commune/NPA et nombre d'enfants.
- Dashboard résultat avec score, impôt estimé, économies potentielles, recommandations, checklist.
- Comparateur cantonal indicatif.
- Export PDF.
- Création de compte et connexion via NextAuth.
- Admin protégé par rôle.
- Prisma/PostgreSQL prêt pour sauvegarde simulations et leads.

## Ce qui reste à faire

Priorités:

1. Réinstaller proprement les dépendances si `node_modules` est corrompu.
2. Relancer `pnpm typecheck` et `pnpm build`.
3. Intégrer de vrais barèmes fiscaux officiels par année, canton et commune.
4. Ajouter récupération de mot de passe email.
5. Ajouter paiements et plans SaaS.
6. Ajouter consentement explicite avant sauvegarde complète de données fiscales sensibles côté serveur.
7. Ajouter journal d'audit admin complet.
8. Ajouter tests automatisés du questionnaire et du moteur fiscal.

Limites fiscales:

- Les montants sont indicatifs.
- Les coefficients cantonaux actuels sont des approximations produit.
- La comparaison cantonale ne remplace pas une analyse de résidence fiscale réelle.
- Les décisions LPP, immobilier, société, succession et déménagement doivent être validées par un expert.

Sécurité production:

- Utiliser un `NEXTAUTH_SECRET` fort.
- Utiliser Redis/Upstash pour le rate limit.
- Ajouter 2FA admin.
- Ajouter chiffrement applicatif pour simulations fiscales sensibles.
- Ajouter politique de confidentialité RGPD/LPD.

Monétisation:

- Freemium: estimation simple gratuite.
- Plan premium: PDF complet, historique, scénarios illimités.
- Lead qualifié: mise en relation fiscaliste partenaire.
- Offre B2B: espace fiscaliste avec commentaires et suivi client.

## Questions pour la suite

- Le nom final est-il bien `OptiTax Suisse` partout, ou faut-il garder `FiscalAI` comme nom interne?
- Faut-il sauvegarder les simulations complètes en base par défaut, ou seulement après consentement?
- Quel fiscaliste/expert validera les règles fiscales avant lancement public?
- Veux-tu un modèle freemium, abonnement, paiement au rapport ou génération de leads?
- Quels cantons doivent être exacts en premier: Vaud, Genève, Zurich, Valais, Fribourg?
- Veux-tu une interface multilingue français/allemand/anglais?
- Faut-il intégrer Stripe dès maintenant?
- Faut-il créer une vraie page de politique de confidentialité et conditions générales?
