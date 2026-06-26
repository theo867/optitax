"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, FileText } from "lucide-react";
import { analyseTax } from "@/lib/tax-engine";
import { CANTONS } from "@/lib/constants";
import { QuestionnaireInput, questionnaireSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { chf } from "@/lib/utils";

const steps = [
  "Résidence",
  "Situation familiale",
  "Enfants",
  "Revenus",
  "Fortune",
  "Immobilier",
  "Prévoyance",
  "Déductions",
  "Entreprise"
];

const defaultValues: QuestionnaireInput = {
  residence: { canton: "VD", commune: "Lausanne", nationality: "Suisse", permit: "citizen", religion: "none" },
  family: { status: "single", partnerIncome: 0 },
  children: { count: 0, agesText: "", ages: [], sharedCustody: false, childcareCosts: 0 },
  income: { salary: 95000, bonus: 5000, selfEmployed: 0, rental: 0, dividends: 1200, foreign: 0, pensions: 0 },
  wealth: { bank: 25000, securities: 30000, etf: 15000, bonds: 0, crypto: 2000, metals: 0, realEstate: 0, otherAssets: 0, debts: 0 },
  realEstate: { ownerStatus: "tenant", primaryResidence: false, secondaryResidence: false, fiscalValue: 0, mortgage: 0, mortgageInterest: 0, maintenanceCosts: 0 },
  pension: { hasSecondPillar: true, lppBuybackPossible: false, lppBuybackAmount: 0, hasThirdPillar: true, thirdPillarPaid: 2500 },
  deductions: { transport: 2400, meals: 0, education: 0, remoteWork: 0, donations: 0, healthInsurance: 3200, alimony: 0, medical: 0 },
  business: { shareholder: false, independent: false, company: false, holding: false, dividendIncome: 0, professionalExpenses: 0 }
};

export function TaxQuestionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<QuestionnaireInput>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues,
    mode: "onChange"
  });
  const values = form.watch();
  const errors = form.formState.errors;
  const preview = useMemo(() => {
    const parsed = questionnaireSchema.safeParse(values);
    return analyseTax(parsed.success ? normalizeQuestionnaireData(parsed.data) : defaultValues);
  }, [values]);
  const progress = ((step + 1) / steps.length) * 100;

  useEffect(() => {
    const raw = localStorage.getItem("optitax:draft");
    if (!raw) return;
    const parsed = questionnaireSchema.safeParse(JSON.parse(raw));
    if (parsed.success) form.reset(parsed.data);
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((draft) => {
      localStorage.setItem("optitax:draft", JSON.stringify(draft));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  function onSubmit(data: QuestionnaireInput) {
    const normalizedData = normalizeQuestionnaireData(data);
    const result = analyseTax(normalizedData);
    localStorage.setItem("optitax:last-input", JSON.stringify(normalizedData));
    localStorage.setItem("optitax:last-result", JSON.stringify(result));
    router.push("/dashboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge variant="outline">Étape {step + 1} / {steps.length}</Badge>
              <CardTitle className="mt-3 text-3xl">{steps[step]}</CardTitle>
              <CardDescription>Les champs peuvent être affinés plus tard depuis votre compte.</CardDescription>
            </div>
            <div className="min-w-52">
              <Progress value={progress} />
              <p className="mt-2 text-right text-xs text-muted-foreground">{Math.round(progress)}%</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 0 && (
              <Grid>
                <Field label="Canton">
                  <select className="h-11 rounded-lg border bg-background px-3" {...form.register("residence.canton")}>
                    {CANTONS.map((canton) => <option key={canton.code} value={canton.code}>{canton.name}</option>)}
                  </select>
                </Field>
                <Field label="Commune ou NPA" error={errors.residence?.commune?.message}><Input {...form.register("residence.commune")} /></Field>
                <Field label="Nationalité" error={errors.residence?.nationality?.message}><Input {...form.register("residence.nationality")} /></Field>
                <Field label="Type de permis">
                  <select className="h-11 rounded-lg border bg-background px-3" {...form.register("residence.permit")}>
                    <option value="citizen">Suisse</option><option value="C">Permis C</option><option value="B">Permis B</option>
                    <option value="G">Permis G</option><option value="L">Permis L</option><option value="other">Autre</option>
                  </select>
                </Field>
                <Field label="Religion">
                  <select className="h-11 rounded-lg border bg-background px-3" {...form.register("residence.religion")}>
                    <option value="none">Aucune / non soumise</option><option value="catholic">Catholique</option>
                    <option value="protestant">Protestante</option><option value="other">Autre reconnue</option>
                  </select>
                </Field>
              </Grid>
            )}

            {step === 1 && (
              <Grid>
                <Field label="Situation familiale">
                  <select className="h-11 rounded-lg border bg-background px-3" {...form.register("family.status")}>
                    <option value="single">Célibataire</option><option value="married">Marié</option><option value="divorced">Divorcé</option>
                    <option value="widowed">Veuf</option><option value="registered">Partenariat enregistré</option>
                  </select>
                </Field>
                <Field label="Revenu annuel du conjoint/partenaire"><MoneyInput register={form.register("family.partnerIncome")} /></Field>
              </Grid>
            )}

            {step === 2 && (
              <Grid>
                <Field label="Nombre d'enfants" error={errors.children?.count?.message}><Input type="number" min={0} max={12} {...form.register("children.count")} /></Field>
                <Field label="Âge des enfants"><Input placeholder="ex. 4, 8, 16" {...form.register("children.agesText")} /></Field>
                <Field label="Frais de garde annuels"><MoneyInput register={form.register("children.childcareCosts")} /></Field>
                <CheckField label="Garde alternée" register={form.register("children.sharedCustody")} />
              </Grid>
            )}

            {step === 3 && <MoneyGrid form={form} prefix="income" labels={["Salaire annuel brut", "Bonus", "Revenus indépendants", "Revenus locatifs", "Dividendes", "Revenus étrangers", "Pensions"]} keys={["salary", "bonus", "selfEmployed", "rental", "dividends", "foreign", "pensions"]} />}
            {step === 4 && <MoneyGrid form={form} prefix="wealth" labels={["Liquidités", "Titres / actions", "ETF", "Obligations", "Crypto", "Métaux précieux", "Immobilier", "Autres actifs", "Dettes"]} keys={["bank", "securities", "etf", "bonds", "crypto", "metals", "realEstate", "otherAssets", "debts"]} />}
            {step === 5 && (
              <Grid>
                <Field label="Statut immobilier">
                  <select className="h-11 rounded-lg border bg-background px-3" {...form.register("realEstate.ownerStatus")}>
                    <option value="tenant">Locataire</option>
                    <option value="owner">Propriétaire</option>
                    <option value="both">Locataire et propriétaire</option>
                  </select>
                </Field>
                <CheckField label="Résidence principale" register={form.register("realEstate.primaryResidence")} />
                <CheckField label="Résidence secondaire" register={form.register("realEstate.secondaryResidence")} />
                <Field label="Valeur fiscale"><MoneyInput register={form.register("realEstate.fiscalValue")} /></Field>
                <Field label="Hypothèque"><MoneyInput register={form.register("realEstate.mortgage")} /></Field>
                <Field label="Intérêts hypothécaires"><MoneyInput register={form.register("realEstate.mortgageInterest")} /></Field>
                <Field label="Frais d'entretien"><MoneyInput register={form.register("realEstate.maintenanceCosts")} /></Field>
              </Grid>
            )}
            {step === 6 && (
              <Grid>
                <CheckField label="2e pilier existant" register={form.register("pension.hasSecondPillar")} />
                <CheckField label="Possibilité de rachat LPP" register={form.register("pension.lppBuybackPossible")} />
                <Field label="Montant de rachat disponible"><MoneyInput register={form.register("pension.lppBuybackAmount")} /></Field>
                <CheckField label="3e pilier existant" register={form.register("pension.hasThirdPillar")} />
                <Field label="Montant 3a déjà versé"><MoneyInput register={form.register("pension.thirdPillarPaid")} /></Field>
              </Grid>
            )}
            {step === 7 && <MoneyGrid form={form} prefix="deductions" labels={["Transport", "Repas", "Formation", "Télétravail", "Dons", "Assurance maladie", "Pension alimentaire", "Frais médicaux"]} keys={["transport", "meals", "education", "remoteWork", "donations", "healthInsurance", "alimony", "medical"]} />}
            {step === 8 && (
              <Grid>
                <CheckField label="Actionnaire" register={form.register("business.shareholder")} />
                <CheckField label="Indépendant" register={form.register("business.independent")} />
                <CheckField label="Société" register={form.register("business.company")} />
                <CheckField label="Holding" register={form.register("business.holding")} />
                <Field label="Revenus de dividendes société"><MoneyInput register={form.register("business.dividendIncome")} /></Field>
                <Field label="Frais professionnels"><MoneyInput register={form.register("business.professionalExpenses")} /></Field>
              </Grid>
            )}

            <div className="flex flex-col-reverse justify-between gap-3 border-t pt-6 sm:flex-row">
              <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>
                  Continuer <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" variant="swiss">
                  Générer mon dashboard <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation</CardTitle>
            <CardDescription>Estimation indicative en direct.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Metric label="Impôts estimés" value={chf(preview.estimatedTax)} />
            <Metric label="Économies potentielles" value={chf(preview.potentialSavings)} />
            <Metric label="Score fiscal" value={`${preview.score}/100`} />
            <Button type="button" variant="outline" className="w-full" onClick={form.handleSubmit(onSubmit)}>
              <FileText className="h-4 w-4" /> Voir le rapport
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function MoneyInput({ register }: { register: ReturnType<ReturnType<typeof useForm<QuestionnaireInput>>["register"]> }) {
  return <Input type="number" min={0} step={100} {...register} />;
}

function CheckField({ label, register }: { label: string; register: ReturnType<ReturnType<typeof useForm<QuestionnaireInput>>["register"]> }) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-lg border bg-background px-3 text-sm font-medium">
      <input type="checkbox" className="h-4 w-4 accent-emerald-700" {...register} /> {label}
    </label>
  );
}

function MoneyGrid({
  form,
  prefix,
  labels,
  keys
}: {
  form: ReturnType<typeof useForm<QuestionnaireInput>>;
  prefix: "income" | "wealth" | "deductions";
  labels: string[];
  keys: string[];
}) {
  return (
    <Grid>
      {keys.map((key, index) => (
        <Field key={key} label={labels[index]}>
          <MoneyInput register={form.register(`${prefix}.${key}` as never)} />
        </Field>
      ))}
    </Grid>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/35 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function normalizeQuestionnaireData(data: QuestionnaireInput): QuestionnaireInput {
  const ages = data.children.agesText
    .split(/[,\s;]+/)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= 30);

  return {
    ...data,
    children: {
      ...data.children,
      ages
    }
  };
}
