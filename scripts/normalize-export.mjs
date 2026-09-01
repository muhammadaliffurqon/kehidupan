import { readdirSync, mkdirSync, copyFileSync, existsSync } from "fs";
import { join } from "path";

const outDir = join(process.cwd(), "out");

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith(".html") && entry.name !== "index.html" && entry.name !== "404.html" && entry.name !== "_not-found.html") {
      const baseName = entry.name.slice(0, -5);
      const routeDir = join(dir, baseName);
      if (!existsSync(routeDir)) {
        mkdirSync(routeDir, { recursive: true });
      }
      copyFileSync(full, join(routeDir, "index.html"));
      console.log(`  ${full.replace(outDir, "")} -> ${join(routeDir, "index.html").replace(outDir, "")}`);
    }
  }
}

console.log("Normalizing static export for GitHub Pages...");
walk(outDir);
console.log("Selesai.");
