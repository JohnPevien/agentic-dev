#!/usr/bin/env node
/**
 * agentic-dev copier — file-only, project-local, variant-aware
 *
 * Copies `variants/_shared` + `variants/<variant>` into <target>.
 * - Missing → COPY
 * - Same → SKIP
 * - AGENTS.md / CLAUDE.md differs → MERGE with tag <!-- agentic-dev:<variant>:start --> ... <!-- agentic-dev:end --> (idempotent)
 * - Other differs → WARN + skip unless --force (then OVERWRITE)
 * - --dry-run lists without writing
 * - Never writes outside <target>, never touches ~ / ~/.claude / ~/.config / ~/.agents
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

function usageAndExit(code = 1) {
  console.error(`Usage: node scripts/copy.mjs --variant=<web|expo> <target-dir> [options]

Options:
  --variant=<name>       Required. Variant folder under variants/ (e.g. web, expo)
  --agent-config=<mode>  Which agent-tool config to install (default: both)
                         opencode  -> .opencode/ only (agents, commands, skills, config)
                         omp       -> .omp/ only (agents, commands, skills, config.yml)
                         both      -> both trees
  --force                Overwrite non-merge files that differ (default: skip + WARN)
  --dry-run              Print what would happen, write nothing
  --help, -h             Show this help

Examples:
  node scripts/copy.mjs --variant=web /path/to/my-new-web-project
  node scripts/copy.mjs --variant=web /tmp/my-project --agent-config=omp
  node scripts/copy.mjs --variant=expo /tmp/test-expo --dry-run
  node scripts/copy.mjs --variant=web /tmp/test-web --force
`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { variant: null, target: null, agentConfig: "both", force: false, dryRun: false, help: false };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") args.force = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--help" || a === "-h") args.help = true;
    else if (a.startsWith("--variant=")) args.variant = a.slice("--variant=".length);
    else if (a === "--variant" && argv[i + 1]) args.variant = argv[++i];
    else if (a.startsWith("--agent-config=")) args.agentConfig = a.slice("--agent-config=".length);
    else if (a === "--agent-config" && argv[i + 1]) args.agentConfig = argv[++i];
    else if (a.startsWith("--")) {
      console.error(`Unknown option: ${a}`);
      usageAndExit(1);
    } else positional.push(a);
  }
  if (!["opencode", "omp", "both"].includes(args.agentConfig)) {
    console.error(`Invalid --agent-config: ${args.agentConfig} (expected opencode, omp, or both)`);
    usageAndExit(1);
  }
  if (positional.length > 0) args.target = positional[0];
  if (positional.length > 1) {
    console.error(`Too many positional args: ${positional.slice(1).join(" ")}`);
    usageAndExit(1);
  }
  return args;
}

function assertNotGlobalPath(p) {
  const resolved = path.resolve(p);
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const forbidden = new Set(
    [
      home,
      path.join(home, ".claude"),
      path.join(home, ".config"),
      path.join(home, ".agents"),
      path.join(home, ".gitconfig"),
      path.join(home, ".gitconfig-personal"),
      "/",
      "/tmp",
    ].filter(Boolean)
  );
  // Also forbid any parent of agentic-dev's own config? No — target can be inside ~/git-repositories but not this repo itself? Allow, but warn if target === REPO_ROOT
  if (forbidden.has(resolved)) {
    console.error(`Refusing to write to global/forbidden path: ${resolved}`);
    console.error(`This copier is project-local — it only writes inside the target project dir you pass.`);
    process.exit(2);
  }
  // Also reject if target resolves to home subpath that is exactly .claude or .config etc.
  for (const f of forbidden) {
    if (resolved === f) {
      console.error(`Refusing forbidden path: ${resolved}`);
      process.exit(2);
    }
  }
  // Reject if target is empty
  if (!resolved || resolved === ".") {
    console.error(`Invalid target: ${p}`);
    process.exit(2);
  }
}

function walkFiles(dir, base = dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(base, full);
    if (e.isDirectory()) {
      out.push(...walkFiles(full, base));
    } else if (e.isFile()) {
      out.push({ full, rel });
    }
  }
  return out;
}

function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readTextOrNull(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function filesEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return a === b;
}

/**
 * When a single agent-tool config is installed (--agent-config=opencode|omp),
 * strip references to the other tree from merge content (AGENTS.md/CLAUDE.md).
 * Deterministic line-level rewrite; safe to run when the other tree is absent.
 */
function adaptMergeContent(content, agentConfig) {
  if (!content || agentConfig === "both") return content;
  const drop = agentConfig === "omp" ? ".opencode" : ".omp";
  const lines = content.split("\n");
  return lines
    .filter((l) => !l.includes(drop))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

function buildMergeBlock(variant, rel, sharedContent, variantContent) {  const parts = [];
  const sources = [];
  if (sharedContent != null) {
    parts.push(sharedContent.trimEnd());
    sources.push(`agentic-dev/variants/_shared/${rel}`);
  }
  if (variantContent != null) {
    parts.push(variantContent.trimEnd());
    sources.push(`agentic-dev/variants/${variant}/${rel}`);
  }
  const body = parts.join("\n\n---\n\n");
  const sourceLine = `<!-- source: ${sources.join(" + ")} -->`;
  const start = `<!-- agentic-dev:${variant}:start -->`;
  const end = `<!-- agentic-dev:end -->`;
  return `${start}\n${sourceLine}\n${body}\n${end}`;
}

function mergeIntoTarget(existing, variant, rel, block) {
  const start = `<!-- agentic-dev:${variant}:start -->`;
  const end = `<!-- agentic-dev:end -->`;
  const startEsc = start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const endEsc = end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${startEsc}[\\s\\S]*?${endEsc}`, "m");
  if (existing != null && re.test(existing)) {
    // replace existing block
    const next = existing.replace(re, block);
    // if unchanged, skip
    if (next === existing) return { next, changed: false, mode: "SKIP" };
    return { next, changed: true, mode: "MERGE" };
  }
  // append
  const sep = existing == null || existing === "" ? "" : existing.endsWith("\n") ? "\n" : "\n\n";
  const prefix = existing == null ? "" : existing;
  const next = `${prefix}${sep}${block}\n`;
  // if existing was null, this is COPY (new file) but we report as MERGE/COPY
  const mode = existing == null ? "COPY" : "MERGE";
  return { next, changed: true, mode };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) usageAndExit(0);
  if (!args.variant) {
    console.error("Missing --variant=<name>");
    usageAndExit(1);
  }
  if (!args.target) {
    console.error("Missing <target-dir>");
    usageAndExit(1);
  }

  const variant = args.variant;
  const targetDir = path.resolve(args.target);
  assertNotGlobalPath(targetDir);

  const sharedDir = path.join(REPO_ROOT, "variants", "_shared");
  const variantDir = path.join(REPO_ROOT, "variants", variant);

  if (!fs.existsSync(sharedDir)) {
    console.error(`Missing shared dir: ${sharedDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(variantDir)) {
    console.error(`Variant not found: ${variantDir}`);
    console.error(`Available: ${fs.readdirSync(path.join(REPO_ROOT, "variants")).join(", ")}`);
    process.exit(1);
  }

  // Collect merge files specially
  const MERGE_RELS = new Set(["AGENTS.md", "CLAUDE.md"]);
  // Read shared + variant content for merge rels
  const mergeSources = {};
  for (const rel of MERGE_RELS) {
    const sharedFile = path.join(sharedDir, rel);
    const variantFile = path.join(variantDir, rel);
    const sharedContent = fs.existsSync(sharedFile) ? fs.readFileSync(sharedFile, "utf8") : null;
    const variantContent = fs.existsSync(variantFile) ? fs.readFileSync(variantFile, "utf8") : null;
    if (sharedContent != null || variantContent != null) {
      mergeSources[rel] = { sharedContent, variantContent };
    }
  }

  // Walk other files (non-merge)
  const sharedFiles = walkFiles(sharedDir, sharedDir).filter((f) => !MERGE_RELS.has(f.rel));
  const variantFiles = walkFiles(variantDir, variantDir).filter((f) => !MERGE_RELS.has(f.rel));

  // Filter agent-tool config trees by --agent-config (default: both)
  const skipAgentDirs =
    args.agentConfig === "opencode" ? [".omp"] : args.agentConfig === "omp" ? [".opencode"] : [];
  const agentConfigFilter = (f) =>
    !skipAgentDirs.some((d) => f.rel === d || f.rel.startsWith(d + "/"));
  for (const list of [sharedFiles, variantFiles]) {
    for (let i = list.length - 1; i >= 0; i--) {
      if (!agentConfigFilter(list[i])) list.splice(i, 1);
    }
  }

  // Build file map: rel -> { full, isVariant }
  const fileMap = new Map();
  for (const f of sharedFiles) fileMap.set(f.rel, { full: f.full, isVariant: false });
  for (const f of variantFiles) fileMap.set(f.rel, { full: f.full, isVariant: true }); // variant wins

  let counts = { copy: 0, skip: 0, merge: 0, warn: 0, overwrite: 0 };

  const log = (level, rel, msg = "") => {
    const prefix = level.padEnd(9);
    console.log(`${prefix} ${rel}${msg ? " " + msg : ""}`);
  };

  console.log(`agentic-dev copy — variant=${variant} → ${targetDir}${args.dryRun ? " (dry-run)" : ""}${args.force ? " --force" : ""}`);
  console.log(`shared: ${sharedDir}`);
  console.log(`variant: ${variantDir}`);
  console.log("");

  // Handle merge files first
  for (const rel of MERGE_RELS) {
    const src = mergeSources[rel];
    if (!src) continue;
    const block = adaptMergeContent(
      buildMergeBlock(variant, rel, src.sharedContent, src.variantContent),
      args.agentConfig
    );
    const targetFile = path.join(targetDir, rel);
    const existing = readTextOrNull(targetFile);
    const { next, changed, mode } = mergeIntoTarget(existing, variant, rel, block);
    if (!changed) {
      log("SKIP", rel, "(identical block)");
      counts.skip++;
      continue;
    }
    if (mode === "COPY") {
      log("COPY", rel, "(new merge block)");
      counts.copy++;
    } else {
      log(mode, rel, existing == null ? "(new)" : "(merge/patch)");
      if (mode === "MERGE") counts.merge++;
    }
    if (!args.dryRun) {
      ensureDirFor(targetFile);
      fs.writeFileSync(targetFile, next, "utf8");
    }
  }

  // Handle regular files
  for (const [rel, { full }] of fileMap) {
    const targetFile = path.join(targetDir, rel);
    const srcContent = fs.readFileSync(full); // binary-safe
    const srcText = srcContent.toString("utf8");
    const exists = fs.existsSync(targetFile);
    if (!exists) {
      log("COPY", rel);
      counts.copy++;
      if (!args.dryRun) {
        ensureDirFor(targetFile);
        fs.writeFileSync(targetFile, srcContent);
      }
      continue;
    }
    const existingBuf = fs.readFileSync(targetFile);
    if (existingBuf.equals(srcContent)) {
      log("SKIP", rel, "(identical)");
      counts.skip++;
      continue;
    }
    // differs
    if (args.force) {
      log("OVERWRITE", rel, "(--force)");
      counts.overwrite++;
      if (!args.dryRun) fs.writeFileSync(targetFile, srcContent);
    } else {
      log("WARN", rel, "(exists, differs — skip; use --force to overwrite)");
      counts.warn++;
    }
  }

  console.log("");
  console.log(`Done. COPY=${counts.copy} MERGE=${counts.merge} SKIP=${counts.skip} WARN=${counts.warn} OVERWRITE=${counts.overwrite}`);
  if (counts.warn > 0 && !args.force) {
    console.log(`Tip: re-run with --force to overwrite WARN files, or --dry-run to preview.`);
  }
  // For AGENTS.md/CLAUDE.md, idempotency check hint
  if (!args.dryRun) {
    console.log(`Verify idempotency: re-run same command; AGENTS.md should still have one <!-- agentic-dev:${variant}:start --> block.`);
  }
}

main();
