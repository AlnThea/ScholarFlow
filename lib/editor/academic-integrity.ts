// lib/editor/academic-integrity.ts
// Composite Academic Integrity & AI-Likeness Barometer Engine (Phase 24)
// Evaluates Burstiness (sentence length variance), Lexical Diversity (TTR),
// AI Cliché/Buzzword Frequency, and Syntactic Variance to predict AI-likeness and publication readiness.

import { calculateBurstiness, AI_BUZZWORDS, type BurstinessMetrics } from '@/lib/editor/burstiness-engine';

export type IntegrityRiskLevel = 'low' | 'medium' | 'high';

export interface SentenceIntegrity {
  index: number;
  text: string;
  words: number;
  riskLevel: IntegrityRiskLevel;
  riskScore: number; // 0 (low risk / human) to 100 (high risk / AI-like)
  reasons: string[];
  detectedClichés: string[];
}

export interface AcademicIntegrityReport {
  overallScore: number; // 0 to 100% (Higher = More Original / Human-like)
  riskLevel: IntegrityRiskLevel;
  riskLabel: { en: string; id: string };
  metrics: {
    burstinessScore: number;
    burstinessContribution: number;
    lexicalDiversityScore: number; // Type-Token Ratio %
    uniqueWordRatio: number;
    clichéCount: number;
    clichéDensity: number; // percentage of words that are clichés
    totalWords: number;
    totalSentences: number;
    averageSentenceLength: number;
    standardDeviation: number;
  };
  sentences: SentenceIntegrity[];
  highRiskSentences: SentenceIntegrity[];
  recommendations: { en: string; id: string }[];
}

/**
 * Calculates the Composite Academic Integrity Index for a given text.
 */
export function calculateAcademicIntegrity(text: string): AcademicIntegrityReport {
  const burstiness = calculateBurstiness(text);

  if (burstiness.totalWords === 0 || burstiness.totalSentences === 0) {
    return {
      overallScore: 100,
      riskLevel: 'low',
      riskLabel: { en: 'Awaiting Content', id: 'Menunggu Naskah' },
      metrics: {
        burstinessScore: 0,
        burstinessContribution: 100,
        lexicalDiversityScore: 100,
        uniqueWordRatio: 1,
        clichéCount: 0,
        clichéDensity: 0,
        totalWords: 0,
        totalSentences: 0,
        averageSentenceLength: 0,
        standardDeviation: 0,
      },
      sentences: [],
      highRiskSentences: [],
      recommendations: [],
    };
  }

  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const rawWords = cleanText.toLowerCase().match(/\b[a-z0-9_-]+\b/g) || [];
  const totalWords = rawWords.length;
  const uniqueWords = new Set(rawWords).size;

  // 1. Lexical Diversity Score (Type-Token Ratio with length dampening)
  const baseTtr = totalWords > 0 ? (uniqueWords / totalWords) * 100 : 100;
  // Dampen TTR for long texts (natural repetition occurs in long documents)
  const lengthFactor = Math.log10(Math.max(totalWords, 10)) / 2;
  const normalizedTtr = Math.min(Math.max(baseTtr * lengthFactor, 15), 100);

  // 2. Burstiness Score Contribution (Normalized to 0-100)
  // Human: CV >= 0.60 -> 100, Warning: 0.35-0.59 -> 60-80, AI: <= 0.30 -> < 50
  let burstinessContribution = 50;
  if (burstiness.burstinessScore >= 0.65) {
    burstinessContribution = 95 + Math.min((burstiness.burstinessScore - 0.65) * 20, 5);
  } else if (burstiness.burstinessScore >= 0.45) {
    burstinessContribution = 75 + ((burstiness.burstinessScore - 0.45) / 0.20) * 20;
  } else if (burstiness.burstinessScore >= 0.30) {
    burstinessContribution = 50 + ((burstiness.burstinessScore - 0.30) / 0.15) * 25;
  } else {
    burstinessContribution = Math.max(burstiness.burstinessScore / 0.30 * 50, 10);
  }

  // 3. AI Cliché / Buzzwords Density Penalty
  const clichéDensity = totalWords > 0 ? (burstiness.buzzwordCount / totalWords) * 100 : 0;
  let clichéScore = 100;
  if (clichéDensity === 0) {
    clichéScore = 100;
  } else if (clichéDensity <= 0.8) {
    clichéScore = 90;
  } else if (clichéDensity <= 1.8) {
    clichéScore = 70;
  } else if (clichéDensity <= 3.0) {
    clichéScore = 50;
  } else {
    clichéScore = Math.max(30 - (clichéDensity - 3.0) * 15, 5);
  }

  // 4. Syntactic Length Variance (Sentence length distribution)
  let shortSentences = 0; // < 12 words
  let mediumSentences = 0; // 12 - 24 words
  let longSentences = 0; // > 24 words

  burstiness.sentenceData.forEach((s) => {
    if (s.words < 12) shortSentences++;
    else if (s.words <= 24) mediumSentences++;
    else longSentences++;
  });

  const shortRatio = shortSentences / burstiness.totalSentences;
  const mediumRatio = mediumSentences / burstiness.totalSentences;
  const longRatio = longSentences / burstiness.totalSentences;

  // High AI likeness occurs when > 80% sentences are rigidly medium length (15-22 words)
  let syntacticVarianceScore = 80;
  if (mediumRatio > 0.85 && burstiness.totalSentences >= 4) {
    syntacticVarianceScore = 35; // Monotonous length penalty
  } else if (shortRatio > 0.10 && longRatio > 0.10) {
    syntacticVarianceScore = 95; // Excellent cadence variety
  } else if (shortRatio > 0.05 || longRatio > 0.05) {
    syntacticVarianceScore = 75;
  }

  // Composite Formula (Weights: Burstiness 35%, Lexical 25%, Clichés 20%, Syntactic 20%)
  const rawComposite =
    burstinessContribution * 0.35 +
    normalizedTtr * 0.25 +
    clichéScore * 0.20 +
    syntacticVarianceScore * 0.20;

  const overallScore = Math.min(Math.max(Math.round(rawComposite), 5), 99);

  // Risk Level Classification
  let riskLevel: IntegrityRiskLevel = 'low';
  let riskLabel = {
    en: 'High Originality (Human-Authored)',
    id: 'Orisinalitas Tinggi (Human-Authored)',
  };

  if (overallScore < 48) {
    riskLevel = 'high';
    riskLabel = {
      en: 'High AI Likeness (Monotonous Pattern)',
      id: 'Kemiripan AI Tinggi (Pola Monoton)',
    };
  } else if (overallScore < 75) {
    riskLevel = 'medium';
    riskLabel = {
      en: 'Moderate Rhythm (Review Suggested)',
      id: 'Ritme Sedang (Disarankan Review)',
    };
  }

  // Per-sentence risk evaluation for heatmap navigation
  const sentences: SentenceIntegrity[] = burstiness.sentenceData.map((s) => {
    const sLower = s.text.toLowerCase();
    const wordsInSentence = sLower.match(/\b[a-z0-9_-]+\b/g) || [];
    const detectedClichés = wordsInSentence.filter((w) => AI_BUZZWORDS.includes(w));
    const reasons: string[] = [];
    let sentenceRiskScore = 20;

    // Length check: too monotonous with average
    const diffFromMean = Math.abs(s.words - burstiness.averageSentenceLength);
    if (burstiness.burstinessScore < 0.35 && diffFromMean <= 1.5 && burstiness.totalSentences >= 4) {
      sentenceRiskScore += 35;
      reasons.push(
        'Panjang kalimat identik dengan rata-rata naskah (pola prediktif LLM)'
      );
    }

    // Extreme length check: run-on sentence (> 38 words)
    if (s.words > 38) {
      sentenceRiskScore += 25;
      reasons.push('Kalimat terlalu panjang (> 38 kata), berisiko menurunkan kohesi');
    }

    // Clichés in sentence
    if (detectedClichés.length >= 2) {
      sentenceRiskScore += 40;
      reasons.push(`Mengandung ${detectedClichés.length} kosakata klise AI: "${detectedClichés.join(', ')}"`);
    } else if (detectedClichés.length === 1) {
      sentenceRiskScore += 15;
      reasons.push(`Mengandung kosakata klise AI: "${detectedClichés[0]}"`);
    }

    let sentenceRiskLevel: IntegrityRiskLevel = 'low';
    if (sentenceRiskScore >= 60) {
      sentenceRiskLevel = 'high';
    } else if (sentenceRiskScore >= 40) {
      sentenceRiskLevel = 'medium';
    }

    return {
      index: s.index,
      text: s.text,
      words: s.words,
      riskLevel: sentenceRiskLevel,
      riskScore: Math.min(sentenceRiskScore, 100),
      reasons,
      detectedClichés,
    };
  });

  const highRiskSentences = sentences.filter((s) => s.riskLevel === 'high' || s.riskLevel === 'medium');

  // Dynamic recommendations
  const recommendations: { en: string; id: string }[] = [];
  if (burstinessContribution < 60) {
    recommendations.push({
      en: 'Vary your sentence lengths by splitting compound sentences or introducing punchy transitional thoughts.',
      id: 'Variasikan panjang kalimat Anda dengan memecah klausa panjang atau menyisipkan kalimat ringkas penegas.',
    });
  }
  if (clichéScore < 70) {
    recommendations.push({
      en: 'Replace frequent robotic buzzwords (e.g. delve, pivotal, testament, tapestry) with discipline-specific academic terminology.',
      id: 'Ganti kosakata klise AI (seperti esensial, krusial, komprehensif, lanskap) dengan terminologi spesifik disiplin ilmu Anda.',
    });
  }
  if (normalizedTtr < 50) {
    recommendations.push({
      en: 'Expand lexical diversity by introducing richer synonyms and avoiding repetitive clause openers.',
      id: 'Perkaya variasi leksikal dengan sinonim akademis dan hindari pengulangan pembuka kalimat yang seragam.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      en: 'Naskah menunjukkan ritme dan variasi akademis yang sangat alami, siap untuk review jurnal atau Turnitin.',
      id: 'Naskah menunjukkan ritme dan variasi akademis yang sangat alami, siap untuk review jurnal atau Turnitin.',
    });
  }

  return {
    overallScore,
    riskLevel,
    riskLabel,
    metrics: {
      burstinessScore: burstiness.burstinessScore,
      burstinessContribution: Math.round(burstinessContribution),
      lexicalDiversityScore: Math.round(normalizedTtr),
      uniqueWordRatio: parseFloat((uniqueWords / Math.max(totalWords, 1)).toFixed(2)),
      clichéCount: burstiness.buzzwordCount,
      clichéDensity: parseFloat(clichéDensity.toFixed(2)),
      totalWords: burstiness.totalWords,
      totalSentences: burstiness.totalSentences,
      averageSentenceLength: burstiness.averageSentenceLength,
      standardDeviation: burstiness.standardDeviation,
    },
    sentences,
    highRiskSentences,
    recommendations,
  };
}
