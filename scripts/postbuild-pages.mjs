import { constants } from "node:fs";
import { copyFile, access, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "out");
const rootIndexPath = path.join(outDir, "index.html");
const root404Path = path.join(outDir, "404.html");
const basePathIndexPath = path.join(outDir, "BuddySQLServer", "index.html");
const basePath404Path = path.join(outDir, "BuddySQLServer", "404.html");

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const hasRootIndex = await fileExists(rootIndexPath);
  const hasBasePathIndex = await fileExists(basePathIndexPath);

  if (!hasRootIndex && !hasBasePathIndex) {
    throw new Error(
      "No static index.html was found in out/ after build. Cannot create 404 fallback.",
    );
  }

  if (hasRootIndex) {
    await copyFile(rootIndexPath, root404Path);
  }

  if (hasBasePathIndex) {
    await copyFile(basePathIndexPath, basePath404Path);
    if (!hasRootIndex) {
      await copyFile(basePathIndexPath, root404Path);
    }
  }

  await writeFile(path.join(outDir, ".nojekyll"), "");

  console.log("Created GitHub Pages fallback files in out/");
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
