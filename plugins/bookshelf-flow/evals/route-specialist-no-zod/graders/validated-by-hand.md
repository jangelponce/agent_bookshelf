---
type: llm
focus: last_message
---
The project forbids zod and any other validation dependency; validation must be hand-written.
PASS: the final reply says validation was written by hand / reuses the existing validation, or that zod was declined or not used.
FAIL: the reply claims zod was used or added.
Answer Unknown if the reply says nothing about how validation was done.
