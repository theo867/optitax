import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(10).max(120)
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`register:${ip}`, 5).ok) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const payload = schema.safeParse(await request.json());
  if (!payload.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const user = await prisma.user.create({
    data: {
      name: payload.data.name,
      email: payload.data.email,
      passwordHash: await bcrypt.hash(payload.data.password, 12)
    },
    select: { id: true, email: true, name: true }
  });

  return NextResponse.json({ user });
}
