/* Partner portal: the application questionnaire and the sign-in dialog, carried over from the previous site's main.js. The questionnaire submits by email (partners@3hue.net); the sign-in dialog is UI only until 3HUE wires the login endpoints. */
(() => {
  const partnerModal = document.querySelector("[data-partner-modal]");
  if (partnerModal) {
    const openButtons = Array.from(document.querySelectorAll("[data-partner-apply]"));
    const closeButtons = Array.from(partnerModal.querySelectorAll("[data-partner-modal-close]"));
    const form = partnerModal.querySelector("[data-partner-form]");
    const steps = Array.from(partnerModal.querySelectorAll("[data-partner-step]"));
    const nextBtn = partnerModal.querySelector("[data-partner-next]");
    const backBtn = partnerModal.querySelector("[data-partner-back]");
    const editBtn = partnerModal.querySelector("[data-partner-edit]");
    const submitBtn = partnerModal.querySelector("[data-partner-submit]");
    const progressBar = partnerModal.querySelector("[data-partner-progress]");
    const summaryList = partnerModal.querySelector("[data-partner-summary]");
    let currentStep = 0;

    const setStep = (index) => {
      currentStep = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((step, idx) => step.classList.toggle("is-active", idx === currentStep));
      const progress = (currentStep / (steps.length - 1)) * 100;
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      partnerModal.classList.toggle("is-summary", currentStep === steps.length - 1);
      if (backBtn) {
        backBtn.disabled = currentStep === 0;
      }
      if (currentStep === steps.length - 1) {
        updateSummary();
      }
    };

    const openModal = () => {
      partnerModal.classList.add("is-open");
      partnerModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      setStep(0);
      const firstField = steps[0] ? steps[0].querySelector("input, select, textarea") : null;
      if (firstField) {
        firstField.focus();
      }
    };

    const closeModal = () => {
      partnerModal.classList.remove("is-open");
      partnerModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };

    const validateStep = () => {
      const activeStep = steps[currentStep];
      if (!activeStep) {
        return true;
      }
      const requiredFields = Array.from(
        activeStep.querySelectorAll("input, select, textarea")
      ).filter((field) => field.required);
      const partnerTypeInputs = Array.from(
        activeStep.querySelectorAll('input[name="partnerTypes"]')
      );
      if (partnerTypeInputs.length) {
        const isChecked = partnerTypeInputs.some((input) => input.checked);
        partnerTypeInputs.forEach((input) =>
          input.setCustomValidity(isChecked ? "" : "Select at least one.")
        );
        if (!isChecked && partnerTypeInputs[0]) {
          partnerTypeInputs[0].reportValidity();
          return false;
        }
      }
      for (const field of requiredFields) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return false;
        }
      }
      return true;
    };

    // Render summary rows using textContent to avoid HTML injection from form input.
    const buildSummaryRow = (label, value) => {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value || "Not provided";
      return [dt, dd];
    };

    const updateSummary = () => {
      if (!summaryList) {
        return;
      }
      const formData = new FormData(form);
      const getValues = (name) => formData.getAll(name).filter(Boolean).join(", ");
      const getValue = (name) => (formData.get(name) || "").toString().trim();
      const rows = [
        ["Company name", getValue("companyName")],
        ["Website", getValue("companyWebsite")],
        ["HQ location", getValue("hqLocation")],
        ["Industry", getValue("industry")],
        ["Company size", getValue("companySize")],
        ["Primary contact", getValue("contactName")],
        ["Title / Role", getValue("contactRole")],
        ["Email", getValue("contactEmail")],
        ["Phone", getValue("contactPhone")],
        ["Partner type(s)", getValues("partnerTypes")],
        ["Services of interest", getValues("services")],
        ["Regions served", getValue("regions")],
        ["Target client profile", getValue("clientProfile")],
        ["Current offerings", getValue("offerings")],
        ["NDA readiness", getValue("ndaReady")],
        ["Onboarding timeline", getValue("timeline")],
        ["Training needs", getValue("trainingNeeds")],
        ["Referral source", getValue("referralSource")],
        ["Additional notes", getValue("notes")],
      ];
      summaryList.textContent = "";
      rows.forEach(([label, value]) => {
        const [dt, dd] = buildSummaryRow(label, value);
        summaryList.appendChild(dt);
        summaryList.appendChild(dd);
      });
    };

    const submitForm = (event) => {
      event.preventDefault();
      updateSummary();
      const formData = new FormData(form);
      const getValues = (name) => formData.getAll(name).filter(Boolean).join(", ");
      const getValue = (name) => (formData.get(name) || "").toString().trim();
      const lines = [
        `Company name: ${getValue("companyName")}`,
        `Website: ${getValue("companyWebsite")}`,
        `HQ location: ${getValue("hqLocation")}`,
        `Industry: ${getValue("industry")}`,
        `Company size: ${getValue("companySize")}`,
        `Primary contact: ${getValue("contactName")}`,
        `Title / Role: ${getValue("contactRole")}`,
        `Email: ${getValue("contactEmail")}`,
        `Phone: ${getValue("contactPhone")}`,
        `Partner type(s): ${getValues("partnerTypes")}`,
        `Services of interest: ${getValues("services")}`,
        `Regions served: ${getValue("regions")}`,
        `Target client profile: ${getValue("clientProfile")}`,
        `Current offerings: ${getValue("offerings")}`,
        `NDA readiness: ${getValue("ndaReady")}`,
        `Onboarding timeline: ${getValue("timeline")}`,
        `Training needs: ${getValue("trainingNeeds")}`,
        `Referral source: ${getValue("referralSource")}`,
        `Additional notes: ${getValue("notes")}`,
      ];
      const subject = encodeURIComponent(
        `Partner ID Application - ${getValue("companyName") || "3HUE Partner"}`
      );
      const body = encodeURIComponent(lines.join("\n"));
      window.location.href = `mailto:partners@3hue.net?subject=${subject}&body=${body}`;
      closeModal();
    };

    openButtons.forEach((button) =>
      button.addEventListener("click", (event) => {
        event.preventDefault();
        openModal();
      })
    );
    closeButtons.forEach((button) => button.addEventListener("click", closeModal));

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (validateStep()) {
          setStep(currentStep + 1);
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => setStep(currentStep - 1));
    }

    if (editBtn) {
      editBtn.addEventListener("click", () => setStep(0));
    }

    if (form) {
      form.addEventListener("submit", submitForm);
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && partnerModal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  const portalLoginModal = document.querySelector("[data-portal-login-modal]");
  if (portalLoginModal) {
    const openButtons = Array.from(document.querySelectorAll("[data-portal-login]"));
    const closeButtons = Array.from(portalLoginModal.querySelectorAll("[data-portal-login-close]"));
    const form = portalLoginModal.querySelector("[data-portal-login-form]");
    const toggleButton = portalLoginModal.querySelector("[data-password-toggle]");
    const passwordInput = portalLoginModal.querySelector('input[name="loginPassword"]');

    const openLogin = () => {
      portalLoginModal.classList.add("is-open");
      portalLoginModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      const firstField = portalLoginModal.querySelector('input[name="loginEmail"]');
      if (firstField) {
        firstField.focus();
      }
    };

    const closeLogin = () => {
      portalLoginModal.classList.remove("is-open");
      portalLoginModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };

    openButtons.forEach((button) =>
      button.addEventListener("click", (event) => {
        event.preventDefault();
        openLogin();
      })
    );

    closeButtons.forEach((button) => button.addEventListener("click", closeLogin));

    if (toggleButton && passwordInput) {
      toggleButton.addEventListener("click", () => {
        const isMasked = passwordInput.type === "password";
        passwordInput.type = isMasked ? "text" : "password";
        toggleButton.textContent = isMasked ? "Hide" : "Show";
        toggleButton.setAttribute("aria-label", isMasked ? "Hide password" : "Show password");
      });
    }

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && portalLoginModal.classList.contains("is-open")) {
        closeLogin();
      }
    });
  }
})();
