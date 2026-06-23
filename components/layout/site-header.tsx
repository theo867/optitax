"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, ShieldCheck, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/86 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-black tracking-normal">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-swiss text-sm text-white">OT</span>
          <span>OptiTax Suisse</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/#fonctionnalites">Fonctionnalités</Link>
          <Link href="/questionnaire">Questionnaire</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Changer le thème"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/login">
              <ShieldCheck className="h-4 w-4" />
              Connexion
            </Link>
          </Button>
          <Button asChild variant="swiss">
            <Link href="/questionnaire">Simuler</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
