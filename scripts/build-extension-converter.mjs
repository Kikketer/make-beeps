import { context } from "esbuild";

const isWatch = process.argv.includes("--watch");

/**
 * Bundle the extension's converter.js from the TS source to avoid drift.
 */
async function main() {
  const ctx = await context({
    entryPoints: ["extension/converter-entry.ts"],
    outfile: "extension/converter.js",
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["chrome114"],
    sourcemap: true,
    legalComments: "none",
    logLevel: "info",
  });

  if (isWatch) {
    await ctx.watch();
    return;
  }

  await ctx.rebuild();
  await ctx.dispose();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
