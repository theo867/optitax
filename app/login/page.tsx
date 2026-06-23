import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="container grid min-h-[calc(100svh-4rem)] place-items-center py-10">
      <div className="w-full">
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Pas encore de compte ? <Link className="font-semibold text-primary" href="/register">Créer un compte</Link>
        </p>
      </div>
    </main>
  );
}
