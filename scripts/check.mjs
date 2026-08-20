#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

function runCopy(variant, target, extra = []) {
  const res = spawnSync("node", [path.join(REPO_ROOT, "scripts/copy.mjs"), `--variant=${variant}`, target, ...extra], {
    encoding: "utf8",
  });
  return res;
}

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
}

const tmpBase = fs.mkdtempSync(path.join("/tmp", "agentic-dev-check-"));
console.log(`tmp: ${tmpBase}`);

try {
  // 1. syntax check
  const chk = spawnSync("node", ["--check", path.join(REPO_ROOT, "scripts/copy.mjs")], { encoding: "utf8" });
  assert(chk.status === 0, `node --check failed: ${chk.stderr}`);
  console.log("PASS syntax check");

  // 2. dry-run web
  const dryWeb = runCopy("web", path.join(tmpBase, "dry-web"), ["--dry-run"]);
  assert(dryWeb.status === 0, `dry-run web failed: ${dryWeb.stderr}`);
  assert(dryWeb.stdout.includes("COPY") || dryWeb.stdout.includes("MERGE"), "dry-run should list COPY/MERGE");
  assert(!fs.existsSync(path.join(tmpBase, "dry-web", "AGENTS.md")), "dry-run must not write");
  console.log("PASS dry-run web");

  // 3. real copy web
  const realWeb = runCopy("web", path.join(tmpBase, "web1"));
  assert(realWeb.status === 0, `real copy web failed: ${realWeb.stderr}\n${realWeb.stdout}`);
  const agentsWeb = fs.readFileSync(path.join(tmpBase, "web1", "AGENTS.md"), "utf8");
  assert(agentsWeb.includes("<!-- agentic-dev:web:start -->"), "AGENTS.md missing web start tag");
  assert(agentsWeb.includes("<!-- agentic-dev:end -->"), "AGENTS.md missing end tag");
  assert(agentsWeb.includes("_shared/AGENTS.md") && agentsWeb.includes("variants/web/AGENTS.md"), "source line missing");
  const countWebStart = (agentsWeb.match(/agentic-dev:web:start/g) || []).length;
  assert(countWebStart === 1, `expected 1 web start tag, got ${countWebStart}`);
  // .agentic-dev/ structure installed
  assert(fs.existsSync(path.join(tmpBase, "web1", ".agentic-dev/orchestration.md")), "orchestration.md missing");
  assert(fs.existsSync(path.join(tmpBase, "web1", ".agentic-dev/constraints.md")), "constraints.md missing");
  assert(fs.existsSync(path.join(tmpBase, "web1", ".agentic-dev/roles/planner.md")), "planner role missing");
  assert(fs.existsSync(path.join(tmpBase, "web1", ".agentic-dev/roles/reviewer.md")), "reviewer role missing");
  assert(fs.existsSync(path.join(tmpBase, "web1", ".agentic-dev/roles/debugger.md")), "debugger role missing");
  assert(fs.existsSync(path.join(tmpBase, "web1", ".agentic-dev/roles/test-author.md")), "test-author role missing");
  assert(fs.existsSync(path.join(tmpBase, "web1", ".agentic-dev/roles/implementer.md")), "implementer role missing");
  assert(fs.existsSync(path.join(tmpBase, "web1", ".agentic-dev/roles/verifier.md")), "verifier role missing");
  assert(fs.existsSync(path.join(tmpBase, "web1", ".agentic-dev/reference/quality-gates.md")), "quality-gates reference missing");
  assert(fs.existsSync(path.join(tmpBase, "web1", ".agentic-dev/reference/architecture.md")), "architecture reference missing (web override)");
  // .gitignore merged with .agentic-dev/run/
  const gitignoreWeb = fs.readFileSync(path.join(tmpBase, "web1", ".gitignore"), "utf8");
  assert(gitignoreWeb.includes(".agentic-dev/run/"), ".gitignore missing .agentic-dev/run/");
  assert(gitignoreWeb.includes("agentic-dev:web:start"), ".gitignore missing merge tag");
  // no old trees
  assert(!fs.existsSync(path.join(tmpBase, "web1", ".opencode")), ".opencode/ should not exist");
  assert(!fs.existsSync(path.join(tmpBase, "web1", ".omp")), ".omp/ should not exist");
  console.log("PASS real copy web");

  // 4. idempotency
  const rerun = runCopy("web", path.join(tmpBase, "web1"));
  assert(rerun.status === 0, `rerun failed: ${rerun.stderr}`);
  const agentsWeb2 = fs.readFileSync(path.join(tmpBase, "web1", "AGENTS.md"), "utf8");
  const count2 = (agentsWeb2.match(/agentic-dev:web:start/g) || []).length;
  assert(count2 === 1, `idempotency: expected 1, got ${count2}`);
  assert(agentsWeb === agentsWeb2, "idempotency: content changed on rerun");
  const gitignoreWeb2 = fs.readFileSync(path.join(tmpBase, "web1", ".gitignore"), "utf8");
  const gitignoreCount2 = (gitignoreWeb2.match(/agentic-dev:web:start/g) || []).length;
  assert(gitignoreCount2 === 1, `idempotency .gitignore: expected 1 tag, got ${gitignoreCount2}`);
  console.log("PASS idempotency");

  // 5. merge with existing content
  const mergeDir = path.join(tmpBase, "merge-test");
  fs.mkdirSync(mergeDir, { recursive: true });
  fs.writeFileSync(path.join(mergeDir, "AGENTS.md"), "# My Project\nCustom rules.\n", "utf8");
  fs.writeFileSync(path.join(mergeDir, ".gitignore"), "node_modules/\n", "utf8");
  const mergeRun = runCopy("web", mergeDir);
  assert(mergeRun.status === 0, `merge run failed: ${mergeRun.stderr}`);
  const merged = fs.readFileSync(path.join(mergeDir, "AGENTS.md"), "utf8");
  assert(merged.startsWith("# My Project"), "merge should preserve existing header");
  assert(merged.includes("Custom rules"), "merge should preserve custom rules");
  assert(merged.includes("agentic-dev:web:start"), "merge should append tag block at end");
  const mergedGitignore = fs.readFileSync(path.join(mergeDir, ".gitignore"), "utf8");
  assert(mergedGitignore.includes("node_modules/"), "gitignore merge should preserve existing entries");
  assert(mergedGitignore.includes(".agentic-dev/run/"), "gitignore merge should append pack entry");
  assert(mergedGitignore.includes("agentic-dev:web:start"), "gitignore merge should have tag");
  console.log("PASS merge with existing");

  // 6. WARN vs --force for non-merge files
  const warnDir = path.join(tmpBase, "warn-test");
  fs.mkdirSync(warnDir, { recursive: true });
  // first copy
  runCopy("web", warnDir);
  // tamper a non-merge file
  const rolePath = path.join(warnDir, ".agentic-dev/roles/planner.md");
  fs.writeFileSync(rolePath, "tampered", "utf8");
  const warnRun = runCopy("web", warnDir);
  assert(warnRun.stdout.includes("WARN"), "should WARN on differing non-merge file");
  assert(fs.readFileSync(rolePath, "utf8") === "tampered", "WARN should not overwrite");
  const forceRun = runCopy("web", warnDir, ["--force"]);
  assert(forceRun.stdout.includes("OVERWRITE"), "force should overwrite");
  assert(fs.readFileSync(rolePath, "utf8") !== "tampered", "force should overwrite content");
  console.log("PASS WARN/--force");

  // 7. expo variant
  const expoRun = runCopy("expo", path.join(tmpBase, "expo1"));
  assert(expoRun.status === 0, `expo copy failed: ${expoRun.stderr}`);
  const agentsExpo = fs.readFileSync(path.join(tmpBase, "expo1", "AGENTS.md"), "utf8");
  assert(agentsExpo.includes("agentic-dev:expo:start"), "expo tag missing");
  assert(fs.existsSync(path.join(tmpBase, "expo1", ".agentic-dev/roles/planner.md")), "expo role missing");
  assert(fs.existsSync(path.join(tmpBase, "expo1", ".agentic-dev/orchestration.md")), "expo orchestration missing");
  assert(!fs.existsSync(path.join(tmpBase, "expo1", ".opencode")), "expo should not have .opencode");
  assert(!fs.existsSync(path.join(tmpBase, "expo1", ".omp")), "expo should not have .omp");
  console.log("PASS expo variant");

  // 8. global guard — should refuse HOME
  const home = process.env.HOME;
  if (home) {
    const guard = runCopy("web", home);
    assert(guard.status !== 0, "should refuse HOME as target");
    assert(guard.stderr.includes("Refusing") || guard.stdout.includes("Refusing"), "guard message missing");
    console.log("PASS global guard (HOME)");
  }

  console.log("\nAll checks PASS.");
} finally {
  // keep tmp for inspection: print path
  console.log(`\nArtifacts kept at: ${tmpBase}`);
  console.log(`Clean up: rm -rf ${tmpBase}`);
}