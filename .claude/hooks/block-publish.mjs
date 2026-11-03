#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

const WRAPPERS = new Set([
  '{', '!', 'if', 'then', 'else', 'elif', 'do', 'while', 'until',
  'time', 'command', 'builtin', 'exec', 'nohup', 'sudo', 'env',
])
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh'])
const VALUE_FLAGS = new Set([
  '-X', '--method', '-f', '--raw-field', '-F', '--field', '-H', '--header', '--input',
  '--jq', '-q', '--template', '-t', '--cache', '--hostname', '-p', '--preview', '-R', '--repo',
])
const FIELD_FLAGS = new Set(['-f', '-F', '--field', '--raw-field'])
const BLOCKED_PR_SUBCOMMANDS = new Set(['review', 'comment', 'merge'])
const SEPARATORS = ';&|\n()`'

function splitSegments(command) {
  const segments = []
  let tokens = []
  let word = ''
  let inWord = false
  let quote = null
  const endWord = () => {
    if (inWord) tokens.push(word)
    word = ''
    inWord = false
  }
  const endSegment = () => {
    endWord()
    if (tokens.length) segments.push(tokens)
    tokens = []
  }
  for (let i = 0; i < command.length; i++) {
    const c = command[i]
    if (quote === "'") {
      if (c === "'") quote = null
      else word += c
      continue
    }
    if (quote === '"') {
      if (c === '"') quote = null
      else if (c === '\\' && '"\\$`'.includes(command[i + 1] ?? '')) word += command[++i]
      else word += c
      continue
    }
    if (c === "'" || c === '"') {
      quote = c
      inWord = true
    } else if (c === '\\') {
      const next = command[++i]
      if (next === undefined) break
      if (next !== '\n') {
        word += next
        inWord = true
      }
    } else if (SEPARATORS.includes(c)) {
      endSegment()
    } else if (/\s/.test(c)) {
      endWord()
    } else {
      word += c
      inWord = true
    }
  }
  endSegment()
  return segments
}

function parseArgs(args) {
  const positional = []
  const flags = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--') {
      positional.push(...args.slice(i + 1))
      break
    }
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=')
      if (eq > 0) flags.push({ name: arg.slice(0, eq), value: arg.slice(eq + 1) })
      else if (VALUE_FLAGS.has(arg)) flags.push({ name: arg, value: args[++i] ?? '' })
      else flags.push({ name: arg })
    } else if (arg.startsWith('-') && arg.length > 1) {
      const name = arg.slice(0, 2)
      if (!VALUE_FLAGS.has(name)) flags.push({ name })
      else flags.push({ name, value: arg.length > 2 ? arg.slice(2) : (args[++i] ?? '') })
    } else {
      positional.push(arg)
    }
  }
  return { positional, flags }
}

function readJsonObject(file, cwd) {
  try {
    const parsed = JSON.parse(readFileSync(resolve(cwd, file), 'utf8'))
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function checkApi(positional, flags, cwd) {
  const endpoint = (positional[1] ?? '')
    .replace(/^https?:\/\/[^/]+/, '')
    .split('?')[0]
    .replace(/^\/+/, '')
  const fields = flags.filter((f) => FIELD_FLAGS.has(f.name))
  const input = flags.findLast((f) => f.name === '--input')
  const explicit = flags.findLast((f) => f.name === '-X' || f.name === '--method')
  const method = explicit ? explicit.value.toUpperCase() : fields.length || input ? 'POST' : 'GET'

  if (endpoint === 'graphql') {
    let body = [...flags.map((f) => f.value ?? ''), ...positional.slice(2)].join('\n')
    if (input) {
      try {
        body += '\n' + readFileSync(resolve(cwd, input.value), 'utf8')
      } catch {
        return 'a graphql call whose --input file cannot be read'
      }
    }
    if (/\b(submitPullRequestReview|mergePullRequest|addComment)\b/.test(body)) {
      return 'a graphql mutation that submits, comments on or merges a pull request'
    }
    if (/\baddPullRequestReview\b/.test(body) && /\bevent\b/.test(body)) {
      return 'a graphql addPullRequestReview with an event'
    }
    return null
  }

  if (/\/pulls\/[^/]+\/reviews\/[^/]+\/events$/.test(endpoint)) return 'submitting a pull request review'
  if (method === 'GET') return null
  if (/\/pulls\/[^/]+\/merge$/.test(endpoint)) return 'merging a pull request'
  if (/\/(pulls|issues)\/[^/]+\/comments(\/|$)/.test(endpoint)) return 'posting a pull request comment'
  if (/\/pulls\/[^/]+\/reviews$/.test(endpoint)) {
    if (fields.some((f) => (f.value ?? '').split('=')[0] === 'event')) return 'creating a review with an event'
    const payload = input ? readJsonObject(input.value, cwd) : undefined
    if (input && (payload === null || 'event' in payload)) {
      return 'creating a review whose --input has an event or cannot be verified'
    }
  }
  return null
}

function checkGh(args, cwd) {
  const { positional, flags } = parseArgs(args)
  if (positional[0] === 'pr' && BLOCKED_PR_SUBCOMMANDS.has(positional[1])) return `gh pr ${positional[1]}`
  if (positional[0] === 'api') return checkApi(positional, flags, cwd)
  return null
}

function checkSegment(tokens, cwd) {
  let i = 0
  let wrapped = false
  while (i < tokens.length) {
    const token = tokens[i]
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(token)) i++
    else if (WRAPPERS.has(token)) {
      wrapped = true
      i++
    } else if (wrapped && token.startsWith('-')) i++
    else break
  }
  if (i >= tokens.length) return null
  const program = basename(tokens[i])
  const rest = tokens.slice(i + 1)
  if (program === 'gh') return checkGh(rest, cwd)
  if (program === 'eval') return checkCommand(rest.join(' '), cwd)
  if (SHELLS.has(program)) {
    const c = rest.findIndex((t) => /^-[a-z]*c$/.test(t))
    if (c !== -1 && rest[c + 1] !== undefined) return checkCommand(rest[c + 1], cwd)
  }
  return null
}

function checkCommand(command, cwd) {
  for (const tokens of splitSegments(command)) {
    const reason = checkSegment(tokens, cwd)
    if (reason) return reason
  }
  return null
}

function block(what) {
  process.stderr.write(
    `Blocked: ${what} would publish on GitHub. Only create a pending review; the human submits it from the GitHub UI.\n`,
  )
  process.exit(2)
}

const raw = readFileSync(0, 'utf8')
let input
try {
  input = JSON.parse(raw)
} catch {
  if (/"tool_name"\s*:\s*"Bash"/.test(raw)) block('an unparseable Bash tool call')
  process.exit(0)
}

if (input?.tool_name === 'Bash' && typeof input.tool_input?.command === 'string') {
  const cwd = typeof input.cwd === 'string' ? input.cwd : process.cwd()
  const reason = checkCommand(input.tool_input.command, cwd)
  if (reason) block(reason)
}
process.exit(0)
