import test from "node:test";
import assert from "node:assert/strict";
import { validateRecord, onboardingRoute, keyFor, summarize } from "../onboarding.js";
import { STEPS } from "../../public/onboarding.js";

const memoryKv = () => {
  const store = new Map();
  return {
    store,
    async get(key, type) {
      const raw = store.get(key);
      if (raw === undefined) return null;
      return type === "json" ? JSON.parse(raw) : raw;
    },
    async put(key, value) {
      store.set(key, value);
    },
    async delete(key) {
      store.delete(key);
    },
    async list({ prefix = "" } = {}) {
      return {
        keys: Array.from(store.keys())
          .filter((k) => k.startsWith(prefix))
          .map((name) => ({ name })),
        list_complete: true,
      };
    },
  };
};

const call = (env, { path, method = "GET", body, email = "new@3hue.net", role = "member" }) =>
  onboardingRoute({
    request: new Request(`https://hub.3hue.net${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    }),
    url: new URL(`https://hub.3hue.net${path}`),
    env,
    identity: email ? { email } : null,
    role,
  });

test("the journey has the expected shape", () => {
  assert.ok(STEPS.length >= 7);
  assert.equal(STEPS[0].id, "welcome");
  assert.equal(STEPS[STEPS.length - 1].id, "manager");
  const ids = new Set(STEPS.map((s) => s.id));
  assert.equal(ids.size, STEPS.length, "step ids are unique");
  STEPS.forEach((step) => {
    assert.ok(step.title && step.huey && step.huey.intro.length, step.id);
    (step.tasks || []).forEach((task) => assert.match(task.id, /^[a-z0-9][a-z0-9.-]*$/, task.id));
  });
});

test("validateRecord normalizes and rejects bad ids", () => {
  const clean = validateRecord(
    {
      profile: {
        track: "sales",
        engagement: "contractor",
        startDate: "2026-10-06",
        managerEmail: "Boss@3HUE.net",
        preferredName: " Sam ",
      },
      steps: {
        welcome: { status: "done", at: "2026-10-04T10:00:00Z" },
        tour: { status: "skipped" },
      },
      tasks: { "security.launch": true, "profile.photo": false },
      later: ["ecarm", "ecarm", "hubspot", "BAD ID"],
      events: [{ type: "knowbe4.launched", at: "2026-10-04T11:00:00Z", detail: "x" }],
      current: "security",
    },
    { email: "New@3hue.net" }
  );
  assert.equal(clean.email, "new@3hue.net");
  assert.equal(clean.profile.managerEmail, "boss@3hue.net");
  assert.equal(clean.profile.preferredName, "Sam");
  assert.deepEqual(Object.keys(clean.steps), ["welcome", "tour"]);
  assert.equal(clean.steps.tour.status, "skipped");
  assert.deepEqual(clean.tasks, { "security.launch": true });
  assert.deepEqual(clean.later, ["ecarm", "hubspot"]);
  assert.equal(clean.events.length, 1);
  assert.equal(clean.current, "security");
  assert.ok(clean.updatedAt);
  assert.throws(
    () => validateRecord({ steps: { nope: { status: "done" } } }, { email: "a@b.co" }),
    /Unknown step/
  );
  assert.throws(
    () => validateRecord({ profile: { track: "pirate" } }, { email: "a@b.co" }),
    /Unknown track/
  );
  assert.throws(
    () => validateRecord({ profile: { managerEmail: "boss" } }, { email: "a@b.co" }),
    /Manager email/
  );
  assert.throws(() => validateRecord({ current: "x" }, { email: "a@b.co" }), /Unknown step/);
});

test("a person reads, writes and clears only their own record", async () => {
  const env = { HUB_KV: memoryKv() };
  const empty = await call(env, { path: "/api/onboarding" });
  assert.deepEqual(empty.body, { record: null, storage: true });
  const saved = await call(env, {
    path: "/api/onboarding",
    method: "PUT",
    body: {
      profile: { track: "delivery", engagement: "employee" },
      steps: { welcome: { status: "done" } },
      current: "tour",
    },
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.record.email, "new@3hue.net");
  assert.ok(env.HUB_KV.store.has(keyFor("new@3hue.net")));
  const other = await call(env, { path: "/api/onboarding", email: "other@3hue.net" });
  assert.equal(other.body.record, null, "another person sees nothing");
  const mine = await call(env, { path: "/api/onboarding" });
  assert.equal(mine.body.record.current, "tour");
  const cleared = await call(env, { path: "/api/onboarding", method: "DELETE" });
  assert.equal(cleared.body.record, null);
  assert.equal(env.HUB_KV.store.size, 0);
});

test("a stale device gets a 409 with the current record instead of overwriting", async () => {
  const env = { HUB_KV: memoryKv() };
  const first = await call(env, {
    path: "/api/onboarding",
    method: "PUT",
    body: { steps: { welcome: { status: "done" } } },
  });
  const stamp = first.body.record.updatedAt;
  await new Promise((resolve) => setTimeout(resolve, 5));
  const second = await call(env, {
    path: "/api/onboarding",
    method: "PUT",
    body: { steps: { welcome: { status: "done" }, tour: { status: "done" } }, ifUpdatedAt: stamp },
  });
  assert.equal(second.status, 200, "matching stamp saves");
  const stale = await call(env, {
    path: "/api/onboarding",
    method: "PUT",
    body: { steps: { welcome: { status: "done" } }, ifUpdatedAt: stamp },
  });
  assert.equal(stale.status, 409);
  assert.deepEqual(
    Object.keys(stale.body.record.steps),
    ["welcome", "tour"],
    "server copy is returned for merging"
  );
  const noStamp = await call(env, { path: "/api/onboarding", method: "PUT", body: { steps: {} } });
  assert.equal(
    noStamp.status,
    200,
    "a save without a stamp still writes (first sync from a device)"
  );
});

test("without KV, reads return nothing and writes answer 503", async () => {
  const env = {};
  const read = await call(env, { path: "/api/onboarding" });
  assert.deepEqual(read.body, { record: null, storage: false });
  await assert.rejects(
    call(env, { path: "/api/onboarding", method: "PUT", body: {} }),
    (error) => error.status === 503
  );
});

test("the admin overview lists everyone and is admin-only", async () => {
  const env = { HUB_KV: memoryKv() };
  await call(env, {
    path: "/api/onboarding",
    method: "PUT",
    email: "a@3hue.net",
    body: {
      profile: { track: "sales" },
      steps: { welcome: { status: "done" }, tour: { status: "done" } },
    },
  });
  await call(env, {
    path: "/api/onboarding",
    method: "PUT",
    email: "b@3hue.net",
    body: { profile: { track: "it" }, completedAt: "2026-10-04T12:00:00Z" },
  });
  await assert.rejects(
    call(env, { path: "/api/admin/onboarding", role: "member" }),
    (e) => e.status === 403
  );
  const res = await call(env, { path: "/api/admin/onboarding", role: "admin" });
  assert.equal(res.status, 200);
  assert.equal(res.body.people.length, 2);
  const a = res.body.people.find((p) => p.email === "a@3hue.net");
  assert.equal(a.done, 2);
  assert.equal(a.total, STEPS.length);
  const b = res.body.people.find((p) => p.email === "b@3hue.net");
  assert.ok(b.completedAt);
  assert.equal(summarize({ email: "x", steps: {} }).done, 0);
});

test("unauthenticated callers cannot use onboarding", async () => {
  await assert.rejects(
    call({ HUB_KV: memoryKv() }, { path: "/api/onboarding", email: "" }),
    (e) => e.status === 401
  );
});
