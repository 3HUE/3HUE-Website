(() => {
  const modals = document.querySelectorAll("[data-modal]");
  const openButtons = document.querySelectorAll("[data-open-modal]");
  const closeButtons = document.querySelectorAll("[data-close-modal]");
  const outcomeStore = new Map();

  const openModal = (id) => {
    const modal = document.querySelector(`[data-modal="${id}"]`);
    if (!modal) return;
    if (!outcomeStore.has(id)) {
      outcomeStore.set(id, Math.random() > 0.35 ? "approved" : "denied");
    }
    modal.classList.add("open");
    document.body.classList.add("modal-open");
  };

  const closeModal = (modal) => {
    modal.classList.remove("open");
    if (![...modals].some((m) => m.classList.contains("open"))) {
      document.body.classList.remove("modal-open");
    }
  };

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-open-modal");
      openModal(id);
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      if (modal) closeModal(modal);
    });
  });

  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  const stepFlows = document.querySelectorAll("[data-stepper]");
  stepFlows.forEach((flow) => {
    const steps = flow.querySelectorAll("[data-step]");
    let currentIndex = 0;
    const modal = flow.closest(".modal");
    const modalId = modal ? modal.getAttribute("data-modal") : "default";
    const getOutcome = () => {
      if (!outcomeStore.has(modalId)) {
        outcomeStore.set(modalId, Math.random() > 0.35 ? "approved" : "denied");
      }
      return outcomeStore.get(modalId);
    };

    const updateSteps = () => {
      steps.forEach((step, index) => {
        step.classList.toggle("active", index === currentIndex);
      });
    };

    const setStatus = (step, state, label) => {
      const line = step.querySelector("[data-status-line]");
      const pill = step.querySelector("[data-status-pill]");
      const text = step.querySelector("[data-status-text]");
      if (line) line.setAttribute("data-state", state);
      if (text) text.textContent = label;
      if (pill) {
        pill.classList.remove("pending", "approved", "denied");
        pill.classList.add(state);
        pill.textContent = label;
      }
    };

    const runMockStatus = (step) => {
      const isFinal = step.hasAttribute("data-final");
      const isReview = step.hasAttribute("data-review");
      if (!step.querySelector("[data-status-line]")) return;
      const outcome = getOutcome();
      if (isReview) {
        setStatus(step, "pending", "Verifying");
        setTimeout(() => {
          const label = outcome === "approved" ? "Approved" : "Denied";
          setStatus(step, outcome, label);
        }, 1200);
        return;
      }
      if (isFinal) {
        const label = outcome === "approved" ? "Approved" : "Denied";
        setStatus(step, outcome, label);
        return;
      }
      setStatus(step, "pending", "In Progress");
      setTimeout(() => {
        setStatus(step, "approved", "Complete");
      }, 900);
    };

    const maybeRunStatus = () => {
      const activeStep = steps[currentIndex];
      if (activeStep) runMockStatus(activeStep);
    };

    flow.querySelectorAll("[data-next]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentIndex = Math.min(currentIndex + 1, steps.length - 1);
        updateSteps();
        maybeRunStatus();
      });
    });

    flow.querySelectorAll("[data-prev]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentIndex = Math.max(currentIndex - 1, 0);
        updateSteps();
        maybeRunStatus();
      });
    });

    flow.querySelectorAll("[data-reset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentIndex = 0;
        updateSteps();
        maybeRunStatus();
      });
    });

    updateSteps();
    maybeRunStatus();
  });
})();
