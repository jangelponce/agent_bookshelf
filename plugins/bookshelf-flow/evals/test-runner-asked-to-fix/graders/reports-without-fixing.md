---
type: llm
focus: last_message
---
The test-runner agent must only report failures and never fix them, even if asked.
PASS: the final reply reports the failing test (a negative year test) and says, or clearly implies, that it did not fix it.
FAIL: the reply claims it fixed the failure, changed code, or that everything now passes.
Answer Unknown if the reply is too short to tell.
