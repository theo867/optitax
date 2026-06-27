import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function LoginPage() {
  return (
    <main className="grid min-h-[calc(100svh-4.5rem)] lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <BrandLogo className="[&_span]:text-white" />
        <div className="max-w-md"><p className="text-xs font-bold uppercase text-copper-light" style={{ letterSpacing: "0.16em" }}>Espace confidentiel</p><h1 className="mt-5 font-display text-5xl leading-tight">Votre fiscalité mérite une lecture précise.</h1><p className="mt-5 text-white/70">Un espace sobre pour conserver vos analyses, préparer vos décisions et échanger avec un professionnel.</p></div>
        <p className="text-xs text-white/50">Fiscalité suisse · Simulation indicative · Données confidentielles</p>
      </aside>
      <div className="grid place-items-center px-4 py-12 sm:px-8">
        <div className="w-full">
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Pas encore de compte ? <Link className="font-semibold text-primary" href="/register">Créer un compte</Link>
        </p>
        </div>
      </div>
    </main>
  );
}
