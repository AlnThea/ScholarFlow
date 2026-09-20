
const fs = require("fs");
const path = "components/editor/sidebar/sidebar-main-view.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  "onClick={() => setActiveView(\"library\")}",
  "onClick={() => { onSelectDocument?.(\"\"); router.push(\"/dashboard/library\"); }}"
);

content = content.replace(
  "className=\"flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left text-slate-650 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-all duration-200 group\"",
  "className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-all duration-200 group cursor-pointer ${!currentDocumentId && activeDashboardTab === \"library\" ? \"text-indigo-700 bg-indigo-50/70 font-semibold\" : \"text-slate-650 hover:bg-slate-100/80 hover:text-slate-900\"}`}"
);

content = content.replace(
  "<IconBook className=\"h-[18px] w-[18px] mt-0.5 text-slate-400 flex-shrink-0 transition-transform duration-200 group-hover:scale-105\" />",
  "<IconBook className={`h-[18px] w-[18px] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${!currentDocumentId && activeDashboardTab === \"library\" ? \"text-indigo-600\" : \"text-slate-400\"}`} />"
);

content = content.replace(
  "onClick={() => setActiveView(\"library\")}",
  "onClick={() => { onSelectDocument?.(\"\"); router.push(\"/dashboard/library\"); }}"
);

fs.writeFileSync(path, content, "utf8");
console.log("Library link updated.");

