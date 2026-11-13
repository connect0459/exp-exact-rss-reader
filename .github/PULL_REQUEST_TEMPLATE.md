<!-- # PULL_REQUEST_TEMPLATE -->

<!-- Remove unnecessary sections to keep the review focused -->

## Related Links

- Issues
  - <!-- <https://github.com/connect0459/rss-reader/issues/xxx> -->
- PRs
  - <!-- <https://github.com/connect0459/rss-reader/pull/xxx> -->

## [Required] Overview

- Describe the problem being solved, its background, and what changes when this PR is merged.
- Links to specs, design documents, or other references are welcome.

```txt
It is difficult to review without knowing the specifications and background.
```

## Scope of Change

- [ ] `app.contract` (view, state, resources, mutations)
- [ ] `app.ts` (data module, grants)
- [ ] `app.test.contract` (tests)
- [ ] `app.json` (manifest)
- [ ] Tooling / CI
- [ ] Documentation

## Breaking Changes

- [ ] No breaking changes
- [ ] Breaking changes (describe below)

<!--
If this changes a `shape`, a `resource`/`mutation` signature, or the on-disk format of
`app:/data/*.json`, describe what breaks and why the breakage is justified.
-->

## Deferred Items and TODOs

- Items intentionally deferred and the reasons why.

```txt
If you deferred something due to time constraints, document it here.
Reviewers cannot tell whether something was intentionally skipped or overlooked
without this information.
```

## Test Items

- Describe any test considerations beyond `app.test.contract`.
- Note which hosts were validated (web / macOS / iOS Simulator) and whether `exact verify` is clean.

## [Required] Quality Checklist

**Please check all items before merging.**

- [ ] **Tests**: `./exact.mjs test web` passes
- [ ] **Verify**: `./exact.mjs verify` is clean for the hosts this change affects
- [ ] **Grants**: `grants` in `app.ts` lists only what the app actually reads, writes, or fetches
- [ ] **Reference Docs**: `docs/todo.md` is updated if this change resolves an open question or surfaces a new one

> **Important**: This checklist ensures quality. Please verify all items before requesting review.
