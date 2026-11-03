import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const hook = resolve(import.meta.dirname, '../../.claude/hooks/block-publish.mjs')

function runRaw(stdin: string) {
  const res = spawnSync('node', [hook], { input: stdin, encoding: 'utf8' })
  return { status: res.status, stderr: res.stderr }
}

function run(command: string, cwd = process.cwd()) {
  return runRaw(JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd }))
}

let dir: string

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'block-publish-'))
  writeFileSync(join(dir, 'pending.json'), JSON.stringify({ commit_id: 'abc', comments: [] }))
  writeFileSync(join(dir, 'submit.json'), JSON.stringify({ commit_id: 'abc', event: 'APPROVE' }))
  writeFileSync(join(dir, 'broken.json'), '{not json')
  writeFileSync(join(dir, 'list.json'), '[]')
  writeFileSync(join(dir, 'gql-ok.json'), JSON.stringify({ query: '{ viewer { login } }' }))
  writeFileSync(
    join(dir, 'gql-merge.json'),
    JSON.stringify({ query: 'mutation { mergePullRequest(input: {pullRequestId: "x"}) { clientMutationId } }' }),
  )
})

afterAll(() => rmSync(dir, { recursive: true, force: true }))

const blocked = (command: string, cwd?: string) => {
  const res = run(command, cwd)
  expect(res.status, command).toBe(2)
  expect(res.stderr.trim().split('\n')).toHaveLength(1)
  expect(res.stderr).toMatch(/GitHub UI/)
}

const allowed = (command: string, cwd?: string) => {
  expect(run(command, cwd).status, command).toBe(0)
}

describe('gh pr subcommands', () => {
  it.each([
    'gh pr review 1 --approve',
    'gh pr review 1',
    'gh pr review --comment -b "x" 1',
    'gh pr comment 1 --body hi',
    'gh pr merge 1 --squash',
    'gh -R owner/repo pr merge 1',
    'gh pr --repo owner/repo review 1',
    '/opt/homebrew/bin/gh pr merge 1',
  ])('blocks %s', (command) => blocked(command))

  it.each([
    'gh pr view 1',
    'gh pr view 1 --json number,title,headRefOid',
    'gh pr diff 1',
    'gh pr list',
    'gh pr checkout 1',
    'gh issue comment 1',
  ])('allows %s', (command) => allowed(command))
})

describe('gh api publishing endpoints', () => {
  it.each([
    'gh api repos/o/r/pulls/1/reviews/99/events --method POST -f event=APPROVE',
    'gh api repos/o/r/pulls/1/reviews/99/events -X POST',
    'gh api repos/o/r/pulls/1/comments -f body=hi -f path=a -F line=1',
    'gh api repos/o/r/pulls/1/comments/5/replies -f body=hi',
    'gh api repos/o/r/issues/1/comments --method POST -f body=hi',
    'gh api repos/o/r/pulls/1/merge --method PUT',
    'gh api repos/{owner}/{repo}/pulls/1/reviews -f event=COMMENT',
    'gh api repos/o/r/pulls/1/reviews --method POST -F event=APPROVE',
    'gh api repos/o/r/pulls/1/reviews --method POST --field event=APPROVE',
    'gh api repos/o/r/pulls/1/reviews --method POST --raw-field=event=APPROVE',
    'gh api repos/o/r/pulls/1/reviews -fevent=APPROVE',
    'gh api https://api.github.com/repos/o/r/pulls/1/reviews/9/events -X POST',
  ])('blocks %s', (command) => blocked(command))

  it.each([
    'gh api repos/o/r/pulls/1',
    'gh api repos/{owner}/{repo}/pulls/1/files --paginate --jq ".[] | .filename"',
    'gh api repos/o/r/pulls/1/comments',
    'gh api repos/o/r/issues/1/comments --method GET',
    'gh api repos/o/r/pulls/1/reviews',
    'gh api repos/o/r/pulls/1/reviews --method POST -f commit_id=abc',
    'gh api repos/o/r/pulls/1/merge',
  ])('allows %s', (command) => allowed(command))
})

describe('gh api --input handling', () => {
  it('allows a pending-review payload without event', () => {
    allowed('gh api repos/o/r/pulls/1/reviews --method POST --input pending.json', dir)
    allowed(`gh api repos/o/r/pulls/1/reviews --method POST --input ${join(dir, 'pending.json')}`, '/')
    allowed('gh api repos/o/r/pulls/1/reviews --input pending.json', dir)
  })

  it('blocks a payload with an event key', () => {
    blocked('gh api repos/o/r/pulls/1/reviews --method POST --input submit.json', dir)
    blocked('gh api repos/o/r/pulls/1/reviews --input=submit.json', dir)
  })

  it('fails closed when the input file is missing, unparseable or not an object', () => {
    blocked('gh api repos/o/r/pulls/1/reviews --method POST --input missing.json', dir)
    blocked('gh api repos/o/r/pulls/1/reviews --method POST --input broken.json', dir)
    blocked('gh api repos/o/r/pulls/1/reviews --method POST --input list.json', dir)
    blocked('gh api repos/o/r/pulls/1/reviews --method POST --input -', dir)
  })

  it('resolves relative input paths against the hook cwd', () => {
    blocked('gh api repos/o/r/pulls/1/reviews --method POST --input submit.json', dir)
    blocked('gh api repos/o/r/pulls/1/reviews --method POST --input pending.json', tmpdir())
  })
})

describe('gh api graphql', () => {
  const gql = (query: string) => `gh api graphql -f query='${query}'`

  it.each([
    'mutation { submitPullRequestReview(input: {pullRequestReviewId: "x", event: APPROVE}) { clientMutationId } }',
    'mutation { mergePullRequest(input: {pullRequestId: "x"}) { clientMutationId } }',
    'mutation { addComment(input: {subjectId: "x", body: "hi"}) { clientMutationId } }',
    'mutation { addPullRequestReview(input: {pullRequestId: "x", event: COMMENT}) { clientMutationId } }',
    'mutation {\n  submitPullRequestReview(input: {pullRequestReviewId: "x"}) { clientMutationId }\n}',
  ])('blocks %s', (query) => blocked(gql(query)))

  it('blocks a graphql payload supplied through --input', () => {
    blocked('gh api graphql --input gql-merge.json', dir)
    blocked('gh api graphql --input missing.json', dir)
  })

  it.each([
    '{ viewer { login } }',
    'mutation { addPullRequestReview(input: {pullRequestId: "x"}) { clientMutationId } }',
  ])('allows %s', (query) => allowed(gql(query)))

  it('allows a read-only graphql payload supplied through --input', () => {
    allowed('gh api graphql --input gql-ok.json', dir)
  })
})

describe('chained and wrapped commands', () => {
  it.each([
    'npm test && gh pr merge 1',
    'false || gh pr merge 1',
    'echo hi; gh pr review 1 --approve',
    'echo hi\ngh pr review 1 --approve',
    'echo hi &\ngh pr comment 1 -b x',
    'GH_TOKEN=abc gh pr merge 1',
    'FOO=1 BAR="a b" gh pr review 1',
    'env GH_TOKEN=abc gh pr merge 1',
    'cd sub && gh pr merge 1',
    'echo $(gh pr merge 1)',
    'echo `gh pr merge 1`',
    '(gh pr merge 1)',
    '{ gh pr merge 1; }',
    'bash -c "gh pr merge 1"',
    "sh -c 'echo x && gh pr review 1'",
    'eval "gh pr merge 1"',
    'gh pr view 1 && gh api repos/o/r/pulls/1/reviews/2/events -X POST',
    'gh pr \\\nreview 1',
  ])('blocks %s', (command) => blocked(command))

  it.each([
    'npm test && gh pr view 1',
    'git fetch origin pull/1/head; gh pr diff 1',
    'echo "gh pr merge 1"',
    "echo 'gh pr review 1'",
    'git commit -m "docs: mention gh pr merge"',
    'rg "gh pr merge" .',
    'ls -la',
  ])('allows %s', (command) => allowed(command))
})

describe('non-Bash and malformed input', () => {
  it('allows other tools', () => {
    const res = runRaw(JSON.stringify({ tool_name: 'Read', tool_input: { file_path: 'gh pr merge 1' } }))
    expect(res.status).toBe(0)
  })

  it('allows a Bash call without a command', () => {
    expect(runRaw(JSON.stringify({ tool_name: 'Bash', tool_input: {} })).status).toBe(0)
  })

  it('fails closed on malformed JSON that looks like a Bash call', () => {
    const res = runRaw('{"tool_name": "Bash", "tool_input": {"command": "gh pr merge 1"')
    expect(res.status).toBe(2)
    expect(res.stderr).toMatch(/GitHub UI/)
  })

  it('allows malformed JSON that does not look like a Bash call', () => {
    expect(runRaw('{"tool_name": "Read", ').status).toBe(0)
    expect(runRaw('').status).toBe(0)
    expect(runRaw('garbage').status).toBe(0)
  })
})
