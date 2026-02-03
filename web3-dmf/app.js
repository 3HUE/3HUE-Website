const atlasGrid = document.getElementById("atlas-grid");
const pillarsGrid = document.getElementById("pillars-grid");
const filterPillar = document.getElementById("filter-pillar");
const filterCore = document.getElementById("filter-core");
const filterSearch = document.getElementById("filter-search");
const btnMore = document.getElementById("btn-more");
const atlasCount = document.getElementById("atlas-count");

const metaPillars = document.getElementById("meta-pillars");
const metaCores = document.getElementById("meta-cores");
const metaCapabilities = document.getElementById("meta-capabilities");

const drawer = document.getElementById("detail-drawer");
const drawerContent = document.getElementById("drawer-content");
const drawerClose = document.getElementById("drawer-close");

const state = {
  limit: 12,
  filtered: [],
};

// Build DOM nodes with textContent to prevent HTML injection from data fields.
const createEl = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = text;
  return el;
};

const appendTextWithBreaks = (el, text) => {
  if (!text) return;
  const parts = String(text).split("\n");
  parts.forEach((part, idx) => {
    if (idx > 0) el.appendChild(document.createElement("br"));
    el.appendChild(document.createTextNode(part));
  });
};

const unique = (arr) => [...new Set(arr.filter(Boolean))];

const pillars = unique(DMP_DATA.map((item) => item.pillar));
const cores = unique(DMP_DATA.map((item) => item.coreDimension));

metaPillars.textContent = String(pillars.length);
metaCores.textContent = String(cores.length);
metaCapabilities.textContent = String(DMP_DATA.length);

const pillarMap = pillars.map((pillar) => {
  const coreSet = unique(
    DMP_DATA.filter((item) => item.pillar === pillar).map((item) => item.coreDimension)
  );
  return { pillar, coreSet };
});

const renderPillars = () => {
  pillarsGrid.textContent = "";
  pillarMap.forEach((entry) => {
    const card = createEl("div", "pillar-card");
    const title = createEl("h3", null, entry.pillar);
    const list = createEl("div", "core-list");
    entry.coreSet.forEach((core) => {
      list.appendChild(createEl("div", "core-item", core));
    });
    card.appendChild(title);
    card.appendChild(list);
    pillarsGrid.appendChild(card);
  });
};

const buildSelect = (select, options) => {
  select.textContent = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = "All";
  select.appendChild(all);
  options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
};

const createDetailBlock = (label, value) => {
  if (!value) return null;
  const block = createEl("div", "detail-block");
  const strong = createEl("strong", null, label);
  block.appendChild(strong);
  block.appendChild(document.createElement("br"));
  appendTextWithBreaks(block, value);
  return block;
};

const openDrawer = (item) => {
  drawerContent.textContent = "";
  drawerContent.appendChild(
    createEl("h2", null, item.practice || item.subDimension || "Capability")
  );
  drawerContent.appendChild(createEl("p", null, item.objective || item.subDescription || ""));
  [
    createDetailBlock("Pillar", item.pillar),
    createDetailBlock("Core Dimension", item.coreDimension),
    createDetailBlock("Sub-Dimension", item.subDimension),
    createDetailBlock("Weight", item.weight ? String(item.weight) : ""),
    createDetailBlock("Assessment Questions", item.assessmentQuestions),
    createDetailBlock("Testing Procedures", item.testingProcedures),
    createDetailBlock("Compliance Frameworks", item.complianceFrameworks),
    createDetailBlock("Supporting Technologies", item.supportingTech),
    createDetailBlock("Evidence & Artifacts", item.evidenceArtifacts),
    createDetailBlock("Stakeholders", item.stakeholders),
    createDetailBlock("Risk Implication", item.riskImplication),
    createDetailBlock("Transformation Initiative", item.transformationInitiative),
  ]
    .filter(Boolean)
    .forEach((block) => drawerContent.appendChild(block));
  drawer.classList.add("open");
};

const closeDrawer = () => {
  drawer.classList.remove("open");
};

const renderAtlas = () => {
  const pillarValue = filterPillar.value;
  const coreValue = filterCore.value;
  const searchValue = filterSearch.value.trim().toLowerCase();

  state.filtered = DMP_DATA.filter((item) => {
    const matchesPillar = !pillarValue || item.pillar === pillarValue;
    const matchesCore = !coreValue || item.coreDimension === coreValue;
    const haystack = [
      item.practice,
      item.subDimension,
      item.subDescription,
      item.objective,
      item.coreDimension,
      item.pillar,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !searchValue || haystack.includes(searchValue);
    return matchesPillar && matchesCore && matchesSearch;
  });

  const visible = state.filtered.slice(0, state.limit);
  atlasGrid.textContent = "";
  visible.forEach((item) => {
    const card = createEl("div", "cap-card");
    const metaTop = createEl("div", "cap-meta");
    metaTop.appendChild(createEl("span", null, item.pillar || "Pillar"));
    if (item.weight) {
      metaTop.appendChild(createEl("span", "weight", `Weight ${item.weight}`));
    }
    const title = createEl("h3", null, item.practice || item.subDimension || "Capability");
    const desc = createEl("p", null, item.objective || item.subDescription || "");
    const metaBottom = createEl("div", "cap-meta", item.coreDimension || "");
    card.appendChild(metaTop);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(metaBottom);
    card.addEventListener("click", () => openDrawer(item));
    atlasGrid.appendChild(card);
  });

  atlasCount.textContent = `${visible.length} of ${state.filtered.length} capabilities shown`;
  btnMore.style.display = state.filtered.length > state.limit ? "inline-flex" : "none";
};

btnMore.addEventListener("click", () => {
  state.limit += 12;
  renderAtlas();
});

filterPillar.addEventListener("change", renderAtlas);
filterCore.addEventListener("change", renderAtlas);
filterSearch.addEventListener("input", () => {
  state.limit = 12;
  renderAtlas();
});

drawerClose.addEventListener("click", closeDrawer);
drawer.addEventListener("click", (event) => {
  if (event.target === drawer) closeDrawer();
});

renderPillars();
buildSelect(filterPillar, pillars);
buildSelect(filterCore, cores);
renderAtlas();

const jumpToAtlas = () => {
  document.getElementById("atlas").scrollIntoView({ behavior: "smooth" });
};

document.getElementById("btn-explore").addEventListener("click", jumpToAtlas);

const preloader = document.getElementById("preloader");
const preloaderCount = document.getElementById("preloader-count");
if (preloader) {
  let progress = 0;
  const start = Date.now();
  const tick = () => {
    const elapsed = Date.now() - start;
    progress = Math.min(100, Math.round((elapsed / 1200) * 100));
    if (preloaderCount) preloaderCount.textContent = `${String(progress).padStart(2, "0")}%`;
    if (progress < 100) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
  window.addEventListener("load", () => {
    const minDelay = 900;
    const elapsed = Date.now() - start;
    const remaining = Math.max(minDelay - elapsed, 0);
    setTimeout(() => {
      preloader.classList.add("hidden");
    }, remaining);
  });
}
