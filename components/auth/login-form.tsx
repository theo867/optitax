"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: formData.get("password"),
      redirect: false
    });
    if (!result?.ok || result.error) {
      setError("Email ou mot de passe incorrect. Vérifiez vos identifiants.");
      setPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md border-navy/15 shadow-premium">
      <CardHeader>
        <span className="mb-3 grid h-10 w-10 place-items-center bg-sand text-navy"><LockKeyhole className="h-5 w-5" /></span>
        <CardTitle className="font-display text-3xl">Connexion sécurisée</CardTitle>
        <CardDescription>Retrouvez vos simulations et vos rapports OptiTax Suisse.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-2"><Label htmlFor="login-email">Email</Label><Input id="login-email" name="email" type="email" autoComplete="email" required /></div>
          <div className="grid gap-2"><Label htmlFor="login-password">Mot de passe</Label><Input id="login-password" name="password" type="password" autoComplete="current-password" required /></div>
          {error && <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
          <Button className="w-full" variant="swiss" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {pending ? "Connexion..." : "Se connecter"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Connexion chiffrée. Ne partagez jamais votre mot de passe.</p>
        </form>
      </CardContent>
    </Card>
  );
}
