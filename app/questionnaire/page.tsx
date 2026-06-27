import type { Metadata } from "next";
import { TaxQuestionnaire } from "@/components/questionnaire/tax-questionnaire";

export const metadata: Metadata = {
  title: "Questionnaire fiscal",
  description: "Questionnaire fiscal suisse multi-étapes pour estimer impôts et optimisations."
};

export default function QuestionnairePage() {
  return (
    <main className="container py-10">
      <div className="mb-8 max-w-3xl">
        <p className="section-kicker">Analyse confidentielle</p>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Votre situation fiscale, étape par étape.</h1>
        <p className="mt-4 text-muted-foreground">
          Vos réponses restent dans votre navigateur pendant la simulation. Elles servent uniquement à produire votre estimation indicative.
        </p>
      </div>
      <TaxQuestionnaire />
    </main>
  );
}
