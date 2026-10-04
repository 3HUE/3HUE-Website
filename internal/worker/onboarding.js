/* Onboarding progress: one KV record per person (key onboarding:<email>) so Huey's walkthrough
 * resumes on any device. The signed-in user reads and writes only their own record; admins get a
 * progress overview. Step and track ids are validated against public/onboarding.js. */
import { STEPS, TRACKS, ENGAGEMENTS, ONBOARDING_VERSION } from "../public/onboarding.js";
import { HttpError, ROLES } from "./admin.js";

export const ONBOARDING_PREFIX = "onboarding:";
export const MAX_EVENTS = 100;
export const MAX_TASKS = 160;
export const MAX_LATER = 60;

const lower = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
const isIsoTime = (value) => !Number.isNaN(Date.parse(String(value || "")));
const now = () => new Date().toISOString();
const STEP_IDS = new Set(STEPS.map((step) => step.id));
const TRACK_IDS = new Set(TRACKS.map((track) => track.id));
const ENGAGEMENT_IDS = new Set(ENGAGEMENTS.map((item) => item.id));

export const keyFor = (email) => `${ONBOARDING_PREFIX}${lower(email)}`;

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** Validate and normalize a progress record sent by the browser. Throws 400 on bad input. */
export function validateRecord(input, { email }) {
  if (!input || typeof input !== "object")
    throw new HttpError(400, "Record must be a JSON object.");
  const profileIn = input.profile && typeof input.profile === "object" ? input.profile : {};
  const track = text(profileIn.track, 40);
  if (track && !TRACK_IDS.has(track)) throw new HttpError(400, `Unknown track "${track}".`);
  const engagement = text(profileIn.engagement, 40);
  if (engagement && !ENGAGEMENT_IDS.has(engagement))
    throw new HttpError(400, `Unknown engagement type "${engagement}".`);
  const startDate = text(profileIn.startDate, 10);
  if (startDate && !isIsoDate(startDate))
    throw new HttpError(400, "Start date must be YYYY-MM-DD.");
  const managerEmail = lower(text(profileIn.managerEmail, 120));
  if (managerEmail && !isEmail(managerEmail))
    throw new HttpError(400, "Manager email is not a valid address.");

  const steps = {};
  const stepsIn = input.steps && typeof input.steps === "object" ? input.steps : {};
  for (const [id, value] of Object.entries(stepsIn)) {
    if (!STEP_IDS.has(id)) throw new HttpError(400, `Unknown step "${id}".`);
    if (!value || typeof value !== "object") continue;
    const status = value.status === "skipped" ? "skipped" : value.status === "done" ? "done" : "";
    if (!status) continue;
    steps[id] = { status, at: isIsoTime(value.at) ? new Date(value.at).toISOString() : now() };
  }

  const tasks = {};
  const tasksIn = input.tasks && typeof input.tasks === "object" ? input.tasks : {};
  let taskCount = 0;
  for (const [id, value] of Object.entries(tasksIn)) {
    if (!/^[a-z0-9][a-z0-9.-]{0,63}$/.test(id)) throw new HttpError(400, `Bad task id "${id}".`);
    if (!value) continue;
    if (++taskCount > MAX_TASKS) throw new HttpError(400, "Too many tasks.");
    tasks[id] = true;
  }

  const laterIn = Array.isArray(input.later) ? input.later : [];
  const later = Array.from(
    new Set(laterIn.map((id) => text(id, 64)).filter((id) => /^[a-z0-9][a-z0-9-]*$/.test(id)))
  ).slice(0, MAX_LATER);

  const eventsIn = Array.isArray(input.events) ? input.events : [];
  const events = eventsIn
    .filter((event) => event && typeof event === "object" && typeof event.type === "string")
    .slice(-MAX_EVENTS)
    .map((event) => {
      const clean = {
        at: isIsoTime(event.at) ? new Date(event.at).toISOString() : now(),
        type: text(event.type, 40),
      };
      const detail = text(event.detail, 200);
      if (detail) clean.detail = detail;
      return clean;
    });

  const current = text(input.current, 40);
  if (current && !STEP_IDS.has(current)) throw new HttpError(400, `Unknown step "${current}".`);

  const record = {
    version: ONBOARDING_VERSION,
    email: lower(email),
    profile: {
      preferredName: text(profileIn.preferredName, 40),
      track,
      engagement,
      startDate,
      managerName: text(profileIn.managerName, 80),
      managerEmail,
    },
    steps,
    tasks,
    later,
    events,
    current,
    startedAt: isIsoTime(input.startedAt) ? new Date(input.startedAt).toISOString() : now(),
    updatedAt: now(),
    completedAt: isIsoTime(input.completedAt) ? new Date(input.completedAt).toISOString() : null,
    dismissedAt: isIsoTime(input.dismissedAt) ? new Date(input.dismissedAt).toISOString() : null,
    managerNotifiedAt: isIsoTime(input.managerNotifiedAt)
      ? new Date(input.managerNotifiedAt).toISOString()
      : null,
  };
  return record;
}

export async function getRecord(env, email) {
  if (!env.HUB_KV) return null;
  try {
    const doc = await env.HUB_KV.get(keyFor(email), "json");
    return doc && typeof doc === "object" ? doc : null;
  } catch (error) {
    return null;
  }
}

export const summarize = (record) => {
  const stepValues = Object.values(record.steps || {});
  return {
    email: record.email,
    preferredName: (record.profile || {}).preferredName || "",
    track: (record.profile || {}).track || "",
    engagement: (record.profile || {}).engagement || "",
    startDate: (record.profile || {}).startDate || "",
    managerEmail: (record.profile || {}).managerEmail || "",
    done: stepValues.filter((step) => step.status === "done").length,
    skipped: stepValues.filter((step) => step.status === "skipped").length,
    total: STEPS.length,
    current: record.current || "",
    startedAt: record.startedAt || null,
    updatedAt: record.updatedAt || null,
    completedAt: record.completedAt || null,
    managerNotifiedAt: record.managerNotifiedAt || null,
  };
};

/** Every person's progress (admins). KV list + get; fine for a firm-sized roster. */
export async function listRecords(env) {
  if (!env.HUB_KV) return [];
  const out = [];
  let cursor;
  do {
    const page = await env.HUB_KV.list({ prefix: ONBOARDING_PREFIX, cursor });
    for (const key of page.keys || []) {
      const doc = await env.HUB_KV.get(key.name, "json");
      if (doc && typeof doc === "object") out.push(summarize(doc));
      if (out.length >= 500) return out;
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  out.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  return out;
}

const readJson = async (request) => {
  const raw = await request.text();
  if (raw.length > 64 * 1024) throw new HttpError(413, "Request too large.");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    throw new HttpError(400, "Body must be JSON.");
  }
};

const requireStorage = (env) => {
  if (!env.HUB_KV)
    throw new HttpError(503, "Progress storage (HUB_KV) is not configured on this Worker.");
};

/** Handle /api/onboarding and /api/admin/onboarding. Returns { status, body } or null. */
export async function onboardingRoute({ request, url, env, identity, role }) {
  const path = url.pathname;
  const method = request.method;
  const email = lower(identity && identity.email);

  if (path === "/api/onboarding") {
    if (!email) throw new HttpError(401, "Sign in to track onboarding progress.");
    if (method === "GET") {
      return {
        status: 200,
        body: { record: await getRecord(env, email), storage: Boolean(env.HUB_KV) },
      };
    }
    if (method === "PUT") {
      requireStorage(env);
      const input = await readJson(request);
      const existing = await getRecord(env, email);
      // Optimistic concurrency: a device that loaded an older copy must merge, not overwrite.
      if (
        existing &&
        typeof input.ifUpdatedAt === "string" &&
        input.ifUpdatedAt &&
        existing.updatedAt &&
        input.ifUpdatedAt !== existing.updatedAt
      ) {
        return {
          status: 409,
          body: {
            error: "Your onboarding progress changed on another device. Merging the two.",
            record: existing,
          },
        };
      }
      const record = validateRecord(input, { email });
      await env.HUB_KV.put(keyFor(email), JSON.stringify(record));
      return { status: 200, body: { record } };
    }
    if (method === "DELETE") {
      requireStorage(env);
      await env.HUB_KV.delete(keyFor(email));
      return { status: 200, body: { record: null } };
    }
    throw new HttpError(405, "Onboarding accepts GET, PUT and DELETE.");
  }

  if (path === "/api/admin/onboarding" && method === "GET") {
    if (role !== ROLES.ADMIN && role !== ROLES.SUPER)
      throw new HttpError(403, "The onboarding overview requires the Admin role.");
    return { status: 200, body: { people: await listRecords(env) } };
  }
  return null;
}
