
const fs = require("fs");
const path = "app/dashboard/library/page.tsx";
let content = fs.readFileSync(path, "utf8");

if (!content.includes("MinimalSidebar")) {
  content = content.replace(
    "import { parseRISContent } from \"@/lib/utils/ris-parser\";",
    "import { parseRISContent } from \"@/lib/utils/ris-parser\";\nimport { MinimalSidebar } from \"@/components/editor/minimal-sidebar\";"
  );
}

if (!content.includes("sidebarExpanded")) {
  content = content.replace(
    "const [isLoading, setIsLoading] = useState(true);",
    "const [isLoading, setIsLoading] = useState(true);\n  const [sidebarExpanded, setSidebarExpanded] = useState(true);"
  );
}

const oldReturn = `<div className="flex flex-col w-full h-full p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">`;
const newReturn = `<div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <MinimalSidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        documents={[]}
        currentDocumentId={null}
        activeDashboardTab="library"
      />
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col w-full p-8 min-h-full">`;

if (content.includes(oldReturn)) {
  content = content.replace(oldReturn, newReturn);
  // Now add the two closing divs at the very end
  content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*$/, "</div>\n        </div>\n      </div>\n    </div>\n");
} else {
  console.log("Could not find the original wrapper div!");
}

fs.writeFileSync(path, content, "utf8");
console.log("Library page layout updated.");

