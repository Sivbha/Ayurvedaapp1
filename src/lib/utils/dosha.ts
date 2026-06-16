import { DoshaScores, DoshaType, ConstitutionType } from '@/types/assessment';

export function normalizeScores(scores: DoshaScores): DoshaScores {
  const sum = scores.vata + scores.pitta + scores.kapha;
  if (sum === 0) return { vata: 0, pitta: 0, kapha: 0 };
  return {
    vata: Math.round((scores.vata / sum) * 100),
    pitta: Math.round((scores.pitta / sum) * 100),
    kapha: Math.round((scores.kapha / sum) * 100),
  };
}

export function determineDominant(normalized: DoshaScores, dominantThreshold = 50, dualGap = 15): { dominant: ConstitutionType; confidence: number } {
  const sorted = Object.entries(normalized).sort(([, a], [, b]) => b - a) as [DoshaType, number][];
  const [top1, top2] = sorted;

  if (top1[1] >= dominantThreshold) {
    return { dominant: top1[0], confidence: top1[1] / 100 };
  }

  if (top2 && top1[1] - top2[1] < dualGap) {
    const dual = `${top1[0]}-${top2[0]}` as ConstitutionType;
    return { dominant: dual, confidence: (top1[1] + top2[1]) / 200 };
  }

  return { dominant: top1[0], confidence: top1[1] / 100 };
}

export function doshaToColor(dosha: string): string {
  const map: Record<string, string> = { vata: '#6d28d9', pitta: '#dc2626', kapha: '#059669' };
  return map[dosha] || '#6b7280';
}

export function formatDoshaName(dosha: string): string {
  return dosha.charAt(0).toUpperCase() + dosha.slice(1);
}
