// =============================================
// STATE
// =============================================
const state = {
  container: {
    'flex-direction': 'row',
    'flex-wrap': 'nowrap',
    'justify-content': 'flex-start',
    'align-items': 'stretch',
    'align-content': 'stretch',
    'row-gap': '8px',
    'column-gap': '8px',
  },
  items: [
    { id: 1, label: '1', 'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'align-self': 'auto', 'order': '0' },
    { id: 2, label: '2', 'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'align-self': 'auto', 'order': '0' },
    { id: 3, label: '3', 'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'align-self': 'auto', 'order': '0' },
  ],
  selectedItemId: null,
  nextId: 4,
};

// =============================================
// DOM REFS
// =============================================
const flexPreview = document.getElementById('flex-preview');
const codeOutput  = document.getElementById('code-output');
const itemHint    = document.getElementById('item-hint');
const itemControls= document.getElementById('item-controls');
const itemCountLabel = document.getElementById('item-count-label');
const mainAxisBadge  = document.getElementById('main-axis-badge');
const crossAxisBadge = document.getElementById('cross-axis-badge');

// =============================================
// TAB SWITCH
// =============================================
function switchTab(tab) {
  ['container','item'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`tab-${t}-btn`).classList.toggle('active', t === tab);
  });
}

// =============================================
// RENDER PREVIEW
// =============================================
function renderPreview() {
  // Apply container styles
  const c = state.container;
  Object.assign(flexPreview.style, {
    flexDirection:  c['flex-direction'],
    flexWrap:       c['flex-wrap'],
    justifyContent: c['justify-content'],
    alignItems:     c['align-items'],
    alignContent:   c['align-content'],
    rowGap:         c['row-gap'],
    columnGap:      c['column-gap'],
  });

  // Update axis badges
  const isColumn = c['flex-direction'].startsWith('column');
  mainAxisBadge.textContent  = isColumn ? '↓ main axis'  : '→ main axis';
  crossAxisBadge.textContent = isColumn ? '→ cross axis' : '↓ cross axis';

  // Render items
  flexPreview.innerHTML = '';
  state.items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'flex-item' + (item.id === state.selectedItemId ? ' selected' : '');
    el.dataset.id = item.id;
    el.innerHTML = `<span class="item-label">${item.label}</span>`;

    // Apply item styles
    el.style.flexGrow   = item['flex-grow'];
    el.style.flexShrink = item['flex-shrink'];
    el.style.flexBasis  = item['flex-basis'];
    el.style.alignSelf  = item['align-self'];
    el.style.order      = item['order'];

    el.addEventListener('click', () => selectItem(item.id));
    flexPreview.appendChild(el);
  });

  itemCountLabel.textContent = `${state.items.length} item${state.items.length > 1 ? 's' : ''}`;
  renderCode();
  saveState();
}

// =============================================
// CODE GENERATION
// =============================================
function renderCode() {
  const c = state.container;
  const defaults = {
    'flex-direction':  'row',
    'flex-wrap':       'nowrap',
    'justify-content': 'flex-start',
    'align-items':     'stretch',
    'align-content':   'stretch',
    'row-gap':         '0px',
    'column-gap':      '0px',
  };

  let lines = [];
  lines.push(hl('selector', '.container') + ' ' + hl('brace', '{'));
  lines.push('  ' + hl('prop', 'display') + ': ' + hl('val', 'flex') + ';');

  Object.keys(c).forEach(prop => {
    const val = c[prop];
    const isDefault = val === defaults[prop];
    const line = '  ' + hl('prop', prop) + ': ' + hl('val', val) + ';';
    lines.push(isDefault ? hl('comment', '  /* ' + prop + ': ' + val + '; */') : line);
  });

  lines.push(hl('brace', '}'));

  // Item-specific styles (only non-default values)
  const itemDefaults = { 'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'align-self': 'auto', 'order': '0' };
  state.items.forEach(item => {
    const custom = Object.entries(itemDefaults).filter(([k]) => item[k] !== itemDefaults[k]);
    if (custom.length === 0) return;
    lines.push('');
    lines.push(hl('selector', `.item-${item.id}`) + ' ' + hl('brace', '{'));
    custom.forEach(([k, _]) => {
      lines.push('  ' + hl('prop', k) + ': ' + hl('val', item[k]) + ';');
    });
    lines.push(hl('brace', '}'));
  });

  codeOutput.innerHTML = lines.join('\n');
}

function hl(type, str) {
  return `<span class="tok-${type}">${str}</span>`;
}

// =============================================
// COPY
// =============================================
function copyCss() {
  const text = codeOutput.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btn-copy-css');
    btn.textContent = '✓ Copié !';
    btn.classList.add('copied');
    showToast('CSS copié dans le presse-papier !');
    setTimeout(() => { btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M2 10V2h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Copier le CSS'; btn.classList.remove('copied'); }, 2000);
  });
}

function copyHtml() {
  const c = state.container;
  const itemsHtml = state.items.map(i => `  <div class="item-${i.id}">${i.label}</div>`).join('\n');
  const css = codeOutput.innerText;
  const full = `<style>\n${css}\n</style>\n\n<div class="container">\n${itemsHtml}\n</div>`;
  navigator.clipboard.writeText(full).then(() => {
    showToast('HTML + CSS copié !');
    const btn = document.getElementById('btn-copy-html');
    const orig = btn.innerHTML;
    btn.textContent = '✓ Copié !';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// =============================================
// ITEM SELECTION
// =============================================
function selectItem(id) {
  state.selectedItemId = id;
  switchTab('item');
  itemHint.style.display = 'none';
  itemControls.style.display = 'block';
  loadItemControls(id);
  renderPreview();
}

function loadItemControls(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;

  document.getElementById('ctrl-grow').value = item['flex-grow'];
  document.getElementById('ctrl-grow-val').textContent = item['flex-grow'];

  document.getElementById('ctrl-shrink').value = item['flex-shrink'];
  document.getElementById('ctrl-shrink-val').textContent = item['flex-shrink'];

  const basisVal = item['flex-basis'] === 'auto' ? 0 : parseInt(item['flex-basis']) || 0;
  document.getElementById('ctrl-basis').value = basisVal;
  document.getElementById('ctrl-basis-val').textContent = item['flex-basis'];

  document.getElementById('ctrl-order').value = item['order'];

  // align-self radio
  const asRadio = document.querySelector(`input[name="align-self"][value="${item['align-self']}"]`);
  if (asRadio) asRadio.checked = true;
}

function updateItemProp(prop, value) {
  if (!state.selectedItemId) return;
  const item = state.items.find(i => i.id === state.selectedItemId);
  if (!item) return;
  item[prop] = value;

  // update display labels
  if (prop === 'flex-grow') { document.getElementById('ctrl-grow-val').textContent = value; }
  if (prop === 'flex-shrink') { document.getElementById('ctrl-shrink-val').textContent = value; }
  if (prop === 'flex-basis') {
    const display = value === '0px' ? 'auto' : value;
    document.getElementById('ctrl-basis-val').textContent = display;
    if (value === '0px') item['flex-basis'] = 'auto';
  }
  renderPreview();
}

// =============================================
// ADD / REMOVE ITEMS
// =============================================
function addItem() {
  if (state.items.length >= 8) { showToast('Maximum 8 éléments'); return; }
  const id = state.nextId++;
  state.items.push({ id, label: String(id), 'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'align-self': 'auto', 'order': '0' });
  renderPreview();
}

function removeItem() {
  if (state.selectedItemId) {
    state.items = state.items.filter(i => i.id !== state.selectedItemId);
    state.selectedItemId = null;
    itemHint.style.display = '';
    itemControls.style.display = 'none';
  } else {
    if (state.items.length <= 1) { showToast('Minimum 1 élément'); return; }
    state.items.pop();
  }
  renderPreview();
}

// =============================================
// RESET
// =============================================
function resetAll() {
  state.container = { 'flex-direction': 'row', 'flex-wrap': 'nowrap', 'justify-content': 'flex-start', 'align-items': 'stretch', 'align-content': 'stretch', 'row-gap': '8px', 'column-gap': '8px' };
  state.items = [
    { id: 1, label: '1', 'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'align-self': 'auto', 'order': '0' },
    { id: 2, label: '2', 'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'align-self': 'auto', 'order': '0' },
    { id: 3, label: '3', 'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'align-self': 'auto', 'order': '0' },
  ];
  state.selectedItemId = null;
  state.nextId = 4;
  itemHint.style.display = '';
  itemControls.style.display = 'none';
  syncControlsToState();
  renderPreview();
  showToast('Playground réinitialisé');
}

// =============================================
// CONTAINER CONTROL BINDINGS
// =============================================
function bindContainerControls() {
  // Radio groups
  ['flex-direction','flex-wrap','justify-content','align-items','align-content'].forEach(prop => {
    document.querySelectorAll(`input[name="${prop}"]`).forEach(radio => {
      radio.addEventListener('change', () => {
        state.container[prop] = radio.value;
        renderPreview();
      });
    });
  });

  // Row-gap slider
  const rowGapSlider = document.getElementById('ctrl-row-gap');
  const rowGapVal    = document.getElementById('ctrl-row-gap-val');
  rowGapSlider.addEventListener('input', () => {
    state.container['row-gap'] = rowGapSlider.value + 'px';
    rowGapVal.textContent = rowGapSlider.value + 'px';
    renderPreview();
  });

  // Column-gap slider
  const colGapSlider = document.getElementById('ctrl-col-gap');
  const colGapVal    = document.getElementById('ctrl-col-gap-val');
  colGapSlider.addEventListener('input', () => {
    state.container['column-gap'] = colGapSlider.value + 'px';
    colGapVal.textContent = colGapSlider.value + 'px';
    renderPreview();
  });

  // align-self radios
  document.querySelectorAll('input[name="align-self"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updateItemProp('align-self', radio.value);
    });
  });

  // flex-grow / flex-shrink sliders via oninput in HTML — no need here
  // flex-basis slider
  const basisSlider = document.getElementById('ctrl-basis');
  basisSlider.addEventListener('input', () => {
    const val = parseInt(basisSlider.value);
    updateItemProp('flex-basis', val === 0 ? 'auto' : val + 'px');
  });

  // flex-grow slider
  document.getElementById('ctrl-grow').addEventListener('input', function() {
    updateItemProp('flex-grow', this.value);
    document.getElementById('ctrl-grow-val').textContent = this.value;
  });

  // flex-shrink slider
  document.getElementById('ctrl-shrink').addEventListener('input', function() {
    updateItemProp('flex-shrink', this.value);
    document.getElementById('ctrl-shrink-val').textContent = this.value;
  });

  // order input
  document.getElementById('ctrl-order').addEventListener('input', function() {
    updateItemProp('order', this.value);
  });
}

// =============================================
// SYNC CONTROLS TO STATE (for reset)
// =============================================
function syncControlsToState() {
  const c = state.container;
  Object.keys(c).forEach(prop => {
    const radio = document.querySelector(`input[name="${prop}"][value="${c[prop]}"]`);
    if (radio) radio.checked = true;
  });
  const rg = parseInt(c['row-gap']) || 0;
  document.getElementById('ctrl-row-gap').value = rg;
  document.getElementById('ctrl-row-gap-val').textContent = rg + 'px';
  const cg = parseInt(c['column-gap']) || 0;
  document.getElementById('ctrl-col-gap').value = cg;
  document.getElementById('ctrl-col-gap-val').textContent = cg + 'px';
}

// =============================================
// PERSIST STATE
// =============================================
function saveState() {
  try { localStorage.setItem('flexmaster-state', JSON.stringify({ container: state.container, items: state.items, nextId: state.nextId })); }
  catch(e) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem('flexmaster-state');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (parsed.container) {
      // Migrate old 'gap' property to row-gap + column-gap
      if (parsed.container['gap'] && !parsed.container['row-gap']) {
        parsed.container['row-gap'] = parsed.container['gap'];
        parsed.container['column-gap'] = parsed.container['gap'];
        delete parsed.container['gap'];
      }
      state.container = parsed.container;
    }
    if (parsed.items) state.items = parsed.items;
    if (parsed.nextId) state.nextId = parsed.nextId;
    syncControlsToState();
  } catch(e) {}
}

// =============================================
// GUIDE DATA & RENDER
// =============================================
const guideData = [
  {
    prop: 'flex-direction',
    icon: '↔',
    desc: 'Définit la direction de l\'axe principal dans lequel les éléments flex sont placés.',
    values: ['row','row-reverse','column','column-reverse'],
    default: 'row',
    target: 'container',
  },
  {
    prop: 'flex-wrap',
    icon: '↩',
    desc: 'Contrôle si les éléments passent sur une nouvelle ligne quand il n\'y a plus de place.',
    values: ['nowrap','wrap','wrap-reverse'],
    default: 'nowrap',
    target: 'container',
  },
  {
    prop: 'justify-content',
    icon: '⇔',
    desc: 'Aligne les éléments le long de l\'axe principal (horizontal par défaut).',
    values: ['flex-start','flex-end','center','space-between','space-around','space-evenly'],
    default: 'flex-start',
    target: 'container',
  },
  {
    prop: 'align-items',
    icon: '⇕',
    desc: 'Aligne les éléments le long de l\'axe secondaire (vertical par défaut) pour une seule ligne.',
    values: ['stretch','flex-start','flex-end','center','baseline'],
    default: 'stretch',
    target: 'container',
  },
  {
    prop: 'align-content',
    icon: '☰',
    desc: 'Aligne les lignes flex quand il y en a plusieurs (nécessite flex-wrap: wrap).',
    values: ['stretch','flex-start','flex-end','center','space-between','space-around'],
    default: 'stretch',
    target: 'container',
  },
  {
    prop: 'row-gap',
    icon: '↕',
    desc: 'Espace entre les lignes flex. Utile quand flex-wrap: wrap est activé et que les éléments passent sur plusieurs rangées.',
    values: ['0px','8px','16px','24px','...'],
    default: '0px',
    target: 'container',
  },
  {
    prop: 'column-gap',
    icon: '↔',
    desc: 'Espace entre les éléments sur l\'axe principal (entre les colonnes d\'une même rangée).',
    values: ['0px','8px','16px','24px','...'],
    default: '0px',
    target: 'container',
  },
  {
    prop: 'flex-grow',
    icon: '↗',
    desc: 'Détermine si un élément peut grandir pour occuper l\'espace disponible restant.',
    values: ['0','1','2','3','...'],
    default: '0',
    target: 'item',
  },
  {
    prop: 'flex-shrink',
    icon: '↙',
    desc: 'Détermine si un élément peut rétrécir pour éviter le débordement du conteneur.',
    values: ['0','1','2','3','...'],
    default: '1',
    target: 'item',
  },
  {
    prop: 'flex-basis',
    icon: '↔',
    desc: 'Définit la taille de base d\'un élément avant la distribution de l\'espace disponible.',
    values: ['auto','0','100px','50%','...'],
    default: 'auto',
    target: 'item',
  },
  {
    prop: 'align-self',
    icon: '⟂',
    desc: 'Remplace align-items du parent pour un élément spécifique.',
    values: ['auto','flex-start','flex-end','center','stretch','baseline'],
    default: 'auto',
    target: 'item',
  },
  {
    prop: 'order',
    icon: '⇄',
    desc: 'Contrôle l\'ordre dans lequel les éléments apparaissent dans le conteneur flex.',
    values: ['-2','-1','0','1','2','...'],
    default: '0',
    target: 'item',
  },
];

function renderGuide() {
  const grid = document.getElementById('guide-grid');
  grid.innerHTML = guideData.map(card => {
    const tags = card.values.map(v =>
      `<span class="guide-tag${v === card.default ? ' default' : ''}">${v}${v === card.default ? ' *' : ''}</span>`
    ).join('');
    const targetLabel = card.target === 'container'
      ? '<span style="font-size:0.7rem;color:var(--secondary);background:rgba(100,220,255,0.08);padding:2px 7px;border-radius:4px;font-weight:500;">conteneur</span>'
      : '<span style="font-size:0.7rem;color:var(--primary);background:var(--primary-glow);padding:2px 7px;border-radius:4px;font-weight:500;">élément</span>';
    return `
      <div class="guide-card">
        <div class="guide-card-header">
          <div class="guide-card-icon">${card.icon}</div>
          <div>
            <div class="guide-card-title">${card.prop}</div>
            <div style="margin-top:3px">${targetLabel}</div>
          </div>
        </div>
        <p class="guide-card-desc">${card.desc}</p>
        <div class="guide-values">${tags}</div>
      </div>`;
  }).join('');
}

// =============================================
// NAV ACTIVE STATE
// =============================================
function initNav() {
  const sections = ['playground','guide'];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        sections.forEach(s => {
          document.getElementById(`nav-${s}`)?.classList.toggle('active', s === e.target.id);
        });
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => {
    const el = document.getElementById(s);
    if (el) observer.observe(el);
  });
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  bindContainerControls();
  renderPreview();
  renderGuide();
  initNav();
});
