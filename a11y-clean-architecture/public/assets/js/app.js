const API_BASE = '/api';
const A11Y_PREFERENCES_KEY = 'a11y_preferences';

const elements = {
  fields: document.getElementById('dynamic-fields'),
  form: document.getElementById('a11y-form'),
  error: document.getElementById('form-error'),
  resultsSection: document.getElementById('results-section'),
  results: document.getElementById('results'),
  reset: document.getElementById('btn-reset'),
  copy: document.getElementById('btn-copy'),
  export: document.getElementById('btn-export'),
  toggleAccessibility: document.getElementById('toggle-accessibility'),
  accessibilityStatus: document.getElementById('a11y-status'),
  toastRoot: document.getElementById('toast-root')
};

let currentPayload = null;
let vlibrasStarted = false;

const mockRules = {
  questions: [
    {
      id: 'interfaceType',
      label: 'Qual é o tipo principal de interface?',
      type: 'select',
      required: true,
      options: [
        { value: 'form', label: 'Formulário (cadastro/login/checkout)' },
        { value: 'modal', label: 'Modal/diálogo' },
        { value: 'navigation', label: 'Navegação (menus, sidebar, tabs)' },
        { value: 'content', label: 'Conteúdo (artigo/página informativa)' }
      ]
    },
    {
      id: 'keyboardOnly',
      label: 'O fluxo precisa ser 100% utilizável por teclado?',
      type: 'boolean',
      required: true
    },
    {
      id: 'screenReader',
      label: 'O fluxo precisa funcionar bem com leitor de tela?',
      type: 'boolean',
      required: true
    },
    {
      id: 'sensorySensitivity',
      label: 'Há risco de sensibilidade sensorial (movimento, flashes, sons)?',
      type: 'boolean',
      required: true
    },
    {
      id: 'highCognitiveLoad',
      label: 'A tarefa envolve muitos passos/opções (alta carga cognitiva)?',
      type: 'boolean',
      required: true
    },
    {
      id: 'timePressure',
      label: 'Existe pressão de tempo (sessão expira, countdown etc.)?',
      type: 'boolean',
      required: true
    }
  ]
};

function createDefaultPreferences() {
  return {
    highContrast: false,
    reduceMotion: false,
    largeText: false
  };
}

function getStoredPreferences() {
  try {
    const rawValue = localStorage.getItem(A11Y_PREFERENCES_KEY);

    if (!rawValue) {
      return createDefaultPreferences();
    }

    return {
      ...createDefaultPreferences(),
      ...JSON.parse(rawValue)
    };
  } catch {
    return createDefaultPreferences();
  }
}

function savePreferences(preferences) {
  localStorage.setItem(A11Y_PREFERENCES_KEY, JSON.stringify(preferences));
}

function setAccessibilityMode(enabled) {
  const preferences = {
    highContrast: enabled,
    reduceMotion: enabled,
    largeText: enabled
  };

  document.body.classList.toggle('high-contrast', preferences.highContrast);
  document.body.classList.toggle('reduce-motion', preferences.reduceMotion);
  document.body.classList.toggle('large-text', preferences.largeText);

  elements.toggleAccessibility.setAttribute('aria-pressed', String(enabled));
  elements.accessibilityStatus.textContent = enabled ? 'modo acessível ativo' : 'modo padrão';

  savePreferences(preferences);
}

function toggleAccessibilityMode() {
  const isEnabled = document.body.classList.contains('high-contrast');
  setAccessibilityMode(!isEnabled);
  showToast(!isEnabled ? 'Modo de acessibilidade ativado.' : 'Modo padrão restabelecido.');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast--error' : ''}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.textContent = message;

  elements.toastRoot.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function setError(message = '') {
  elements.error.textContent = message;

  if (message) {
    showToast(message, 'error');
  }
}

function safeInitVlibras(retries = 20) {
  if (vlibrasStarted) {
    return;
  }

  const container = document.querySelector('[vw]');

  if (!container) {
    console.warn('VLibras: container [vw] não encontrado.');
    return;
  }

  if (window.VLibras && typeof window.VLibras.Widget === 'function') {
    try {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
      vlibrasStarted = true;
      console.info('VLibras inicializado com sucesso.');
      return;
    } catch (error) {
      console.warn('VLibras falhou ao inicializar:', error);
      return;
    }
  }

  if (retries > 0) {
    setTimeout(() => safeInitVlibras(retries - 1), 300);
  } else {
    console.warn('VLibras não ficou disponível após múltiplas tentativas.');
  }
}

function simulateBackendEvaluation(answers) {
  const wcag = [];
  const gaia = [];
  const techniques = [];

  if (answers.interfaceType === 'form') {
    wcag.push({
      id: '1.3.1',
      name: 'Info and Relationships',
      summary: 'Estrutura semântica e relações programáticas claras.'
    });
    wcag.push({
      id: '3.3.2',
      name: 'Labels or Instructions',
      summary: 'Rótulos visíveis e instruções claras para inputs.'
    });
    gaia.push({
      id: 'COGNITIVE_LOAD',
      name: 'Redução de Carga Cognitiva',
      summary: 'Quebrar o formulário em etapas lógicas.'
    });
    techniques.push('Associar a tag <label> diretamente ao ID do <input>.');
    techniques.push('Utilizar aria-describedby para mensagens de erro inline.');
  }

  if (answers.interfaceType === 'modal') {
    wcag.push({
      id: '2.4.3',
      name: 'Focus Order',
      summary: 'Ordem lógica de foco (Focus Trap).'
    });
    gaia.push({
      id: 'USER_AUTONOMY',
      name: 'Autonomia do Usuário',
      summary: 'Garantir botões de saída fáceis de encontrar.'
    });
    techniques.push('Retornar o foco ao elemento acionador ao fechar o modal.');
  }

  if (answers.keyboardOnly) {
    wcag.push({
      id: '2.1.1',
      name: 'Keyboard',
      summary: 'Todas as funcionalidades operáveis via teclado.'
    });
    wcag.push({
      id: '2.4.7',
      name: 'Focus Visible',
      summary: 'Indicador visual de foco evidente.'
    });
    techniques.push('Garantir outline através da pseudo-classe :focus-visible.');
  }

  if (answers.screenReader) {
    wcag.push({
      id: '4.1.2',
      name: 'Name, Role, Value',
      summary: 'Nome, função e valor expostos programaticamente.'
    });
    techniques.push("Anunciar mudanças dinâmicas de estado via aria-live='polite'.");
  }

  if (answers.timePressure) {
    gaia.push({
      id: 'PREDICTABILITY',
      name: 'Previsibilidade',
      summary: 'Avisar o usuário antes que sessões expirem.'
    });
  }

  if (wcag.length === 0) {
    wcag.push({
      id: '1.4.3',
      name: 'Contrast (Minimum)',
      summary: 'Garantir contraste mínimo de 4.5:1.'
    });
  }

  const goalsByInterface = {
    form: 'preencher dados',
    modal: 'visualizar detalhes',
    navigation: 'encontrar seções',
    content: 'consumir informações'
  };

  const role = answers.screenReader ? 'usuário de tecnologia assistiva' : 'usuário';

  return {
    answers,
    recommendations: { wcag, gaia, techniques },
    artifacts: {
      userStory: `Como ${role},\nQuero ${goalsByInterface[answers.interfaceType] || 'operar a interface'},\nPara concluir meu objetivo com autonomia e sem barreiras tecnológicas.`,
      bdd: `Funcionalidade: Requisitos de acessibilidade

Cenário: Navegação assistida
  Dado que a pessoa usuária acessa o componente
  Quando interage usando recursos assistivos preferenciais
  Então o sistema deve responder de forma previsível e descritiva`
    }
  };
}

function createSelectField(question) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field-stack';

  const label = document.createElement('label');
  label.className = 'field-label';
  label.setAttribute('for', question.id);
  label.textContent = question.label;

  const select = document.createElement('select');
  select.id = question.id;
  select.name = question.id;
  select.required = Boolean(question.required);
  select.className = 'editorial-input';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Selecione o cenário...';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  question.options.forEach((optionData) => {
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    select.appendChild(option);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);

  return wrapper;
}

function createBooleanField(question) {
  const wrapper = document.createElement('div');
  wrapper.className = 'checkbox-card';

  const label = document.createElement('label');
  label.className = 'checkbox-label';
  label.setAttribute('for', question.id);

  const text = document.createElement('span');
  text.className = 'checkbox-text';
  text.textContent = question.label;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = question.id;
  input.name = question.id;

  label.appendChild(text);
  label.appendChild(input);
  wrapper.appendChild(label);

  return wrapper;
}

function renderQuestionnaire(questions) {
  elements.fields.innerHTML = '';

  const selectQuestions = questions.filter((question) => question.type === 'select');
  const booleanQuestions = questions.filter((question) => question.type === 'boolean');

  selectQuestions.forEach((question) => {
    elements.fields.appendChild(createSelectField(question));
  });

  if (booleanQuestions.length > 0) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'group-fieldset';

    const legend = document.createElement('legend');
    legend.className = 'group-legend';
    legend.textContent = 'Condições Específicas do Fluxo';

    const grid = document.createElement('div');
    grid.className = 'checkbox-grid';

    booleanQuestions.forEach((question) => {
      grid.appendChild(createBooleanField(question));
    });

    fieldset.appendChild(legend);
    fieldset.appendChild(grid);
    elements.fields.appendChild(fieldset);
  }
}

function readFormValues() {
  const valueAsBoolean = (fieldId) => Boolean(document.getElementById(fieldId)?.checked);

  return {
    interfaceType: document.getElementById('interfaceType')?.value,
    keyboardOnly: valueAsBoolean('keyboardOnly'),
    screenReader: valueAsBoolean('screenReader'),
    sensorySensitivity: valueAsBoolean('sensorySensitivity'),
    highCognitiveLoad: valueAsBoolean('highCognitiveLoad'),
    timePressure: valueAsBoolean('timePressure')
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderRecommendationList(items, formatter) {
  if (items.length === 0) {
    return '<li class="recommendation-item"><span class="recommendation-item__summary">Nenhum item mapeado.</span></li>';
  }

  return items.map(formatter).join('');
}

function renderResults(payload) {
  currentPayload = payload;

  const wcagMarkup = renderRecommendationList(payload.recommendations.wcag, (criterion) => `
    <li class="recommendation-item">
      <strong class="recommendation-item__title">Critério ${criterion.id}: ${escapeHtml(criterion.name)}</strong>
      <p class="recommendation-item__summary">${escapeHtml(criterion.summary)}</p>
    </li>
  `);

  const gaiaMarkup = renderRecommendationList(payload.recommendations.gaia, (principle) => `
    <li class="recommendation-item">
      <strong class="recommendation-item__title">Princípio: ${escapeHtml(principle.name)}</strong>
      <p class="recommendation-item__summary">${escapeHtml(principle.summary)}</p>
    </li>
  `);

  const techniquesMarkup = renderRecommendationList(payload.recommendations.techniques, (technique) => `
    <li class="recommendation-item">
      <p class="recommendation-item__summary">${escapeHtml(technique)}</p>
    </li>
  `);

  elements.results.innerHTML = `
    <div class="artifact-grid">
      <div>
        <h3 class="block-title">User Story</h3>
        <pre class="artifact-block">${escapeHtml(payload.artifacts.userStory)}</pre>
      </div>

      <div>
        <h3 class="block-title">BDD (Gherkin em português)</h3>
        <pre class="artifact-block">${escapeHtml(payload.artifacts.bdd)}</pre>
      </div>
    </div>

    <div class="guideline-grid">
      <div>
        <h3 class="block-heading">WCAG 2.2</h3>
        <ul class="recommendation-list">${wcagMarkup}</ul>
      </div>

      <div>
        <h3 class="block-heading">Princípios Gaia</h3>
        <ul class="recommendation-list">${gaiaMarkup}</ul>
      </div>

      <div>
        <h3 class="block-heading">Técnicas</h3>
        <ul class="recommendation-list">${techniquesMarkup}</ul>
      </div>
    </div>
  `;

  elements.resultsSection.classList.remove('hidden');
  setTimeout(() => {
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Erro de comunicação.');
  }

  return data;
}

function createMarkdownExport(payload) {
  return `# Artefatos de Acessibilidade

## User Story

${payload.artifacts.userStory}

## BDD (Gherkin em português)

${payload.artifacts.bdd}

## WCAG

${payload.recommendations.wcag
  .map((criterion) => `- **${criterion.id}** ${criterion.name}: ${criterion.summary}`)
  .join('\n')}

## Gaia

${payload.recommendations.gaia
  .map((principle) => `- **${principle.id}** ${principle.name}: ${principle.summary}`)
  .join('\n')}

## Técnicas

${payload.recommendations.techniques
  .map((technique) => `- ${technique}`)
  .join('\n')}`;
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';

  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

async function loadQuestionnaire() {
  try {
    const response = await fetchJson(`${API_BASE}/rules`);
    renderQuestionnaire(response.questions);
  } catch (error) {
    console.info('API offline. Iniciando modo demonstração.');
    renderQuestionnaire(mockRules.questions);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  setError('');
  elements.resultsSection.classList.add('hidden');

  const answers = readFormValues();

  if (!answers.interfaceType) {
    setError('A seleção do tipo de interface é obrigatória para a avaliação.');
    return;
  }

  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  submitButton.textContent = 'Processando Contexto...';
  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');

  try {
    let result;

    try {
      result = await fetchJson(`${API_BASE}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers)
      });
      showToast('Avaliação gerada via servidor com sucesso.');
    } catch {
      result = simulateBackendEvaluation(answers);
      showToast('Resultados gerados localmente (modo demonstração).');
    }

    renderResults(result);
  } finally {
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  }
}

function handleReset() {
  elements.form.reset();
  elements.resultsSection.classList.add('hidden');
  currentPayload = null;
  setError('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Formulário redefinido para uma nova análise.');
}

async function handleCopy() {
  if (!currentPayload) {
    return;
  }

  const content = createMarkdownExport(currentPayload);

  try {
    await navigator.clipboard.writeText(content);
    showToast('Artefatos copiados para a área de transferência.');
  } catch {
    fallbackCopy(content);
    showToast('Artefatos copiados via fallback.');
  }
}

function handleExport() {
  if (!currentPayload) {
    return;
  }

  const markdown = createMarkdownExport(currentPayload);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'a11y-requirements.md';
  link.click();

  URL.revokeObjectURL(url);
  showToast('Arquivo .md exportado com sucesso.');
}

function bindEvents() {
  elements.form.addEventListener('submit', handleFormSubmit);
  elements.reset.addEventListener('click', handleReset);
  elements.copy.addEventListener('click', handleCopy);
  elements.export.addEventListener('click', handleExport);
  elements.toggleAccessibility.addEventListener('click', toggleAccessibilityMode);
}

function initializeApp() {
  safeInitVlibras();

  const preferences = getStoredPreferences();
  const shouldEnableAccessibilityMode =
    preferences.highContrast ||
    preferences.reduceMotion ||
    preferences.largeText;

  setAccessibilityMode(shouldEnableAccessibilityMode);
  bindEvents();
  loadQuestionnaire();
}

document.addEventListener('DOMContentLoaded', initializeApp);