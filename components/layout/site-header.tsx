"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-background/94 backdrop-blur-xl">
      <div className="container flex h-[4.5rem] items-center justify-between gap-3">
        <BrandLogo compact />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          <Link href="/#fonctionnalites">Fonctionnalités</Link>
          <Link href="/questionnaire">Questionnaire</Link>
          <Link href="/#securite">Confidentialité</Link>
          {/* L'administration est à la fois masquée ici et protégée côté serveur dans /admin. */}
          {isAdmin ? <Link href="/admin">Administration</Link> : null}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Changer le thème"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          {status === "loading" ? (
            <span className="hidden h-10 w-36 animate-pulse bg-muted sm:block" aria-label="Chargement du compte" />
          ) : session?.user ? (
            <>
              <span className="flex max-w-20 items-center gap-2 truncate text-xs font-medium text-muted-foreground sm:max-w-28 xl:max-w-44 xl:text-sm">
                <UserRound className="hidden h-4 w-4 shrink-0 text-copper sm:block" />
                {session.user.name || session.user.email}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard"><LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span></Link>
              </Button>
              <Button variant="ghost" size="icon" title="Se déconnecter" aria-label="Se déconnecter" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login"><ShieldCheck className="hidden h-4 w-4 sm:block" />Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Créer un compte</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
