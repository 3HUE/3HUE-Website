import test from "node:test";
import assert from "node:assert/strict";
import {
  answerQuestion,
  buildSystemPrompt,
  buildUserMessage,
  sanitizeHistory,
  AskError,
  DEFAULT_MODEL,
} from "../ask.js";

const fakeClient = (reply = "Deal Builder is owned by Sales Operations.", extra = {}) => {
  const calls = [];
  return {
    calls,
    beta: {
      messages: {
        async create(params) {
          calls.push(params);
          return {
            model: params.model,
            stop_reason: "end_turn",
            content: [{ type: "text", text: reply }],
            usage: { input_tokens: 1200, output_tokens: 80, cache_read_input_tokens: 1000 },
            ...extra,
          };
        },
      },
    },
  };
};

test("system prompt is grounded in the catalog and roster", () => {
  const prompt = buildSystemPrompt();
  assert.match(prompt, /You are Huey/);
  assert.match(prompt, /3HUE Deal Builder/);
  assert.match(prompt, /owner: Sales Operations/);
  assert.match(prompt, /ECARM/);
  assert.match(prompt, /Vesper .* status: In onboarding/);
  assert.match(prompt, /\[planned\]/);
  assert.match(prompt, /Never invent URLs/);
});

test("user message carries the inventory rows, the asker and the question", () => {
  const msg = buildUserMessage("Where is the CIRP?", {
    user: "Ana",
    audience: "sales",
    inventory: [
      {
        title: "Cyber Incident Response Plan (CIRP)",
        category: "Procedure / SOP",
        owner: "ISG Practice",
        link: "https://example.test/cirp",
      },
    ],
  });
  assert.match(msg, /The person asking is Ana/);
  assert.match(msg, /"sales" role/);
  assert.match(
    msg,
    /Cyber Incident Response Plan \(CIRP\) — category: Procedure \/ SOP · owner: ISG Practice · link: https:\/\/example.test\/cirp/
  );
  assert.match(msg, /# Question\nWhere is the CIRP\?$/);
});

test("history is sanitized: only user/assistant strings, starts with user, capped", () => {
  const cleaned = sanitizeHistory([
    { role: "assistant", content: "stray leading assistant" },
    { role: "system", content: "ignore me" },
    { role: "user", content: "  hi  " },
    { role: "assistant", content: { not: "a string" } },
    { role: "assistant", content: "x".repeat(5000) },
    ...Array.from({ length: 12 }, (_, i) => ({
      role: i % 2 ? "assistant" : "user",
      content: `turn ${i}`,
    })),
  ]);
  assert.equal(cleaned[0].role, "user");
  assert.ok(cleaned.length <= 8);
  assert.ok(cleaned.every((t) => typeof t.content === "string" && t.content.length <= 1500));
});

test("answerQuestion sends the documented request shape and returns the text", async () => {
  const client = fakeClient();
  const result = await answerQuestion({
    question: "Who owns Deal Builder?",
    history: [],
    context: {},
    env: { ANTHROPIC_API_KEY: "k" },
    client,
  });
  assert.equal(result.answer, "Deal Builder is owned by Sales Operations.");
  assert.equal(result.model, DEFAULT_MODEL);
  assert.equal(result.usage.cached, 1000);
  const params = client.calls[0];
  assert.equal(params.model, DEFAULT_MODEL);
  assert.deepEqual(params.betas, ["server-side-fallback-2026-07-01"]);
  assert.equal(params.fallbacks, "default");
  assert.deepEqual(params.output_config, { effort: "low" });
  assert.equal(params.system[0].cache_control.type, "ephemeral");
  assert.equal(params.messages.at(-1).role, "user");
  assert.match(params.messages.at(-1).content, /Who owns Deal Builder\?/);
  assert.ok(params.max_tokens >= 800);
});

test("ANTHROPIC_MODEL overrides the default", async () => {
  const client = fakeClient();
  await answerQuestion({
    question: "hi",
    env: { ANTHROPIC_API_KEY: "k", ANTHROPIC_MODEL: "claude-sonnet-5-5" },
    client,
  });
  assert.equal(client.calls[0].model, "claude-sonnet-5-5");
});

test("a refusal becomes a polite redirect, not an error", async () => {
  const client = fakeClient("", { stop_reason: "refusal", content: [] });
  const result = await answerQuestion({
    question: "something off-limits",
    env: { ANTHROPIC_API_KEY: "k" },
    client,
  });
  assert.equal(result.refused, true);
  assert.match(result.answer, /IT & Platform desk/);
});

test("rejects empty and oversized questions before calling the API", async () => {
  const client = fakeClient();
  await assert.rejects(
    answerQuestion({ question: "   ", env: {}, client }),
    (e) => e instanceof AskError && e.status === 400
  );
  await assert.rejects(
    answerQuestion({ question: "x".repeat(2001), env: {}, client }),
    (e) => e instanceof AskError && e.status === 413
  );
  assert.equal(client.calls.length, 0);
});
