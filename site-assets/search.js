(() => {
  const controls = document.querySelector('[data-catalog-controls]');
  if (!controls) return;

  const input = controls.querySelector('[data-search-input]');
  const classFilter = controls.querySelector('[data-class-filter]');
  const behaviorFilter = controls.querySelector('[data-behavior-filter]');
  const cards = [...document.querySelectorAll('[data-polymer-card]')];
  const count = document.querySelector('[data-result-count]');
  const empty = document.querySelector('[data-empty-state]');
  const rawIndex = document.querySelector('#catalog-index')?.textContent || '{}';
  const index = JSON.parse(rawIndex);

  const normalize = (value) => String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLocaleLowerCase('en-US');

  const termIndex = [
    ...(index.terms || []).map((entry) => ({
      term: normalize(entry.term),
      ids: new Set(entry.wopIds),
      kind: 'curated'
    })),
    ...(index.aliases || []).map((entry) => ({
      term: normalize(entry.slug),
      ids: new Set([entry.wopId]),
      kind: 'alias'
    }))
  ];

  function update() {
    const query = normalize(input.value);
    const primaryClass = classFilter.value;
    const behavior = behaviorFilter.value;
    const termMatches = new Set();
    if (query) {
      for (const entry of termIndex) {
        const reverseMatch = query.includes(entry.term) && (entry.kind === 'curated' || entry.term.length >= 6);
        if (entry.term.includes(query) || reverseMatch) {
          for (const id of entry.ids) termMatches.add(id);
        }
      }
    }
    let visible = 0;
    for (const card of cards) {
      const textMatches = !query || normalize(card.dataset.search).includes(query) || termMatches.has(card.dataset.wopId);
      const classMatches = !primaryClass || card.dataset.primaryClass === primaryClass;
      const behaviorMatches = !behavior || card.dataset.behaviors.split(' ').includes(behavior);
      const show = textMatches && classMatches && behaviorMatches;
      card.hidden = !show;
      if (show) visible += 1;
    }
    count.textContent = String(visible);
    empty.hidden = visible !== 0;
  }

  controls.addEventListener('input', update);
  controls.addEventListener('change', update);
  controls.addEventListener('reset', () => requestAnimationFrame(update));
})();
