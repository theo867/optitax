import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function RegisterPage() {
  return (
    <main className="grid min-h-[calc(100svh-4.5rem)] lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <BrandLogo className="[&_span]:text-white" />
        <div className="max-w-md"><p className="text-xs font-bold uppercase text-copper-light" style={{ letterSpacing: "0.16em" }}>OptiTax Suisse</p><h1 className="mt-5 font-display text-5xl leading-tight">Une vision fiscale structurée, à votre rythme.</h1><p className="mt-5 text-white/70">Centralisez vos simulations et vos rapports dans un espace conçu pour la clarté et la confidentialité.</p></div>
        <p className="text-xs text-white/50">Protection des données · Transparence · Aucun conseil fiscal personnalisé</p>
      </aside>
      <div className="grid place-items-center px-4 py-12 sm:px-8">
        <div className="w-full">
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">Déjà inscrit ? <Link className="font-semibold text-primary" href="/login">Se connecter</Link></p>
        </div>
      </div>
    </main>
  );
}
