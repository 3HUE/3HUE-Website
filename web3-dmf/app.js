const atlasGrid = document.getElementById('atlas-grid');
const pillarsGrid = document.getElementById('pillars-grid');
const filterPillar = document.getElementById('filter-pillar');
const filterCore = document.getElementById('filter-core');
const filterSearch = document.getElementById('filter-search');
const btnMore = document.getElementById('btn-more');
const atlasCount = document.getElementById('atlas-count');

const metaPillars = document.getElementById('meta-pillars');
const metaCores = document.getElementById('meta-cores');
const metaCapabilities = document.getElementById('meta-capabilities');

const drawer = document.getElementById('detail-drawer');
const drawerContent = document.getElementById('drawer-content');
const drawerClose = document.getElementById('drawer-close');

const state = {
  limit: 12,
  filtered: []
};

const unique = (arr) => [...new Set(arr.filter(Boolean))];

const pillars = unique(DMP_DATA.map(item => item.pillar));
const cores = unique(DMP_DATA.map(item => item.coreDimension));

metaPillars.textContent = String(pillars.length);
metaCores.textContent = String(cores.length);
metaCapabilities.textContent = String(DMP_DATA.length);

const pillarMap = pillars.map(pillar => {
  const coreSet = unique(DMP_DATA.filter(item => item.pillar === pillar).map(item => item.coreDimension));
  return { pillar, coreSet };
});

const renderPillars = () => {
  pillarsGrid.innerHTML = '';
  pillarMap.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'pillar-card';
    card.innerHTML = `
      <h3>${entry.pillar}</h3>
      <div class="core-list">
        ${entry.coreSet.map(core => `<div class="core-item">${core}</div>`).join('')}
      </div>
    `;
    pillarsGrid.appendChild(card);
  });
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

const formatBlock = (label, value) => {
  if (!value) return '';
  return `
    <div class="detail-block">
      <strong>${label}</strong><br />
      ${value.replace(/\n/g, '<br />')}
    </div>
  `;
};

const openDrawer = (item) => {
  drawerContent.innerHTML = `
    <h2>${item.practice || item.subDimension}</h2>
    <p>${item.objective || item.subDescription || ''}</p>
    ${formatBlock('Pillar', item.pillar)}
    ${formatBlock('Core Dimension', item.coreDimension)}
    ${formatBlock('Sub-Dimension', item.subDimension)}
    ${formatBlock('Weight', item.weight ? String(item.weight) : '')}
    ${formatBlock('Assessment Questions', item.assessmentQuestions)}
    ${formatBlock('Testing Procedures', item.testingProcedures)}
    ${formatBlock('Compliance Frameworks', item.complianceFrameworks)}
    ${formatBlock('Supporting Technologies', item.supportingTech)}
    ${formatBlock('Evidence & Artifacts', item.evidenceArtifacts)}
    ${formatBlock('Stakeholders', item.stakeholders)}
    ${formatBlock('Risk Implication', item.riskImplication)}
    ${formatBlock('Transformation Initiative', item.transformationInitiative)}
  `;
  drawer.classList.add('open');
};

const closeDrawer = () => {
  drawer.classList.remove('open');
};

const renderAtlas = () => {
  const pillarValue = filterPillar.value;
  const coreValue = filterCore.value;
  const searchValue = filterSearch.value.trim().toLowerCase();

  state.filtered = DMP_DATA.filter(item => {
    const matchesPillar = !pillarValue || item.pillar === pillarValue;
    const matchesCore = !coreValue || item.coreDimension === coreValue;
    const haystack = [
      item.practice,
      item.subDimension,
      item.subDescription,
      item.objective,
      item.coreDimension,
      item.pillar
    ].join(' ').toLowerCase();
    const matchesSearch = !searchValue || haystack.includes(searchValue);
    return matchesPillar && matchesCore && matchesSearch;
  });

  const visible = state.filtered.slice(0, state.limit);
  atlasGrid.innerHTML = '';
  visible.forEach(item => {
    const card = document.createElement('div');
    card.className = 'cap-card';
    card.innerHTML = `
      <div class="cap-meta">
        <span>${item.pillar || 'Pillar'}</span>
        ${item.weight ? `<span class="weight">Weight ${item.weight}</span>` : ''}
      </div>
      <h3>${item.practice || item.subDimension || 'Capability'}</h3>
      <p>${item.objective || item.subDescription || ''}</p>
      <div class="cap-meta">${item.coreDimension || ''}</div>
    `;
    card.addEventListener('click', () => openDrawer(item));
    atlasGrid.appendChild(card);
  });

  atlasCount.textContent = `${visible.length} of ${state.filtered.length} capabilities shown`;
  btnMore.style.display = state.filtered.length > state.limit ? 'inline-flex' : 'none';
};

btnMore.addEventListener('click', () => {
  state.limit += 12;
  renderAtlas();
});

filterPillar.addEventListener('change', renderAtlas);
filterCore.addEventListener('change', renderAtlas);
filterSearch.addEventListener('input', () => {
  state.limit = 12;
  renderAtlas();
});

drawerClose.addEventListener('click', closeDrawer);
drawer.addEventListener('click', (event) => {
  if (event.target === drawer) closeDrawer();
});

renderPillars();
buildSelect(filterPillar, pillars);
buildSelect(filterCore, cores);
renderAtlas();

const jumpToAtlas = () => {
  document.getElementById('atlas').scrollIntoView({ behavior: 'smooth' });
};

document.getElementById('btn-explore').addEventListener('click', jumpToAtlas);

const preloader = document.getElementById('preloader');
const preloaderCount = document.getElementById('preloader-count');
if (preloader) {
  let progress = 0;
  const start = Date.now();
  const tick = () => {
    const elapsed = Date.now() - start;
    progress = Math.min(100, Math.round((elapsed / 1200) * 100));
    if (preloaderCount) preloaderCount.textContent = `${String(progress).padStart(2, '0')}%`;
    if (progress < 100) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
  window.addEventListener('load', () => {
    const minDelay = 900;
    const elapsed = Date.now() - start;
    const remaining = Math.max(minDelay - elapsed, 0);
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, remaining);
  });
}
