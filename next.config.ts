import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  reactStrictMode: true,
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: "/FreeTheBeach",
        assetPrefix: "/FreeTheBeach/",
        trailingSlash: true,
        images: {
          unoptimized: true
        }
      }
    : {})
};

export default nextConfig;
