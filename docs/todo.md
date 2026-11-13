# todo - exp-exact-rss-reader

Current state: **Milestones 0 to 5 are complete.** The RSS reader reads the maintainer's Zenn feed over `net.fetch` on the macOS and iOS hosts, and keeps its tests offline on fixtures. All thirteen `app.test.contract` tests pass on web, macOS, and the iOS Simulator, and `verify` reports one problem on web and on iOS: the failure screen itself, which no `verify.accept` kind can take. The web host cannot read the real feed (CORS). Nothing further is planned.

---

## Background

This project is a trial of [Exact](https://github.com/expo/exact) (pre-1.0, MIT), written after reading the article ["Expo Exact first impression"](https://zenn.dev/tellernovel_inc/articles/expo-exact-first-impression). The article's central claim, as far as this project is concerned, is that the data a screen reads and writes can be declared (`resource`, `mutation ... refreshes`, `shape ... else`) instead of fetched imperatively, which makes the dependencies checkable at compile time and the tests deterministic.

The goal is to exercise that claim with an app whose data is genuinely read and written: an RSS reader. The goal is not to ship a product or to build a general RSS engine.

## Decisions made before any code existed

- **Subject: RSS / news reader**, chosen by the user over a bookmark list. A bookmark list would have avoided the network entirely; an RSS reader keeps `net.fetch`, `pending`/`failed`, and `grants` in scope.
- **Fixture feed first (option a), real feed later (option b).** The test driver's only network control is `fail fetch`, so a success path that depends on a live feed would be non-deterministic. `app.ts` therefore serves fixed RSS text behind a `fetchFeed(url)` boundary; replacing it with `net.fetch` is a later, isolated change. `grants` lists only `fs.*` until then, because declaring an unused `net.fetch` target would widen the grant without a reason.
- **Two tabs, not one list.** A reader tab (feed switcher, entry list, entry detail) and a starred tab. The tabs are split by kind of view, not by feed: a tab per feed would enumerate instances of one kind, which a switcher expresses better. The split exercises two independent navigation stacks, the `resource` argument change on feed switching, and `toggleStar` refreshing both tabs from one declaration.
- **Feedback to Expo stays local.** `AGENTS.md` asks agents to record friction with `feedback note`. The send mode is `ask`; nothing is sent without the maintainer's explicit approval.
- **Repository name: `exp-exact-rss-reader`.** The `exp-` prefix marks a trial rather than a product, as in `exp-mbt-chasm-kmp`; the technologies under test follow, then the subject. `rss-reader-exact` was rejected because the suffix form says "an implementation of X in Y" and implies sibling implementations to compare; `exp-rss-reader` was rejected because it drops the technology under test, which every other `exp-` name carries. If the project ever becomes a real reader, the answer is a new product repository built on this evidence, not a rename.
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
- [x] README in the other repositories' shape (badges, Motivation, Features, Installation, Usage, Compatibility, Limits, then Documentation, Contributing, License). No CI badge: this repository has no workflow, and a badge for a missing workflow would be a dead image
- [x] Quality gates: pre-commit hooks (markdownlint), `justfile`
- [x] Install the pre-commit hooks: `pre-commit`'s default Node resolved to a pre-release whose version string `nodeenv` could not parse (`0-alpha`), so markdownlint's environment never built; `language_version: lts`, as in the other repositories, fixed it, and the hooks now run on every commit
- [x] Create the public GitHub repository and push (`connect0459/exp-exact-rss-reader`, renamed from `rss-reader` before the first pull request)
- [x] CI (`.github/workflows/ci.yml`, dependabot for its actions): lint through pre-commit, the unit tests, and the web host's contract compile and tests behind a path filter, with a `gate` job. macOS and iOS are not in CI: Exact's own CI runs no Apple build, and the hosted image's Xcode is unconfirmed
- [ ] Set `app.name` and `app.id` in `app.json` — `exact new` generated the placeholder `com.example.rss-reader-bfd7e1`, and Exact requires both to be set before building

## Milestone 1: Tests first (Red)

Goal: specify the RSS reader in `app.test.contract` before touching `app.contract` or `app.ts`.

- [x] Agree coverage targets with the maintainer and record them above
- [x] Entry list shows the selected feed's entries from the fixture, newest first
- [x] Switching the feed refetches the entries once (the `resource` argument changes; `expect perf query entries == 1`)
- [x] Opening an entry marks it read, and the read state survives a relaunch
- [x] Starring an entry shows it in the starred tab and survives a relaunch; unstarring from the starred tab clears the reader's row too
- [x] One star mutation refreshes `entries` and `starred` once each and leaves `feeds` alone (`expect perf query`)
- [x] The reader tab keeps its pushed detail while the starred tab is in use (independent stacks)
- [x] A feed whose fetch fails shows a failure state with a retry, in place of the list
- [x] Adding a feed by address refuses an unknown address with a reason, and a known one becomes selectable
- [x] Confirm every new test fails for the right reason before moving on: all nine fail against the untouched `list-detail` app on names that do not exist yet (`no state named "entries"`, `no view matches feed-beta`). The `perf` assertions sit behind earlier steps that fail first, so their counts are only proven at Green

## Milestone 2: Contract and data module (Green)

- [x] `shape Feed`, `shape Article` (not `Entry`: `routes` reserves that name), and the fixture feeds (including one that always fails)
- [x] `resource feeds`, `resource entries` (argument: selected feed), `resource starred`, and the mutations `marked`, `starToggled`, `subscribed`, each with its `refreshes`
- [x] `routes nav` for the two tabs, the entry detail, and the add-feed sheet
- [x] `app.ts` answers every declared name; `fetchFeed(url)` in `source.ts` is the only place that knows where feed text comes from
- [x] An RSS 2.0 parser (`rss.ts`) with its own tests, written test-first; Atom is not supported
- [x] Remove the `list-detail` pattern's leftovers (items, lock, notes) rather than carrying them
- [x] `./exact.mjs test web` green (9 passed, 0 failed); `./exact.mjs contract build app.contract --json --errors-only` clean
- [x] Mutation check: removing `starred` from `starToggled`'s `refreshes` makes two tests fail (`query starred counted 0 ... expected == 1`, and the Starred tab no longer lists the entry), so the `perf` assertions are not vacuous

## Milestone 3: `verify`

- [x] `./exact.mjs verify` on the web host (light/dark, two widths, largest text size): 18 problems at the first run, 3 at the last. The remaining three are the `broken` feed's two refusals and one "failed and not arranged"; `verify.accept` cannot take them (it covers layout and contrast kinds only), so they stay counted until a real `net.fetch` lets `fail fetch` arrange them (Milestone 5)
- [x] Persist the chosen feed, driven by the reload note (test first)
- [x] Adopt six of the seven suggested frame properties as `after … only writes …` lines
- [x] Record the diagnostics it produced and what each one required (below)

### What `verify` found, and what each finding required

| Run | Problems | What changed |
| :-- | :-- | :-- |
| 1 | 18: 9 overlap at the largest size, 6 contrast, 2 refused, 1 not arranged | first run on the Milestone 2 contract |
| 2 | 12 | headers wrap; feed chooser a scrolling row; the chosen feed persists |
| 3 | 3 | the unread count inverts with the scheme; the detail title has a minimum width |
| 4 | 3 | the tab bar repaired after a screenshot showed it broken; the numbers did not change |

- **Overlap, 9 (largest text size).** The headers did not wrap and the feed chooser stacked one 181 px button per feed under them, pushing past the tab bar. Remedy named by `verify`: `flex-wrap="wrap"`. The chooser could not move into the list, because a failed feed shows no list and the person could not leave it; it became one horizontally scrolling row.
- **Contrast, 6 (dark only).** White text on `-exact-system-red` was 3.4:1. The compiler first refused `-exact-system-background` and named the right role (`-exact-background`), but that role then failed in light (3.5:1), because the system red is brighter in dark than in light and no fixed text colour clears both. Inverting the capsule (`-exact-label` fill, `-exact-background` text) passes in both.
- **Clipped, 2.** The detail title shared a row with the star button and was 63 px too wide at the largest size; a rem `flex-basis` lets the button wrap beneath it.
- **Reload notes, 2 (not counted).** The chosen feed reloaded into the first feed. The note said "a saved value must survive a reload; a game or a draft in progress may not", which is the question of whether the choice is a saved value; it is, so it persists.
- **Refused at run time 2, not arranged 1.** The `broken` feed is refused by design. As predicted at Milestone 1, `verify` counts it.

## Milestone 4: Native hosts

- [x] macOS: `./exact.mjs test macos` runs the same tests; 10 of 10 on the first run (first build about 12 minutes), 12 of 12 after the tests grew
- [x] iOS Simulator (iPhone 17 Pro, iOS 26.5): `./exact.mjs test ios`, 10 of 10 on the first run (first build about 7 minutes), 12 of 12 after
- [x] `./exact.mjs verify ios`: tests pass, nothing spills at the largest text size, and the six `after … only writes …` properties held (134 to 232 checks each); the findings are the `broken` feed's
- [x] Compare the three hosts: the same tests give the same results on all three, so the parser and the data module behave the same on Hermes as under Bun
- [x] Look at the screenshots on iOS, not only the report (found the lost tab label and badge, below)
- [x] Make the failure screen and the add sheet's refusal the last screen of a test, because `verify` checks only those

### What the native hosts showed

- **The same tests passed on all three hosts the first time.** Nothing in the parser (`Date.parse` avoided, entities decoded by hand) or the data module needed a native-specific change.
- **A fix for one host broke another.** To repair the web tab bar I wrapped the Reader tab's label in a `row`. On iOS the native tab bar then showed neither the label nor the unread badge, because it reads the button's direct `image`, `text`, and badge children. No test failed and `verify ios` reported nothing; only the screenshot showed it. Restoring the flat structure, with the column layout on the button itself, gave the native bar its label and a native red badge, and kept the web bar acceptable.
- **`verify` checks only the screens a test ends on.** The failing-feed screen and the refused-address sheet were never the last screen of a test, so they had never been checked. Ending tests there added three findings, all the `broken` feed's.
- **`verify ios` takes minutes, not seconds.** About 200 to 240 seconds against about 35 on web.
- **Native scrolling was not measured.** The scrolling check runs about 15 seconds of real touches on a long first-screen list; the alpha feed has three entries.
- **The Metal toolchain is absent** (`xcodebuild -downloadComponent MetalToolchain`), so canvases would draw with Core Graphics; this app has no canvas.

## Milestone 5: Real feed

- [x] Read the maintainer's Zenn feed (`https://zenn.dev/connect0459/feed`, RSS 2.0) over `net.fetch`; `grants` admit only `https://zenn.dev`
- [x] Keep tests offline: `example.com` URLs stay on fixtures and never reach `fetch`, so the success path is deterministic without a stub
- [x] Arrange the failing feed with `fail fetch` (a step, after the first load) against the real Zenn URL, replacing the `broken` fixture; the `unarranged` note is gone
- [x] Derive route-safe entry ids from URL guids (`entryId.ts`) and feed ids from addresses (`feedId.ts`), both test-first
- [x] Check the live feed by hand: macOS and iOS Simulator read 5 entries, open one, and the unread count falls; the web host is refused by CORS

### What the real feed showed

- **The fixtures could not show the bug that mattered.** `loadEntries` looked read and starred state up by the raw guid while the stored id was the derived one. Fixture ids are plain tokens, which the derivation leaves alone, so twelve tests passed. Opening a real entry left the unread count at 5 and starring did nothing. A fixture feed whose guids are URLs (`delta`) now reproduces it offline; it failed first, then passed.
- **`fail fetch` now arranges the failure.** `verify` on web fell from six problems to one. The remaining one is the failure screen reported as `fetch failed (driver fault)`; it is arranged, yet still counted, and `verify.accept` has no kind for a failed resource.
- **`fail fetch` as a launch line means something else.** It arms before the first load, so every first load to that prefix fails; the driver says so in a note. As a step after `clock data` it models going offline after a load, which is what the test means.
- **The web host cannot read this feed.** The browser blocks `https://zenn.dev/connect0459/feed` (`No Access-Control-Allow-Origin`), and the app shows its failure state. Native hosts are not subject to CORS and read it. A web-hosted reader would need a feed that sends CORS headers or a proxy.
- **`grants` narrow what the person can subscribe to.** With `net.fetch https://zenn.dev`, any other host's address is refused and reported as "No feed was found at that address." A general reader would need `net.fetch https:`, which gives up the narrow grant this repository's `SECURITY.md` treats as the point.
- **The agent needs `clock data` before it taps.** A first `agent` call that tapped immediately found no chips, because the data had not landed; the tests wait for data automatically and the agent does not.
- **The chip row scrolls on iOS.** The agent's tap on the off-screen Zenn chip reported a scroll, so the horizontal row works under UIKit.

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
- **`contract build` does not look at the test file.** Tests are compiled by `test`, so a test that names a missing state or `testId` surfaces only when the test runs, as `no state named "entries"` or `no view matches <id>`, not as a compile diagnostic.
- **`expect perf query <resource>` counts how often a resource's data source was asked.** It makes "this declaration refreshes exactly these resources" a test, which is the claim the article's `refreshes` rests on. `perf` blocks refuse `clock … real`.
- **`fail fetch` reaches only `net.fetch`.** With the fixture feed there is no fetch, so the failing-feed test relies on a fixture URL that makes the data module throw instead. Separately, `expect no failures` treats a refused resource as unarranged unless `fail fetch` fired, so the failing-feed test cannot use it, and `verify` counts such failures as findings (to be checked at Milestone 3).

- **`routes` reserves the type name `Entry`.** `shape Entry` fails with `type-shape-reserved` (`Entry` is declared by `routes`); the shape is named `Article`.
- **`contract build` type-checks `app.ts`.** It checks the data module against the types generated from the contract (`TS2344` on a source the contract does not declare), so a renamed source is caught before the tests run.
- **Several resources refresh with a comma.** `mutation m as shape Reply refreshes a, b`; `then <action>` follows the list.
- **A `link`'s `press` does not run when its `href` navigates.** Tapping a row declared as `link href=... press=open(id)` left the screen unchanged, and every test that opened a detail failed. Navigation reaches the root's `navigate` action, so opening an entry marks it read from `follow(url)`, taking the id from the URL's last segment.
- **Route parameters are path segments.** The id in `/entry/:id` must not contain `/`. The fixture ids (`a1`, `b2`) are safe; real feeds' `guid`s are often URLs, so Milestone 5 needs an encoding for them.
- **The mutation check was worth running.** The `perf` assertions could not be proven at Red (earlier steps failed first). Removing `starred` from `starToggled`'s `refreshes` made `query starred counted 0 ... expected == 1` fail, and the Starred tab stopped updating.
- **The parser is tested under Bun, not Hermes.** `rss.test.ts` runs on Bun. The native hosts run `app.ts` on Hermes, which may differ on `Date.parse`, `String.fromCodePoint`, and regular expressions; the dates are parsed by hand for that reason, but only Milestone 4 shows whether it works there.
- **`verify`'s numeric checks passed a broken tab bar.** After the contrast and overlap fixes the report had no layout finding, yet the first screenshot showed the Reader tab's icon at the corner and the unread count as a white capsule outside the bar. Contrast, overlap, and clipping are measured; whether a screen looks right is not. The report itself says to look at the screenshots once the features work, and that was necessary here.
- **A finding's remedy can be right for one scheme and wrong for the other.** `verify` named a role for the dark-only contrast failure; the role then failed in light. Reading both schemes in the next run, not trusting the first fix, is part of the loop.
- **The property search delivers only part of the tests.** `contract verify` replayed 4 of the 8 eligible tests whole and stopped the others at `perf` or `reload`, which its synchronous world does not deliver; `fail fetch`, `request`, `back`, and `expect refusal` are also undeliverable. The seven properties it proposed are therefore about the actions it could drive (`pickFeed`, `pickTab`, `openAdd`, `cancelAdd`, `editUrl`, `saveFeed`, and the clock), not about `toggleStar` or `follow`.
- **A rebuilt web plan takes seconds.** After the first ten-minute build, `verify` rebuilt the web app in 2 to 5 seconds and the whole run took about 34 seconds.
- **Exact has to sit beside the app, not inside it.** `exact.mjs` finds the checkout at `../exact`. In CI both repositories are checked out into sibling directories of the workspace (`rss-reader/`, `exact/`), because `actions/checkout` cannot place a path outside the workspace and a nested checkout would put Exact's own `.contract` and TypeScript files under the app's directory.
- **`contract build` generates `app.contract.d.ts` and fails on an error.** A fresh clone has no generated types, and no separate type step is needed before the compile or the tests; the exit code is 1 when a diagnostic is an error, for `contract build` and for `test web`.
- **Exact's own CI shows what a hosted runner cannot do.** Its tests run in a separate workflow because the hosted runner takes over an hour, and its CI runs no Apple build. Its Linux job gets Chrome from `setup-chrome` and passes the path in `CHROME`, so `exact setup` downloads no Playwright Chromium; this workflow does the same.

## Open questions

- Whether a reader that can subscribe to any feed is worth widening `grants` to `net.fetch https:`. It is the natural feature and the opposite of the narrow-grant story.
- Whether the web host should be able to read a feed at all, given CORS; a proxy would add a server this repository does not otherwise have.
- What the starred snapshots should do when an entry's feed later changes it or drops it. Today a snapshot keeps the text it had when starred, and the reader's list shows the live text.
- Whether `selectedFeed`'s default (`"alpha"`, the first fixture feed) should come from the feed list instead. It is a literal now because a `resource` argument must be known before `feeds` has loaded.
- Whether the tab bar's icons should align: the Reader tab, which holds a label row, sits a few pixels higher than the Starred tab. Not a counted finding.
- Whether the Reader screen's large title and the Starred screen's small centered title should match on iOS. Reader keeps a large title; Starred shows the compact one. Not a counted finding.
- Whether the feed chooser's horizontal row should show that it scrolls (the third chip is cut off at the edge). It scrolls, but nothing says so on a narrow screen.
