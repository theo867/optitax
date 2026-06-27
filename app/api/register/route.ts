import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10).max(120)
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`register:${ip}`, 5).ok) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const payload = schema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json({ error: "Vérifiez votre nom, votre email et le mot de passe (10 caractères minimum)." }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: payload.data.name,
        email: payload.data.email,
        passwordHash: await bcrypt.hash(payload.data.password, 12)
      },
      select: { id: true, email: true, name: true }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Un compte existe déjà avec cette adresse email." }, { status: 409 });
    }
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Le service de compte est momentanément indisponible. Réessayez dans quelques instants." }, { status: 503 });
  }
}
