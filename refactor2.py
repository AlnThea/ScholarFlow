import re

with open('app/dashboard/bibliometric/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

sidebar_start = "          {/* Settings Sidebar Panel */}"
sidebar_end_marker = "          {/* Graph Area */}"

p_start_idx = code.find(sidebar_start)
p_end_idx = code.find(sidebar_end_marker)

sidebar_body = code[p_start_idx:p_end_idx]

sidebar_code = f'''import React from "react";
import {{ IconSettings, IconTags, IconUsers, IconFilter, IconCalendarEvent }} from "@tabler/icons-react";

interface NetworkSettingsSidebarProps {{
  yearFilter: 'all' | 'custom';
  setYearFilter: (v: 'all' | 'custom') => void;
  minYear: number;
  setMinYear: (v: number) => void;
  maxYear: number;
  setMaxYear: (v: number) => void;
  analysisType: 'keyword' | 'author';
  setAnalysisType: (v: 'keyword' | 'author') => void;
  minOccurrences: number;
  setMinOccurrences: (v: number) => void;
  minLinkStrength: number;
  setMinLinkStrength: (v: number) => void;
  graphData: any;
  setSelectedYear: (y: string) => void;
}}

export function NetworkSettingsSidebar({{
  yearFilter, setYearFilter, minYear, setMinYear, maxYear, setMaxYear,
  analysisType, setAnalysisType, minOccurrences, setMinOccurrences,
  minLinkStrength, setMinLinkStrength, graphData, setSelectedYear
}}: NetworkSettingsSidebarProps) {{
  return (
    <>
{sidebar_body}
    </>
  );
}}
'''

with open('components/dashboard/bibliometric/network-settings-sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(sidebar_code)

code = code[:p_start_idx] + """          <NetworkSettingsSidebar 
            yearFilter={yearFilter} setYearFilter={setYearFilter}
            minYear={minYear} setMinYear={setMinYear}
            maxYear={maxYear} setMaxYear={setMaxYear}
            analysisType={analysisType} setAnalysisType={setAnalysisType}
            minOccurrences={minOccurrences} setMinOccurrences={setMinOccurrences}
            minLinkStrength={minLinkStrength} setMinLinkStrength={setMinLinkStrength}
            graphData={graphData} setSelectedYear={setSelectedYear}
          />
""" + code[p_end_idx:]

import_insert_pos = code.find("import { NodeDetailPanel")
import_str = 'import { NetworkSettingsSidebar } from "@/components/dashboard/bibliometric/network-settings-sidebar";\\n'
code = code[:import_insert_pos] + import_str + code[import_insert_pos:]

with open('app/dashboard/bibliometric/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

