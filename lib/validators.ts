import { z } from "zod";

const emptyToZero = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return 0;
  if (typeof value === "number" && Number.isNaN(value)) return 0;
  return value;
};

const money = z.preprocess(emptyToZero, z.coerce.number().min(0).max(100_000_000)).default(0);
const count = z.preprocess(emptyToZero, z.coerce.number().int().min(0).max(12)).default(0);
const text = (max = 80) =>
  z.preprocess((value) => (typeof value === "string" ? value.trim() : value), z.string().max(max)).default("");
const requiredText = (max = 80, min = 1) =>
  z.preprocess((value) => (typeof value === "string" ? value.trim() : value), z.string().min(min).max(max));
const optionalText = (max = 1000) =>
  z.preprocess((value) => (value === null || value === undefined ? "" : value), z.string().max(max)).default("");

export const questionnaireSchema = z.object({
  residence: z.object({
    canton: z.string().min(2),
    postalCode: z.preprocess(
      (value) => (value === null || value === undefined ? "" : String(value).trim()),
      z.string().regex(/^\d{4}$/, "Le NPA doit contenir 4 chiffres")
    ).default("1000"),
    commune: requiredText(80, 1),
    nationality: requiredText(80, 2),
    permit: z.enum(["citizen", "C", "B", "G", "L", "other"]),
    religion: z.enum(["none", "catholic", "protestant", "other"])
  }),
  family: z.object({
    status: z.enum(["single", "married", "divorced", "widowed", "registered"]),
    partnerIncome: money
  }),
  children: z.object({
    count,
    agesText: text(120),
    ages: z.array(z.coerce.number().int().min(0).max(30)).default([]),
    sharedCustody: z.boolean().default(false),
    childcareCosts: money
  }),
  income: z.object({
    salary: money,
    bonus: money,
    selfEmployed: money,
    rental: money,
    dividends: money,
    foreign: money,
    pensions: money
  }),
  wealth: z.object({
    bank: money,
    securities: money,
    etf: money,
    bonds: money,
    crypto: money,
    metals: money,
    realEstate: money,
    otherAssets: money,
    debts: money
  }),
  realEstate: z.object({
    ownerStatus: z.enum(["tenant", "owner", "both"]).default("tenant"),
    primaryResidence: z.boolean().default(false),
    secondaryResidence: z.boolean().default(false),
    fiscalValue: money,
    mortgage: money,
    mortgageInterest: money,
    maintenanceCosts: money
  }),
  pension: z.object({
    hasSecondPillar: z.boolean().default(true),
    lppBuybackPossible: z.boolean().default(false),
    lppBuybackAmount: money,
    hasThirdPillar: z.boolean().default(false),
    thirdPillarPaid: money
  }),
  deductions: z.object({
    transport: money,
    meals: money,
    education: money,
    remoteWork: money,
    donations: money,
    healthInsurance: money,
    alimony: money,
    medical: money
  }),
  business: z.object({
    shareholder: z.boolean().default(false),
    independent: z.boolean().default(false),
    company: z.boolean().default(false),
    holding: z.boolean().default(false),
    dividendIncome: money,
    professionalExpenses: money
  })
});

export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;

export const leadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  phone: optionalText(40),
  canton: z.string().min(2).max(2),
  savings: z.coerce.number().min(0),
  message: optionalText(1000),
  consent: z.literal(true)
});
