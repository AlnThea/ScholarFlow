import re

with open('app/dashboard/bibliometric/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Create hook
start_marker = "  const graphData = useMemo(() => {\n"
end_marker = "  }, [library, minOccurrences, minLinkStrength, analysisType, yearFilter, minYear, maxYear]);\n"

start_idx = code.find(start_marker)
end_idx = code.find(end_marker) + len(end_marker)

hook_body = code[start_idx:end_idx]

hook_code = f'''import {{ useMemo }} from "react";
import {{ CitationCandidate }} from "@/lib/services";

export function useBibliometricGraph(
  library: CitationCandidate[],
  minOccurrences: number,
  minLinkStrength: number,
  analysisType: "keyword" | "author",
  yearFilter: "all" | "custom",
  minYear: number,
  maxYear: number
) {{
{hook_body.replace("  const graphData = useMemo(() => {", "  return useMemo(() => {")}
}}
'''

with open('hooks/use-bibliometric-graph.ts', 'w', encoding='utf-8') as f:
    f.write(hook_code)

# 2. Update page.tsx to use hook
code = code.replace(hook_body, "  const graphData = useBibliometricGraph(library, minOccurrences, minLinkStrength, analysisType, yearFilter, minYear, maxYear);\n")

# 3. Create NodeDetailPanel component
panel_start = "                 {/* Node Detail Panel */}"
panel_end_marker = "                 <ForceGraph2D"

p_start_idx = code.find(panel_start)
p_end_idx = code.find(panel_end_marker)

panel_body = code[p_start_idx:p_end_idx]

panel_code = f'''import React from "react";
import {{ IconTags }} from "@tabler/icons-react";

interface NodeDetailPanelProps {{
  selectedNode: any;
  onClose: () => void;
}}

const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#94a3b8"];

export function NodeDetailPanel({{ selectedNode, onClose }}: NodeDetailPanelProps) {{
  if (!selectedNode) return null;
  return (
    <>
{panel_body}
    </>
  );
}}
'''

panel_code = panel_code.replace("setSelectedNode(null)", "onClose()")
panel_code = panel_code.replace("{selectedNode && (", "")
last_bracket = panel_code.rfind(")}")
if last_bracket != -1:
    panel_code = panel_code[:last_bracket] + panel_code[last_bracket+2:]

with open('components/dashboard/bibliometric/node-detail-panel.tsx', 'w', encoding='utf-8') as f:
    f.write(panel_code)

# 4. Update page.tsx to use NodeDetailPanel
code = code[:p_start_idx] + "                 <NodeDetailPanel selectedNode={{selectedNode}} onClose={{() => setSelectedNode(null)}} />\\n\\n" + code[p_end_idx:]

# 5. Add imports
import_insert_pos = code.find("import { useDataService")
import_str = 'import { useBibliometricGraph } from "@/hooks/use-bibliometric-graph";\\nimport { NodeDetailPanel } from "@/components/dashboard/bibliometric/node-detail-panel";\\n'
code = code[:import_insert_pos] + import_str + code[import_insert_pos:]

with open('app/dashboard/bibliometric/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

