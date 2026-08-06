---
name: example
description: Example shared skill — copied into every variant target. Replace with real skills.
---

# Example (shared)

This is a placeholder skill under `variants/_shared`. It ships to **all** variants.

Use as a template for shared tooling. Real shared skills (e.g., repo hygiene, planning) live here.
Target projects get this at `.agents/skills/example/SKILL.md` after `scripts/copy.mjs`.

> To add a shared skill: `mkdir -p variants/_shared/.agents/skills/<name> && echo "---" > variants/_shared/.agents/skills/<name>/SKILL.md`
