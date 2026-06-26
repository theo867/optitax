import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as never as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const canton = request.nextUrl.searchParams.get("canton") || undefined;
  const format = request.nextUrl.searchParams.get("format");
  const leads = await prisma.lead.findMany({
    where: canton ? { canton } : undefined,
    orderBy: { createdAt: "desc" },
    take: 500
  });

  if (format === "csv") {
    const header = "date,name,email,phone,canton,savings,status,consent";
    const rows = leads.map((lead) =>
      [
        lead.createdAt.toISOString(),
        lead.name,
        lead.email,
        lead.phone ?? "",
        lead.canton,
        lead.savings,
        lead.status,
        lead.consent ? "yes" : "no"
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    );
    return new NextResponse([header, ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=optitax-leads.csv"
      }
    });
  }

  return NextResponse.json({ leads });
}
