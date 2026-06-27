import React from "react";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { analyseTax } from "@/lib/tax-engine";
import { questionnaireSchema, QuestionnaireInput } from "@/lib/validators";
import { chf } from "@/lib/utils";

const navy = "#142844";
const copper = "#9A7046";
const sand = "#EEE8DD";
const ink = "#1B2738";
const grey = "#667181";

const styles = StyleSheet.create({
  page: { paddingTop: 42, paddingBottom: 50, paddingHorizontal: 42, fontSize: 9.5, color: ink, fontFamily: "Helvetica", backgroundColor: "#FCFBF8" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 17, borderBottom: `1px solid ${copper}` },
  brand: { flexDirection: "row", alignItems: "center" },
  mark: { width: 28, height: 28, backgroundColor: navy, marginRight: 10, alignItems: "center", justifyContent: "center", position: "relative" },
  crossHorizontal: { position: "absolute", width: 12, height: 1.5, backgroundColor: "#D6BA8B" },
  crossVertical: { position: "absolute", width: 1.5, height: 12, backgroundColor: "#D6BA8B" },
  brandName: { fontSize: 17, fontFamily: "Times-Roman", color: navy },
  brandCountry: { marginTop: 2, fontSize: 6.5, color: copper, letterSpacing: 1.7 },
  headerMeta: { textAlign: "right", color: grey, fontSize: 8, lineHeight: 1.45 },
  hero: { marginTop: 28, marginBottom: 22 },
  eyebrow: { color: copper, fontSize: 7.5, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 },
  title: { fontFamily: "Times-Roman", fontSize: 28, lineHeight: 1.12, color: navy, maxWidth: 430 },
  subtitle: { marginTop: 10, maxWidth: 440, color: grey, fontSize: 10, lineHeight: 1.5 },
  summary: { flexDirection: "row", marginBottom: 22, borderTop: `1px solid #DAD4C9`, borderBottom: `1px solid #DAD4C9` },
  metric: { flex: 1, paddingVertical: 13, paddingHorizontal: 10, borderRight: `1px solid #DAD4C9` },
  metricLast: { flex: 1, paddingVertical: 13, paddingHorizontal: 10 },
  metricLabel: { color: grey, fontSize: 7.5, marginBottom: 5 },
  metricValue: { color: navy, fontFamily: "Times-Bold", fontSize: 14 },
  metricValueAccent: { color: copper, fontFamily: "Times-Bold", fontSize: 14 },
  infoBand: { flexDirection: "row", justifyContent: "space-between", backgroundColor: sand, padding: 12, marginBottom: 20 },
  infoLabel: { color: grey, fontSize: 7.5, marginBottom: 3 },
  infoValue: { color: navy, fontSize: 10 },
  section: { marginTop: 17 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sectionNumber: { width: 20, height: 20, backgroundColor: navy, color: "#FFFFFF", textAlign: "center", paddingTop: 5, marginRight: 8, fontSize: 8 },
  h2: { fontFamily: "Times-Bold", fontSize: 16, color: navy },
  recommendation: { borderLeft: `2px solid ${copper}`, paddingLeft: 11, paddingVertical: 7, marginBottom: 9 },
  recommendationHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  recommendationTitle: { fontSize: 10.5, color: navy, fontFamily: "Helvetica-Bold", maxWidth: 330 },
  saving: { color: copper, fontFamily: "Helvetica-Bold", fontSize: 9 },
  small: { color: grey, lineHeight: 1.45, marginBottom: 2 },
  tag: { color: navy, fontSize: 7.5, marginTop: 3 },
  checklistItem: { flexDirection: "row", marginBottom: 7, paddingBottom: 7, borderBottom: "1px solid #E6E1D8" },
  checkbox: { width: 10, height: 10, border: `1px solid ${copper}`, marginRight: 8, marginTop: 1 },
  disclaimer: { marginTop: 20, padding: 13, backgroundColor: navy, color: "#FFFFFF" },
  disclaimerTitle: { fontFamily: "Helvetica-Bold", fontSize: 9, marginBottom: 5, color: "#D6BA8B" },
  disclaimerText: { fontSize: 7.5, lineHeight: 1.45, color: "#E7EAF0" },
  footer: { position: "absolute", bottom: 22, left: 42, right: 42, flexDirection: "row", justifyContent: "space-between", color: grey, fontSize: 7, borderTop: "1px solid #DED9CF", paddingTop: 8 }
});

function ReportHeader({ label }: { label: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={styles.mark}><View style={styles.crossHorizontal} /><View style={styles.crossVertical} /></View>
        <View><Text style={styles.brandName}>OptiTax</Text><Text style={styles.brandCountry}>SUISSE</Text></View>
      </View>
      <Text style={styles.headerMeta}>Rapport confidentiel{"\n"}{label}</Text>
    </View>
  );
}

function ReportFooter() {
  return (
    <View style={styles.footer}>
      <Text>OptiTax Suisse · Créé par Théophile Morel</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function SectionTitle({ number, children }: { number: string; children: string }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionNumber}>{number}</Text><Text style={styles.h2}>{children}</Text></View>;
}

function Recommendations({ items }: { items: ReturnType<typeof analyseTax>["recommendations"] }) {
  return (
    <>
      {items.map((rec) => (
        <View key={rec.id} style={styles.recommendation} wrap={false}>
          <View style={styles.recommendationHead}><Text style={styles.recommendationTitle}>{rec.title}</Text><Text style={styles.saving}>{chf(rec.estimatedSavings)}</Text></View>
          <Text style={styles.small}>{rec.description}</Text>
          <Text style={styles.tag}>Priorité {rec.priority} · Difficulté {rec.difficulty} · {rec.implementationTime}</Text>
          {rec.guide.slice(0, 3).map((item) => <Text key={item} style={styles.small}>- {item}</Text>)}
          {rec.warning ? <Text style={styles.small}>Point d’attention : {rec.warning}</Text> : null}
        </View>
      ))}
    </>
  );
}

function Report({ input }: { input: QuestionnaireInput }) {
  const result = analyseTax(input);
  const generatedOn = new Intl.DateTimeFormat("fr-CH", { dateStyle: "long" }).format(new Date());

  return (
    <Document title="Rapport d’optimisation fiscale suisse" author="OptiTax Suisse" subject="Simulation fiscale indicative">
      <Page key="cover" size="A4" style={styles.page}>
        <ReportHeader label="Simulation indicative" />
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Analyse personnalisée · Fiscalité suisse</Text>
          <Text style={styles.title}>Rapport d’optimisation fiscale suisse</Text>
          <Text style={styles.subtitle}>Synthèse de votre situation, estimation des économies potentielles et priorités d’action à faire valider par un professionnel.</Text>
        </View>

        <View style={styles.infoBand}>
          <View><Text style={styles.infoLabel}>RÉSIDENCE FISCALE</Text><Text style={styles.infoValue}>{input.residence.postalCode} {input.residence.commune} · {input.residence.canton}</Text></View>
          <View><Text style={styles.infoLabel}>DATE DU RAPPORT</Text><Text style={styles.infoValue}>{generatedOn}</Text></View>
        </View>

        <View style={styles.summary}>
          <View style={styles.metric}><Text style={styles.metricLabel}>SCORE FISCAL</Text><Text style={styles.metricValue}>{result.score}/100</Text></View>
          <View style={styles.metric}><Text style={styles.metricLabel}>AVANT OPTIMISATION</Text><Text style={styles.metricValue}>{chf(result.estimatedTaxBeforeOptimization)}</Text></View>
          <View style={styles.metric}><Text style={styles.metricLabel}>APRÈS OPTIMISATION</Text><Text style={styles.metricValue}>{chf(result.estimatedTaxAfterOptimization)}</Text></View>
          <View style={styles.metricLast}><Text style={styles.metricLabel}>ÉCONOMIES POTENTIELLES</Text><Text style={styles.metricValueAccent}>{chf(result.potentialSavings)}</Text></View>
        </View>

        <View style={styles.section}>
          <SectionTitle number="01">Résumé fiscal</SectionTitle>
          <View style={styles.infoBand}>
            <View><Text style={styles.infoLabel}>REVENU IMPOSABLE ESTIMÉ</Text><Text style={styles.infoValue}>{chf(result.taxableIncome)}</Text></View>
            <View><Text style={styles.infoLabel}>FORTUNE IMPOSABLE ESTIMÉE</Text><Text style={styles.infoValue}>{chf(result.taxableWealth)}</Text></View>
            <View><Text style={styles.infoLabel}>RECOMMANDATIONS</Text><Text style={styles.infoValue}>{result.recommendations.length} pistes identifiées</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle number="02">Recommandations prioritaires</SectionTitle>
          <Recommendations items={result.recommendations.slice(0, 1)} />
        </View>
        <ReportFooter />
      </Page>

      <Page key="recommendations-one" size="A4" style={styles.page}>
        <ReportHeader label="Recommandations prioritaires" />
        <View style={styles.section}>
          <SectionTitle number="02">Recommandations · suite</SectionTitle>
          <Recommendations items={result.recommendations.slice(1, 4)} />
        </View>
        <ReportFooter />
      </Page>

      <Page key="recommendations-two" size="A4" style={styles.page}>
        <ReportHeader label="Analyse patrimoniale" />
        <View style={styles.section}>
          <SectionTitle number="02">Recommandations · suite</SectionTitle>
          <Recommendations items={result.recommendations.slice(4, 7)} />
        </View>
        <ReportFooter />
      </Page>

      <Page key="checklist" size="A4" style={styles.page}>
        <ReportHeader label="Checklist d’actions" />
        <View style={styles.section}>
          <SectionTitle number="03">Checklist d’actions</SectionTitle>
          {result.checklist.map((item) => <View key={item} style={styles.checklistItem} wrap={false}><View style={styles.checkbox} /><Text style={styles.small}>{item}</Text></View>)}
        </View>

        <View style={styles.disclaimer} wrap={false}>
          <Text style={styles.disclaimerTitle}>INFORMATION FISCALE IMPORTANTE</Text>
          <Text style={styles.disclaimerText}>Ce rapport est généré automatiquement à partir des informations saisies. Il fournit une simulation indicative et ne constitue ni un conseil fiscal personnalisé, ni une décision de taxation, ni une garantie d’économie. Les règles, barèmes communaux et situations individuelles peuvent modifier sensiblement le résultat. Faites valider toute décision par un fiscaliste ou l’administration fiscale compétente.</Text>
        </View>
        <ReportFooter />
      </Page>
    </Document>
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const payload = questionnaireSchema.safeParse(body);
  if (!payload.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  try {
    const blob = await pdf(<Report input={payload.data} />).toBlob();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=rapport-optitax-suisse.pdf",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("PDF generation failed", error);
    return NextResponse.json({ error: "Génération du rapport impossible" }, { status: 500 });
  }
}
