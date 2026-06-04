import fs from "node:fs";
import path from "node:path";

// Read a legal document's markdown from content/legal/<slug>.md (build time).
// The .md files are the canonical, fully-written legal texts (no placeholders).
export function readLegal(slug) {
  return fs.readFileSync(path.join(process.cwd(), "content", "legal", `${slug}.md`), "utf8");
}
