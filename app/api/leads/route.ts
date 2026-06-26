import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { leadSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`lead:${ip}`, 10).ok) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const payload = leadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      name: payload.data.name,
      email: payload.data.email,
      phone: payload.data.phone,
      canton: payload.data.canton,
      savings: Math.round(payload.data.savings),
      message: payload.data.message,
      consent: payload.data.consent
    }
  });

  return NextResponse.json({ lead });
}
