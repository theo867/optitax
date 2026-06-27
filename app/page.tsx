import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, FileText, Landmark, LockKeyhole, Scale, ShieldCheck, Sparkles, Users, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CANTONS } from "@/lib/constants";

const features = [
  { icon: BarChart3, title: "Estimation fiscale", text: "Projection revenu, fortune, impôt fédéral, cantonal, communal et église selon hypothèses." },
  { icon: Sparkles, title: "Optimisations", text: "3e pilier, rachats LPP, frais immobiliers, famille, placements, dividendes et activité indépendante." },
  { icon: WalletCards, title: "Comparaison cantonale", text: "Vue comparative sur les cantons souvent analysés pour résidence et fiscalité." },
  { icon: FileText, title: "Rapport PDF", text: "Résumé personnalisé avec checklist et recommandations actionnables." },
  { icon: LockKeyhole, title: "Sécurité", text: "Validation stricte, protection des routes et architecture prête pour RGPD/LPD." }
];

const faqs = [
  ["Est-ce un conseil fiscal officiel ?", "Non. OptiTax Suisse donne des estimations et pistes de préparation. Les décisions importantes doivent être validées avec les autorités ou un expert fiscal."],
  ["Les montants sont-ils exacts au franc près ?", "Non. Les barèmes communaux, déductions et règles changent. Le moteur est conçu pour être remplacé ou enrichi avec des tables officielles maintenues."],
  ["À qui s'adresse l'outil ?", "Aux étudiants, salariés, familles, retraités, indépendants, investisseurs et propriétaires résidant en Suisse."],
  ["Puis-je exporter un PDF ?", "Oui. Le projet inclut une route d'export PDF côté serveur avec un rapport personnalisé."]
];

export default function HomePage() {
  return (
    <main>
      <section className="relative isolate flex min-h-[min(760px,calc(100svh-4.5rem))] items-center overflow-hidden border-b bg-navy text-white">
        <Image src="/assets/hero-dashboard.png" fill priority alt="Aperçu du dashboard OptiTax Suisse" className="-z-20 object-cover object-center opacity-25" />
        <div className="absolute inset-0 -z-10 bg-navy/80" />
        <div className="container py-20 md:py-28">
          <div className="max-w-4xl">
            <Badge className="mb-6 border-copper-light/40 bg-transparent text-copper-light">Fiscalité suisse · Analyse indicative</Badge>
            <h1 className="max-w-4xl text-balance font-display text-5xl font-semibold leading-[1.02] md:text-7xl">
              Découvrez combien vous pourriez économiser sur vos impôts.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/72">
              OptiTax Suisse analyse votre canton, famille, revenus, fortune, immobilier et prévoyance
              pour produire une estimation, des optimisations et une checklist claire.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-navy hover:bg-sand">
                <Link href="/questionnaire">
                  Découvrez combien vous pourriez économiser sur vos impôts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/dashboard">Voir le dashboard</Link>
              </Button>
            </div>
            <div className="mt-9 grid gap-3 text-sm text-white/65 sm:grid-cols-3">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-copper-light" /> Fiscalité suisse</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-copper-light" /> Export PDF professionnel</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-copper-light" /> Données confidentielles</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container grid gap-4 py-4 text-xs font-semibold text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-copper" /> Données confidentielles</span>
          <span className="flex items-center gap-2"><Landmark className="h-4 w-4 text-copper" /> Fiscalité suisse</span>
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-copper" /> Simulation indicative</span>
          <span className="flex items-center gap-2"><Scale className="h-4 w-4 text-copper" /> Aucun conseil personnalisé</span>
        </div>
      </section>

      <section className="container py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Comment ça fonctionne</p>
          <h2 className="mt-3 text-balance font-display text-4xl font-semibold md:text-5xl">Un parcours simple pour une matière complexe.</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {["Répondez au questionnaire", "Recevez vos priorités", "Exportez le rapport"].map((title, index) => (
            <Card key={title}>
              <CardHeader>
                <div className="mb-4 grid h-10 w-10 place-items-center bg-navy font-display text-lg text-white">{index + 1}</div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                  {index === 0 && "Canton, commune, famille, revenus, fortune, immobilier, prévoyance et déductions."}
                  {index === 1 && "Score fiscal, impôts estimés, économies potentielles et actions classées par priorité."}
                  {index === 2 && "Un PDF clair à conserver ou préparer avant un rendez-vous avec un fiscaliste."}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="fonctionnalites" className="border-y bg-card py-20">
        <div className="container">
          <div className="max-w-3xl">
            <p className="section-kicker">Fonctionnalités</p>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold md:text-5xl">Une lecture structurée de votre situation fiscale.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-7 w-7 text-copper" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{feature.text}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">Optimisations détectées</p>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold md:text-5xl">Des leviers concrets, expliqués simplement.</h2>
            <p className="mt-4 text-muted-foreground">
              Le moteur reste indicatif, mais il structure déjà les grands sujets à vérifier avant une déclaration ou un rendez-vous fiscal.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["3e pilier sous-utilisé", "Rachat LPP possible", "Frais de garde", "Frais immobiliers", "Transport et repas", "Dividendes et société", "Assurance maladie", "Comparaison cantonale"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 text-success" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="securite" className="border-y bg-sand/55 py-20 dark:bg-white/[0.03]">
        <div className="container grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Users className="h-7 w-7 text-primary" />
              <CardTitle>Pour qui ?</CardTitle>
              <CardDescription>
                Étudiants, jeunes actifs, familles, couples mariés, célibataires, indépendants, propriétaires, retraités et personnes fortunées.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <LockKeyhole className="h-7 w-7 text-primary" />
              <CardTitle>Sécurité des données</CardTitle>
              <CardDescription>
                Validation des formulaires, consentement explicite pour les leads, headers sécurité et aucune transmission à un tiers dans le prototype.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Scale className="h-7 w-7 text-primary" />
              <CardTitle>Limites fiscales</CardTitle>
              <CardDescription>
                Les calculs sont des estimations. Les barèmes officiels par canton, commune et année fiscale doivent être intégrés avant production.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="container grid gap-8 py-20 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="section-kicker">Simulateur rapide</p>
          <h2 className="mt-3 font-display text-4xl font-semibold">Une première lecture en quelques instants.</h2>
          <p className="mt-4 text-muted-foreground">
            Le questionnaire complet affine ensuite l'estimation et identifie les leviers concrets.
          </p>
        </div>
        <Card>
          <CardContent className="grid gap-4 pt-5 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Canton</p>
              <p className="mt-2 font-semibold">{CANTONS.find((c) => c.code === "VD")?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenu foyer</p>
              <p className="mt-2 font-semibold">CHF 120'000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Optimisation typique</p>
              <p className="mt-2 font-semibold text-success">CHF 2'000 à 7'500</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y bg-sand/55 py-20 dark:bg-white/[0.03]">
        <div className="container">
          <div className="mb-10 max-w-2xl"><p className="section-kicker">Retours d’utilisation</p><h2 className="mt-3 font-display text-4xl font-semibold">Des profils différents, une même exigence de clarté.</h2></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[
              ["Nadia, 29 ans", "Jeune active, Vaud", "Le rapport m’a permis d’identifier les justificatifs à réunir pour mon 3e pilier et ma formation, sans me promettre un résultat irréaliste."],
              ["Marc et Elena", "Famille, Fribourg", "La checklist nous a aidés à préparer les frais de garde et les attestations avant notre rendez-vous. L’estimation nous a surtout donné les bonnes questions à poser."],
              ["David, 41 ans", "Indépendant, Genève", "J’ai apprécié la distinction entre pistes simples et sujets à faire valider. La partie frais professionnels m’a servi de base de travail avec ma fiduciaire."],
              ["Sophie, 52 ans", "Propriétaire, Berne", "Le résumé immobilier est clair et prudent. J’ai pu comparer entretien effectif et déduction forfaitaire avec des documents mieux organisés."],
              ["Pierre, 63 ans", "Proche de la retraite, Valais", "La comparaison cantonale ne remplace pas un conseil, mais elle m’a aidé à préparer une discussion structurée sur la prévoyance et le futur retrait en capital."]
            ].map(([name, profile, quote]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="font-display text-xl">{name}</CardTitle>
                  <p className="text-xs font-semibold uppercase text-copper" style={{ letterSpacing: "0.08em" }}>{profile}</p>
                  <CardDescription className="pt-3 leading-relaxed">{quote}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">FAQ</p>
            <h2 className="mt-3 font-display text-4xl font-semibold">Clair, prudent, utile.</h2>
          </div>
          <div className="grid gap-4">
            {faqs.map(([q, a]) => (
              <Card key={q}>
                <CardHeader>
                  <CardTitle className="text-lg">{q}</CardTitle>
                  <CardDescription>{a}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-navy py-12 text-white">
        <div className="container grid gap-8 md:grid-cols-[0.65fr_1.35fr]">
          <div><p className="font-display text-2xl font-semibold">OptiTax Suisse</p><p className="mt-2 text-sm text-copper-light">Créé par Théophile Morel</p></div>
          <div className="space-y-2 text-sm text-white/65">
            <p>Les informations sont fournies à titre indicatif et ne constituent pas un conseil fiscal personnalisé.</p>
            <p>Consultez un fiscaliste ou l’administration compétente pour une analyse complète de votre situation.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
