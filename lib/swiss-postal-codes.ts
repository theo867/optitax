export type SwissLocality = {
  postalCode: string;
  commune: string;
  canton: string;
};

// Échantillon local pour l'autocomplétion. Pour la production, remplacer ce tableau
// par le répertoire officiel des localités de la Poste suisse, importé et versionné.
export const SWISS_LOCALITIES: SwissLocality[] = [
  { postalCode: "1000", commune: "Lausanne", canton: "VD" },
  { postalCode: "1200", commune: "Genève", canton: "GE" },
  { postalCode: "1700", commune: "Fribourg", canton: "FR" },
  { postalCode: "2000", commune: "Neuchâtel", canton: "NE" },
  { postalCode: "2500", commune: "Bienne / Biel", canton: "BE" },
  { postalCode: "2800", commune: "Delémont", canton: "JU" },
  { postalCode: "3000", commune: "Berne", canton: "BE" },
  { postalCode: "3280", commune: "Morat / Murten", canton: "FR" },
  { postalCode: "4000", commune: "Bâle", canton: "BS" },
  { postalCode: "5000", commune: "Aarau", canton: "AG" },
  { postalCode: "6000", commune: "Lucerne", canton: "LU" },
  { postalCode: "6300", commune: "Zoug", canton: "ZG" },
  { postalCode: "7000", commune: "Coire", canton: "GR" },
  { postalCode: "8000", commune: "Zurich", canton: "ZH" },
  { postalCode: "9000", commune: "Saint-Gall", canton: "SG" }
];

export function findSwissLocalities(postalCode: string) {
  return SWISS_LOCALITIES.filter((locality) => locality.postalCode === postalCode.trim());
}
