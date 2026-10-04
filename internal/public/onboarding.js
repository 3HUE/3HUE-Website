/* 3HUE Enterprise Hub — the onboarding journey Huey walks every new employee and contractor through.
 *
 * Pure data and pure helpers (no DOM): the browser renders it, the Worker validates progress against
 * it and briefs Huey with it. Progress itself lives in KV (worker/onboarding.js) so a person can
 * close the hub on a laptop and pick the journey up on a phone.
 *
 * Shape
 *   TRACKS / ENGAGEMENTS   who the person is; drives which tiles, tasks and teammates they meet
 *   STEPS                  the walkthrough, in order. Each step has Huey's lines, a renderer `kind`
 *                          and a task list. Tasks may be limited to a track or an engagement type.
 *   TOUR_STOPS             the spotlight tour of the hub (selectors resolved by portal.js)
 *   helpers                toolkitFor, laterFor, agentsFor, tasksFor, stepsFor, managerMessage
 */
export const ONBOARDING_VERSION = 1;

export const TRACKS = [
  {
    id: "leadership",
    label: "Leadership",
    blurb: "Partners and practice leads. The whole picture: revenue, delivery, security posture.",
  },
  {
    id: "sales",
    label: "Sales & Marketing",
    blurb: "Pipeline, outbound, content and the brand. ECARM is home base.",
  },
  {
    id: "delivery",
    label: "Delivery & Consulting",
    blurb: "Engagements, assessments and client work. Teamwork and the Playbooks are home base.",
  },
  {
    id: "finance",
    label: "Finance & Admin",
    blurb: "Books, billing, pay and the paperwork that keeps the firm honest.",
  },
  {
    id: "it",
    label: "IT & Engineering",
    blurb: "Tenant, cloud, security consoles and the platforms 3HUE builds.",
  },
];

export const ENGAGEMENTS = [
  {
    id: "employee",
    label: "Employee",
    blurb: "Full-time or part-time 3HUE team member.",
  },
  {
    id: "contractor",
    label: "Contractor",
    blurb: "Independent or partner-firm consultant working a 3HUE engagement.",
  },
];

/* Everyone lives in these. */
export const CORE_TILES = [
  "m365-home",
  "outlook",
  "teams",
  "sharepoint-internal",
  "teamwork-projects",
  "it-help",
  "directory",
  "calendar",
];

/* The systems a person on each track opens every week. Order matters: most important first. */
export const TRACK_TOOLKIT = {
  leadership: [
    "ecarm",
    "deal-builder",
    "playbooks",
    "assessments",
    "quickbooks",
    "hubspot",
    "trust-center",
    "teamwork-desk",
  ],
  sales: ["ecarm", "hubspot", "apollo", "deal-builder", "playbooks", "calendly", "linkedin", "ga4"],
  delivery: [
    "teamwork-projects",
    "teamwork-desk",
    "teamwork-spaces",
    "teamwork-chat",
    "playbooks",
    "assessments",
    "deal-builder",
    "lucid",
  ],
  finance: [
    "quickbooks",
    "payroll",
    "ecarm",
    "repo-quickbooks",
    "teamwork-projects",
    "deal-builder",
  ],
  it: [
    "entra",
    "m365-admin",
    "intune",
    "defender",
    "purview",
    "cloudflare",
    "github-org",
    "aws",
    "azure",
  ],
};

/* Deep dives worth a proper sitting later — saved to the person's "Later" list in step 3. */
export const TRACK_LATER = {
  leadership: [
    "dmf",
    "framework-library",
    "partner-portal",
    "experience-tour",
    "bigquery",
    "semrush",
    "status-m365",
  ],
  sales: [
    "gtm",
    "search-console",
    "google-business",
    "semrush",
    "ubersuggest",
    "windsor",
    "bigquery",
    "framework-library",
    "partner-portal",
    "instagram",
    "x",
  ],
  delivery: [
    "dmf",
    "framework-library",
    "experience-tour",
    "repo-teamwork",
    "wispr",
    "figma",
    "status-m365",
  ],
  finance: ["hubspot", "repo-sharepoint", "framework-library", "status-m365"],
  it: [
    "gcp",
    "bigquery",
    "anthropic-console",
    "resend",
    "claude-code",
    "entra-ca",
    "repo-cloudflare",
    "repo-github",
    "status-cloudflare",
    "status-azure",
  ],
};

/* Digital teammates each track will actually work with. Huey is everyone's first colleague. */
export const TRACK_AGENTS = {
  leadership: ["huey", "ava", "marlowe", "theo", "vesper"],
  sales: ["huey", "marlowe", "aries", "vera", "theo", "trevor"],
  delivery: ["huey", "quinn", "sage", "ava"],
  finance: ["huey", "vera", "sage"],
  it: ["huey", "vesper", "sage"],
};

/* Links used by checklist items. Tiles are preferred (admins can fix them in the hub); raw hrefs
 * are for Microsoft pages that have no tile of their own. */
const MY_ACCOUNT = "https://myaccount.microsoft.com/";
const SECURITY_INFO = "https://mysignins.microsoft.com/security-info";
const OUTLOOK_SIGNATURE = "https://outlook.office.com/mail/options/mail/messageContent";
const INTUNE_PORTAL = "https://portal.manage.microsoft.com/";

export const STEPS = [
  {
    id: "welcome",
    title: "Welcome aboard",
    short: "Welcome",
    icon: "sparkles",
    estimate: "3 min",
    kind: "profile",
    huey: {
      intro: [
        "Welcome to 3HUE. I'm Huey — concierge for this building and, for the next little while, your onboarding buddy.",
        "I'll walk you through everything in order, and I save your place as we go. Close the laptop, pick it up on your phone tomorrow — it'll be right where you left it.",
        "First, three quick questions so I show you the right rooms.",
      ],
      done: "Good. Now I know which doors to open for you.",
    },
    tasks: [],
  },
  {
    id: "tour",
    title: "Tour of the hub",
    short: "Tour",
    icon: "map",
    estimate: "4 min",
    kind: "tour",
    huey: {
      intro: [
        "Before anything else: where things are. This hub is the front door to every 3HUE system, document and teammate.",
        "The tour spotlights each part of the screen and takes about four minutes. You can rerun it any time from the Administration-free zone known as your Home page.",
      ],
      done: "That's the building. Everything else is a door inside it.",
    },
    tasks: [{ id: "tour.complete", label: "Take the spotlight tour of the hub", auto: "tour" }],
  },
  {
    id: "toolkit",
    title: "Your toolkit",
    short: "Toolkit",
    icon: "grid",
    estimate: "5 min",
    kind: "toolkit",
    huey: {
      intro: [
        "Here are the systems someone in your role actually opens every week. Not the whole catalog — the shortlist.",
        "Pin the ones you'll use daily and they'll sit at the top of your Home page. The deeper tools I've parked on a Later list for you; no one expects you to learn them in week one.",
      ],
      done: "Shortlist pinned, deep dives parked. That's how the people who look organised do it.",
    },
    tasks: [
      { id: "toolkit.pin", label: "Pin at least three tiles you'll use daily", auto: "favorites" },
      {
        id: "toolkit.later",
        label: "Skim the Later list — just so you know it exists",
        optional: true,
      },
    ],
  },
  {
    id: "security",
    title: "Security awareness training",
    short: "Security",
    icon: "shield",
    estimate: "45 min",
    kind: "security",
    tile: "knowbe4",
    huey: {
      intro: [
        "Now the one everybody does before anything else: security awareness training in KnowBe4. 3HUE sells security — we'd look a bit silly getting phished.",
        "I can show you where it lives in the hub and let you launch it yourself, or I can open it for you right now. Either way, sign in with your @3hue.net account and work through every module assigned to you.",
        "Come back here when you're done and tick the box. I'll keep your place.",
      ],
      done: "Training done. You're now officially harder to fool than the average inbox.",
    },
    tasks: [
      {
        id: "security.launch",
        label: "Launch KnowBe4 and sign in with your @3hue.net account",
        auto: "launch",
      },
      { id: "security.modules", label: "Complete every module assigned to you" },
      {
        id: "security.policy",
        label: "Read the Information Security Policy",
        tile: "infosec-policy",
      },
      {
        id: "security.cirp",
        label: "Know where the Cyber Incident Response Plan lives",
        tile: "cirp",
        optional: true,
      },
      {
        id: "security.aup",
        label: "Acknowledge the acceptable-use terms that come with contractor access",
        engagement: "contractor",
      },
    ],
    attest: {
      id: "security.attest",
      label: "I completed all of the KnowBe4 modules assigned to me.",
    },
  },
  {
    id: "profile",
    title: "Complete your Microsoft 365 profile",
    short: "Profile",
    icon: "user",
    estimate: "10 min",
    kind: "checklist",
    tile: "m365-account",
    huey: {
      intro: [
        "Next, make yourself findable. Your Microsoft 365 profile feeds Teams, Outlook and the directory — a photo and a title save everyone a round of 'who is this?'.",
        "Each item below opens the exact page you need. Tick them off as you go.",
      ],
      done: "Profile complete. People can now put a face to the name in the meeting.",
    },
    tasks: [
      {
        id: "profile.photo",
        label: "Upload a clear headshot (Teams, Outlook and the directory all use it)",
        href: MY_ACCOUNT,
      },
      {
        id: "profile.details",
        label: "Check your job title, department and location are right",
        href: MY_ACCOUNT,
      },
      {
        id: "profile.phone",
        label: "Add your mobile number so colleagues can reach you",
        href: MY_ACCOUNT,
      },
      {
        id: "profile.mfa",
        label: "Set up Microsoft Authenticator for sign-in",
        href: SECURITY_INFO,
      },
      {
        id: "profile.signature",
        label: "Add the 3HUE email signature in Outlook",
        href: OUTLOOK_SIGNATURE,
        tile: "brand-kit",
      },
      {
        id: "profile.teams",
        label: "Set your Teams status message and quiet hours",
        tile: "teams",
      },
      { id: "profile.pronouns", label: "Add your pronouns", href: MY_ACCOUNT, optional: true },
    ],
  },
  {
    id: "dayone",
    title: "Ready for day one",
    short: "Day one",
    icon: "calendar",
    estimate: "10 min",
    kind: "checklist",
    huey: {
      intro: [
        "Last stretch of setup. These are the small things that make the first real day feel like the third.",
        "Some depend on your role and whether you're an employee or a contractor — I've already filtered the list.",
      ],
      done: "You're set up. Day one is going to feel like you've been here a week — in a good way.",
    },
    tasks: [
      {
        id: "dayone.teams",
        label: "Join the General channel and your team's channel in Teams",
        tile: "teams",
      },
      {
        id: "dayone.calendar",
        label: "Open your calendar and accept the invites waiting for you",
        tile: "calendar",
      },
      {
        id: "dayone.assets",
        label: "Open Internal Assets and skim the folder structure",
        tile: "sharepoint-internal",
      },
      {
        id: "dayone.help",
        label: "Find the IT & Internal Help Desk — it's where to go when something's stuck",
        tile: "it-help",
      },
      {
        id: "dayone.intune",
        label: "Enrol your device in Intune so it meets the security baseline",
        href: INTUNE_PORTAL,
        engagement: "employee",
      },
      {
        id: "dayone.device",
        label:
          "Confirm your device meets the baseline: disk encryption on, screen lock, current OS",
        engagement: "contractor",
      },
      {
        id: "dayone.scope",
        label: "Confirm your access scope and end date with your engagement lead",
        engagement: "contractor",
      },
      {
        id: "dayone.ecarm",
        label: "Open ECARM and find your pipeline view",
        tile: "ecarm",
        track: ["sales", "leadership"],
      },
      {
        id: "dayone.hubspot",
        label: "Sign in to HubSpot and check your contact ownership",
        tile: "hubspot",
        track: ["sales"],
      },
      {
        id: "dayone.teamwork",
        label: "Open Teamwork Projects and find your first engagement",
        tile: "teamwork-projects",
        track: ["delivery"],
      },
      {
        id: "dayone.playbooks",
        label: "Skim the Engagement Playbooks before your first client call",
        tile: "playbooks",
        track: ["delivery", "sales"],
      },
      {
        id: "dayone.quickbooks",
        label: "Confirm your QuickBooks access level",
        tile: "quickbooks",
        track: ["finance"],
      },
      {
        id: "dayone.entra",
        label: "Check your admin roles in the Entra admin center",
        tile: "entra",
        track: ["it"],
      },
      {
        id: "dayone.trust",
        label: "Read the Trust Center the way a client would",
        tile: "trust-center-sec",
        track: ["leadership"],
      },
      {
        id: "dayone.install",
        label: "Add the hub to your phone's home screen so the field is one tap away",
        optional: true,
      },
    ],
  },
  {
    id: "team",
    title: "Meet your teammates",
    short: "Team",
    icon: "users",
    estimate: "3 min",
    kind: "team",
    optional: true,
    huey: {
      intro: [
        "One more introduction: the digital workforce. We're AI colleagues with names, faces and actual jobs — not chatbots bolted onto a page.",
        "These are the ones you'll work with most. Open a profile to see what each of us does, what's live and what's still in onboarding — yes, some of us are new too.",
      ],
      done: "Introductions made. We'll see you around the building.",
    },
    tasks: [
      { id: "team.profiles", label: "Open at least one teammate's profile", auto: "profile" },
      {
        id: "team.ask",
        label: "Ask me something — anything — in the chat",
        auto: "ask",
        optional: true,
      },
    ],
  },
  {
    id: "manager",
    title: "Tell your manager you're ready",
    short: "Manager",
    icon: "send",
    estimate: "1 min",
    kind: "manager",
    huey: {
      intro: [
        "Last step, and the easiest. Let your manager know you've finished setup so they can plan your first week properly.",
        "I've written the update for you — it lists what you completed and when. Send it by email or Teams, whichever your manager actually reads.",
      ],
      done: "Sent. Onboarding complete — welcome to 3HUE, properly this time.",
    },
    tasks: [
      {
        id: "manager.sent",
        label: "Send the ready-for-day-one update to your manager",
        auto: "notify",
      },
    ],
  },
];

export const STEP_IDS = STEPS.map((step) => step.id);

/* Spotlight tour. Selectors are resolved in the browser; `mobile` wins under 1025px when present. */
export const TOUR_STOPS = [
  {
    id: "home",
    route: "home",
    target: "[data-nav] .nav-item",
    mobile: "[data-bottom='home']",
    title: "Home",
    text: "Home is your morning page: what you've pinned, what you opened last, announcements and your teammates. I live here too.",
  },
  {
    id: "sections",
    target: "[data-nav] .nav-group:nth-of-type(2)",
    mobile: "[data-bottom='browse']",
    title: "The workspace",
    text: "Every 3HUE system sorted into rooms: Core Systems, Business Systems, Infrastructure, Customer Acquisition, Security, People and Documents. Counts show how many tiles are in each.",
  },
  {
    id: "search",
    target: "[data-cmd]",
    mobile: "[data-bottom='search']",
    title: "Search anything",
    text: "Type any app, document, teammate or action. On a keyboard, ⌘K (or Ctrl+K, or just /) opens it from anywhere. Fastest way around the building.",
  },
  {
    id: "ask",
    target: "[data-ask]",
    mobile: "[data-bottom='ask']",
    title: "Ask me",
    text: "Stuck? Ask in plain words: who owns a system, how to get access, where a policy lives. I answer from the catalog, and from 3HUE's knowledge when the AI line is on.",
  },
  {
    id: "team",
    target: "[data-nav] .nav-group:nth-of-type(3)",
    mobile: "[data-bottom='team']",
    title: "Digital Workforce",
    text: "The AI colleagues on the roster — who's on duty, what each one does, and how to reach them. You'll meet the ones on your team later in the journey.",
  },
  {
    id: "tile",
    route: "home",
    target: "#main .tile",
    title: "A tile",
    text: "Each tile is a system. Click to open it; the star pins it to Home; the ⋯ menu requests access, copies the link or reports a problem. Chips tell you the login type and the owner.",
  },
  {
    id: "viewas",
    target: "[data-audience]",
    desktopOnly: true,
    title: "View as",
    text: "Filter the hub to what a role needs. Leave it on Everyone for the full picture.",
  },
  {
    id: "identity",
    target: "[data-identity]",
    desktopOnly: true,
    title: "You",
    text: "Who you're signed in as, your role in the hub, and the sign-out door. Daylight/Midnight is just above it.",
  },
  {
    id: "documents",
    route: "home",
    target: "#main .browse-grid",
    title: "Documents & Artifacts",
    text: "Policies, templates, playbooks and where each secure repository lives. The inventory tells you the owner, classification and the next review date.",
  },
];

/* ───────────────────────── helpers ───────────────────────── */
const uniq = (list) => Array.from(new Set(list.filter(Boolean)));

export const trackById = (id) => TRACKS.find((track) => track.id === id) || null;
export const engagementById = (id) => ENGAGEMENTS.find((item) => item.id === id) || null;

/** Tiles for step 3: track shortlist first, then the core set everyone uses. */
export const toolkitFor = (track) => uniq([...(TRACK_TOOLKIT[track] || []), ...CORE_TILES]);
export const laterFor = (track) => uniq(TRACK_LATER[track] || []);
export const agentsFor = (track) => uniq(TRACK_AGENTS[track] || ["huey", "ava"]);

/** Steps that apply to a profile (optional steps still show; they can be skipped). */
export const stepsFor = () => STEPS;

/** A step's tasks filtered to the person's track and engagement type. */
export const tasksFor = (step, profile = {}) =>
  (step.tasks || []).filter((task) => {
    if (task.track && !task.track.includes(profile.track)) return false;
    if (task.engagement && task.engagement !== profile.engagement) return false;
    return true;
  });

/** Required tasks of a step are those not marked optional. */
export const requiredTasks = (step, profile) =>
  tasksFor(step, profile).filter((task) => !task.optional);

export const stepStatus = (record, stepId) =>
  ((record && record.steps && record.steps[stepId]) || {}).status || "";

export const progressOf = (record) => {
  const done = STEPS.filter((step) => stepStatus(record, step.id) === "done").length;
  const skipped = STEPS.filter((step) => stepStatus(record, step.id) === "skipped").length;
  return { done, skipped, total: STEPS.length, percent: Math.round((done / STEPS.length) * 100) };
};

/** The first step that is neither done nor skipped, or null when the journey is complete. */
export const nextStep = (record) =>
  STEPS.find((step) => !["done", "skipped"].includes(stepStatus(record, step.id))) || null;

/** The ready-for-day-one update sent to the manager. Plain text; works in mail and Teams. */
export const managerMessage = ({ name, email, record, dateLabel = (iso) => iso.slice(0, 10) }) => {
  const profile = (record && record.profile) || {};
  const track = trackById(profile.track);
  const engagement = engagementById(profile.engagement);
  const lines = STEPS.filter((step) => step.id !== "manager").map((step) => {
    const status = stepStatus(record, step.id);
    const at = ((record.steps || {})[step.id] || {}).at;
    const mark = status === "done" ? "Done" : status === "skipped" ? "Skipped" : "Open";
    return `- ${step.title}: ${mark}${at ? ` (${dateLabel(at)})` : ""}`;
  });
  const training = (record.tasks || {})["security.attest"]
    ? "Security awareness training attested as complete."
    : "";
  return [
    `Hi${profile.managerName ? ` ${profile.managerName.split(" ")[0]}` : ""},`,
    "",
    `${name || email} has finished Enterprise Hub onboarding and is ready for day one${profile.startDate ? ` (start date ${profile.startDate})` : ""}.`,
    "",
    `Track: ${track ? track.label : "not set"} · ${engagement ? engagement.label : ""}`.trim(),
    "",
    "Checklist:",
    ...lines,
    training ? "" : null,
    training || null,
    "",
    "Sent from the 3HUE Enterprise Hub (hub.3hue.net) with Huey.",
  ]
    .filter((line) => line !== null)
    .join("\n");
};
