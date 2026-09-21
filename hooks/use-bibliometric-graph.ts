import { useMemo } from "react";
import { CitationCandidate } from "@/lib/services";

export function useBibliometricGraph(
  library: CitationCandidate[],
  minOccurrences: number,
  minLinkStrength: number,
  analysisType: "keyword" | "author",
  yearFilter: "all" | "custom",
  minYear: number,
  maxYear: number
) {
  return useMemo(() => {
    if (library.length === 0) return { nodes: [], links: [], yearCounts: {}, maxYearCount: 1 };

    const stopWords = new Set([
      "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
      "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were", "will", "with", "this", "we", "which", "their",
      "dan", "di", "yang", "untuk", "dengan", "itu", "ini", "dalam", "pada", "dari", "ke",
      "sebagai", "adalah", "oleh", "atau", "telah", "bisa", "dapat", "akan", "juga", "terhadap", "menggunakan"
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

    library.forEach((item) => {
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
        const text = `${item.title} ${item.abstract || ""}`.toLowerCase().replace(/[^\w\s-]/g, " ");
        const rawWords = text.split(/\s+/).filter(w => w.length > 0);
        const docPhrases = new Set<string>();

        for (let i = 0; i < rawWords.length; i++) {
          const w1 = rawWords[i];
          let formedPhrase = false;
          
          if (i < rawWords.length - 1) {
            const w2 = rawWords[i + 1];
            if (!stopWords.has(w1) && !stopWords.has(w2) && w1.length > 2 && w2.length > 2) {
              docPhrases.add(`${w1} ${w2}`);
              formedPhrase = true;
              i++;
            }
          }
          
          if (!formedPhrase && !stopWords.has(w1) && w1.length >= 4) {
            if (!genericUnigrams.has(w1)) {
              docPhrases.add(w1);
            }
          }
        }
        // Limit per doc to prevent massive hubs
        docEntities = Array.from(docPhrases).slice(0, 15);
      } else if (analysisType === 'author') {
        if (item.authors && item.authors.length > 0) {
          // Normalize author names
          docEntities = item.authors.map(a => a.trim()).filter(a => a.length > 0);
        }
      }

      docEntities.forEach(w => {
        entityCounts[w] = (entityCounts[w] || 0) + 1;
      });

      for (let i = 0; i < docEntities.length; i++) {
        for (let j = i + 1; j < docEntities.length; j++) {
          const w1 = docEntities[i];
          const w2 = docEntities[j];
          const pair = w1 < w2 ? `${w1}__${w2}` : `${w2}__${w1}`;
          cooccurrences[pair] = (cooccurrences[pair] || 0) + 1;
        }
      }
    });

    // Apply Thresholds
    const validNodes = Object.entries(entityCounts)
      .filter(([_, count]) => count >= minOccurrences)
      .map(([id, val]) => ({ id, val, neighbors: [] as string[], links: [] as any[], group: 0 }));

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

    // Cross-link nodes for highlighting logic and simple clustering simulation
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

    // Assign simple communities (groups) based on strongest links
    // Run Label Propagation Algorithm for Clustering
    validNodes.forEach((node, i) => {
        node.group = i; // Initial group is their own index
    });

    for (let iter = 0; iter < 5; iter++) {
        let changed = false;
        // Deterministic shuffle for consistency between renders if data doesn't change
        const shuffledNodes = [...validNodes].sort((a, b) => a.id.localeCompare(b.id));
        
        shuffledNodes.forEach(node => {
            if (node.links.length === 0) return;
            
            const groupWeights: Record<number, number> = {};
            node.links.forEach((link: any) => {
                const neighborId = link.source === node.id ? link.target : link.source;
                const neighbor = validNodes.find(n => n.id === neighborId);
                if (neighbor) {
                    groupWeights[neighbor.group] = (groupWeights[neighbor.group] || 0) + link.value;
                }
            });
            
            if (Object.keys(groupWeights).length > 0) {
                let maxGroup = node.group;
                let maxWeight = -1;
                for (const [gStr, w] of Object.entries(groupWeights)) {
                    const g = parseInt(gStr);
                    if (w > maxWeight) {
                        maxWeight = w;
                        maxGroup = g;
                    }
                }
                
                if (node.group !== maxGroup) {
                    node.group = maxGroup;
                    changed = true;
                }
            }
        });
        if (!changed) break;
    }
    
    // re-index groups to be 0,1,2... to map cleanly to colors
    const uniqueGroups = Array.from(new Set(validNodes.map(n => n.group)));
    validNodes.forEach(node => {
        node.group = uniqueGroups.indexOf(node.group);
    });
    
    const maxYearCount = Object.keys(yearCounts).length > 0 ? Math.max(...Object.values(yearCounts)) : 1;

    return { nodes: validNodes, links: validLinks, yearCounts, maxYearCount };
  }, [library, minOccurrences, minLinkStrength, analysisType, yearFilter, minYear, maxYear]);

}
