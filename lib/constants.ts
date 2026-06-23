export const CANTONS = [
  { code: "AG", name: "Argovie", multiplier: 1.02, wealthRate: 0.0022 },
  { code: "AI", name: "Appenzell Rhodes-Intérieures", multiplier: 0.84, wealthRate: 0.0016 },
  { code: "AR", name: "Appenzell Rhodes-Extérieures", multiplier: 0.94, wealthRate: 0.0018 },
  { code: "BE", name: "Berne", multiplier: 1.15, wealthRate: 0.0028 },
  { code: "BL", name: "Bâle-Campagne", multiplier: 1.06, wealthRate: 0.0024 },
  { code: "BS", name: "Bâle-Ville", multiplier: 1.08, wealthRate: 0.0026 },
  { code: "FR", name: "Fribourg", multiplier: 1.04, wealthRate: 0.0023 },
  { code: "GE", name: "Genève", multiplier: 1.24, wealthRate: 0.0034 },
  { code: "GL", name: "Glaris", multiplier: 0.96, wealthRate: 0.0019 },
  { code: "GR", name: "Grisons", multiplier: 0.99, wealthRate: 0.002 },
  { code: "JU", name: "Jura", multiplier: 1.16, wealthRate: 0.0027 },
  { code: "LU", name: "Lucerne", multiplier: 0.91, wealthRate: 0.0017 },
  { code: "NE", name: "Neuchâtel", multiplier: 1.18, wealthRate: 0.0029 },
  { code: "NW", name: "Nidwald", multiplier: 0.68, wealthRate: 0.0011 },
  { code: "OW", name: "Obwald", multiplier: 0.75, wealthRate: 0.0012 },
  { code: "SG", name: "Saint-Gall", multiplier: 1.01, wealthRate: 0.0021 },
  { code: "SH", name: "Schaffhouse", multiplier: 1.03, wealthRate: 0.0022 },
  { code: "SO", name: "Soleure", multiplier: 1.1, wealthRate: 0.0025 },
  { code: "SZ", name: "Schwytz", multiplier: 0.63, wealthRate: 0.001 },
  { code: "TG", name: "Thurgovie", multiplier: 0.97, wealthRate: 0.0019 },
  { code: "TI", name: "Tessin", multiplier: 1.09, wealthRate: 0.0024 },
  { code: "UR", name: "Uri", multiplier: 0.9, wealthRate: 0.0017 },
  { code: "VD", name: "Vaud", multiplier: 1.21, wealthRate: 0.003 },
  { code: "VS", name: "Valais", multiplier: 0.93, wealthRate: 0.0018 },
  { code: "ZG", name: "Zoug", multiplier: 0.58, wealthRate: 0.0009 },
  { code: "ZH", name: "Zurich", multiplier: 0.98, wealthRate: 0.002 }
] as const;

export const COMPARISON_CANTONS = ["ZG", "SZ", "NW", "OW", "LU", "VS", "VD", "GE", "FR", "BE", "ZH"];

export const THIRD_PILLAR = {
  withPensionFund: 7258,
  withoutPensionFundCap: 36288,
  withoutPensionFundIncomeShare: 0.2
};

export const OFFICIAL_LINKS = [
  {
    label: "Calculateur fiscal suisse AFC",
    href: "https://swisstaxcalculator.estv.admin.ch/#/calculator/income-wealth-tax"
  },
  {
    label: "Administration fédérale des contributions",
    href: "https://www.estv.admin.ch/estv/fr/accueil.html"
  },
  {
    label: "Portail ch.ch impôts",
    href: "https://www.ch.ch/fr/impots-et-finances/"
  },
  {
    label: "OFAS - prévoyance liée 3a",
    href: "https://www.bsv.admin.ch/bsv/fr/home/assurances-sociales/bv/grundlagen-und-gesetze/grundlagen/gebundene-selbstvorsorge.html"
  }
];
