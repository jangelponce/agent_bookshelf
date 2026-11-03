---
name: review-pr
description: Review a GitHub pull request and leave verified, inline findings as a pending (draft) review that a human submits. Use when asked to review a PR or MR ("review PR 12", "revisa el PR", "check this pull request"). Not for reviewing local uncommitted changes.
argument-hint: "<pr-number>"
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*), Bash(gh api:*), Bash(git fetch:*), Bash(git show:*), Bash(npm test:*), Read, Grep, Glob
---

# Review a pull request

Target: PR `$ARGUMENTS` in the current repository. If no number is given, ask for it and stop.

The output of this skill is a **pending review on GitHub**, visible only to the reviewer. Publishing it is always the human's step: submitting, approving, commenting and merging are blocked by the project hook (`.claude/hooks/block-publish.mjs`). Do not try to work around that block.

## 1. Gather context

```bash
gh pr view <n> --json number,title,body,author,baseRefName,headRefName,headRefOid,url
gh pr diff <n>
gh api repos/{owner}/{repo}/pulls/<n>/files --paginate --jq '.[] | {filename, status, patch}'
git fetch origin pull/<n>/head
```

- Read the PR description and any linked issue to learn the intended outcome. Review against that outcome, not your own idea of the feature.
- Read changed files at the head commit with `git show <headRefOid>:<path>`, never from the local working tree (it may be on another branch).
- Read `CLAUDE.md`. Its rules are review criteria.

## 2. Look for findings

Check, in this order:

1. **Correctness**: wrong behavior, unhandled inputs, wrong status codes, broken contracts.
2. **Tests**: new behavior without a test, tests that cannot fail, removed assertions.
3. **Scope**: changes unrelated to the PR's stated outcome.
4. **Project rules**: violations of `CLAUDE.md`.
5. **Readability**: only when it makes the code hard to change. No style nits a formatter would fix.

## 3. Verify every finding (mandatory)

A finding that is not verified is dropped, not softened. For each candidate:

- Re-read the exact code at `headRefOid` and confirm the problem is real in that version.
- Prove it when it can be proven: write a failing test case, run `npm test`, or trace the call path. Note how it was verified.
- Confirm it was **caused by this PR**. Pre-existing problems go in the chat report as follow-ups, not as review comments.
- Confirm the target line is inside a diff hunk on the new side (`RIGHT`) of `patch`. GitHub rejects inline comments outside the diff.

## 4. Draft locally, then show the user

Write the draft to `.reviews/pr-<n>.json`:

```json
{
  "commit_id": "<headRefOid>",
  "comments": [
    { "path": "src/books/routes.ts", "line": 42, "side": "RIGHT", "body": "..." }
  ]
}
```

- No `event` field and no `body`: this creates a PENDING review with no summary comment.
- Use `start_line` + `line` for a multi-line range.

Comment rules:

- **One finding per comment**, anchored to the line it is about.
- 1-3 sentences: what is wrong, why it matters, the fix. No preamble, no praise, no hedging.
- Prefix with `blocking:` or `nit:`.
- When the fix is a few lines, include a GitHub suggestion block:
  ````
  ```suggestion
  fixed code
  ```
  ````
- Write in the PR's language (default English).
- Never write a summary comment listing what you checked.

Show the user a table (file:line, severity, finding, how verified) plus the follow-ups. **Stop and wait** for an explicit OK, or apply their edits to the JSON.

## 5. Create the pending review

Only after the user's OK:

```bash
gh api repos/{owner}/{repo}/pulls/<n>/reviews --method POST --input .reviews/pr-<n>.json
```

- If GitHub answers 422 because a pending review already exists, report it and stop. Do not delete the user's existing draft.
- If a comment fails because its line is outside the diff, move it to the nearest changed line or drop it, then retry once.

Finish with the PR URL and one line: "The review is pending. Open the PR's Files changed tab, then use Finish your review to submit it."
