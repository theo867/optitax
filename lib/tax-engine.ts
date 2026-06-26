import { CANTONS, COMPARISON_CANTONS, THIRD_PILLAR } from "@/lib/constants";
import type { QuestionnaireInput } from "@/lib/validators";

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  priority: "Haute" | "Moyenne" | "Basse";
  estimatedSavings: number;
  difficulty: "Facile" | "Moyenne" | "Avancée";
  implementationTime: string;
  eligibility: string[];
  warning?: string;
  guide: string[];
};

export type TaxResult = {
  taxableIncome: number;
  taxableWealth: number;
  estimatedTax: number;
  estimatedTaxBeforeOptimization: number;
  estimatedTaxAfterOptimization: number;
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
  return (
    input.wealth.bank +
    input.wealth.securities +
    input.wealth.etf +
    input.wealth.bonds +
    input.wealth.crypto +
    input.wealth.metals +
    input.wealth.realEstate +
    input.wealth.otherAssets +
    input.realEstate.fiscalValue -
    input.realEstate.mortgage -
    input.wealth.debts
  );
}

function currentDeductions(input: QuestionnaireInput) {
  const childDeduction = input.children.count * 6500;
  const familyDeduction = ["married", "registered"].includes(input.family.status) ? 2600 : 0;
  const ordinary =
    input.deductions.transport +
    input.deductions.meals +
    input.deductions.education +
    input.deductions.remoteWork +
    input.deductions.donations +
    input.deductions.healthInsurance +
    input.deductions.alimony +
    input.deductions.medical +
    input.realEstate.mortgageInterest +
    input.realEstate.maintenanceCosts +
    input.pension.thirdPillarPaid +
    input.business.professionalExpenses;

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
  // TODO fiscaliste/data: remplacer ce coefficient par les barèmes cantonaux et communaux officiels par année.
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
      implementationTime: "30 à 60 minutes",
      eligibility: ["Avoir un revenu soumis à l'AVS", "Ne pas avoir atteint le plafond annuel 3a"],
      warning: "Les plafonds 3a changent selon l'année fiscale et l'affiliation à une caisse de pension.",
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
      implementationTime: "1 à 3 semaines",
      eligibility: ["Potentiel de rachat confirmé par la caisse de pension", "Liquidités disponibles", "Revenu imposable suffisant"],
      warning: "Un rachat LPP peut limiter certains retraits en capital à court terme. À valider avant action.",
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
      implementationTime: "30 minutes",
      eligibility: ["Enfant à charge", "Frais de garde ou formation documentés"],
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
      implementationTime: "1 à 2 heures",
      eligibility: ["Bien immobilier déclaré", "Intérêts, entretien ou travaux documentés"],
      warning: "Les travaux de plus-value ne sont généralement pas traités comme l'entretien courant.",
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
      implementationTime: "2 à 6 heures",
      eligibility: ["Activité indépendante ou accessoire", "Charges professionnelles justifiables"],
      warning: "La séparation privé/professionnel et l'AVS doivent être documentées proprement.",
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
      implementationTime: "1 à 4 semaines",
      eligibility: ["Actionnaire ou dirigeant", "Dividendes significatifs", "Structure société existante"],
      warning: "Les arbitrages salaire-dividendes nécessitent une validation sociale et fiscale.",
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
      implementationTime: "45 à 90 minutes",
      eligibility: ["Dépenses professionnelles, médicales, dons ou formation pendant l'année"],
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
      implementationTime: "1 à 2 heures",
      eligibility: ["Titres, ETF, crypto ou métaux précieux détenus au 31 décembre"],
      warning: "Une activité de trading intensive peut modifier le traitement fiscal.",
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
      implementationTime: "2 à 8 semaines",
      eligibility: ["Famille, immobilier, fortune ou transmission envisagée"],
      warning: "Les règles de succession et donation varient fortement selon canton et lien familial.",
      guide: [
        "Lister biens, dettes, assurances, comptes 3a et bénéficiaires.",
        "Vérifier testament, contrat de mariage et donations avec un professionnel.",
        "Anticiper l'impact cantonal des droits de succession ou donation."
      ]
    });
  }

  if (input.deductions.transport === 0 && income > 20_000) {
    addRecommendation(recommendations, {
      id: "transport",
      title: "Vérifier les frais de transport et repas",
      description: "Les frais de déplacement et repas professionnels sont souvent oubliés, surtout lors d'un changement d'emploi ou de taux d'activité.",
      priority: "Basse",
      estimatedSavings: Math.max(300, (input.deductions.transport + input.deductions.meals + 1200) * marginal * 0.25),
      difficulty: "Facile",
      implementationTime: "20 à 45 minutes",
      eligibility: ["Trajet domicile-travail", "Repas hors domicile", "Justificatifs ou forfait admis"],
      guide: [
        "Calculer les jours travaillés et le moyen de transport principal.",
        "Vérifier les plafonds admis par le canton.",
        "Conserver abonnements, factures ou explications de trajet."
      ]
    });
  }

  if (input.deductions.medical > 0 || input.deductions.healthInsurance > 0) {
    addRecommendation(recommendations, {
      id: "medical-insurance",
      title: "Vérifier assurance maladie et frais médicaux",
      description: "Les primes, frais médicaux et franchises peuvent être partiellement pris en compte selon les règles applicables.",
      priority: input.deductions.medical > 3000 ? "Moyenne" : "Basse",
      estimatedSavings: Math.max(250, input.deductions.medical * marginal * 0.2),
      difficulty: "Facile",
      implementationTime: "30 minutes",
      eligibility: ["Primes ou frais médicaux supportés personnellement", "Factures et décomptes disponibles"],
      warning: "Les seuils et plafonds varient selon canton et situation familiale.",
      guide: [
        "Exporter l'attestation annuelle de l'assurance maladie.",
        "Rassembler factures non remboursées.",
        "Comparer le montant avec les seuils admis."
      ]
    });
  }

  addRecommendation(recommendations, {
    id: "canton-comparison",
    title: "Comparer le canton de résidence",
    description: "Un changement de canton ou commune peut modifier l'impôt, mais doit être analysé avec loyers, travail, famille et qualité de vie.",
    priority: estimate.canton.multiplier > 1.05 ? "Moyenne" : "Basse",
    estimatedSavings: Math.max(0, estimate.estimatedTax - Math.min(...COMPARISON_CANTONS.map((code) => estimateForCanton(input, code).estimatedTax))),
    difficulty: "Avancée",
    implementationTime: "Plusieurs semaines",
    eligibility: ["Mobilité résidentielle possible", "Situation professionnelle compatible"],
    warning: "La résidence fiscale réelle dépend du centre de vie, pas seulement d'une adresse.",
    guide: [
      "Comparer impôt, loyer, transport et assurances.",
      "Vérifier la date fiscale déterminante en cas de déménagement.",
      "Valider les conséquences familiales et patrimoniales."
    ]
  });

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
    estimatedTaxBeforeOptimization: Math.round(estimate.estimatedTax),
    estimatedTaxAfterOptimization: Math.max(0, Math.round(estimate.estimatedTax - potentialSavings)),
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
