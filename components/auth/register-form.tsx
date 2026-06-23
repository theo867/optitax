"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setError("");
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
      })
    });
    if (!response.ok) setError("Création impossible. Email déjà utilisé ou mot de passe trop court.");
    else router.push("/login");
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>Sauvegardez vos simulations et exports.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={submit} className="space-y-4">
          <div className="grid gap-2"><Label>Nom</Label><Input name="name" required /></div>
          <div className="grid gap-2"><Label>Email</Label><Input name="email" type="email" required /></div>
          <div className="grid gap-2"><Label>Mot de passe</Label><Input name="password" type="password" minLength={10} required /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" variant="swiss">Créer mon compte</Button>
        </form>
      </CardContent>
    </Card>
  );
}
