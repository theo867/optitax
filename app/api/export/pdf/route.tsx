import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { analyseTax } from "@/lib/tax-engine";
import { questionnaireSchema, QuestionnaireInput } from "@/lib/validators";
import { chf } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: "#17211c", fontFamily: "Helvetica" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  subtitle: { fontSize: 11, color: "#5f6b64", marginBottom: 18 },
  section: { marginTop: 16, paddingTop: 12, borderTop: "1px solid #d9ded7" },
  h2: { fontSize: 15, fontWeight: 700, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  box: { padding: 10, border: "1px solid #d9ded7", borderRadius: 6, marginBottom: 8 },
  small: { color: "#5f6b64", lineHeight: 1.35 }
});

function Report({ input }: { input: QuestionnaireInput }) {
  const result = analyseTax(input);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Rapport OptiTax Suisse</Text>
        <Text style={styles.subtitle}>Estimation informative générée automatiquement. À valider avec sources officielles ou expert fiscal.</Text>
        <View style={styles.box}>
          <View style={styles.row}><Text>Canton</Text><Text>{input.residence.canton} - {input.residence.commune}</Text></View>
          <View style={styles.row}><Text>Score fiscal</Text><Text>{result.score}/100</Text></View>
          <View style={styles.row}><Text>Impôts avant optimisation</Text><Text>{chf(result.estimatedTaxBeforeOptimization)}</Text></View>
          <View style={styles.row}><Text>Impôts après optimisation</Text><Text>{chf(result.estimatedTaxAfterOptimization)}</Text></View>
          <View style={styles.row}><Text>Économies potentielles</Text><Text>{chf(result.potentialSavings)}</Text></View>
        </View>
        <View style={styles.section}>
          <Text style={styles.h2}>Recommandations</Text>
          {result.recommendations.slice(0, 6).map((rec) => (
            <View key={rec.id} style={styles.box}>
              <Text>{rec.title} - {rec.priority} - {chf(rec.estimatedSavings)}</Text>
              <Text style={styles.small}>{rec.description}</Text>
              <Text style={styles.small}>Temps: {rec.implementationTime}</Text>
              <Text style={styles.small}>Éligibilité: {rec.eligibility.join(", ")}</Text>
              {rec.warning ? <Text style={styles.small}>Attention: {rec.warning}</Text> : null}
              {rec.guide.map((item) => <Text key={item} style={styles.small}>• {item}</Text>)}
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.h2}>Checklist</Text>
          {result.checklist.map((item) => <Text key={item} style={styles.small}>□ {item}</Text>)}
        </View>
      </Page>
    </Document>
  );
}

export async function POST(request: NextRequest) {
  const payload = questionnaireSchema.safeParse(await request.json());
  if (!payload.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const blob = await pdf(<Report input={payload.data} />).toBlob();
  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=rapport-optitax-suisse.pdf"
    }
  });
}
