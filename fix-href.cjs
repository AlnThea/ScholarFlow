
const fs = require("fs");
const path = "app/dashboard/page.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace("href=\"/library\"", "href=\"/dashboard/library\"");
content = content.replace("href=\"/analytics\"", "href=\"/dashboard/bibliometric\"");

fs.writeFileSync(path, content, "utf8");
console.log("Fixed quick links in dashboard.");

