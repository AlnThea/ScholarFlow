// lib/editor/burstiness-engine.ts
// Calculates sentence variance (burstiness) to detect AI vs Human patterns

export interface BurstinessMetrics {
  totalWords: number;
  totalSentences: number;
  averageSentenceLength: number;
  standardDeviation: number;
  burstinessScore: number;
  status: 'human' | 'warning' | 'ai';
  sentenceData: Array<{ index: number; words: number; text: string }>;
}

export function calculateBurstiness(text: string): BurstinessMetrics {
  // Clean HTML if passed directly from editor
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (!cleanText) {
    return {
      totalWords: 0,
      totalSentences: 0,
      averageSentenceLength: 0,
      standardDeviation: 0,
      burstinessScore: 0,
      status: 'human',
      sentenceData: []
    };
  }

  // Smart sentence segmentation regex
  // Match ., !, or ? that is followed by whitespace and a capital letter or end of string.
  // Ignore standard academic abbreviations.
  // This is a simplified regex; negative lookbehind is supported in modern JS.
  const sentenceRegex = /(?<!\be\.g)(?<!\bi\.e)(?<!\bal)(?<!\bvs)(?<!\bJan)(?<!\bFeb)(?<!\bMar)(?<!\bApr)(?<!\bAug)(?<!\bSep)(?<!\bOct)(?<!\bNov)(?<!\bDec)(?<!\bDr)(?<!\bMr)(?<!\bMs)(?<!\bProf)(?<!\d)([.!?])\s+(?=[A-Z0-9]|$)/g;

  // Split and clean sentences
  const rawSentences = cleanText.split(sentenceRegex).reduce((acc: string[], val: string, i: number, arr: string[]) => {
    // Re-attach punctuation
    if (i % 2 === 0) {
      if (arr[i+1]) {
         acc.push((val + arr[i+1]).trim());
      } else {
         acc.push(val.trim());
      }
    }
    return acc;
  }, []).filter(s => s.length > 0);

  // If the regex splitting fails or produces no punctuation match, fallback
  const sentences = rawSentences.length > 0 ? rawSentences : [cleanText];

  const sentenceData = sentences.map((s, index) => {
    const wordCount = s.split(/\s+/).filter(w => w.length > 0).length;
    return { index: index + 1, words: wordCount, text: s };
  }).filter(s => s.words > 0);

  const totalSentences = sentenceData.length;
  const totalWords = sentenceData.reduce((acc, curr) => acc + curr.words, 0);
  
  if (totalSentences === 0) {
    return {
      totalWords: 0,
      totalSentences: 0,
      averageSentenceLength: 0,
      standardDeviation: 0,
      burstinessScore: 0,
      status: 'human',
      sentenceData: []
    };
  }

  const averageSentenceLength = totalWords / totalSentences;

  // Calculate Standard Deviation
  const variance = sentenceData.reduce((acc, curr) => {
    return acc + Math.pow(curr.words - averageSentenceLength, 2);
  }, 0) / totalSentences;
  
  const standardDeviation = Math.sqrt(variance);

  // Burstiness Score = Coefficient of Variation (SD / Mean)
  // If mean is 0, score is 0.
  let burstinessScore = averageSentenceLength > 0 ? standardDeviation / averageSentenceLength : 0;
  
  // Normalize slightly to ensure the thresholds match the prompt intent
  burstinessScore = parseFloat(burstinessScore.toFixed(2));

  let status: 'human' | 'warning' | 'ai' = 'human';
  if (burstinessScore <= 0.30) {
    status = 'ai';
  } else if (burstinessScore >= 0.31 && burstinessScore <= 0.59) {
    status = 'warning';
  } else {
    status = 'human';
  }

  // Require minimum 3 sentences to trigger AI warning reliably
  if (totalSentences < 3 && status === 'ai') {
    status = 'warning'; 
  }

  return {
    totalWords,
    totalSentences,
    averageSentenceLength: parseFloat(averageSentenceLength.toFixed(1)),
    standardDeviation: parseFloat(standardDeviation.toFixed(2)),
    burstinessScore,
    status,
    sentenceData
  };
}
