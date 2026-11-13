# todo - rss-reader

Current state: **Milestone 0 (environment and community standard files) is complete.** The Exact checkout builds and passes its own `caltrain` web tests on this machine (Bun 1.4.2 through mise, Xcode 27.2 selected per command, Rust 1.97). The `list-detail` pattern is applied as the starting point and is not yet adapted: `app.contract`, `app.ts`, and `app.test.contract` still describe the generic item list. The RSS reader itself starts at Milestone 1.

---

## Background

This project is a trial of [Exact](https://github.com/expo/exact) (pre-1.0, MIT), written after reading the article ["Expo Exact first impression"](https://zenn.dev/tellernovel_inc/articles/expo-exact-first-impression). The article's central claim, as far as this project is concerned, is that the data a screen reads and writes can be declared (`resource`, `mutation ... refreshes`, `shape ... else`) instead of fetched imperatively, which makes the dependencies checkable at compile time and the tests deterministic.

The goal is to exercise that claim with an app whose data is genuinely read and written: an RSS reader. The goal is not to ship a product or to build a general RSS engine.

## Decisions made before any code existed

- **Subject: RSS / news reader**, chosen by the user over a bookmark list. A bookmark list would have avoided the network entirely; an RSS reader keeps `net.fetch`, `pending`/`failed`, and `grants` in scope.
- **Fixture feed first (option a), real feed later (option b).** The test driver's only network control is `fail fetch`, so a success path that depends on a live feed would be non-deterministic. `app.ts` therefore serves fixed RSS text behind a `fetchFeed(url)` boundary; replacing it with `net.fetch` is a later, isolated change. `grants` lists only `fs.*` until then, because declaring an unused `net.fetch` target would widen the grant without a reason.
- **Two tabs, not one list.** A reader tab (feed switcher, entry list, entry detail) and a starred tab. The tabs are split by kind of view, not by feed: a tab per feed would enumerate instances of one kind, which a switcher expresses better. The split exercises two independent navigation stacks, the `resource` argument change on feed switching, and `toggleStar` refreshing both tabs from one declaration.
- **Feedback to Expo stays local.** `AGENTS.md` asks agents to record friction with `feedback note`. The send mode is `ask`; nothing is sent without the maintainer's explicit approval.
- **Language, git conventions, and Development Philosophy are copied from `mbt-dodge-kmp`**, with project-specific lines (coverage targets, domain wording) adapted. `AGENTS.md` keeps Exact's generated block untouched and outside markdownlint's reach, because `exact update` rewrites it.
- **Coverage targets, agreed with the maintainer before implementation:**
  - `app.test.contract` covers every path that the article's claims rest on: the `resource` re-read when its argument changes (feed switching), the `refreshes` ripple (one star mutation reflected in both tabs), the failure path (a failed fetch and its retry), and state kept across a relaunch.
  - The visual layer (light/dark, widths, text size, contrast) is left to `exact verify`, not to hand-written tests.
  - The fixture RSS parser is not a coverage target; it is revisited when a real feed replaces the fixture (Milestone 5).

## Milestone 0: Environment and community standard files

- [x] Cloned `expo/exact` next to this repository (commit `1aaab607`, 2026-11-10)
- [x] Bun 1.4.2 through mise, pinned in `exact/mise.toml` (a local, untracked file in the Exact checkout) and in this repository's `.mise.toml`
- [x] Rewrote the generated files' Exact path from absolute to relative (`../exact`) with `./exact.mjs update`; the Bun fallback in `exact.mjs`'s second line was made portable by symlinking `~/.bun-1.4.2/bin/bun` to the mise-installed Bun (see Findings)
- [x] Xcode 27.2 recognized through `DEVELOPER_DIR`, without `xcode-select` or `sudo`; the iOS SDK 27.2 installed by `exact setup`
- [x] `exact setup` succeeded after the Xcode 27.2 license was accepted (see Findings)
- [x] `caltrain`'s `app.test.contract` passes on the web host (3 passed, 0 failed)
- [x] Scaffolded this app with `exact new`, then applied `list-detail` (see Findings for the non-empty directory workaround)
- [x] Community standard files: `LICENSE` (Apache-2.0), `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, PR and issue templates, `dependabot.yml`
- [x] Agent guide: `AGENTS.md` (`CLAUDE.md` is a symlink)
- [x] Quality gates: pre-commit hooks (markdownlint), `justfile`
- [ ] Verify the pre-commit hooks (`pre-commit install` has not been run, and `pre-commit`'s Node environment failed to build on this machine: `nodeenv` cannot parse the Node version `0-alpha`; the first six commits were made without the hooks, with markdownlint run through `bunx markdownlint-cli2@0.23.2` instead)
- [ ] Create the GitHub repository and push — `connect0459/rss-reader`; a separate, explicit decision
- [ ] CI — deliberately not added yet: a web test needs the Exact checkout, `exact setup`, and a ten-minute first build, so the workflow needs its own design
- [ ] Set `app.name` and `app.id` in `app.json` — `exact new` generated the placeholder `com.example.rss-reader-bfd7e1`, and Exact requires both to be set before building

## Milestone 1: Tests first (Red)

Goal: specify the RSS reader in `app.test.contract` before touching `app.contract` or `app.ts`.

- [x] Agree coverage targets with the maintainer and record them above
- [ ] Entry list shows the selected feed's entries from the fixture
- [ ] Switching the feed refetches the entries (the `resource` argument changes)
- [ ] Opening an entry marks it read, and the read state survives a relaunch
- [ ] Starring an entry shows it in the starred tab, and unstarring removes it (one `mutation`, two tabs)
- [ ] The reader tab keeps its pushed detail while the starred tab is in use (independent stacks)
- [ ] A feed whose fetch fails shows a failure state with a retry, in place of the list
- [ ] Confirm every new test fails for the right reason before moving on

## Milestone 2: Contract and data module (Green)

- [ ] `shape Feed`, `shape Entry`, and the fixture feeds (including one that always fails)
- [ ] `resource feeds`, `resource entries` (argument: selected feed), `mutation markRead`, `mutation toggleStar`, `mutation addFeed`, each with its `refreshes`
- [ ] `routes nav` for the two tabs and the entry detail
- [ ] `app.ts` answers every declared name; `fetchFeed(url)` is the only place that knows where feed text comes from
- [ ] Remove the `list-detail` pattern's leftovers (items, lock, notes) rather than carrying them
- [ ] `./exact.mjs test web` green; `./exact.mjs contract build app.contract --json --errors-only` clean

## Milestone 3: `verify`

- [ ] `./exact.mjs verify` clean on the web host (light/dark, two widths, largest text size)
- [ ] Record the diagnostics it produced and what each one required, since the diagnostics' machine-readable shape is one of the article's claims

## Milestone 4: Native hosts

- [ ] `./exact.mjs mac --run` (first build is expected to take ten to fifteen minutes)
- [ ] `./exact.mjs ios --run` on an iOS Simulator, then `./exact.mjs verify ios`
- [ ] Compare the three hosts' behavior for the same `app.test.contract`

## Milestone 5: Real feed

- [ ] Replace the fixture behind `fetchFeed(url)` with `net.fetch` and add the exact feed URL to `grants`
- [ ] Keep the fixture for tests; record how the driver's `fail fetch` limitation constrains the success-path test

## Findings

Observations from setting up and using Exact, recorded because they cost time and the docs did not cover them. Exact's own documentation says its API is not stable; every item is as of commit `1aaab607`.

- **Xcode license.** A newly added Xcode (27.2) fails every `cc` link with `You have not agreed to the Xcode license agreements` until `sudo xcodebuild -license accept` is run for it. The first `exact setup` failed on `wasm-bindgen-cli` for this reason; the error surfaced as a linker failure, not as a setup diagnostic.
- **Xcode selection.** `exact setup --check` honors `DEVELOPER_DIR`, so a newer Xcode can be used per command without changing the global selection.
- **First web test needs a build.** `agent.mjs web --test` against an unbuilt app exits 1 with `web dist is not a complete build`; the message names the build command. The build then takes about ten minutes.
- **`exact new` refuses a non-empty directory.** A repository that already holds a `README.md` cannot be scaffolded in place. The workaround is to scaffold into a directory with the final name elsewhere, then copy the files in without overwriting.
- **App name comes from the directory name.** `exact new <dir>` derives the name, `app.id`, and the `package.json` name from `<dir>`'s last component, so a scratch directory must be named like the final repository.
- **Absolute local paths in generated files.** `exact new` wrote the absolute path of the Exact checkout into `AGENTS.md`'s generated block, `app.json`'s `$schema`, and `exact.mjs`. The cause is `pathFrom` in `scripts/app.mjs`: it writes a relative path only when the app and the checkout share the same first directory (here `/Users`), and the app had been scaffolded under `/private/tmp`. Running `./exact.mjs update` from the repository itself rewrote all three as `../exact`, so the repository is now free of the home directory except for the line below.
- **`exact.mjs` bakes in the creating Bun's absolute path.** Its second line falls back to the absolute path of the Bun that ran `update`, unless that Bun is the same file as `~/.bun-1.4.2/bin/bun` (Exact's pinned location), in which case it writes a bare `bun`. Resolved by symlinking `~/.bun-1.4.2/bin/bun` to the mise-installed Bun and rerunning `update`; the file now contains no home directory. Anyone regenerating the file (`exact update`) needs the same symlink, or the absolute path comes back.
- **`exact update` leaves content outside the generated `AGENTS.md` block alone.** Verified: only the lines inside `exact:begin`/`exact:end` changed.
- **`mise use` wrote to the global config.** `mise use bun@1.4.2` tried to write `~/.config/mise/config.toml` and failed; a hand-written local `mise.toml` plus `mise install` worked. The cause was not investigated.
- **`apps/hello` has no tests.** It cannot be used for `test web`; `caltrain` can.

## Open questions

- Whether `app:/data/state.json` should hold read and starred state together with the entries, or whether the fixture feeds should stay read-only and state live in its own file. Milestone 1's relaunch test will force the choice.
