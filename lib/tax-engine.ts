import { CANTONS, COMPARISON_CANTONS, THIRD_PILLAR } from "@/lib/constants";
import type { QuestionnaireInput } from "@/lib/validators";

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  priority: "Haute" | "Moyenne" | "Basse";
  estimatedSavings: number;
  difficulty: "Facile" | "Moyenne" | "Avancée";
  guide: string[];
};

export type TaxResult = {
  taxableIncome: number;
  taxableWealth: number;
  estimatedTax: number;
  federalTax: number;
  cantonalTax: number;
  wealthTax: number;
  churchTax: number;
  potentialSavings: number;
  score: number;
  recommendations: Recommendation[];
  checklist: string[];
  comparison: { canton: string; code: string; estimatedTax: number; delta: number }[];
  breakdown: { name: string; value: number }[];
};

function progressiveFederalTax(income: number) {
  if (income <= 18_000) return 0;
  if (income <= 50_000) return (income - 18_000) * 0.015;
  if (income <= 100_000) return 480 + (income - 50_000) * 0.045;
  if (income <= 200_000) return 2730 + (income - 100_000) * 0.075;
  return 10_230 + (income - 200_000) * 0.105;
}

function totalIncome(input: QuestionnaireInput) {
  return Object.values(input.income).reduce((sum, value) => sum + value, 0) + input.family.partnerIncome;
}

function totalWealth(input: QuestionnaireInput) {
  return Object.values(input.wealth).reduce((sum, value) => sum + value, 0) + input.realEstate.fiscalValue - input.realEstate.mortgage;
}

function currentDeductions(input: QuestionnaireInput) {
  const childDeduction = input.children.count * 6500;
  const familyDeduction = ["married", "registered"].includes(input.family.status) ? 2600 : 0;
  const ordinary =
    input.deductions.transport +
    input.deductions.education +
    input.deductions.remoteWork +
    input.deductions.donations +
    input.deductions.healthInsurance +
    input.deductions.alimony +
    input.deductions.medical +
    input.realEstate.mortgageInterest +
    input.realEstate.maintenanceCosts +
    input.pension.thirdPillarPaid;

  return ordinary + childDeduction + familyDeduction + input.children.childcareCosts;
}

function marginalRate(taxableIncome: number, cantonMultiplier: number) {
  const base = taxableIncome < 70_000 ? 0.18 : taxableIncome < 160_000 ? 0.27 : taxableIncome < 300_000 ? 0.34 : 0.39;
  return Math.min(0.46, base * cantonMultiplier);
}

function estimateForCanton(input: QuestionnaireInput, cantonCode: string) {
  const canton = CANTONS.find((item) => item.code === cantonCode) ?? CANTONS[0];
  const income = totalIncome(input);
  const deductions = currentDeductions(input);
  const taxableIncome = Math.max(0, income - deductions);
  const taxableWealth = Math.max(0, totalWealth(input) - 100_000 - input.children.count * 50_000);
  const federalTax = progressiveFederalTax(taxableIncome);
  const cantonalTax = progressiveFederalTax(taxableIncome) * 1.85 * canton.multiplier;
  const wealthTax = taxableWealth * canton.wealthRate;
  const churchTax = input.residence.religion === "none" ? 0 : (federalTax + cantonalTax) * 0.06;
  const estimatedTax = federalTax + cantonalTax + wealthTax + churchTax;

  return { canton, taxableIncome, taxableWealth, federalTax, cantonalTax, wealthTax, churchTax, estimatedTax };
}

function addRecommendation(list: Recommendation[], recommendation: Recommendation) {
  list.push(recommendation);
}

export function analyseTax(input: QuestionnaireInput): TaxResult {
  const estimate = estimateForCanton(input, input.residence.canton);
  const income = totalIncome(input);
  const marginal = marginalRate(estimate.taxableIncome, estimate.canton.multiplier);
  const recommendations: Recommendation[] = [];

  const thirdPillarMax = input.pension.hasSecondPillar
    ? THIRD_PILLAR.withPensionFund
    : Math.min(income * THIRD_PILLAR.withoutPensionFundIncomeShare, THIRD_PILLAR.withoutPensionFundCap);
  const thirdPillarGap = Math.max(0, thirdPillarMax - input.pension.thirdPillarPaid);

  if (thirdPillarGap > 500) {
    addRecommendation(recommendations, {
      id: "third-pillar",
      title: "Compléter le pilier 3a",
      description: "Vous semblez avoir une marge de versement 3a non utilisée. C'est souvent le levier simple le plus accessible.",
      priority: "Haute",
      estimatedSavings: thirdPillarGap * marginal,
      difficulty: "Facile",
      guide: [
        "Vérifier le plafond 3a applicable à votre situation pour l'année fiscale.",
        "Comparer compte 3a bancaire et solution titres selon horizon et risque.",
        "Effectuer le versement avant la date limite bancaire de l'année."
      ]
    });
  }

  if (input.pension.lppBuybackPossible && input.pension.lppBuybackAmount > 0 && income > 90_000) {
    const usableBuyback = Math.min(input.pension.lppBuybackAmount, Math.max(0, estimate.taxableIncome - 60_000));
    addRecommendation(recommendations, {
      id: "lpp-buyback",
      title: "Planifier un rachat LPP",
      description: "Un rachat de 2e pilier peut réduire le revenu imposable, mais il doit être coordonné avec liquidité, retraite et retraits futurs.",
      priority: usableBuyback > 10_000 ? "Haute" : "Moyenne",
      estimatedSavings: usableBuyback * marginal,
      difficulty: "Moyenne",
      guide: [
        "Demander le certificat de potentiel de rachat à la caisse de pension.",
        "Échelonner sur plusieurs années si le montant est important.",
        "Éviter un rachat juste avant un retrait en capital sans validation professionnelle."
      ]
    });
  }

  if (input.children.count > 0 && input.children.childcareCosts === 0) {
    addRecommendation(recommendations, {
      id: "childcare",
      title: "Contrôler les frais de garde et déductions enfants",
      description: "Les familles oublient souvent des justificatifs liés aux enfants, à la garde ou à la formation.",
      priority: "Moyenne",
      estimatedSavings: input.children.count * 450,
      difficulty: "Facile",
      guide: [
        "Réunir attestations de crèche, accueil parascolaire et garde par des tiers.",
        "Vérifier le traitement de la garde alternée avec l'autre parent.",
        "Reporter les enfants majeurs en formation si les conditions cantonales sont remplies."
      ]
    });
  }

  if (input.realEstate.primaryResidence || input.realEstate.secondaryResidence) {
    addRecommendation(recommendations, {
      id: "real-estate",
      title: "Optimiser les frais immobiliers",
      description: "Entre forfait, frais effectifs, intérêts et travaux, l'immobilier peut changer fortement le résultat fiscal.",
      priority: input.realEstate.maintenanceCosts > 5000 ? "Haute" : "Moyenne",
      estimatedSavings: Math.max(1200, input.realEstate.maintenanceCosts * marginal * 0.35),
      difficulty: "Moyenne",
      guide: [
        "Comparer déduction forfaitaire et frais effectifs selon votre canton.",
        "Séparer entretien déductible et plus-value non déductible.",
        "Planifier les travaux importants sur plusieurs années fiscales."
      ]
    });
  }

  if (input.business.independent || input.income.selfEmployed > 0) {
    addRecommendation(recommendations, {
      id: "self-employed",
      title: "Structurer l'activité indépendante",
      description: "Les indépendants ont des leviers spécifiques: charges documentées, prévoyance, véhicule, bureau, acomptes et forme juridique.",
      priority: "Haute",
      estimatedSavings: Math.max(1800, input.income.selfEmployed * 0.035),
      difficulty: "Avancée",
      guide: [
        "Tenir une comptabilité claire avec justificatifs et séparation privée/professionnelle.",
        "Vérifier l'affiliation AVS et la marge de pilier 3a sans caisse de pension.",
        "Simuler entreprise individuelle versus Sàrl/SA si le bénéfice devient récurrent."
      ]
    });
  }

  if (input.income.dividends + input.business.dividendIncome > 15_000 || input.business.shareholder) {
    addRecommendation(recommendations, {
      id: "dividends",
      title: "Revoir la stratégie salaire-dividendes",
      description: "Pour les dirigeants ou actionnaires, l'équilibre entre salaire, dividendes, prévoyance et charges sociales est central.",
      priority: "Moyenne",
      estimatedSavings: Math.max(900, (input.income.dividends + input.business.dividendIncome) * 0.04),
      difficulty: "Avancée",
      guide: [
        "Comparer rémunération, dividendes et capacité de rachat LPP.",
        "Vérifier les règles de participation qualifiée et de double imposition économique.",
        "Documenter toute structure holding avec un spécialiste."
      ]
    });
  }

  if (input.deductions.donations === 0 || input.deductions.medical > 2500 || input.deductions.education === 0) {
    addRecommendation(recommendations, {
      id: "forgotten-deductions",
      title: "Chercher les déductions oubliées",
      description: "Transports, formation continue, dons, frais médicaux et primes peuvent représenter de petites économies cumulées.",
      priority: "Basse",
      estimatedSavings: 600,
      difficulty: "Facile",
      guide: [
        "Scanner les dépenses de l'année par catégorie fiscale.",
        "Conserver factures et attestations au format PDF.",
        "Reporter uniquement les montants justifiables et admis par le canton."
      ]
    });
  }

  if (input.wealth.securities + input.wealth.etf + input.wealth.crypto > 50_000) {
    addRecommendation(recommendations, {
      id: "investments",
      title: "Rendre les placements fiscalement propres",
      description: "Les investisseurs doivent documenter revenus, cours fiscaux, impôt anticipé et distinction privé/professionnel.",
      priority: "Moyenne",
      estimatedSavings: Math.max(500, (input.wealth.securities + input.wealth.etf) * 0.002),
      difficulty: "Moyenne",
      guide: [
        "Utiliser les relevés fiscaux bancaires et la liste des cours AFC.",
        "Éviter une fréquence de trading pouvant être qualifiée de professionnelle.",
        "Déclarer crypto et métaux précieux avec valeur au 31 décembre."
      ]
    });
  }

  if (input.wealth.realEstate + input.wealth.securities + input.wealth.bank > 800_000 || input.children.count > 0) {
    addRecommendation(recommendations, {
      id: "estate",
      title: "Préparer une optimisation successorale de base",
      description: "Une planification simple peut réduire les conflits, clarifier donations et protéger conjoint ou enfants.",
      priority: "Basse",
      estimatedSavings: 0,
      difficulty: "Avancée",
      guide: [
        "Lister biens, dettes, assurances, comptes 3a et bénéficiaires.",
        "Vérifier testament, contrat de mariage et donations avec un professionnel.",
        "Anticiper l'impact cantonal des droits de succession ou donation."
      ]
    });
  }

  const sortedRecommendations = recommendations.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
  const potentialSavings = sortedRecommendations.reduce((sum, item) => sum + item.estimatedSavings, 0);
  const score = Math.max(25, Math.min(96, 92 - sortedRecommendations.length * 5 - Math.round(potentialSavings / Math.max(1, estimate.estimatedTax) * 18)));
  const comparison = COMPARISON_CANTONS.map((code) => {
    const item = estimateForCanton(input, code);
    return {
      canton: item.canton.name,
      code,
      estimatedTax: Math.round(item.estimatedTax),
      delta: Math.round(item.estimatedTax - estimate.estimatedTax)
    };
  }).sort((a, b) => a.estimatedTax - b.estimatedTax);

  const checklist = [
    "Importer certificat de salaire, attestations de rente et bonus.",
    "Rassembler attestations 3a, caisse de pension et rachats LPP.",
    "Télécharger relevés fiscaux bancaires, titres, ETF, dividendes et impôt anticipé.",
    "Ajouter frais professionnels: transport, repas, télétravail et formation.",
    "Vérifier frais de garde, pensions alimentaires et documents liés aux enfants.",
    "Comparer le résultat avec le calculateur officiel AFC ou cantonal avant dépôt."
  ];

  return {
    taxableIncome: Math.round(estimate.taxableIncome),
    taxableWealth: Math.round(estimate.taxableWealth),
    estimatedTax: Math.round(estimate.estimatedTax),
    federalTax: Math.round(estimate.federalTax),
    cantonalTax: Math.round(estimate.cantonalTax),
    wealthTax: Math.round(estimate.wealthTax),
    churchTax: Math.round(estimate.churchTax),
    potentialSavings: Math.round(potentialSavings),
    score,
    recommendations: sortedRecommendations,
    checklist,
    comparison,
    breakdown: [
      { name: "Impôt fédéral", value: Math.round(estimate.federalTax) },
      { name: "Canton/commune", value: Math.round(estimate.cantonalTax) },
      { name: "Fortune", value: Math.round(estimate.wealthTax) },
      { name: "Église", value: Math.round(estimate.churchTax) }
    ]
  };
}
