import { existsSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");
const apiDir = join(projectRoot, "app", "api");
const hiddenApiDir = join(projectRoot, "app", "_api.github-pages-build");

if (existsSync(hiddenApiDir)) {
  renameSync(hiddenApiDir, apiDir);
}

let exitStatus = 0;

try {
  if (existsSync(apiDir)) {
    renameSync(apiDir, hiddenApiDir);
  }

  const result = spawnSync("next", ["build"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? "/FreeTheBeach"
    },
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    exitStatus = result.status ?? 1;
  }
} finally {
  if (existsSync(hiddenApiDir)) {
    renameSync(hiddenApiDir, apiDir);
  }
}

if (exitStatus !== 0) {
  process.exit(exitStatus);
}
