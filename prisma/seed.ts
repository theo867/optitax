import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@optitax.local";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin OptiTax",
      role: "ADMIN",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12)
    }
  });

  await prisma.recommendationContent.upsert({
    where: { id: "third-pillar" },
    update: {},
    create: {
      id: "third-pillar",
      title: "Compléter le pilier 3a",
      description: "Identifier la marge de versement 3a encore disponible.",
      guide: ["Vérifier le plafond annuel.", "Choisir compte ou titres 3a.", "Verser avant la fin de l'année bancaire."]
    }
  });

  await prisma.lead.createMany({
    data: [
      { name: "Nadia Exemple", email: "nadia@example.ch", canton: "VD", savings: 3200 },
      { name: "Marc Exemple", email: "marc@example.ch", canton: "ZH", savings: 7400 }
    ],
    skipDuplicates: true
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
