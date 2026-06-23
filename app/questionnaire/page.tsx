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
        <p className="text-sm font-bold uppercase text-warning">Questionnaire</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">Votre situation fiscale, étape par étape.</h1>
        <p className="mt-4 text-muted-foreground">
          Les informations restent dans ce prototype côté navigateur, sauf si vous branchez la base de données et les routes de compte.
        </p>
      </div>
      <TaxQuestionnaire />
    </main>
  );
}
