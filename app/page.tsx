import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, FileText, LockKeyhole, Scale, Sparkles, Users, WalletCards } from "lucide-react";
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
      <section className="premium-grid border-b">
        <div className="container grid min-h-[calc(100svh-4rem)] items-center gap-10 py-16 lg:grid-cols-[0.96fr_1.04fr]">
          <div>
            <Badge variant="warning" className="mb-5">Optimisation fiscale suisse, version SaaS</Badge>
            <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.96] tracking-normal md:text-7xl">
              Découvrez combien vous pourriez économiser sur vos impôts.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              OptiTax Suisse analyse votre canton, famille, revenus, fortune, immobilier et prévoyance
              pour produire une estimation, des optimisations et une checklist claire.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="swiss">
                <Link href="/questionnaire">
                  Découvrez combien vous pourriez économiser sur vos impôts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">Voir le dashboard</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 26 cantons</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> PDF inclus</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Dark mode</span>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/assets/hero-dashboard.png"
              width={1600}
              height={1000}
              priority
              alt="Aperçu premium du dashboard OptiTax Suisse"
              className="rounded-lg border shadow-premium"
            />
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase text-warning">Comment ça fonctionne</p>
          <h2 className="mt-3 text-balance text-4xl font-black md:text-5xl">Un parcours simple pour une matière compliquée.</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {["Répondez au questionnaire", "Recevez vos priorités", "Exportez le rapport"].map((title, index) => (
            <Card key={title}>
              <CardHeader>
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">{index + 1}</div>
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
            <p className="text-sm font-bold uppercase text-warning">Fonctionnalités</p>
            <h2 className="mt-3 text-balance text-4xl font-black md:text-5xl">Tout le nécessaire pour un vrai produit SaaS.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-7 w-7 text-primary" />
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
            <p className="text-sm font-bold uppercase text-warning">Optimisations détectées</p>
            <h2 className="mt-3 text-balance text-4xl font-black md:text-5xl">Des leviers concrets, expliqués simplement.</h2>
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

      <section className="border-y bg-muted/45 py-20">
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
          <p className="text-sm font-bold uppercase text-warning">Simulateur rapide</p>
          <h2 className="mt-3 text-4xl font-black">Une première intuition en 20 secondes.</h2>
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

      <section className="border-y bg-muted/45 py-20">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Nadia, 29 ans", "J'ai compris quoi faire avec mon 3e pilier et mes frais de formation."],
              ["Marc et Elena, famille", "La checklist nous a évité d'oublier les frais de garde et les attestations."],
              ["Pierre, retraité", "La comparaison cantonale m'a aidé à préparer une discussion sérieuse avant déménagement."]
            ].map(([name, text]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription>{text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase text-warning">FAQ</p>
            <h2 className="mt-3 text-4xl font-black">Clair, prudent, utile.</h2>
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

      <footer className="border-t bg-foreground py-10 text-background">
        <div className="container flex flex-col justify-between gap-4 md:flex-row">
          <p className="font-bold">OptiTax Suisse</p>
          <p className="max-w-2xl text-sm opacity-75">
            Prototype SaaS informatif. Les estimations doivent être validées avec les calculateurs officiels, l'administration fiscale ou un expert.
          </p>
        </div>
      </footer>
    </main>
  );
}
