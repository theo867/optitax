import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as never as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ leads });
}
