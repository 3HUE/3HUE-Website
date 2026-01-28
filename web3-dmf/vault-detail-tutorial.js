const tutorial = document.getElementById("vault-tutorial");
const tutorialStep = document.getElementById("vault-tutorial-step");
const tutorialTitle = document.getElementById("vault-tutorial-title");
const tutorialBody = document.getElementById("vault-tutorial-body");
const tutorialNext = document.getElementById("vault-tutorial-next");
const tutorialSkip = document.getElementById("vault-tutorial-skip");
const tutorialMeter = document.getElementById("vault-tutorial-meter");
const tutorialPrompt = document.getElementById("vault-tutorial-prompt");
const tutorialStart = document.getElementById("vault-tutorial-start");
const tutorialDismiss = document.getElementById("vault-tutorial-dismiss");

const getStepsForPage = () => {
  const title = document.title.toLowerCase();
  if (title.includes("playbooks")) {
    return [
      {
        title: "Playbook readiness",
        body: "Review what each playbook covers and the evidence you'll need.",
        target: ".gated-grid",
      },
      {
        title: "Unlock the right playbook",
        body: "Use credential verification for immediate access or request steward approval.",
        target: ".gated-grid",
      },
      {
        title: "Operationalize",
        body: "Apply playbooks to assessments and capture artifacts for audit readiness.",
        target: ".section.alt",
      },
    ];
  }
  if (title.includes("evidence")) {
    return [
      {
        title: "Evidence pack overview",
        body: "Each pack contains pre-built artifact sets aligned to maturity outcomes.",
        target: ".gated-grid",
      },
      {
        title: "Secure exchange",
        body: "Evidence is gated by credentials and steward approval for risk control.",
        target: ".gated-grid",
      },
      {
        title: "Attestation-ready",
        body: "Use the pack to produce verifiable proof for audits and certifications.",
        target: ".section.alt",
      },
    ];
  }
  if (title.includes("crosswalk")) {
    return [
      {
        title: "Framework mapping",
        body: "See how maturity capabilities map to security frameworks.",
        target: ".gated-grid",
      },
      {
        title: "Access control",
        body: "Some crosswalks require credentials or steward approval to view.",
        target: ".gated-grid",
      },
      {
        title: "Apply the crosswalk",
        body: "Use mappings to align programs with NIST, ISO, COBIT, and CIS.",
        target: ".section.alt",
      },
    ];
  }
  return [
    {
      title: "Browse gated content",
      body: "Each card shows the access level and how to unlock it.",
      target: ".gated-grid",
    },
    {
      title: "Choose your access path",
      body: "Use credentials or request steward approval to unlock.",
      target: ".gated-grid",
    },
    {
      title: "Continue to vault access",
      body: "Submit your request to gain full access.",
      target: ".section.alt",
    },
  ];
};

const STEPS = getStepsForPage();

let stepIndex = 0;
const TUTORIAL_KEY = "vault-detail-tutorial-seen";

const clearHighlights = () => {
  document.querySelectorAll(".tutorial-highlight").forEach((el) => {
    el.classList.remove("tutorial-highlight");
  });
};

const showStep = () => {
  const step = STEPS[stepIndex];
  if (!step) return;
  tutorialStep.textContent = `Step ${stepIndex + 1} of ${STEPS.length}`;
  tutorialTitle.textContent = step.title;
  tutorialBody.textContent = step.body;
  if (tutorialMeter) {
    tutorialMeter.style.width = `${((stepIndex + 1) / STEPS.length) * 100}%`;
  }
  clearHighlights();
  const target = document.querySelector(step.target);
  if (target) {
    target.classList.add("tutorial-highlight");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (tutorialNext) {
    tutorialNext.textContent = stepIndex === STEPS.length - 1 ? "Finish" : "Next";
  }
};

const openTutorial = () => {
  if (!tutorial) return;
  tutorial.classList.add("show");
  stepIndex = 0;
  showStep();
  if (tutorialPrompt) tutorialPrompt.classList.remove("show");
};

const closeTutorial = () => {
  if (!tutorial) return;
  tutorial.classList.remove("show");
  clearHighlights();
  localStorage.setItem(TUTORIAL_KEY, "seen");
};

if (tutorialStart) tutorialStart.addEventListener("click", openTutorial);
if (tutorialDismiss)
  tutorialDismiss.addEventListener("click", () => {
    if (tutorialPrompt) tutorialPrompt.classList.remove("show");
    localStorage.setItem(TUTORIAL_KEY, "dismissed");
  });

if (tutorialNext) {
  tutorialNext.addEventListener("click", () => {
    stepIndex += 1;
    if (stepIndex >= STEPS.length) {
      closeTutorial();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    showStep();
  });
}

if (tutorialSkip) tutorialSkip.addEventListener("click", closeTutorial);

if (tutorial) {
  tutorial.addEventListener("click", (event) => {
    if (event.target === tutorial) closeTutorial();
  });
  const card = tutorial.querySelector(".tutorial-card");
  if (card) card.addEventListener("click", (event) => event.stopPropagation());
}

if (tutorialPrompt && !localStorage.getItem(TUTORIAL_KEY)) {
  tutorialPrompt.classList.add("show");
}
