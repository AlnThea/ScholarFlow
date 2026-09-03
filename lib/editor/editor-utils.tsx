import React from 'react';


function extractTextFromContent(content: any): string {
  if (!content || !content.blocks || !Array.isArray(content.blocks)) return '';
  const texts: string[] = [];
  for (const block of content.blocks) {
    if (block.type === 'paragraph' || block.type === 'header') {
      const txt = block.data?.text;
      if (txt) {
        // Strip HTML tags because Editor.js stores styled html
        const clean = txt.replace(/<[^>]*>/g, '').trim();
        if (clean) texts.push(clean);
      }
    } else if (block.type === 'list') {
      const items = block.data?.items;
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const cleanItem = item.replace(/<[^>]*>/g, '').trim();
          if (cleanItem) texts.push(cleanItem);
        }
      }
    }
  }
  return texts.join('\n\n');
}

function countWords(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function findMostRelevantSentence(abstract: string | null | undefined, query: string): string {
  if (!abstract) return "Abstrak tidak tersedia.";
  
  // Pre-process abstract to add spaces after periods if missing (e.g. "konvensional.Sistem" -> "konvensional. Sistem")
  const cleanedAbstract = abstract.replace(/(?<=[.!?])(?=[A-Za-z])/g, " ");
  
  const sentences = cleanedAbstract.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) return cleanedAbstract;
  const queryWords = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  if (queryWords.size === 0) return sentences[0];
  let bestSentence = sentences[0];
  let maxOverlap = -1;
  for (const sentence of sentences) {
    const sentenceWords = new Set(sentence.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    let overlap = 0;
    for (const word of sentenceWords) {
      if (queryWords.has(word)) overlap++;
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestSentence = sentence;
    }
  }
  return bestSentence;
}

function HighlightedAbstract({ abstract, query }: { abstract: string | null | undefined; query: string }) {
  if (!abstract) return <p className="text-slate-400 italic text-xs">Abstrak tidak tersedia.</p>;
  
  // Pre-process abstract to add spaces after periods if missing
  const cleanedAbstract = abstract.replace(/(?<=[.!?])(?=[A-Za-z])/g, " ");
  
  const sentences = cleanedAbstract.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) {
    return <p className="text-slate-600 leading-relaxed text-xs">{cleanedAbstract}</p>;
  }
  const queryWords = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  let bestIndex = 0;
  let maxOverlap = -1;
  sentences.forEach((sentence, idx) => {
    const sentenceWords = new Set(sentence.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    let overlap = 0;
    for (const word of sentenceWords) {
      if (queryWords.has(word)) overlap++;
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestIndex = idx;
    }
  });
  return (
    <p className="text-slate-600 leading-relaxed text-xs">
      {sentences.map((sentence, idx) => {
        if (idx === bestIndex) {
          return (
            <mark key={idx} className="bg-indigo-50 text-indigo-950 font-semibold px-1 rounded border-b border-indigo-200">
              {sentence}{' '}
            </mark>
          );
        }
        return <span key={idx}>{sentence} </span>;
      })}
    </p>
  );
}

function findMostUniqueWord(sentence: string): string {
  if (!sentence) return "";
  const words = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g, " ").split(/\s+/);
  const stopwords = new Set([
    'dan', 'di', 'yang', 'untuk', 'dengan', 'itu', 'ini', 'dalam', 'pada', 'dari', 'ke', 'sebagai', 'adalah',
    'oleh', 'atau', 'telah', 'bisa', 'dapat', 'akan', 'juga', 'ada', 'mereka', 'ia', 'kita', 'kami', 'saya',
    'kamu', 'dia', 'namun', 'tetapi', 'karena', 'sehingga', 'maka', 'jika', 'serta', 'seperti',
    'tersebut', 'secara', 'sebesar', 'sistem', 'metode', 'aplikasi', 'penelitian', 'peneliti', 'hasil', 'pada',
    'the', 'and', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'an', 'be', 'this', 'that', 'from', 'it', 'is', 'was', 'were', 'are', 'as'
  ]);
  let bestWord = "";
  let maxScore = -1;
  for (const word of words) {
    const cleanWord = word.trim();
    if (!cleanWord || stopwords.has(cleanWord.toLowerCase())) continue;
    let score = cleanWord.length;
    if (/[vxzyqp]/i.test(cleanWord)) score += 2;
    if (/[A-Z]/.test(cleanWord)) score += 1;
    if (/\d/.test(cleanWord)) score += 1;
    if (score > maxScore) {
      maxScore = score;
      bestWord = cleanWord;
    }
  }
  return bestWord || words[0] || "";
}

const getContentComparisonString = (content: any): string => {
  if (!content) return JSON.stringify([]);
  let parsed = content;
  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return content;
    }
  }
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
    return JSON.stringify(parsed.blocks);
  }
  return JSON.stringify(parsed);
};
