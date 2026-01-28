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

const STEPS = [
  {
    title: "Welcome to the Knowledge Vault",
    body: "Understand how gated access protects sensitive playbooks and evidence.",
    target: ".vault-hero",
  },
  {
    title: "Gated Content",
    body: "Preview locked resources and request access using credentials.",
    target: ".gated-grid",
  },
  {
    title: "Access Workflow",
    body: "Follow the approval and attestation steps for secure sharing.",
    target: "#roadmap",
  },
  {
    title: "Request Access",
    body: "Submit your credentials to unlock the vault.",
    target: "#cta",
  },
];

let stepIndex = 0;
const TUTORIAL_KEY = "vault-tutorial-seen";

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
