# Skill Registry — libresbc-fork

Generated: 2026-05-26

## User Skills

| Skill | Trigger |
|-------|---------|
| `issue-creation` | When creating a GitHub issue, reporting a bug, or requesting a feature |
| `branch-pr` | When creating a pull request, opening a PR, or preparing changes for review |
| `work-unit-commits` | When implementing a change, preparing commits, splitting PRs, or planning chained/stacked PRs |
| `comment-writer` | When drafting or posting feedback, review comments, maintainer replies, Slack messages, or GitHub comments |
| `judgment-day` | When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" |
| `chained-pr` | When a PR would exceed 400 changed lines, when planning chained/stacked PRs or reviewable slices |
| `cognitive-doc-design` | When writing guides, READMEs, RFCs, onboarding docs, architecture docs, or review-facing documentation |
| `go-testing` | When writing Go tests, using teatest, or adding test coverage |

## Project Conventions

No project-level CLAUDE.md, AGENTS.md, or .cursorrules found.

Global CLAUDE.md applies:
- Conventional commits only, no AI attribution
- Never build after changes
- Use bat/rg/fd/sd/eza over cat/grep/find/sed/ls
- Upstream-first philosophy: generic fixes go as PRs to hnimminh/libresbc; client-specific changes live in local/customizations

## Compact Rules

### PR workflow (branch-pr + issue-creation)
- Every PR MUST link an approved GitHub issue
- No blank issues — use bug report or feature request template
- Every PR must have exactly one `type:*` label

### Commits (work-unit-commits)
- Structure commits as deliverable work units, not file-type batches
- Tests and docs travel beside the code they verify
- Keep PRs under 400 changed lines (reviewer cognitive budget)

### Large PRs (chained-pr)
- If estimated diff > 400 lines: split into chained/stacked PRs
- Each slice must be independently reviewable and deployable

### Code quality
- No comments unless WHY is non-obvious
- No error handling for impossible scenarios
- No backwards-compatibility shims for removed code
