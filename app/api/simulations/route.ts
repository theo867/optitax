import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { analyseTax } from "@/lib/tax-engine";
import { questionnaireSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`simulation:${ip}`, 20).ok) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const payload = questionnaireSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Données invalides", issues: payload.error.flatten() }, { status: 400 });
  }

  const result = analyseTax(payload.data);
  const session = await getServerSession(authOptions);
  const simulation = await prisma.simulation.create({
    data: {
      userId: (session?.user as never as { id?: string })?.id,
      canton: payload.data.residence.canton,
      commune: payload.data.residence.commune,
      taxableIncome: result.taxableIncome,
      taxableWealth: result.taxableWealth,
      estimatedTax: result.estimatedTax,
      potentialSavings: result.potentialSavings,
      score: result.score,
      input: payload.data,
      result
    }
  });

  return NextResponse.json({ simulation, result });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as never as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const simulations = await prisma.simulation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return NextResponse.json({ simulations });
}
