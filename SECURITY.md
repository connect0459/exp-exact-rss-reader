# Security Policy

This is a small hobby RSS reader built as a trial of [Exact](https://github.com/expo/exact), not a published library with external users consuming it as a dependency. The scope below is narrower than a typical library's because of that.

## Supported Versions

Only the `main` branch is maintained. There are no tagged releases.

| Version | Supported |
| :------ | :-------- |
| `main`  | ✓         |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Use GitHub's [private vulnerability reporting][private-report] feature to disclose issues confidentially. You will receive an acknowledgment within **5 business days** and a resolution timeline once the report has been triaged.

[private-report]: https://github.com/connect0459/rss-reader/security/advisories/new

## Scope

The following vulnerability classes are in scope for this project:

- **Over-broad grants** — a `grants` entry in `app.ts` that lets the app fetch from, read, or write to more than it needs (for example a wildcard `net.fetch` target or a `fs.write` path outside `app:/data/`).
- **Untrusted feed content reaching the UI or the file system** — a feed entry whose title, summary, or link causes behavior beyond displaying text (for example a crafted `link` being opened without validation, or a crafted entry corrupting `app:/data/*.json`).
- **Supply-chain issues in pinned tooling** — the pre-commit hook revisions pinned in `.pre-commit-config.yaml`; a compromised release is in scope for a coordinated response, even though the fix (bump the pin) lives upstream.

The following are **out of scope**:

- Anything that requires the attacker to already control the content of this repository — that's a source-code change, not a vulnerability.
- Issues in Exact itself or other third-party dependencies (report those upstream; this project will track and apply the fix).
- Theoretical issues without a reproducible proof-of-concept.

## Disclosure Policy

Once a fix is ready, a GitHub Security Advisory will be published with full details. The typical timeline from report to public disclosure is **30 days**, though this may be extended by mutual agreement when a fix requires significant changes.
