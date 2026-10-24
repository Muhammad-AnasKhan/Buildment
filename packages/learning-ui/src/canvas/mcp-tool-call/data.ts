import type { SequenceSpec } from "../renderers/sequence/types";

// AI Engineering Interview course, chapter 8.2 "MCP: tools over a protocol".
// Tamer's Wadi Labs knowledge bot lists and calls the tool on its local
// runbook server. It claims only what the chapter states: host, client and
// server roles, JSON-RPC 2.0, tools/list and tools/call, isError on a failed
// call, and the stdio and streamable HTTP transports. See spec.md.
export const mcpToolCall: SequenceSpec = {
  kind: "sequence",
  title: "One tool over MCP: list, check, call",
  purpose: "Follow one tool from discovery to a failed call and a good one, and see which step MCP leaves to your own code.",
  summary:
    "The client asks the runbook server for its tools with tools/list and passes the list to the host. The host sends the question and the tools to the model, which asks for search_runbooks. The host's own code decides whether the call is allowed; MCP does not. The client sends tools/call, and the result comes back with the same id. A call with an empty query comes back with isError set to true, and the model corrects it.",
  actors: [
    { name: "Model", sub: "chooses" },
    { name: "Host", sub: "the bot" },
    { name: "Client", sub: "1 per srv" },
    { name: "Server", sub: "runbooks" },
  ],
  steps: [
    {
      from: 2,
      to: 3,
      label: "tools/list",
      title: "Discover: ask the server for its tools",
      note: "Inside the host, one client manages the connection to the runbook server. This server is local, so the client starts it as a subprocess and talks over stdio. Every message is JSON-RPC 2.0.",
      chips: ["method: tools/list", "transport: stdio"],
    },
    {
      from: 3,
      to: 2,
      label: "name + schema",
      title: "The server describes its tool",
      note: "Each tool comes back with a name, a description and an inputSchema written in JSON Schema. The description is the server's own claim, not a promise.",
      chips: ["name: search_runbooks", "inputSchema: query (string)"],
    },
    {
      from: 2,
      to: 1,
      label: "tool list",
      title: "The host collects the tools",
      note: "The client hands the list to the host. A host that uses three servers runs three clients, one per server.",
    },
    {
      from: 1,
      to: 0,
      label: "question + tools",
      title: "The host asks the model",
      note: "An engineer asks: 'How do I restart the billing worker?' The host sends the question and the tool descriptions to the model.",
      chips: ["1 tool available"],
    },
    {
      from: 0,
      to: 1,
      label: "tool call request",
      title: "The model chooses a tool",
      note: "Tools are model-controlled: the model chooses to call one. It runs nothing itself; it returns the tool name and its arguments.",
      chips: ["search_runbooks", 'query: "restart the billing worker"'],
    },
    {
      from: 1,
      to: 1,
      label: "host checks call",
      tone: "warn",
      outcome: "your code",
      title: "Is this call allowed? Not MCP's question",
      note: "MCP carries the call; it does not decide whether this engineer may make it, or whether a person must confirm it first. The host's own code decides. A read-only runbook search is allowed here, so it goes ahead.",
      chips: ["allowed for this user?", "needs a person?"],
    },
    {
      from: 2,
      to: 3,
      label: "tools/call, id 7",
      title: "The client sends the call",
      note: "The host passes the call to the client for this server, which sends tools/call with the tool name and the arguments. Real requests also carry metadata, left out here.",
      chips: ["id: 7", "name: search_runbooks", 'query: "restart the billing worker"'],
    },
    {
      from: 3,
      to: 2,
      label: "result, id 7",
      tone: "good",
      outcome: "result",
      title: "The result comes back with the same id",
      note: "The result carries the same id and a content list, usually text: here, the runbook's restart steps.",
      chips: ["id: 7", "content: text"],
    },
    {
      from: 1,
      to: 0,
      label: "result as text",
      title: "The result goes into the model's context",
      note: "The host adds the text to the conversation. MCP moved the text; it did not clean it. Chapter 8.3 shows what happens when that text holds instructions.",
    },
    {
      from: 2,
      to: 3,
      label: "tools/call, id 8",
      title: "Another run: a call with an empty query",
      note: "In another run, the model asks for search_runbooks with an empty query. The call is well formed, so the server runs the tool.",
      chips: ["id: 8", 'query: ""'],
    },
    {
      from: 3,
      to: 2,
      label: "isError: true",
      tone: "bad",
      outcome: "tool failed",
      title: "The tool failed, inside a normal result",
      note: "The tool itself failed, so the result carries isError set to true with a message the model can read and correct. A broken request, such as an unknown tool name, would get a JSON-RPC error instead.",
      chips: ["id: 8", "isError: true", "content: the query is empty"],
    },
    {
      from: 0,
      to: 1,
      label: "corrected call",
      tone: "good",
      outcome: "fixed",
      title: "The model reads the error and tries again",
      note: "The host passes the error message to the model as text. The model asks again with a real query, and the call runs like the one with id 7.",
      chips: ['query: "billing worker"'],
    },
  ],
  tryThis: [
    "Before step 6, predict which part decides whether the call may run: the model, MCP or the host. Then check.",
    "Compare steps 8 and 11. Both are results with the same id as their request. What tells the model that the second one failed?",
  ],
  limits:
    "This is one local server over stdio and one tool. A remote server would use streamable HTTP, where each message is an HTTP POST to one endpoint; the methods and results look the same. Connection setup, resources, prompts and protocol metadata are left out, and the protocol changes over time.",
};
