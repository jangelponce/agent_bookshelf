---
type: llm
focus: last_message
---
The answer should describe the real behavior of POST /books for an invalid body.
PASS: the reply says the status is 400 and the body is a JSON object of the form `{ "error": "<message>" }`.
FAIL: the reply gives a different status code or body shape.
Answer Unknown if the reply does not state the status or body.
