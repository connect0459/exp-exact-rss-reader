# Project Agents.md Guide

This is an RSS reader built as a trial of [Exact](https://github.com/expo/exact), Expo's Rust-based cross-platform app runtime. The view, state, and data dependencies are declared in `app.contract`; `app.ts` answers those declarations; the same plan runs on web, macOS, and iOS.

The trial's purpose is to exercise the parts of Exact that the article ["Expo Exact first impression"](https://zenn.dev/tellernovel_inc/articles/expo-exact-first-impression) highlights: declared data dependencies (`resource`, `mutation ... refreshes`), `grants`, deterministic tests with a driver-owned clock, and `verify`.

## Language Convention

This project may be released publicly. All of the following must be written in **English**:

- Commit messages
- Code comments
- Documentation (including `AGENTS.md`, `README.md`, etc.)
- Test names
- Error messages

## Project Structure

- **`app.contract`** — the view and every declaration: `shape`, `state`, `resource`, `mutation`, `action`, `routes`. Two tabs: a reader (feed switcher, entry list, entry detail) and a starred list.
- **`app.ts`** — the data module. It answers each declared `resource`/`mutation` by name and keeps read ids, starred entries, and added feeds in `app:/data/state.json`. Its `grants` admit only `fs` on that file and `net.fetch https://zenn.dev`.
- **`source.ts`** — `fetchFeed(url)`, the only place that knows where feed text comes from: `example.com` URLs read `fixtures.ts` so tests never leave the process, every other address goes through `net.fetch`.
- **`rss.ts`, `entryId.ts`, `feedId.ts`** — pure helpers with `bun test` suites: an RSS 2.0 parser, route-safe entry ids from guids, and feed ids from addresses.
- **`app.test.contract`** — the tests. The driver owns the clock; there is no real-time waiting.
- **`app.json`** — the manifest.
- **`docs/todo.md`** — the decision log: what's been verified, what broke, and why. Read it before changing the contract or the data module's boundary.

## Exact Conventions

- `exact.mjs` and the block between `exact:begin` and `exact:end` below are generated; do not edit them. `./exact.mjs update` rewrites them.
- Run commands through `./exact.mjs`, which finds Bun on its own; a bare `bun` may not be on `PATH`.
- Apple builds need Xcode 27.1 or later. When the selected Xcode is older, point a single command at the newer one with `DEVELOPER_DIR=/Applications/Xcode_27.2.app/Contents/Developer` instead of switching globally with `xcode-select`.
- Feedback to Expo: record notes locally with `./exact.mjs feedback note`, and do not send anything without asking the maintainer first.

## Tooling

- `just test` runs `app.test.contract` on the web host. The first web build is slow (about ten minutes); later runs are fast.
- `just check` compiles `app.contract` and prints machine-readable diagnostics.
- `just verify` builds, runs the tests, and checks the screens reached in light/dark, two widths, and the largest text size.
- `./exact.mjs contract vocab <name>` and `./exact.mjs docs <heading words>` answer questions about the language and the guides.

For local quality verification:

- **pre-commit hooks** — catch formatting and lint issues on every commit (`pre-commit run --all-files` to run manually).

## Development Philosophy

### Red/Green TDD (Detroit school)

- Red → Green → Refactor cycle strictly followed
- Use real objects; mocks are only permitted at external boundaries (file system, external API, network). The `example.com` fixtures behind `fetchFeed(url)` stand in for the network, which is that external boundary
- Write tests BEFORE implementation; run tests AFTER implementation
- Coverage targets are agreed with the user before implementation and recorded in `docs/todo.md`
- Exception: exploratory spikes may skip test-first with explicit user agreement; discard or rewrite the spike as a proper implementation afterward

### Domain Object Design

- Rich domain objects: pair data and logic in the same type
- Prefer immutability; avoid mutable state unless necessary
- Distinguish entities (identity-based) from value objects (value-based)
- Enforce layer boundaries through abstract types; no direct dependency on concrete implementations

### Evergreen Tests

- Test names describe WHAT business rule is being verified, not HOW
- Test names must not reference implementation details
- Test code serves as living documentation of the system's behavior

### Code Comments

- Do NOT write code comments unless explicitly permitted by the user
- Let the code speak for itself; let tests document the behavior
- Code = How, Tests = What, Commit messages = Why

## Git Conventions

### Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
| :--- | :--- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, whitespace) |
| `refactor` | Code change that is neither a fix nor a feature |
| `tidy` | Small, safe cleanup (< 2 min; no behavior change) |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, or config changes |
| `ci` | CI/CD pipeline changes (GitHub Actions, workflows) |
| `perf` | Performance improvement |

### Scopes

Scope is optional; use the area name when the change targets a specific part of the tree (e.g., `contract`, `data`, `tests`). Omit for project-wide changes.

### Type vs. Scope Precedence

The type vocabulary above mixes two axes: an **impact axis** (`feat`, `fix`, `perf`, `refactor` — the SemVer-relevant effect of a change) and a **domain axis** (`docs`, `style`, `test`, `chore`, `ci`, `tidy` — a layer with no runtime/SemVer effect). When a change is fully contained within a domain, use that domain as `type` (e.g. `docs: fix typo`); do not use it as `scope` on an impact-axis type (avoid `fix(docs): ...`). `scope` sub-divides whatever `type` already established (e.g. `feat(contract)`); it is not a substitute classification axis.

### Subject Line

- Use the imperative mood: "add", "fix", "remove" — not "added" or "adds"
- 72 characters max
- No trailing period

### Body (optional)

- Explain **why**, not what — the diff already shows what changed
- Leave one blank line between subject and body

### Footer (optional)

- `BREAKING CHANGE: <description>` for breaking changes
- `Closes #123` or `Fixes #456` to link issues

### Branch naming

`feat/xxx`, `fix/xxx`, `docs/xxx`

<!-- markdownlint-disable -->
<!-- exact:begin (exact new writes this block; bun exact.mjs update rewrites it) -->
# rss-reader: an Exact app

`app.contract` is the view, `app.ts` the data module, `app.test.contract` the tests, `app.json`
the manifest: set `app.name` and `app.id` before building. The app uses Exact at
`../exact` by path (`EXACT` overrides it).

This file is already in your instructions. Start from the nearest pattern: `bun exact.mjs
pattern` lists them and `pattern <name>` writes one, tested. ../exact/docs/start-here-site.md (a site) or
../exact/docs/start-here.md is the only required reading. `bun exact.mjs contract vocab <name>` answers a
name (none: the card); `bun exact.mjs docs <heading words>` a guide's
section. Run `bun exact.mjs verify` when the features work, and `verify ios|android` at the end for a
phone app. When an iPhone app is ready to try, run `bun exact.mjs share` and send its link;
repeat for each change the person should see. `bun exact.mjs help` lists the verbs, including
app.json's `"commands"`.
`bun exact.mjs update` refreshes files. Native verbs (`ios`, `mac`, `linux`, `android`, `windows`)
name their platform in app.json on first use and build in a generated workspace;
`update --without <platform>` stops shipping it.
`bun ../exact/scripts/exact.mjs setup --check` names what a native build lacks.
Shared data: `exact new <path> --snapback`, or `bun exact.mjs snapback` here.
Install `snapback4@0.4.33` above; ../exact/snapback4/README.md has setup and server commands.

Generated, so don't edit: `exact.mjs` and this block.

## Feedback (required)

When a doc was wrong or missing, a workaround was needed, something took several tries or a
command confused you, record it: `bun exact.mjs feedback note "<what happened>"`. It attaches
exact2's commit and the last exit code, never output or code. `bun exact.mjs feedback status` says
whether notes are sent and whether to keep a diary; under `never`, skip all of this.
<!-- exact:end -->
<!-- markdownlint-enable -->
