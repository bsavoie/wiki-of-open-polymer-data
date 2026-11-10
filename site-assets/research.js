(() => {
  const filters = document.querySelector('[data-research-filters]');
  if (filters) {
    const fields = [...filters.querySelectorAll('[data-research-filter]')];
    const questions = [...document.querySelectorAll('[data-research-question]')];
    const count = document.querySelector('[data-research-count]');
    const empty = document.querySelector('[data-research-empty]');
    const update = () => {
      let visible = 0;
      for (const question of questions) {
        question.hidden = !fields.every((field) => !field.value || question.dataset[field.dataset.researchFilter] === field.value);
        if (!question.hidden) visible += 1;
      }
      count.textContent = `${visible} questions shown`;
      empty.hidden = visible !== 0;
    };
    const restore = () => {
      const params = new URL(location.href).searchParams;
      for (const field of fields) field.value = params.get(`research-${field.dataset.researchFilter}`) || '';
      update();
    };
    const save = () => {
      const url = new URL(location.href);
      for (const field of fields) {
        const key = `research-${field.dataset.researchFilter}`;
        if (field.value) url.searchParams.set(key, field.value);
        else url.searchParams.delete(key);
      }
      if (url.href !== location.href) history.replaceState(history.state, '', url);
      update();
    };
    filters.hidden = false;
    filters.addEventListener('submit', (event) => event.preventDefault());
    filters.addEventListener('change', save);
    filters.addEventListener('reset', () => requestAnimationFrame(save));
    addEventListener('popstate', restore);
    addEventListener('pageshow', restore);
    restore();
  }

  const form = document.querySelector('[data-research-request]');
  if (!form) return;
  form.hidden = false;
  const fields = ['section', 'question', 'scope', 'acceptanceCriteria'];
  const status = form.querySelector('[data-request-status]');
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-request-section]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    form.elements.section.value = link.dataset.requestSection;
    form.closest('details').open = true;
    status.textContent = '';
  }, true);
  form.addEventListener('input', (event) => {
    if (fields.includes(event.target.name)) event.target.setCustomValidity('');
    status.textContent = '';
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const request = { schema: 'wop-research-request-v1', wopId: form.dataset.wopId };
    for (const key of fields) {
      const field = form.elements[key];
      request[key] = field.value.trim();
      field.setCustomValidity(request[key] ? '' : 'Please enter a specific, non-empty response.');
    }
    if (!form.reportValidity()) return;
    const blob = new Blob([JSON.stringify(request, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${request.wopId}-${request.section}-research-request.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Request prepared for download. Nothing was sent. Share the JSON file with a maintainer for review and import.';
  });
})();
