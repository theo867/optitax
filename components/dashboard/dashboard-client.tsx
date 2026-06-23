"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileCheck2, Sparkles, TrendingDown } from "lucide-react";
import { CantonComparisonChart, TaxBreakdownChart } from "@/components/charts/tax-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { analyseTax, TaxResult } from "@/lib/tax-engine";
import { questionnaireSchema, QuestionnaireInput } from "@/lib/validators";
import { chf } from "@/lib/utils";

const fallbackInput: QuestionnaireInput = {
  residence: { canton: "VD", commune: "Lausanne", nationality: "Suisse", permit: "citizen", religion: "none" },
  family: { status: "married", partnerIncome: 42000 },
  children: { count: 2, ages: [4, 8], sharedCustody: false, childcareCosts: 9000 },
  income: { salary: 118000, bonus: 12000, selfEmployed: 0, rental: 0, dividends: 2500, foreign: 0, pensions: 0 },
  wealth: { bank: 45000, securities: 60000, etf: 35000, bonds: 10000, crypto: 3000, metals: 0, realEstate: 0 },
  realEstate: { primaryResidence: true, secondaryResidence: false, fiscalValue: 720000, mortgage: 510000, mortgageInterest: 10500, maintenanceCosts: 6500 },
  pension: { hasSecondPillar: true, lppBuybackPossible: true, lppBuybackAmount: 22000, hasThirdPillar: true, thirdPillarPaid: 3000 },
  deductions: { transport: 3200, education: 900, remoteWork: 400, donations: 300, healthInsurance: 7400, alimony: 0, medical: 1200 },
  business: { shareholder: false, independent: false, company: false, holding: false, dividendIncome: 0 }
};

export function DashboardClient() {
  const [input, setInput] = useState<QuestionnaireInput>(fallbackInput);
  const result = useMemo<TaxResult>(() => analyseTax(input), [input]);

  useEffect(() => {
    const raw = localStorage.getItem("optitax:last-input") ?? localStorage.getItem("fiscalai:last-input");
    if (!raw) return;
    const parsed = questionnaireSchema.safeParse(JSON.parse(raw));
    if (parsed.success) setInput(parsed.data);
  }, []);

  async function exportPdf() {
    const response = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rapport-optitax-suisse.pdf";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Score fiscal" value={`${result.score}/100`} icon={Sparkles} tone="primary" />
        <Metric title="Impôts estimés" value={chf(result.estimatedTax)} icon={FileCheck2} tone="blue" />
        <Metric title="Économies possibles" value={chf(result.potentialSavings)} icon={TrendingDown} tone="success" />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Export</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={exportPdf} className="w-full" variant="swiss"><Download className="h-4 w-4" /> Rapport PDF</Button>
          </CardContent>
        </Card>
      </div>

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
                <input type="checkbox" className="mt-1 h-4 w-4 accent-emerald-700" />
                <span>{item}</span>
              </label>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/questionnaire">Modifier la simulation</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ title, value, icon: Icon, tone }: { title: string; value: string; icon: typeof Sparkles; tone: "primary" | "blue" | "success" }) {
  const color = tone === "success" ? "text-success" : tone === "blue" ? "text-[#255b8a]" : "text-primary";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent><p className="text-3xl font-black">{value}</p></CardContent>
    </Card>
  );
}
