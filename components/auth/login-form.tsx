"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setError("");
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });
    if (result?.error) setError("Connexion impossible. Vérifiez vos identifiants.");
    else router.push("/dashboard");
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Accédez à votre historique de simulations.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={submit} className="space-y-4">
          <div className="grid gap-2"><Label>Email</Label><Input name="email" type="email" required /></div>
          <div className="grid gap-2"><Label>Mot de passe</Label><Input name="password" type="password" required /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" variant="swiss">Se connecter</Button>
          <p className="text-center text-sm text-muted-foreground">Mot de passe oublié: brancher un provider email transactionnel en production.</p>
        </form>
      </CardContent>
    </Card>
  );
}
