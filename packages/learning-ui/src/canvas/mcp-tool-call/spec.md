# One tool over MCP

- **Slug:** `mcp-tool-call`
- **Course:** AI Engineering Interview, chapter 8.2 "MCP: tools over a protocol".
- **Teaching claim:** MCP standardises how a host lists and calls a server's tools; it does not decide which calls are safe.
- **Renderer:** sequence (export `mcpToolCall`; four lanes: Model, Host, Client, Server).

## Model

Only what chapter 8.2 states: host, client (one per server) and server roles; JSON-RPC 2.0 messages; `tools/list` returning `name`, `description` and `inputSchema`; `tools/call` with the tool name and arguments, answered with the same id and a `content` list; `isError: true` when the tool itself fails; a JSON-RPC error for a broken request such as an unknown tool name; stdio for a local server and streamable HTTP for a remote one. The example is Tamer's Wadi Labs runbook server with `search_runbooks` and the chapter's call id 7.

Steps (12): tools/list, tool and schema returned, list to host, question and tools to the model, the model's tool call request, the host's own check (allowed? needs a person?), tools/call id 7, result id 7, result into the context as text, another run with an empty query (id 8), `isError: true`, corrected call.

## Learning interaction

- **What this shows:** discovery, the host's check and two calls as messages between the four roles, with method names, ids and fields in chips.
- **Try this:** predict who decides whether a call may run before step 6; compare steps 8 and 11 and name what marks the failure.
- **What changed:** each step note says what crossed which boundary.
- **Limits:** one local server over stdio and one tool; streamable HTTP named in words; connection setup, resources, prompts and metadata left out; the protocol changes.

The chapter puts a predict (which part decides whether this call is allowed? Answer: the host's own code) right before the canvas and a transfer quiz in a new context (Najm Microfinance and an update tool over streamable HTTP) after it.

## QA

Labels are at most 18 characters, lane names at most 8 and subtitles at most 10. `frontend/tests/unit/canvas/agent-sequences-7-8.test.ts` runs the registry's label-fit loop at narrow and wide widths and checks that the only methods named are `tools/list` and `tools/call`. Check light and dark mode and the reader at 375px.
