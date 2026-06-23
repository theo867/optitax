import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard fiscal",
  description: "Dashboard OptiTax Suisse avec score, impôts estimés, graphiques, optimisations et checklist."
};

export default function DashboardPage() {
  return (
    <main className="container py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-warning">Dashboard</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Votre cockpit fiscal.</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Estimation indicative, recommandations et comparaison cantonale. À valider avec les données officielles avant décision.
          </p>
        </div>
      </div>
      <DashboardClient />
    </main>
  );
}
