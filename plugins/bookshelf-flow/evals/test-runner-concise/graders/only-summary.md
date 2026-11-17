---
type: llm
focus: last_message
---
The test-runner agent must return only the two summary lines (`tests: <passed>/<total>` and `typecheck: pass|fail`) when everything passes.
PASS: the final reply is just those two lines or very close to it, under 40 words, with no command transcript, logs or extra commentary.
FAIL: the reply includes test output, transcript, file listings or long explanations.
Answer Unknown if there is no final reply.
