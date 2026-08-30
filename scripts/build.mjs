import * as esbuild from "esbuild";
import { mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
mkdirSync("release", { recursive: true });

const shared = {
  bundle: true,
  sourcemap: true,
  target: ["es2018"],
  logLevel: "info",
};

await esbuild.build({
  ...shared,
  entryPoints: ["src/index.ts"],
  outfile: "dist/cxmodal.esm.js",
  format: "esm",
  platform: "browser",
});

await esbuild.build({
  ...shared,
  entryPoints: ["src/index.ts"],
  outfile: "dist/cxmodal.cjs",
  format: "cjs",
  platform: "browser",
});

await esbuild.build({
  ...shared,
  entryPoints: ["src/legacy-entry.ts"],
  outfile: "dist/legacy.iife.js",
  format: "iife",
  platform: "browser",
  globalName: "CXModalLegacy",
});

await esbuild.build({
  ...shared,
  entryPoints: ["src/legacy-entry.ts"],
  outfile: "release/cxmodal.min.js",
  format: "iife",
  platform: "browser",
  minify: true,
  sourcemap: true,
  globalName: "CXModalLegacy",
});

console.log("Build complete.");
