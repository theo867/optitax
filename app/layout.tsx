import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: {
    default: "OptiTax Suisse | Optimisation fiscale suisse",
    template: "%s | OptiTax Suisse"
  },
  description:
    "SaaS d'optimisation fiscale pour résidents suisses: estimation d'impôts, 3e pilier, comparaison cantonale, checklist et rapport PDF.",
  keywords: [
    "optimisation fiscale suisse",
    "réduire ses impôts en Suisse",
    "3e pilier",
    "fiscalité suisse",
    "impôts cantonaux",
    "comparaison fiscale cantons"
  ],
  openGraph: {
    title: "OptiTax Suisse",
    description: "Découvrez combien vous pourriez économiser sur vos impôts en Suisse.",
    type: "website",
    locale: "fr_CH"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
