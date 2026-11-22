import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // this app lives in a subfolder of the repo: without an explicit root Turbopack climbs to the repo root
  // and picks up its leftover postcss.config.mjs (Tailwind, not installed here) — the Vercel build failed on that
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  distDir: process.env.NEXT_DIST_DIR || '.next',   // lets a verification build run without touching a running dev server
  async headers() {
    return [{ source: '/img/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] }];
  },
};
export default nextConfig;
