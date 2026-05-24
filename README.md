<!-- BADGES -->
<div align="center">

![CI Status](https://img.shields.io/github/actions/workflow/status/your-org/your-repo/ci.yml?branch=main&label=CI%20Pipeline&style=for-the-badge&logo=github-actions&logoColor=white)
![Lint](https://img.shields.io/badge/ESLint-Passing-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Tests](https://img.shields.io/badge/Jest-Passing-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Yarn](https://img.shields.io/badge/Yarn-Frozen%20Lockfile-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white)

</div>

---

# CI/CD Pipeline

> **One rule:** No code touches `main` without passing through this pipeline. No exceptions.

This document explains how our pipeline works, why each decision was made, and what to do when things go wrong. Read this once — you'll never have to ask "why did CI fail?" again.

---

## The Big Picture

Every push you make triggers an automated sequence. Here's the mental model:

```
Your Push / Pull Request
         │
         ▼
┌─────────────────┐
│   LINT CHECK    │  ← First line of defense
│   (ESLint)      │    Code style + syntax issues caught here
└────────┬────────┘
         │
    Pass? ──── No ──→ ✗ FAIL (fix your code, try again)
         │
        Yes
         │
         ▼
┌─────────────────┐
│   TEST SUITE    │  ← Second line of defense
│   (Jest)        │    Logic and behavior verified here
└────────┬────────┘
         │
    Pass? ──── No ──→ ✗ FAIL (your logic broke something)
         │
        Yes
         │
         ▼
         ✓ READY TO MERGE
```

Why this order? Linting runs first because it's fast (seconds, not minutes). No point running a 3-minute test suite if your semicolons are wrong.

---

## Pipeline Jobs — What Actually Happens

### Job 1 — Lint

**Trigger:** Every push to `main` or `develop`. Every pull request targeting `main`.

**What runs:**

```yaml
- uses: actions/checkout@v3
- uses: actions/setup-node@v3
  with:
    node-version: '20'
    cache: 'yarn'
- run: yarn install --frozen-lockfile
- run: yarn lint
```

**Why `--frozen-lockfile`?**
Without it, Yarn can silently upgrade packages. That means the code works on your machine but breaks in CI because CI got a different version. `--frozen-lockfile` forces CI to use *exactly* what's in `yarn.lock` — no surprises.

**Why Node 20?**
It's the current LTS (Long Term Support) release. We don't chase bleeding-edge versions in CI — stability over novelty.

---

### Job 2 — Test

**Trigger:** Only runs *after* Lint passes (`needs: [lint]` in the YAML).

**What runs:**

```yaml
- uses: actions/checkout@v3
- uses: actions/setup-node@v3
  with:
    node-version: '20'
    cache: 'yarn'
- run: yarn install --frozen-lockfile
- run: yarn test
```

**Why does Test repeat the setup steps from Lint?**
Each GitHub Actions job runs in a completely fresh virtual machine. Jobs don't share file systems. So yes — we set up Node and install dependencies twice. The Yarn cache (configured in `setup-node`) makes the second install fast.

**What does `yarn test` actually run?**
Jest. It finds every `*.test.ts` / `*.spec.ts` file in the project and executes them. If any single test fails, the job fails, and the PR cannot merge.

---

## Trigger Rules — When Does This Run?

| Event | Branch | Lint | Test |
|---|---|---|---|
| `git push` | `main` | ✓ | ✓ (if lint passes) |
| `git push` | `develop` | ✓ | ✓ (if lint passes) |
| Pull Request opened | targeting `main` | ✓ | ✓ (if lint passes) |
| Pull Request updated | targeting `main` | ✓ | ✓ (if lint passes) |
| `git push` | any other branch | ✗ | ✗ |

**Practical implication:** Working on a feature branch? CI doesn't run until you open a PR or push to `develop`/`main`. You are responsible for running `yarn lint` and `yarn test` locally before that.

---

## Run This Locally Before You Push

Don't wait for CI to tell you something is broken. Run these in sequence:

```bash
# Check for lint errors
yarn lint

# Run the full test suite
yarn test

# Run both (copy-paste friendly)
yarn lint && yarn test
```

If both pass locally, CI will almost certainly pass too. Almost — environment differences can still cause issues (see Troubleshooting below).

---

## When CI Fails — A Debugging Guide

CI failure emails are easy to ignore. Don't. Here's how to actually read them.

**Step 1** — Go to the Actions tab on the GitHub repo.

**Step 2** — Click the failing workflow run.

**Step 3** — Click the failing job (Lint or Test).

**Step 4** — Expand the failing step. The error is always in the last 20 lines.

### Common failures and what they mean

**`ESLint: X problems (Y errors, Z warnings)`**
Your code violates the ESLint rules. The output will tell you exactly which file, which line, and which rule. Fix it, push again.

**`Cannot find module '...'`**
You added an import that doesn't exist, or the module isn't installed. Check your import path and `package.json`.

**`yarn install` fails with "Your lockfile needs to be updated"`**
You added a package locally but didn't commit the updated `yarn.lock`. Run `yarn install` locally, commit both `package.json` and `yarn.lock`.

**`Test suite failed to run`**
Jest itself crashed before running tests — usually a syntax error or broken import in a test file. Check the error message above the test results.

**`X tests failed`**
Your code change broke existing behavior. Either fix your code, or if the test expectation is genuinely outdated, update the test — but only after understanding *why* it existed.

---

## Pipeline Configuration

The full pipeline lives here:

```
.github/
└── workflows/
    └── ci.yml   ← This is the source of truth
```

If you want to change pipeline behavior — triggers, Node version, added jobs — edit that file. The YAML is readable. Spend 5 minutes with it.

---

## For New Team Members

Three things to know before your first PR:

1. **Branch protection is on.** `main` requires a passing CI run. You cannot merge a failing PR regardless of who approves it.

2. **Run lint and tests locally.** CI is the safety net, not the first check. Fixing things after a push creates noise in the PR history.

3. **Read the error, don't just re-run.** If CI fails, re-running it hoping it passes is almost never the right move. Read the log, understand the failure, fix it.

---

## What's Coming Next

The pipeline currently covers CI (Continuous Integration — catching problems early). The next phases planned:

- **Coverage reporting** — Jest coverage thresholds enforced in CI
- **CD (Continuous Deployment)** — Auto-deploy to staging on `develop` merge
- **Security scanning** — Dependency vulnerability checks on every PR

---

*Configuration lives in `.github/workflows/ci.yml` — that file is the authority, this document is the explanation.*