import { useMemo } from "react";
import keyword_extractor from "keyword-extractor";
import { ind as indStopwords, eng as engStopwords } from "stopword";
import { CitationCandidate } from "@/lib/services";

export function useBibliometricGraph(
  libraryRaw: any,
  minOccurrences: number,
  minLinkStrength: number,
  analysisType: "keyword" | "author" | "co-citation" | "bibliographic-coupling",
  yearFilter: "all" | "custom",
  minYear: number,
  maxYear: number,
  dictionaryStr: string = ""
) {
  return useMemo(() => {
    // Determine if libraryRaw is object map or array
    const library = Array.isArray(libraryRaw) ? libraryRaw : Object.values(libraryRaw);
    if (library.length === 0) return { nodes: [], links: [], yearCounts: {}, maxYearCount: 1 };

    // Build synonym map
    const synonymMap: Record<string, string> = {};
    if (dictionaryStr) {
      dictionaryStr.split('\n').forEach(line => {
        if (line.includes('->')) {
          const [left, right] = line.split('->').map(s => s.trim());
          if (left && right !== undefined) {
            left.split(',').forEach(word => {
              synonymMap[word.trim().toLowerCase()] = right.toLowerCase();
            });
          }
        }
      });
    }

    const stopWords = new Set([
      ...engStopwords,
      ...indStopwords,
      "salah", "satu", "utama", "penting", "bagian", "terdiri", "lain", "lainnya", "baik", "terdapat", "lebih", "paling", "tidak", "ada", "saja", "jika", "namun", "antara", "saat", "hal", "lalu", "bagi", "kita", "banyak",
      "penggunaan", "bertujuan", "meningkatkan", "meningkatan", "dilakukan", "kegiatan", "melalui", "cara", "proses", "tujuan", "sebagai", "mampu", "memberikan", "upaya", "berbagai", "dalam", "sangat", "secara", "dapat", "untuk", "memiliki", "menggunakan", "dengan", "adalah", "terkait", "bahwa", "serta"
    ]);

    const genericUnigrams = new Set([
      "sistem", "aplikasi", "rancang", "bangun", "penelitian", "studi", "analisis", 
      "pengembangan", "implementasi", "metode", "berbasis", "evaluasi", "pengaruh", 
      "penerapan", "kasus", "hasil", "suatu", "sebuah", "karena", "kualitas", "tingkat",
      "research", "study", "analysis", "method", "based", "using", "proposed", "paper", "results"
    ]);

    const entityCounts: Record<string, number> = {};
    const cooccurrences: Record<string, number> = {};
    const yearCounts: Record<string, number> = {};
    const entityYears: Record<string, number[]> = {};

    library.forEach((item: any) => {
      // Apply Year Filter
      const itemYear = item.year ? parseInt(String(item.year)) : null;
      if (yearFilter === 'custom' && itemYear) {
        if (itemYear < minYear || itemYear > maxYear) return;
      }

      // Tally years
      if (item.year) {
        yearCounts[item.year] = (yearCounts[item.year] || 0) + 1;
      }

      let docEntities: string[] = [];

      if (analysisType === 'keyword') {
        if (item.keywords && Array.isArray(item.keywords) && item.keywords.length > 0) {
          docEntities = item.keywords.map((k: any) => String(k).trim().toLowerCase()).filter((k: string) => k.length > 0);
        } else {
          const text = ((item.title || "") + " " + (item.abstract || ""));
          const extractionResult = keyword_extractor.extract(text, {
            language: "english",
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true
          });
          
          const docPhrases = new Set<string>();
          extractionResult.forEach((w: string) => {
            if (w.length >= 4 && !stopWords.has(w) && !genericUnigrams.has(w)) {
              docPhrases.add(w);
            }
          });
          
          docEntities = Array.from(docPhrases).slice(0, 15);
        }
      } else if (analysisType === 'author') {
        if (item.authors && Array.isArray(item.authors)) {
          docEntities = item.authors.map((a: any) => a.trim()).filter((a: any) => a.length > 0);
        }
      } else if (analysisType === 'co-citation') {
        if (item.references && Array.isArray(item.references)) {
          docEntities = item.references.map((r: any) => String(r).trim()).filter((r: any) => r.length > 0);
        }
      } else if (analysisType === 'bibliographic-coupling') {
        if (item.references && Array.isArray(item.references) && item.references.length > 0) {
          docEntities = item.references.map((r: any) => String(r).trim()).filter((r: any) => r.length > 0);
        } else if (item.reference_id) {
          docEntities = [String(item.reference_id).trim()];
        }
      }

      // Apply Synonym Map & Exclusion (Exclude if mapped to empty string)
      docEntities = docEntities
        .map(w => synonymMap[w.toLowerCase()] !== undefined ? synonymMap[w.toLowerCase()] : w)
        .filter(w => w !== "");

      // Unique entities per doc to avoid self-links
      if (analysisType !== 'bibliographic-coupling') {
        docEntities = Array.from(new Set(docEntities));
      }

      docEntities.forEach(w => {
        entityCounts[w] = (entityCounts[w] || 0) + 1;
        if (!entityYears[w]) entityYears[w] = [];
        if (itemYear) entityYears[w].push(itemYear);
      });

      if (analysisType === 'bibliographic-coupling') {
      }

      for (let i = 0; i < docEntities.length; i++) {
        for (let j = i + 1; j < docEntities.length; j++) {
          const w1 = docEntities[i];
          const w2 = docEntities[j];
          const pair = w1 < w2 ? `${w1}__${w2}` : `${w2}__${w1}`;
          cooccurrences[pair] = (cooccurrences[pair] || 0) + 1;
        }
      }
    });

    const validNodes = Object.entries(entityCounts)
      .filter(([_, count]) => count >= minOccurrences)
      .map(([id, val]) => {
        const years = entityYears[id] || [];
        const avgYear = years.length > 0 ? (years.reduce((a, b) => a + b, 0) / years.length) : null;
        return { id, val, avgYear, neighbors: [] as string[], links: [] as any[], group: 0 };
      });

    const validNodeIds = new Set(validNodes.map(n => n.id));

    const validLinks = Object.entries(cooccurrences)
      .filter(([pair, weight]) => {
        const [source, target] = pair.split("__");
        return validNodeIds.has(source) && validNodeIds.has(target) && weight >= minLinkStrength;
      })
      .map(([pair, weight]) => {
        const [source, target] = pair.split("__");
        return { source, target, value: weight };
      });

    validLinks.forEach(link => {
      const a = validNodes.find(n => n.id === link.source);
      const b = validNodes.find(n => n.id === link.target);
      if (a && b) {
        a.neighbors.push(b.id);
        b.neighbors.push(a.id);
        a.links.push(link);
        b.links.push(link);
      }
    });

    validNodes.forEach((node, i) => {
        node.group = i;
    });

    // Label Propagation
    for (let iter = 0; iter < 5; iter++) {
      let changed = false;
      [...validNodes].sort(() => Math.random() - 0.5).forEach(node => {
        if (node.neighbors.length === 0) return;
        const groupCounts: Record<number, number> = {};
        node.links.forEach((link: any) => {
           const neighborId = link.source === node.id ? link.target : link.source;
           const neighbor = validNodes.find(n => n.id === neighborId);
           if (neighbor) {
             groupCounts[neighbor.group] = (groupCounts[neighbor.group] || 0) + link.value;
           }
        });
        let bestGroup = node.group;
        let maxCount = -1;
        for (const [group, count] of Object.entries(groupCounts)) {
          if (count > maxCount) {
             maxCount = count;
             bestGroup = parseInt(group);
          }
        }
        if (node.group !== bestGroup) {
          node.group = bestGroup;
          changed = true;
        }
      });
      if (!changed) break;
    }

    const uniqueGroups = Array.from(new Set(validNodes.map(n => n.group)));
    validNodes.forEach(node => {
        node.group = uniqueGroups.indexOf(node.group);
    });

    // PageRank Centrality
    const pr: Record<string, number> = {};
    const d = 0.85;
    validNodes.forEach(n => { pr[n.id] = 1.0; });

    for (let iter = 0; iter < 10; iter++) {
      const nextPr: Record<string, number> = {};
      validNodes.forEach(n => {
        let sum = 0;
        n.links.forEach((link: any) => {
           const neighborId = link.source === n.id ? link.target : link.source;
           const neighbor = validNodes.find(x => x.id === neighborId);
           if (neighbor && neighbor.links.length > 0) {
             sum += (pr[neighbor.id] * link.value) / neighbor.links.reduce((acc: number, l: any) => acc + l.value, 0);
           }
        });
        nextPr[n.id] = (1 - d) + d * sum;
      });
      validNodes.forEach(n => { pr[n.id] = nextPr[n.id]; });
    }

    const maxPr = Math.max(...Object.values(pr), 0.0001);
    validNodes.forEach(n => {
      (n as any).centrality = parseFloat((pr[n.id] / maxPr).toFixed(4));
    });

    const minAvgYear = Math.min(...validNodes.map(n => n.avgYear || 2050).filter(y => y !== 2050));
    const maxAvgYear = Math.max(...validNodes.map(n => n.avgYear || 0));
    const maxYearCount = Object.keys(yearCounts).length > 0 ? Math.max(...Object.values(yearCounts)) : 1;

    return { 
      nodes: validNodes, 
      links: validLinks, 
      yearCounts, 
      maxYearCount,
      minAvgYear,
      maxAvgYear
    };
  }, [libraryRaw, minOccurrences, minLinkStrength, analysisType, yearFilter, minYear, maxYear, dictionaryStr]);
}
