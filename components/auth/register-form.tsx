"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    if (password !== String(formData.get("passwordConfirm") ?? "")) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setPending(true);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error ?? "Création du compte impossible.");
      setPending(false);
      return;
    }
    const signInResult = await signIn("credentials", {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password,
      redirect: false
    });
    if (!signInResult?.ok) {
      router.push("/login?created=1");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md border-navy/15 shadow-premium">
      <CardHeader>
        <span className="mb-3 grid h-10 w-10 place-items-center bg-sand text-navy"><ShieldCheck className="h-5 w-5" /></span>
        <CardTitle className="font-display text-3xl">Créer votre espace</CardTitle>
        <CardDescription>Sauvegardez vos simulations et retrouvez vos rapports en toute confidentialité.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-2"><Label htmlFor="register-name">Nom complet</Label><Input id="register-name" name="name" autoComplete="name" minLength={2} required /></div>
          <div className="grid gap-2"><Label htmlFor="register-email">Email</Label><Input id="register-email" name="email" type="email" autoComplete="email" required /></div>
          <div className="grid gap-2"><Label htmlFor="register-password">Mot de passe</Label><Input id="register-password" name="password" type="password" autoComplete="new-password" minLength={10} required /><p className="text-xs text-muted-foreground">10 caractères minimum.</p></div>
          <div className="grid gap-2"><Label htmlFor="register-confirm">Confirmer le mot de passe</Label><Input id="register-confirm" name="passwordConfirm" type="password" autoComplete="new-password" minLength={10} required /></div>
          {error && <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
          <Button className="w-full" variant="swiss" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {pending ? "Création..." : "Créer mon compte"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">En créant un compte, vous acceptez le traitement nécessaire à la fourniture du service.</p>
        </form>
      </CardContent>
    </Card>
  );
}
