(function () {
  const { generateLearningExperience, LEVELS } = window.LearningEngine;

  const navItems = [
    { key: 'overview', label: 'Overview', icon: '⌂' },
    { key: 'curriculum', label: 'Study plan', icon: '▤' },
    { key: 'questions', label: 'Question bank', icon: '◇', badge: '8' },
    { key: 'coach', label: 'Coach review', icon: '✦', badge: '1' },
  ];

  const state = {
    view: 'overview',
    profile: {
      learnerName: 'Alex Morgan',
      topic: 'Quantum Computing',
      level: 'Beginner',
      goal: 'understand the fundamentals and solve small problems',
      schedule: '3 sessions per week',
    },
    output: null,
    activeModule: 1,
    answers: {},
    results: {},
    history: [],
    coachFlag: false,
    search: '',
  };

  state.output = generateLearningExperience(state.profile);

  const app = document.getElementById('app');
  const nav = document.getElementById('primary-nav');
  const breadcrumb = document.getElementById('breadcrumb-view');

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderMarkdown(markdown) {
    return escapeHtml(markdown)
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^\*\*(.+?)\*\*\.?/gm, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/^(\d+)\. (.+)$/gm, '<div class="step-line"><b>$1</b>$2</div>')
      .split(/\n{2,}/)
      .map((block) => block.startsWith('<h4>') || block.startsWith('<ul>') || block.startsWith('<div class="step-line">') ? block : `<p>${block.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  function current() { return state.output; }
  function questionById(id) { return current().question_bank.find((question) => question.question_id === id); }
  function answerCount() { return Object.keys(state.results).length; }
  function correctCount() { return Object.values(state.results).filter((result) => result.correct).length; }
  function scorePercent() { return answerCount() ? Math.round((correctCount() / answerCount()) * 100) : 0; }

  function renderNavigation() {
    nav.innerHTML = navItems.map((item) => `<button class="astra-nav-item ${state.view === item.key ? 'active' : ''}" data-action="navigate" data-view="${item.key}">
      <span class="astra-nav-icon">${item.icon}</span><span>${item.label}</span>${item.badge ? `<b>${item.key === 'coach' && state.coachFlag ? '!' : item.badge}</b>` : ''}
    </button>`).join('');
    breadcrumb.textContent = navItems.find((item) => item.key === state.view)?.label || 'Overview';
    document.getElementById('sidebar-student').textContent = state.profile.learnerName;
    document.getElementById('sidebar-level').textContent = `${state.profile.level} learner`;
  }

  function pageHead(eyebrow, title, subtitle, actions = '') {
    return `<div class="page-head"><div><div class="eyebrow"><span></span>${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div>${actions ? `<div class="page-actions">${actions}</div>` : ''}</div>`;
  }

  function button(label, action, className = '', extra = '') {
    return `<button class="astra-button ${className}" data-action="${action}" ${extra}>${label}</button>`;
  }

  function renderBuilder() {
    const profile = state.profile;
    return `<section class="builder-card">
      <div class="builder-copy"><div class="eyebrow light"><span></span>Instant curriculum generation</div><h2>What do you want to learn next?</h2><p>Give Astra a topic and a learner profile. It will shape the path, practice, and coaching signals in one pass.</p><div class="builder-chips"><span>Any topic</span><span>Adaptive level</span><span>Coach-ready output</span></div></div>
      <form id="generator-form" class="generator-form">
        <label>Topic<input name="topic" value="${escapeHtml(profile.topic)}" placeholder="e.g. Organic chemistry" required /></label>
        <div class="form-two"><label>Learner level<select name="level">${LEVELS.map((level) => `<option ${profile.level === level ? 'selected' : ''}>${level}</option>`).join('')}</select></label><label>Study rhythm<select name="schedule"><option ${profile.schedule === '3 sessions per week' ? 'selected' : ''}>3 sessions per week</option><option ${profile.schedule === 'Daily, 30 minutes' ? 'selected' : ''}>Daily, 30 minutes</option><option ${profile.schedule === '1 session per week' ? 'selected' : ''}>1 session per week</option></select></label></div>
        <label>Learning goal<input name="goal" value="${escapeHtml(profile.goal)}" placeholder="e.g. prepare for a practical project" required /></label>
        <label>Learner name<input name="learnerName" value="${escapeHtml(profile.learnerName)}" placeholder="e.g. Alex Morgan" required /></label>
        <button class="generate-button" type="submit"><span>✦</span> Generate adaptive path <b>↗</b></button>
      </form>
    </section>`;
  }

  function renderOutputCard() {
    const metadata = current().topic_metadata;
    return `<section class="json-card"><div class="section-top"><div><div class="card-kicker">Structured output</div><h2>One contract, four learning layers</h2></div><span class="live-pill"><i></i>JSON ready</span></div><div class="json-preview"><div><span class="json-key">topic_metadata</span><b>{</b><span class="json-line"><em>topic_title</em>: “${escapeHtml(metadata.topic_title)}”</span><span class="json-line"><em>level</em>: “${metadata.target_audience_level}”</span><span class="json-line"><em>duration</em>: “${metadata.estimated_total_duration}”</span><b>}</b></div><div class="json-layers"><span><b>01</b>Study plan</span><span><b>02</b>Question bank</span><span><b>03</b>Coach insights</span></div></div>${button('View clean JSON', 'show-json', 'text-button')}<button class="copy-json-button" data-action="copy-json" aria-label="Copy generated JSON">⧉</button></section>`;
  }

  function renderStatStrip() {
    const output = current();
    const completed = answerCount();
    return `<div class="stat-strip"><div><span>Modules</span><strong>${output.study_plan.length}</strong><small>progressive steps</small></div><div><span>Practice items</span><strong>${output.question_bank.length}</strong><small>mixed formats</small></div><div><span>Coach signal</span><strong>${state.coachFlag ? 'Review' : 'Clear'}</strong><small>${state.coachFlag ? 'intervention suggested' : 'no flag yet'}</small></div><div><span>Practice score</span><strong>${completed ? `${scorePercent()}%` : '—'}</strong><small>${completed ? `${completed} checked` : 'start when ready'}</small></div></div>`;
  }

  function renderModulePreview() {
    return `<section class="card-block"><div class="section-top"><div><div class="card-kicker">Study plan</div><h2>A path that gets more useful as you go</h2></div>${button('Open full plan →', 'navigate', 'text-button', 'data-view="curriculum"')}</div><div class="module-preview">${current().study_plan.slice(0, 3).map((module, index) => `<button class="module-preview-row" data-action="open-module" data-module="${module.module_id}"><span class="module-number">0${module.module_id}</span><span><b>${escapeHtml(module.module_title)}</b><small>${escapeHtml(module.learning_objectives[0])}</small></span><i>${index === 0 ? 'Start here' : index === 1 ? 'Build skill' : 'Apply it'} <b>→</b></i></button>`).join('')}</div></section>`;
  }

  function renderCoachPreview() {
    const insight = current().coach_insights;
    return `<section class="card-block coach-preview"><div class="section-top"><div><div class="card-kicker">Human-in-the-loop</div><h2>Coach radar</h2></div><span class="status-chip ${state.coachFlag ? 'alert' : 'good'}"><i></i>${state.coachFlag ? 'Needs review' : 'Monitoring'}</span></div><p class="coach-prompt">${escapeHtml(state.coachFlag ? 'A pattern needs a human look before the learner moves on.' : insight.suggested_intervention_trigger)}</p><div class="coach-mini-list"><div><span>Focus</span><b>${escapeHtml(insight.recommended_focus_areas[0])}</b></div><div><span>Watch for</span><b>${escapeHtml(insight.potential_student_struggle_points[0])}</b></div></div>${button('Open coach review →', 'navigate', 'text-button', 'data-view="coach"')}</section>`;
  }

  function renderOverview() {
    return `${pageHead('Adaptive learning engine', `Good morning, ${escapeHtml(state.profile.learnerName.split(' ')[0])}`, 'Turn any topic into a structured, practice-first learning experience with a clear handoff to a human coach.', button('Export JSON', 'download-json', 'secondary-button') + button('View question bank →', 'navigate', 'primary-button', 'data-view="questions"'))}
      ${renderBuilder()}${renderStatStrip()}<div class="dashboard-columns">${renderModulePreview()}${renderOutputCard()}</div><div class="dashboard-columns lower">${renderCoachPreview()}<section class="card-block philosophy-card"><div class="philosophy-orbit">✦</div><div><div class="card-kicker">Astra principle</div><h2>Explain → practice → reflect</h2><p>Every generated path moves from first principles to realistic application, then leaves a visible signal when a coach should step in.</p></div></section></div>`;
  }

  function renderCurriculum() {
    const module = current().study_plan.find((item) => item.module_id === state.activeModule) || current().study_plan[0];
    return `${pageHead('Study plan', escapeHtml(current().topic_metadata.topic_title), `${current().topic_metadata.target_audience_level} path · ${current().topic_metadata.estimated_total_duration} · tailored to ${escapeHtml(state.profile.goal)}.`, button('Export JSON', 'download-json', 'secondary-button') + button('Practice now →', 'navigate', 'primary-button', 'data-view="questions"'))}
      <div class="curriculum-layout"><aside class="module-rail"><div class="rail-title"><span>Learning sequence</span><b>${current().study_plan.length} modules</b></div>${current().study_plan.map((item) => `<button class="rail-module ${item.module_id === module.module_id ? 'active' : ''}" data-action="open-module" data-module="${item.module_id}"><span>0${item.module_id}</span><div><b>${escapeHtml(item.module_title.replace(/^.*?: /, ''))}</b><small>${escapeHtml(item.learning_objectives[0])}</small></div><i>→</i></button>`).join('')}<div class="rail-note"><span>✦</span><p>Modules stay modular so the coach can reroute the learner without losing the learning history.</p></div></aside><article class="module-detail"><div class="module-detail-head"><div><span class="module-overline">Module 0${module.module_id} · ${module.module_id === 1 ? 'Foundation' : module.module_id === 2 ? 'Practice' : module.module_id === 3 ? 'Application' : 'Transfer'}</span><h2>${escapeHtml(module.module_title)}</h2><p>${escapeHtml(module.learning_objectives[1])}</p></div><div class="module-progress"><strong>${module.module_id}/4</strong><span>sequence</span></div></div><div class="objective-grid">${module.learning_objectives.map((objective, index) => `<div><span>0${index + 1}</span><p>${escapeHtml(objective)}</p></div>`).join('')}</div><div class="notes-panel"><div class="notes-head"><div><span class="card-kicker">Core content summary</span><h3>Learn it in plain language</h3></div><span class="markdown-label">Markdown notes</span></div><div class="markdown-body">${renderMarkdown(module.core_content_summary)}</div></div><div class="takeaway-panel"><div class="takeaway-icon">✓</div><div><span class="card-kicker">Key takeaways</span>${module.key_takeaways.map((takeaway) => `<p>${escapeHtml(takeaway)}</p>`).join('')}</div></div><div class="module-footer">${module.module_id > 1 ? button('← Previous module', 'open-module', 'secondary-button', `data-module="${module.module_id - 1}"`) : '<span></span>'}${module.module_id < current().study_plan.length ? button('Next module →', 'open-module', 'primary-button', `data-module="${module.module_id + 1}"`) : button('Start practice →', 'navigate', 'primary-button', 'data-view="questions"')}</div></article></div>`;
  }

  function evaluateAnswer(question, answer) {
    const value = String(answer || '').trim().toLowerCase();
    if (!value) return false;
    if (question.question_type === 'multiple_choice') return value === question.correct_answer.toLowerCase();
    if (value.length < 20) return false;
    const signals = ['connect', 'purpose', 'example', 'process', 'feedback', 'revise', 'small', 'assumption', 'measurement', 'timeline', 'function', 'test', 'debug', 'probabil', 'plain language', 'core'];
    return signals.some((signal) => value.includes(signal));
  }

  function questionStatus(id) {
    const result = state.results[id];
    if (!result) return '';
    return result.correct ? '<span class="answer-status correct">Correct · keep going</span>' : '<span class="answer-status incorrect">Needs another pass</span>';
  }

  function renderQuestion(question, index) {
    const selected = state.answers[question.question_id] || '';
    const result = state.results[question.question_id];
    const typeLabel = question.question_type === 'multiple_choice' ? 'Multiple choice' : question.question_type === 'short_answer' ? 'Short answer' : 'Scenario';
    return `<article class="question-card ${result ? result.correct ? 'answered-correct' : 'answered-incorrect' : ''}"><div class="question-top"><div><span class="question-index">0${index + 1}</span><span class="question-type">${typeLabel} · Module ${question.module_id}</span></div><span class="difficulty ${question.difficulty.toLowerCase()}">${question.difficulty}</span></div><h3>${escapeHtml(question.prompt)}</h3>${question.question_type === 'multiple_choice' ? `<div class="option-list">${question.options.map((option) => `<button class="option ${selected === option ? 'selected' : ''} ${result && option === question.correct_answer ? 'correct-option' : ''}" data-action="select-option" data-question="${question.question_id}" data-answer="${escapeHtml(option)}"><span>${String.fromCharCode(65 + question.options.indexOf(option))}</span>${escapeHtml(option)}</button>`).join('')}</div>` : `<textarea class="answer-input" data-answer-input="${question.question_id}" placeholder="Write your reasoning in a few sentences...">${escapeHtml(selected)}</textarea>`}<div class="question-footer"><div>${questionStatus(question.question_id)}${result ? `<button class="explanation-toggle" data-action="toggle-explanation" data-question="${question.question_id}">${result.showExplanation ? 'Hide' : 'Show'} explanation</button>` : ''}</div>${button(result ? 'Check again' : 'Check answer', 'check-question', result ? 'secondary-button' : 'primary-button', `data-question="${question.question_id}"`)} </div>${result?.showExplanation ? `<div class="explanation-box"><strong>Why this matters</strong><p>${escapeHtml(question.explanation)}</p><div class="expected-answer"><span>Expected answer</span>${escapeHtml(question.correct_answer)}</div></div>` : ''}</article>`;
  }

  function renderQuestions() {
    const total = current().question_bank.length;
    return `${pageHead('Practice lab', 'Prove it to yourself', `Mixed question types reveal whether ${escapeHtml(state.profile.learnerName.split(' ')[0])} can recall, apply, and explain ${escapeHtml(current().topic_metadata.topic_title)}.`, button('Coach review →', 'navigate', 'secondary-button', 'data-view="coach"') + button('Copy JSON', 'copy-json', 'primary-button'))}<div class="practice-banner"><div><span class="card-kicker">Adaptive checkpoint</span><h2>${answerCount() ? `${correctCount()} of ${answerCount()} checked answers are on track` : 'Start with one honest attempt'}</h2><p>${state.coachFlag ? 'A coach flag is active. Use the review panel to see the pattern and recommended intervention.' : 'Do not wait until you feel ready. The explanation after each attempt is part of the lesson.'}</p></div><div class="practice-score"><strong>${answerCount() ? `${scorePercent()}%` : '—'}</strong><span>${answerCount() ? 'current score' : 'no attempts yet'}</span></div></div><div class="question-list">${current().question_bank.map(renderQuestion).join('')}</div><div class="question-endcap">${button('Open coach review →', 'navigate', 'primary-button', 'data-view="coach"')}<span>Trigger rule: ${escapeHtml(current().coach_insights.suggested_intervention_trigger)}</span></div>`;
  }

  function renderCoach() {
    const insight = current().coach_insights;
    const intervention = state.coachFlag ? 'Intervention suggested' : 'Monitoring learner pattern';
    return `${pageHead('Human-in-the-loop', 'Coach review', 'Astra surfaces evidence and a suggested handoff. The coach decides what happens next.', button('Back to questions', 'navigate', 'secondary-button', 'data-view="questions"') + button('Export case JSON', 'download-json', 'primary-button'))}<div class="coach-hero ${state.coachFlag ? 'flagged' : ''}"><div class="coach-hero-icon">${state.coachFlag ? '!' : '✦'}</div><div><span class="card-kicker">${intervention}</span><h2>${state.coachFlag ? 'This learner may be stuck on a bottleneck.' : 'No urgent intervention yet.'}</h2><p>${state.coachFlag ? 'Review the recent attempts, then use a targeted re-teach or a smaller practice task.' : 'The engine will flag a handoff when the defined pattern appears. You can still review early at any time.'}</p></div><span class="coach-rule">Trigger rule<br><b>2 consecutive misses</b></span></div><div class="coach-grid"><section class="coach-insight-card"><div class="section-top"><div><div class="card-kicker">Recommended focus</div><h2>What to reinforce</h2></div><span class="insight-count">${insight.recommended_focus_areas.length} areas</span></div>${insight.recommended_focus_areas.map((item, index) => `<div class="insight-row"><span>0${index + 1}</span><p>${escapeHtml(item)}</p></div>`).join('')}</section><section class="coach-insight-card warm"><div class="section-top"><div><div class="card-kicker">Potential bottlenecks</div><h2>What to watch for</h2></div><span class="insight-count">${insight.potential_student_struggle_points.length} signals</span></div>${insight.potential_student_struggle_points.map((item, index) => `<div class="insight-row"><span>0${index + 1}</span><p>${escapeHtml(item)}</p></div>`).join('')}</section></div><section class="attempts-card"><div class="section-top"><div><div class="card-kicker">Evidence trail</div><h2>Recent practice attempts</h2></div><span class="status-chip ${state.coachFlag ? 'alert' : 'good'}"><i></i>${answerCount()} checked</span></div>${state.history.length ? state.history.slice().reverse().map((id) => { const q = questionById(id); const result = state.results[id]; return `<div class="attempt-row"><span class="attempt-mark ${result.correct ? 'good' : 'bad'}">${result.correct ? '✓' : '!'}</span><div><b>${escapeHtml(q.prompt)}</b><small>Module ${q.module_id} · ${result.correct ? 'Correct' : 'Needs review'}</small></div><button class="text-button" data-action="show-question" data-question="${id}">View</button></div>`; }).join('') : '<div class="empty-attempts"><span>◇</span><p>Practice attempts will appear here after the learner checks a question.</p></div>'}</section><div class="coach-handoff"><div><span class="card-kicker">Suggested intervention</span><p>${escapeHtml(insight.suggested_intervention_trigger)}</p></div>${button(state.coachFlag ? 'Acknowledge & plan review' : 'Mark for proactive review', 'acknowledge-coach', state.coachFlag ? 'primary-button' : 'secondary-button')}</div>`;
  }

  function renderView() {
    renderNavigation();
    if (state.view === 'curriculum') app.innerHTML = renderCurriculum();
    else if (state.view === 'questions') app.innerHTML = renderQuestions();
    else if (state.view === 'coach') app.innerHTML = renderCoach();
    else app.innerHTML = renderOverview();
  }

  function showToast(message, icon = '✓') {
    const region = document.getElementById('toast-region');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span><p>${escapeHtml(message)}</p>`;
    region.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3300);
  }

  function openModal(content) {
    document.getElementById('modal-root').innerHTML = `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true">${content}</div></div>`;
  }

  function openJsonModal() {
    const json = JSON.stringify(current(), null, 2);
    openModal(`<div class="modal-head"><div><span class="card-kicker">Streaming-safe payload</span><h2>Generated learning experience</h2><p>Copy this object directly into your student or coaching workflow.</p></div><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></div><pre class="json-modal-code">${escapeHtml(json)}</pre><div class="modal-actions">${button('Copy JSON', 'copy-json', 'secondary-button')}${button('Download .json', 'download-json', 'primary-button')}</div>`);
  }

  function copyJson() {
    const json = JSON.stringify(current(), null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {});
    showToast('Structured learning JSON copied to clipboard');
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(current(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${current().topic_metadata.topic_title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'learning-path'}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('JSON download prepared');
  }

  function latestConsecutiveMisses() {
    let misses = 0;
    for (let index = state.history.length - 1; index >= 0; index -= 1) {
      if (state.results[state.history[index]]?.correct) break;
      misses += 1;
    }
    return misses;
  }

  function handleAction(target) {
    const action = target.dataset.action;
    if (!action) return;
    if (action === 'navigate') { state.view = target.dataset.view; renderView(); return; }
    if (action === 'open-module') { state.activeModule = Number(target.dataset.module); state.view = 'curriculum'; renderView(); return; }
    if (action === 'show-json') { openJsonModal(); return; }
    if (action === 'copy-json') { copyJson(); return; }
    if (action === 'download-json') { downloadJson(); return; }
    if (action === 'close-modal') { document.getElementById('modal-root').innerHTML = ''; return; }
    if (action === 'mobile-menu') { document.body.classList.toggle('nav-open'); return; }
    if (action === 'notifications') { showToast('Coach radar is monitoring the active learner', 'i'); return; }
    if (action === 'profile-menu') { showToast('Workspace admin controls are available to the tenant owner', 'i'); return; }
    if (action === 'select-option') { state.answers[target.dataset.question] = target.dataset.answer; renderView(); return; }
    if (action === 'check-question') {
      const id = target.dataset.question;
      const question = questionById(id);
      const input = document.querySelector(`[data-answer-input="${id}"]`);
      const answer = question.question_type === 'multiple_choice' ? state.answers[id] : input?.value || '';
      state.answers[id] = answer;
      state.results[id] = { correct: evaluateAnswer(question, answer), showExplanation: true };
      if (!state.history.includes(id)) state.history.push(id);
      state.coachFlag = latestConsecutiveMisses() >= 2;
      renderView();
      showToast(state.results[id].correct ? 'Nice work — the reasoning is on track' : state.coachFlag ? 'Coach flag raised after consecutive misses' : 'Use the explanation, then try the item again', state.results[id].correct ? '✓' : '!');
      return;
    }
    if (action === 'toggle-explanation') { const id = target.dataset.question; state.results[id].showExplanation = !state.results[id].showExplanation; renderView(); return; }
    if (action === 'show-question') { state.view = 'questions'; renderView(); window.setTimeout(() => document.querySelector(`[data-question="${target.dataset.question}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30); return; }
    if (action === 'acknowledge-coach') { state.coachFlag = false; showToast('Coach handoff acknowledged — continue with a smaller next step'); renderView(); return; }
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (target?.classList.contains('modal-backdrop') && event.target !== target) return;
    if (target) handleAction(target);
  });

  document.addEventListener('submit', (event) => {
    if (event.target.id !== 'generator-form') return;
    event.preventDefault();
    const data = new FormData(event.target);
    state.profile = Object.fromEntries(data.entries());
    state.output = generateLearningExperience(state.profile);
    state.activeModule = 1;
    state.answers = {};
    state.results = {};
    state.history = [];
    state.coachFlag = false;
    state.view = 'overview';
    renderView();
    showToast(`Adaptive path generated for ${state.profile.learnerName}`);
  });

  document.addEventListener('input', (event) => {
    const id = event.target.dataset.answerInput;
    if (id) state.answers[id] = event.target.value;
  });

  document.getElementById('global-search').addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const query = event.target.value.trim().toLowerCase();
    if (!query) return;
    const matchesTopic = current().topic_metadata.topic_title.toLowerCase().includes(query);
    if (matchesTopic || 'learner coach study plan question bank'.includes(query)) {
      state.view = query.includes('question') ? 'questions' : query.includes('coach') ? 'coach' : query.includes('plan') ? 'curriculum' : 'overview';
      renderView();
      showToast(`Showing workspace results for “${event.target.value.trim()}”`);
    } else showToast(`No matching workspace result for “${event.target.value.trim()}”`, 'i');
  });

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.getElementById('global-search').focus(); }
    if (event.key === 'Escape') { document.getElementById('modal-root').innerHTML = ''; document.body.classList.remove('nav-open'); }
  });

  renderView();
})();
