"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileCheck2, Loader2, LockKeyhole, Send, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import { CantonComparisonChart, TaxBreakdownChart } from "@/components/charts/tax-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { analyseTax, TaxResult } from "@/lib/tax-engine";
import { questionnaireSchema, QuestionnaireInput } from "@/lib/validators";
import { chf } from "@/lib/utils";

const fallbackInput: QuestionnaireInput = {
  residence: { canton: "VD", postalCode: "1000", commune: "Lausanne", nationality: "Suisse", permit: "citizen", religion: "none" },
  family: { status: "married", partnerIncome: 42000 },
  children: { count: 2, agesText: "4, 8", ages: [4, 8], sharedCustody: false, childcareCosts: 9000 },
  income: { salary: 118000, bonus: 12000, selfEmployed: 0, rental: 0, dividends: 2500, foreign: 0, pensions: 0 },
  wealth: { bank: 45000, securities: 60000, etf: 35000, bonds: 10000, crypto: 3000, metals: 0, realEstate: 0, otherAssets: 0, debts: 0 },
  realEstate: { ownerStatus: "owner", primaryResidence: true, secondaryResidence: false, fiscalValue: 720000, mortgage: 510000, mortgageInterest: 10500, maintenanceCosts: 6500 },
  pension: { hasSecondPillar: true, lppBuybackPossible: true, lppBuybackAmount: 22000, hasThirdPillar: true, thirdPillarPaid: 3000 },
  deductions: { transport: 3200, meals: 800, education: 900, remoteWork: 400, donations: 300, healthInsurance: 7400, alimony: 0, medical: 1200 },
  business: { shareholder: false, independent: false, company: false, holding: false, dividendIncome: 0, professionalExpenses: 0 }
};

export function DashboardClient() {
  const [input, setInput] = useState<QuestionnaireInput>(fallbackInput);
  const [leadSent, setLeadSent] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const result = useMemo<TaxResult>(() => analyseTax(input), [input]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("optitax:last-input") ?? localStorage.getItem("fiscalai:last-input");
      if (!raw) return;
      const parsed = questionnaireSchema.safeParse(JSON.parse(raw));
      if (parsed.success) setInput(parsed.data);
    } catch {
      localStorage.removeItem("optitax:last-input");
    }
  }, []);

  async function exportPdf() {
    setExportError("");
    setExporting(true);
    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (!response.ok) throw new Error("PDF generation failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "rapport-optitax-suisse.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Le rapport n’a pas pu être généré. Réessayez dans quelques instants.");
    } finally {
      setExporting(false);
    }
  }

  async function requestContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLeadError("");
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        canton: input.residence.canton,
        savings: result.potentialSavings,
        message: formData.get("message"),
        consent: formData.get("consent") === "on"
      })
    });

    if (response.ok) setLeadSent(true);
    else setLeadError("Impossible d'envoyer la demande. Vérifiez les champs et le consentement.");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Score fiscal" value={`${result.score}/100`} icon={Sparkles} tone="primary" />
        <Metric title="Avant optimisation" value={chf(result.estimatedTaxBeforeOptimization)} icon={FileCheck2} tone="blue" />
        <Metric title="Après optimisation" value={chf(result.estimatedTaxAfterOptimization)} icon={FileCheck2} tone="primary" />
        <Metric title="Économies possibles" value={chf(result.potentialSavings)} icon={TrendingDown} tone="success" />
      </div>

      <Card className="border-copper/25 bg-sand/55 dark:bg-white/[0.03]">
        <CardContent className="flex flex-col justify-between gap-4 pt-5 md:flex-row md:items-center">
          <div><p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-copper" /> Simulation indicative et confidentielle</p><p className="mt-1 text-xs text-muted-foreground">Aucun conseil fiscal personnalisé. Vérifiez les montants avec les calculateurs officiels ou un expert.</p>{exportError ? <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{exportError}</p> : null}</div>
          <Button onClick={exportPdf} variant="swiss" disabled={exporting}>{exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {exporting ? "Génération..." : "Rapport PDF"}</Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Répartition estimée</CardTitle>
            <CardDescription>Impôt fédéral, cantonal/communal, fortune et église.</CardDescription>
          </CardHeader>
          <CardContent>
            <TaxBreakdownChart data={result.breakdown} />
            <div className="grid gap-2">
              {result.breakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg bg-muted/45 px-3 py-2 text-sm">
                  <span>{item.name}</span><strong>{chf(item.value)}</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Comparateur de cantons</CardTitle>
            <CardDescription>Zoug, Schwytz, Nidwald, Obwald, Lucerne, Valais, Vaud, Genève, Fribourg, Berne, Zurich.</CardDescription>
          </CardHeader>
          <CardContent>
            <CantonComparisonChart data={result.comparison} />
            <div className="mt-4 grid gap-2">
              {result.comparison.map((item) => (
                <div key={item.code} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/25 px-3 py-2 text-sm">
                  <span className="font-medium">{item.canton}</span>
                  <span className="text-right">
                    <strong>{chf(item.estimatedTax)}</strong>
                    <span className={item.delta < 0 ? "ml-2 text-success" : "ml-2 text-muted-foreground"}>
                      {item.delta < 0 ? `-${chf(Math.abs(item.delta))}` : `+${chf(item.delta)}`}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Limite: cette comparaison ne tient pas compte des loyers, primes maladie, situation professionnelle, ni du centre de vie fiscal réel.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recommandations prioritaires</CardTitle>
            <CardDescription>Classées par économie estimée et impact probable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.recommendations.map((rec) => (
              <div key={rec.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold">{rec.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant={rec.priority === "Haute" ? "success" : rec.priority === "Moyenne" ? "warning" : "secondary"}>{rec.priority}</Badge>
                    <Badge variant="outline">{rec.difficulty}</Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{rec.description}</p>
                <p className="mt-3 text-sm font-bold text-success">Économie estimée: {chf(rec.estimatedSavings)}</p>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                  <span><strong>Temps:</strong> {rec.implementationTime}</span>
                  <span><strong>Éligibilité:</strong> {rec.eligibility.join(", ")}</span>
                </div>
                {rec.warning && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">{rec.warning}</p>}
                <Separator className="my-3" />
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {rec.guide.map((item) => <li key={item} className="flex gap-2"><span>•</span><span>{item}</span></li>)}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist d'actions</CardTitle>
            <CardDescription>À faire avant dépôt ou rendez-vous fiscal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.checklist.map((item) => (
              <label key={item} className="flex gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[#9a7046]" />
                <span>{item}</span>
              </label>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/questionnaire">Modifier la simulation</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Être contacté par un fiscaliste</CardTitle>
          <CardDescription>Envoyez uniquement les informations nécessaires avec consentement explicite.</CardDescription>
        </CardHeader>
        <CardContent>
          {leadSent ? (
            <p className="rounded-lg border bg-muted/40 p-4 text-sm font-medium">Demande envoyée. Vous pourrez brancher ici votre futur partenaire fiscaliste.</p>
          ) : (
            <form onSubmit={requestContact} className="grid gap-4 md:grid-cols-2">
              <input name="name" required placeholder="Nom" className="h-11 rounded-lg border bg-background px-3 text-sm" />
              <input name="email" type="email" required placeholder="Email" className="h-11 rounded-lg border bg-background px-3 text-sm" />
              <input name="phone" placeholder="Téléphone optionnel" className="h-11 rounded-lg border bg-background px-3 text-sm" />
              <input name="message" placeholder="Message optionnel" className="h-11 rounded-lg border bg-background px-3 text-sm" />
              <label className="flex gap-3 text-sm md:col-span-2">
                <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#9a7046]" />
                J'accepte d'être contacté et que ces informations soient enregistrées pour traiter ma demande.
              </label>
              {leadError && <p className="text-sm text-red-600 md:col-span-2">{leadError}</p>}
              <Button variant="swiss" className="md:col-span-2"><Send className="h-4 w-4" /> Demander un contact</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value, icon: Icon, tone }: { title: string; value: string; icon: typeof Sparkles; tone: "primary" | "blue" | "success" }) {
  const color = tone === "success" ? "text-success" : tone === "blue" ? "text-copper" : "text-primary";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent><p className="font-display text-3xl font-semibold">{value}</p></CardContent>
    </Card>
  );
}
