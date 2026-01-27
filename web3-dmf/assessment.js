const assessmentGrid = document.getElementById('assessment-grid');
const filterPillar = document.getElementById('assess-pillar');
const filterCore = document.getElementById('assess-core');
const filterSearch = document.getElementById('assess-search');
const assessmentCount = document.getElementById('assessment-count');
const btnPrevPage = document.getElementById('btn-prev-page');
const btnNextPage = document.getElementById('btn-next-page');
const pagerStatus = document.getElementById('pager-status');

const answeredCount = document.getElementById('answered-count');
const remainingCount = document.getElementById('remaining-count');
const completionRate = document.getElementById('completion-rate');
const resultsGrid = document.getElementById('results-grid');
const coreGrid = document.getElementById('core-grid');
const overallScore = document.getElementById('overall-score');
const reportBody = document.getElementById('report-body');
const printDate = document.getElementById('print-date');
const printOverall = document.getElementById('print-overall');
const printCompletion = document.getElementById('print-completion');
const printAnswered = document.getElementById('print-answered');
const workspaceSummary = document.getElementById('workspace-summary');
const printCoverDate = document.getElementById('print-cover-date');
const printCoverGrid = document.getElementById('print-cover-grid');
const printTopRisks = document.getElementById('print-top-risks');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const toastUndo = document.getElementById('toast-undo');
const pillarSelector = document.getElementById('pillar-selector');
const btnTutorial = document.getElementById('btn-tutorial');
const tutorial = document.getElementById('tutorial');
const tutorialTitle = document.getElementById('tutorial-title');
const tutorialBody = document.getElementById('tutorial-body');
const tutorialStep = document.getElementById('tutorial-step');
const tutorialMeter = document.getElementById('tutorial-meter-fill');
const tutorialNext = document.getElementById('tutorial-next');
const tutorialSkip = document.getElementById('tutorial-skip');
const tutorialPrompt = document.getElementById('tutorial-prompt');
const tutorialStart = document.getElementById('tutorial-start');
const tutorialDismiss = document.getElementById('tutorial-dismiss');
const assessmentHero = document.querySelector('.assessment-hero');

const btnBegin = document.getElementById('btn-begin');
const btnExport = document.getElementById('btn-export');
const btnReset = document.getElementById('btn-reset');
const btnExportJson = document.getElementById('btn-export-json');
const btnExportCsv = document.getElementById('btn-export-csv');
const btnPrint = document.getElementById('btn-print');
const btnPrintReport = document.getElementById('btn-print-report');
const btnClearStorage = document.getElementById('btn-clear-storage');
const btnConfirmClear = document.getElementById('btn-confirm-clear');
const sortHeaders = document.querySelectorAll('[data-sort]');
const sortIndicators = document.querySelectorAll('[data-indicator]');
const sortBadges = document.querySelectorAll('[data-sort-badge]');

const STORAGE_KEY = 'web3-dmp-assessment';

const state = {
  page: 1,
  pageSize: 2,
  responses: loadResponses(),
  lastCleared: null,
  sort: {
    key: 'score',
    direction: 'desc'
  }
};

const unique = (arr) => [...new Set(arr.filter(Boolean))];

const pillars = unique(DMP_DATA.map(item => item.pillar));
const cores = unique(DMP_DATA.map(item => item.coreDimension));

const maturityLabels = {
  1: 'No strategy',
  2: 'Informal use',
  3: 'Documented, inconsistent',
  4: 'Repeatable & integrated',
  5: 'Optimized & adaptive'
};

const buildSelect = (select, options) => {
  select.innerHTML = '';
  const all = document.createElement('option');
  all.value = '';
  all.textContent = 'All';
  select.appendChild(all);
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
};

function loadResponses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveResponses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.responses));
}

const getFilteredData = () => {
  const pillarValue = filterPillar.value;
  const coreValue = filterCore.value;
  const searchValue = filterSearch.value.trim().toLowerCase();

  return DMP_DATA.filter(item => {
    const matchesPillar = !pillarValue || item.pillar === pillarValue;
    const matchesCore = !coreValue || item.coreDimension === coreValue;
    const haystack = [
      item.practice,
      item.subDimension,
      item.subDescription,
      item.objective,
      item.coreDimension,
      item.pillar,
      item.assessmentQuestions
    ].join(' ').toLowerCase();
    const matchesSearch = !searchValue || haystack.includes(searchValue);
    return matchesPillar && matchesCore && matchesSearch;
  });
};

const renderAssessment = () => {
  const filtered = getFilteredData();
  const totalPages = Math.max(Math.ceil(filtered.length / state.pageSize), 1);
  const currentPage = Math.min(state.page, totalPages);
  state.page = currentPage;
  const start = (currentPage - 1) * state.pageSize;
  const visible = filtered.slice(start, start + state.pageSize);
  assessmentGrid.innerHTML = '';

  visible.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'cap-card assessment-card';
    const selected = state.responses[item.id] || '';
    const globalIndex = start + idx + 1;

    card.innerHTML = `
      <div class="cap-meta">
        <span>${item.pillar}</span>
        <span class="weight">Weight ${item.weight ?? 1}</span>
      </div>
      <div class="cap-meta">${globalIndex} of ${filtered.length}</div>
      <h3>${item.practice || item.subDimension}</h3>
      <p>${item.objective || item.subDescription || ''}</p>
      <div class="cap-meta">${item.coreDimension}</div>
      <div class="question">${(item.assessmentQuestions || '').replace(/\n/g, '<br />')}</div>
      <div class="rating">
        ${[1,2,3,4,5].map(val => `
          <label>
            <input type="radio" name="${item.id}" value="${val}" ${String(selected) === String(val) ? 'checked' : ''} />
            <span>${val}</span>
          </label>
        `).join('')}
      </div>
    `;

    card.querySelectorAll('input[type="radio"]').forEach(input => {
      input.setAttribute('data-assessment-input', 'true');
      input.addEventListener('change', () => {
        state.responses[item.id] = Number(input.value);
        saveResponses();
        renderProgress(getFilteredData());
        renderResults();
        renderReport();
      });
    });

    assessmentGrid.appendChild(card);
  });

  assessmentCount.textContent = `${filtered.length} capabilities in this workspace`;
  if (pagerStatus) pagerStatus.textContent = `Page ${currentPage} of ${totalPages}`;
  if (btnPrevPage) btnPrevPage.disabled = currentPage <= 1;
  if (btnNextPage) btnNextPage.disabled = currentPage >= totalPages;
};

const renderPillarSelector = () => {
  if (!pillarSelector) return;
  pillars.forEach(pillar => {
    const card = document.createElement('div');
    card.className = 'pillar-card selectable';
    card.dataset.pillar = pillar;
    card.innerHTML = `
      <h3>${pillar}</h3>
      <p>Focused assessment for this pillar.</p>
      <a class="assessment-link" data-pillar-link="${pillar}" href="assessment.html?pillar=${encodeURIComponent(pillar)}">Start ${pillar}</a>
    `;
    pillarSelector.appendChild(card);
  });
};

const renderProgress = (dataset = DMP_DATA) => {
  const total = dataset.length;
  const answered = dataset.filter(item => state.responses[item.id]).length;
  const remaining = Math.max(total - answered, 0);
  const completion = total ? Math.round((answered / total) * 100) : 0;
  answeredCount.textContent = String(answered);
  remainingCount.textContent = String(remaining);
  completionRate.textContent = `${completion}%`;
  if (workspaceSummary) workspaceSummary.textContent = `${answered} of ${total} in this workspace`;
  if (printCompletion) printCompletion.textContent = `${completion}%`;
  if (printAnswered) printAnswered.textContent = String(answered);
};

const renderResults = () => {
  const pillarScores = {};
  const pillarWeights = {};
  const coreScores = {};
  const coreWeights = {};
  let totalWeighted = 0;
  let totalWeight = 0;

  DMP_DATA.forEach(item => {
    const response = state.responses[item.id];
    if (!response) return;
    const weight = item.weight || 1;
    totalWeighted += response * weight;
    totalWeight += weight;
    const pillar = item.pillar;
    pillarScores[pillar] = (pillarScores[pillar] || 0) + response * weight;
    pillarWeights[pillar] = (pillarWeights[pillar] || 0) + weight;
    const core = item.coreDimension;
    coreScores[core] = (coreScores[core] || 0) + response * weight;
    coreWeights[core] = (coreWeights[core] || 0) + weight;
  });

  resultsGrid.innerHTML = '';
  pillars.forEach(pillar => {
    const score = pillarWeights[pillar]
      ? (pillarScores[pillar] / pillarWeights[pillar]).toFixed(2)
      : '0.00';
    const card = document.createElement('div');
    card.className = 'meta-card';
    card.innerHTML = `
      <div class="meta-value">${score}</div>
      <div class="meta-label">${pillar}</div>
    `;
    resultsGrid.appendChild(card);
  });

  if (coreGrid) {
    coreGrid.innerHTML = '';
    cores.forEach(core => {
      const score = coreWeights[core]
        ? (coreScores[core] / coreWeights[core]).toFixed(2)
        : '0.00';
      const percent = Math.min((parseFloat(score) / 5) * 100, 100);
      const row = document.createElement('div');
      row.className = 'core-row';
      row.innerHTML = `
        <div class="core-label">
          <span>${core}</span>
          <span class="core-score">${score}</span>
        </div>
        <div class="core-bar">
          <div class="core-bar-fill" style="width: ${percent}%"></div>
        </div>
      `;
      coreGrid.appendChild(row);
    });
  }

  const overall = totalWeight ? (totalWeighted / totalWeight).toFixed(2) : '0.00';
  overallScore.textContent = overall;
  if (printOverall) printOverall.textContent = overall;

  if (printCoverGrid) {
    printCoverGrid.innerHTML = '';
    pillars.forEach(pillar => {
      const score = pillarWeights[pillar]
        ? (pillarScores[pillar] / pillarWeights[pillar]).toFixed(2)
        : '0.00';
      const item = document.createElement('div');
      item.className = 'print-cover-card';
      item.innerHTML = `
        <div class="print-cover-label">Pillar</div>
        <div class="print-cover-title">${pillar}</div>
        <div class="print-cover-score">${score}</div>
      `;
      printCoverGrid.appendChild(item);
    });
    cores.forEach(core => {
      const score = coreWeights[core]
        ? (coreScores[core] / coreWeights[core]).toFixed(2)
        : '0.00';
      const item = document.createElement('div');
      item.className = 'print-cover-card';
      item.innerHTML = `
        <div class="print-cover-label">Core</div>
        <div class="print-cover-title">${core}</div>
        <div class="print-cover-score">${score}</div>
      `;
      printCoverGrid.appendChild(item);
    });
  }

  if (printTopRisks) {
    const risks = DMP_DATA.map(item => {
      const maturity = state.responses[item.id] || 0;
      const weight = item.weight || 1;
      const riskScore = (5 - maturity) * weight;
      const objective = (item.objective || item.subDescription || '').replace(/\n/g, ' ');
      return {
        id: item.id,
        practice: item.practice || item.subDimension,
        pillar: item.pillar,
        weight,
        maturity,
        riskScore,
        objective
      };
    }).sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

    printTopRisks.innerHTML = '';
    risks.forEach(risk => {
      const li = document.createElement('li');
      const rationale = `Weight ${risk.weight}, maturity ${risk.maturity || 0}/5. ${risk.objective}`;
      li.textContent = `${risk.practice} (${risk.pillar}) — Risk ${risk.riskScore.toFixed(1)}`;
      li.title = rationale;
      printTopRisks.appendChild(li);
    });
  }
};

const renderReport = () => {
  reportBody.innerHTML = '';
  const sorted = [...DMP_DATA].sort((a, b) => {
    const dir = state.sort.direction === 'asc' ? 1 : -1;
    if (state.sort.key === 'pillar') {
      return a.pillar.localeCompare(b.pillar) * dir;
    }
    if (state.sort.key === 'weight') {
      return ((a.weight ?? 1) - (b.weight ?? 1)) * dir;
    }
    if (state.sort.key === 'score') {
      const aScore = state.responses[a.id] || 0;
      const bScore = state.responses[b.id] || 0;
      return (aScore - bScore) * dir;
    }
    return 0;
  });

  sorted.forEach(item => {
    const maturity = state.responses[item.id] || '';
    const maturityScore = maturity ? Number(maturity) : 0;
    const barWidth = Math.min((maturityScore / 5) * 100, 100);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.pillar}</td>
      <td>${item.coreDimension}</td>
      <td>${item.practice || item.subDimension}</td>
      <td>${item.weight ?? 1}</td>
      <td>${maturity ? `${maturity} - ${maturityLabels[maturity]}` : 'Not answered'}</td>
      <td>
        <div class="mini-bar">
          <div class="mini-bar-fill" style="width: ${barWidth}%"></div>
        </div>
      </td>
      <td>${item.objective || item.subDescription || ''}</td>
    `;
    reportBody.appendChild(row);
  });
};

const exportJson = () => {
  const payload = {
    generatedAt: new Date().toISOString(),
    responses: state.responses,
    results: {
      overall: overallScore.textContent,
    }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'web3-dmp-assessment.json';
  link.click();
  URL.revokeObjectURL(link.href);
};

const exportCsv = () => {
  const header = ['ID','Pillar','Core','Practice','Weight','Maturity','Score','Objective'];
  const rows = DMP_DATA.map(item => {
    const maturity = state.responses[item.id] || '';
    const maturityScore = maturity ? Number(maturity) : 0;
    return [
      item.id,
      item.pillar,
      item.coreDimension,
      item.practice || item.subDimension,
      item.weight ?? 1,
      maturity ? `${maturity} - ${maturityLabels[maturity]}` : 'Not answered',
      maturityScore,
      (item.objective || item.subDescription || '').replace(/\n/g, ' ')
    ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',');
  });
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'web3-dmp-assessment.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};

btnBegin.addEventListener('click', () => {
  document.getElementById('assessment').scrollIntoView({ behavior: 'smooth' });
});

btnExport.addEventListener('click', () => {
  document.getElementById('report').scrollIntoView({ behavior: 'smooth' });
});

btnReset.addEventListener('click', () => {
  state.responses = {};
  saveResponses();
  renderAssessment();
  renderProgress(getFilteredData());
  renderResults();
  renderReport();
});

const printReport = () => {
  if (printDate) {
    printDate.textContent = `Generated on ${new Date().toLocaleDateString()}`;
  }
  if (printCoverDate) {
    printCoverDate.textContent = `Generated on ${new Date().toLocaleDateString()}`;
  }
  window.print();
};

if (btnPrint) btnPrint.addEventListener('click', printReport);
if (btnPrintReport) btnPrintReport.addEventListener('click', printReport);

btnExportJson.addEventListener('click', exportJson);
btnExportCsv.addEventListener('click', exportCsv);

if (btnClearStorage) {
  btnClearStorage.addEventListener('click', () => {
    const modal = document.querySelector('[data-modal=\"clear-storage\"]');
    if (modal) {
      modal.classList.add('open');
      document.body.classList.add('modal-open');
    }
  });
}

if (btnConfirmClear) {
  btnConfirmClear.addEventListener('click', () => {
    state.lastCleared = { ...state.responses };
    localStorage.removeItem(STORAGE_KEY);
    state.responses = {};
    renderAssessment();
    renderProgress(getFilteredData());
    renderResults();
    renderReport();
    const modal = document.querySelector('[data-modal=\"clear-storage\"]');
    if (modal) {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
    }
    showToast('Stored responses cleared.', true);
  });
}

document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
    }
  });
});

if (toastUndo) {
  toastUndo.addEventListener('click', () => {
    if (!state.lastCleared) return;
    state.responses = { ...state.lastCleared };
    saveResponses();
    renderAssessment();
    renderProgress(getFilteredData());
    renderResults();
    renderReport();
    state.lastCleared = null;
    showToast('Stored responses restored.');
  });
}

const showToast = (message, withUndo = false) => {
  if (!toast) return;
  if (toastMessage) toastMessage.textContent = message;
  if (toastUndo) toastUndo.style.display = withUndo ? 'inline-flex' : 'none';
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3200);
};

const updateSortIndicators = () => {
  sortIndicators.forEach(indicator => {
    const key = indicator.getAttribute('data-indicator');
    if (key === state.sort.key) {
      indicator.textContent = state.sort.direction === 'asc' ? '↑' : '↓';
    } else {
      indicator.textContent = '↕';
    }
  });
};

const updateSortBadges = () => {
  sortBadges.forEach(badge => {
    const key = badge.getAttribute('data-sort-badge');
    badge.textContent = key === state.sort.key ? '1' : '2';
  });
};

sortHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const key = header.getAttribute('data-sort');
    if (state.sort.key === key) {
      state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      state.sort.key = key;
      state.sort.direction = 'desc';
    }
    renderReport();
    updateSortIndicators();
    updateSortBadges();
  });
});

updateSortIndicators();
updateSortBadges();

const applyPillarFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const pillar = params.get('pillar');
  if (pillar) {
    filterPillar.value = pillar;
    filterCore.value = '';
    filterSearch.value = '';
    state.page = 1;
    renderAssessment();
    renderProgress(getFilteredData());
    renderResults();
    renderReport();
  }
};

const tutorialSteps = [
  {
    title: 'Choose your scope',
    body: 'Pick a pillar-specific assessment or run the full assessment.',
    target: '#pillar-selector'
  },
  {
    title: 'Filter the assessment',
    body: 'Use pillar/core filters or search to focus your responses.',
    target: '.assessment-controls'
  },
  {
    title: 'Answer capabilities',
    body: 'Rate each capability on the 1–5 maturity scale.',
    target: '#assessment-grid'
  },
  {
    title: 'Review results',
    body: 'Check pillar/core scores and overall maturity.',
    target: '#results'
  },
  {
    title: 'Export & print',
    body: 'Export JSON/CSV or print the detailed report.',
    target: '#report'
  }
];

let tutorialIndex = 0;
const TUTORIAL_KEY = 'web3-dmp-tutorial-seen';

const clearHighlights = () => {
  document.querySelectorAll('.tutorial-highlight').forEach(el => {
    el.classList.remove('tutorial-highlight');
  });
};

const showTutorialStep = () => {
  const step = tutorialSteps[tutorialIndex];
  if (!step) return;
  tutorialStep.textContent = `Step ${tutorialIndex + 1} of ${tutorialSteps.length}`;
  tutorialTitle.textContent = step.title;
  tutorialBody.textContent = step.body;
  if (tutorialNext) {
    tutorialNext.textContent = tutorialIndex === tutorialSteps.length - 1 ? 'Finish' : 'Next';
  }
  if (tutorialMeter) {
    tutorialMeter.style.width = `${((tutorialIndex + 1) / tutorialSteps.length) * 100}%`;
  }
  clearHighlights();
  const target = document.querySelector(step.target);
  if (target) {
    target.classList.add('tutorial-highlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const openTutorial = () => {
  if (!tutorial) return;
  tutorial.classList.add('show');
  tutorialIndex = 0;
  showTutorialStep();
  if (tutorialPrompt) tutorialPrompt.classList.remove('show');
};

const closeTutorial = () => {
  if (!tutorial) return;
  tutorial.classList.remove('show');
  clearHighlights();
  localStorage.setItem(TUTORIAL_KEY, 'seen');
};

if (btnTutorial) {
  btnTutorial.addEventListener('click', openTutorial);
}

if (tutorialStart) {
  tutorialStart.addEventListener('click', openTutorial);
}

if (tutorialDismiss) {
  tutorialDismiss.addEventListener('click', () => {
    if (tutorialPrompt) tutorialPrompt.classList.remove('show');
    localStorage.setItem(TUTORIAL_KEY, 'dismissed');
  });
}

if (tutorialNext) {
  tutorialNext.addEventListener('click', () => {
    tutorialIndex += 1;
    if (tutorialIndex >= tutorialSteps.length) {
      closeTutorial();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (assessmentHero) {
        assessmentHero.classList.add('finish-highlight');
        setTimeout(() => assessmentHero.classList.remove('finish-highlight'), 1800);
      }
      return;
    }
    showTutorialStep();
  });
}

if (tutorialSkip) {
  tutorialSkip.addEventListener('click', closeTutorial);
}

if (tutorial) {
  tutorial.addEventListener('click', (event) => {
    if (event.target === tutorial) closeTutorial();
  });
}

const tutorialCard = document.querySelector('.tutorial-card');
if (tutorialCard) {
  tutorialCard.addEventListener('click', (event) => {
    event.stopPropagation();
  });
}

if (pillarSelector) {
  pillarSelector.addEventListener('click', (event) => {
    const link = event.target.closest('[data-pillar-link]');
    if (!link) return;
    event.preventDefault();
    const pillar = link.getAttribute('data-pillar-link') || '';
    filterPillar.value = pillar;
    filterCore.value = '';
    filterSearch.value = '';
    state.page = 1;
    renderAssessment();
    renderProgress(getFilteredData());
    renderResults();
    renderReport();
    document.getElementById('assessment').scrollIntoView({ behavior: 'smooth' });
  });
}

filterPillar.addEventListener('change', () => {
  state.page = 1;
  renderAssessment();
});

filterCore.addEventListener('change', () => {
  state.page = 1;
  renderAssessment();
});

filterSearch.addEventListener('input', () => {
  state.page = 1;
  renderAssessment();
});

if (btnPrevPage) {
  btnPrevPage.addEventListener('click', () => {
    state.page = Math.max(state.page - 1, 1);
    renderAssessment();
  });
}

if (btnNextPage) {
  btnNextPage.addEventListener('click', () => {
    state.page += 1;
    renderAssessment();
  });
}

buildSelect(filterPillar, pillars);
buildSelect(filterCore, cores);
renderPillarSelector();
renderAssessment();
renderProgress(getFilteredData());
renderResults();
renderReport();
applyPillarFromQuery();

if (tutorialPrompt && !localStorage.getItem(TUTORIAL_KEY)) {
  tutorialPrompt.classList.add('show');
}
