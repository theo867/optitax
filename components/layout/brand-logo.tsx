import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="OptiTax Suisse - Accueil" className={cn("group flex min-w-0 items-center gap-3", className)}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center border border-copper/55 bg-navy text-white shadow-sm">
        <span className="absolute h-[2px] w-4 bg-copper-light" />
        <span className="absolute h-4 w-[2px] bg-copper-light" />
      </span>
      <span className={cn("min-w-0 leading-none", compact && "hidden sm:block")}>
        <span className="block truncate font-display text-[1.35rem] font-semibold text-foreground">OptiTax</span>
        <span className="mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.24em] text-copper">Suisse</span>
      </span>
    </Link>
  );
}
