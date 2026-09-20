
const fs = require("fs");
const path = "app/dashboard/library/page.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace("</ReferenceModal>\n    </div>\n  );\n}", "</ReferenceModal>\n        </div>\n      </div>\n    </div>\n  );\n}");
fs.writeFileSync(path, content, "utf8");
console.log("Fixed closing tags");

