import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Download, Edit3, Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as never as { role?: string })?.role;
  if (role !== "ADMIN") redirect("/login");

  const [leads, simulations, recommendations] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.simulation.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.recommendationContent.findMany({ orderBy: { updatedAt: "desc" } })
  ]);

  return (
    <main className="container py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-warning">Administration</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Leads, contenus et simulations.</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Base administrateur prête pour exporter les données, piloter les recommandations et suivre les demandes.
          </p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetric icon={Users} title="Leads" value={String(leads.length)} />
        <AdminMetric icon={Edit3} title="Simulations" value={String(simulations.length)} />
        <AdminMetric icon={Edit3} title="Recommandations" value={String(recommendations.length)} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader><CardTitle>Derniers leads</CardTitle><CardDescription>Contacts qualifiés par potentiel d'économie.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div><p className="font-semibold">{lead.name}</p><p className="text-sm text-muted-foreground">{lead.email} • {lead.canton}</p></div>
                <Badge variant="success">CHF {lead.savings}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contenus éditables</CardTitle><CardDescription>Squelette pour gérer les recommandations.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function AdminMetric({ icon: Icon, title, value }: { icon: typeof Users; title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent><p className="text-3xl font-black">{value}</p></CardContent>
    </Card>
  );
}
