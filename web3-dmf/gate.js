const REGISTER_KEY = "web3-dmp-registered-session";

const isRegistered = () => sessionStorage.getItem(REGISTER_KEY) === "true";

const getModal = () => document.getElementById("registration-modal");
const getOverlay = () => document.getElementById("assessment-lock");

const openModal = () => {
  const modal = getModal();
  if (!modal) return;
  resetFormState();
  modal.classList.add("open");
  document.body.classList.add("modal-open");
};

const closeModal = () => {
  const modal = getModal();
  if (!modal) return;
  modal.classList.remove("open");
  document.body.classList.remove("modal-open");
};

const unlockAssessment = () => {
  const overlay = getOverlay();
  if (overlay) overlay.classList.add("hidden");
  document.querySelectorAll("[data-assessment-input]").forEach((input) => {
    input.removeAttribute("disabled");
  });
};

const lockAssessment = () => {
  const overlay = getOverlay();
  if (overlay) overlay.classList.remove("hidden");
  document.querySelectorAll("[data-assessment-input]").forEach((input) => {
    input.setAttribute("disabled", "disabled");
  });
};

const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

const resetFormState = () => {
  const form = document.getElementById("registration-form");
  const success = document.getElementById("registration-success");
  if (form) {
    form.reset();
    form.style.display = "grid";
  }
  if (success) {
    success.classList.remove("show");
  }
  document.querySelectorAll("[data-error-for]").forEach((el) => {
    el.textContent = "";
  });
};

const showErrors = (errors) => {
  document.querySelectorAll("[data-error-for]").forEach((el) => {
    const key = el.getAttribute("data-error-for");
    el.textContent = errors[key] || "";
  });
};

const showSuccess = () => {
  const form = document.getElementById("registration-form");
  const success = document.getElementById("registration-success");
  if (form) form.style.display = "none";
  if (success) success.classList.add("show");
};

const initRegistration = () => {
  if (!isRegistered()) {
    lockAssessment();
  } else {
    unlockAssessment();
  }

  document.querySelectorAll("[data-requires-registration]").forEach((el) => {
    el.addEventListener("click", (event) => {
      if (isRegistered()) return;
      event.preventDefault();
      openModal();
    });
  });

  const modal = getModal();
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
  }

  document.querySelectorAll("[data-close-registration]").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  const form = document.getElementById("registration-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const payload = {
        name: String(data.get("name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        org: String(data.get("org") || "").trim(),
        role: String(data.get("role") || "").trim(),
      };

      const errors = {};
      if (!payload.name) errors.name = "Full name is required.";
      if (!payload.email) {
        errors.email = "Work email is required.";
      } else if (!validateEmail(payload.email)) {
        errors.email = "Enter a valid email.";
      }
      if (!payload.org) errors.org = "Organization is required.";
      if (!payload.role) errors.role = "Role is required.";

      showErrors(errors);
      if (Object.keys(errors).length > 0) return;

      sessionStorage.setItem(REGISTER_KEY, "true");
      showSuccess();
      unlockAssessment();
    });
  }
};

window.addEventListener("DOMContentLoaded", initRegistration);
