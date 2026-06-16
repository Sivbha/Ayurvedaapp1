import React from 'react';
import { PractitionerReport, ClientReport } from '@/types/report';

export async function generatePDF(report: PractitionerReport | ClientReport, type: 'practitioner' | 'client'): Promise<Uint8Array> {
  try {
    const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');

    const styles = StyleSheet.create({
      page: { padding: 30, fontFamily: 'Helvetica' },
      title: { fontSize: 24, marginBottom: 10, color: '#9d5a1a' },
      section: { marginBottom: 15 },
      heading: { fontSize: 16, marginBottom: 5, color: '#7e4a1a' },
      text: { fontSize: 11, marginBottom: 3, lineHeight: 1.5 },
      disclaimer: { fontSize: 8, marginTop: 20, color: '#999' },
    });

    const MyDocument = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>{type === 'practitioner' ? 'Practitioner Report' : 'Wellness Report'}</Text>
          
          <View style={styles.section}>
            <Text style={styles.heading}>Summary</Text>
            {'prakritiConclusion' in report && report.prakritiConclusion ? (
              <>
                <Text style={styles.text}>Constitution: {(report as PractitionerReport).prakritiConclusion.constitution}</Text>
                <Text style={styles.text}>Current Imbalance: {(report as PractitionerReport).vikritiConclusion.imbalance}</Text>
                <Text style={styles.text}>Agni Type: {(report as PractitionerReport).agniAssessment.type}</Text>
                <Text style={styles.text}>Ama Level: {(report as PractitionerReport).amaIndicators.level}</Text>
              </>
            ) : (
              <>
                <Text style={styles.text}>Constitution: {(report as ClientReport).likelyConstitution.type}</Text>
                <Text style={styles.text}>Current Pattern: {(report as ClientReport).currentImbalance.pattern}</Text>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Recommendations</Text>
            <Text style={styles.text}>See interactive report for full recommendations.</Text>
          </View>

          <Text style={styles.disclaimer}>This report is for educational purposes only. Not medical advice.</Text>
        </Page>
      </Document>
    );

    const blob = await pdf(React.createElement(MyDocument)).toBlob();
    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return new Uint8Array(0);
  }
}
