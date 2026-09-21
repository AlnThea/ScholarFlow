import re

with open('app/dashboard/bibliometric/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Create hook
start_marker = "  const graphData = useMemo(() => {\n"
end_marker = "  }, [library, minOccurrences, minLinkStrength, analysisType, yearFilter, minYear, maxYear]);\n"

start_idx = code.find(start_marker)
end_idx = code.find(end_marker) + len(end_marker)

hook_body = code[start_idx:end_idx]

# 2. Update page.tsx to use hook
code = code.replace(hook_body, "  const graphData = useBibliometricGraph(library, minOccurrences, minLinkStrength, analysisType, yearFilter, minYear, maxYear);\n")

# 3. Create NodeDetailPanel component
panel_start = "                 {/* Node Detail Panel */}"
panel_end_marker = "                 <ForceGraph2D"

p_start_idx = code.find(panel_start)
p_end_idx = code.find(panel_end_marker)

panel_body = code[p_start_idx:p_end_idx]


# 4. Update page.tsx to use NodeDetailPanel
code = code[:p_start_idx] + "                 <NodeDetailPanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />\n\n" + code[p_end_idx:]

# 5. Extract Sidebar
sidebar_start = "          {/* Settings Sidebar Panel */}"
sidebar_end_marker = "          {/* Graph Area */}"

s_start_idx = code.find(sidebar_start)
s_end_idx = code.find(sidebar_end_marker)

code = code[:s_start_idx] + """          <NetworkSettingsSidebar 
            yearFilter={yearFilter} setYearFilter={setYearFilter}
            minYear={minYear} setMinYear={setMinYear}
            maxYear={maxYear} setMaxYear={setMaxYear}
            analysisType={analysisType} setAnalysisType={setAnalysisType}
            minOccurrences={minOccurrences} setMinOccurrences={setMinOccurrences}
            minLinkStrength={minLinkStrength} setMinLinkStrength={setMinLinkStrength}
            graphData={graphData} setSelectedYear={setSelectedYear}
          />
""" + code[s_end_idx:]

# 6. Add imports
import_insert_pos = code.find("import { useDataService")
import_str = 'import { useBibliometricGraph } from "@/hooks/use-bibliometric-graph";\nimport { NodeDetailPanel } from "@/components/dashboard/bibliometric/node-detail-panel";\nimport { NetworkSettingsSidebar } from "@/components/dashboard/bibliometric/network-settings-sidebar";\n'
code = code[:import_insert_pos] + import_str + code[import_insert_pos:]

with open('app/dashboard/bibliometric/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

