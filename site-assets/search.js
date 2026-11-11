(() => {
  const controls = document.querySelector('[data-catalog-controls]');
  if (!controls) return;

  const input = controls.querySelector('[data-search-input]');
  const classFilter = controls.querySelector('[data-class-filter]');
  const behaviorFilter = controls.querySelector('[data-behavior-filter]');
  const cards = [...document.querySelectorAll('[data-polymer-card]')];
  const grid = document.querySelector('[data-polymer-grid]');
  const count = document.querySelector('[data-result-count]');
  const displayed = document.querySelector('[data-displayed-count]');
  const expand = document.querySelector('[data-catalog-expand]');
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

  let expanded = false;
  const narrow = typeof matchMedia === 'function' ? matchMedia('(max-width: 600px)') : null;

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
    // Keep the most direct name or curated-term match in the collapsed view.
    // The original catalog order is retained for ties and when search is clear.
    const ranked = cards.map((card, order) => {
      const name = normalize(card.querySelector?.('h3')?.textContent);
      const directTerm = termIndex.some((entry) => entry.term === query && entry.ids.has(card.dataset.wopId));
      const rank = !query ? 0 : name === query ? 0
        : directTerm ? 1 : name.startsWith(`${query} `) ? 2
          : name.startsWith(query) ? 3 : 4;
      return { card, order, rank };
    }).sort((a, b) => a.rank - b.rank || a.order - b.order);
    if (grid) for (const { card } of ranked) grid.appendChild(card);
    let matches = 0;
    let visible = 0;
    const limit = narrow?.matches ? 3 : 6;
    for (const { card } of ranked) {
      const textMatches = !query || normalize(card.dataset.search).includes(query) || termMatches.has(card.dataset.wopId);
      const classMatches = !primaryClass || card.dataset.primaryClass === primaryClass;
      const behaviorMatches = !behavior || card.dataset.behaviors.split(' ').includes(behavior);
      const matched = textMatches && classMatches && behaviorMatches;
      if (matched) matches += 1;
      const show = matched && (!expand || expanded || matches <= limit);
      card.hidden = !show;
      if (show) visible += 1;
    }
    count.textContent = String(matches);
    if (displayed) displayed.textContent = visible < matches ? ` · showing ${visible}` : '';
    empty.hidden = matches !== 0;
    if (expand) {
      expand.hidden = matches <= limit;
      expand.setAttribute('aria-expanded', String(expanded));
      expand.textContent = expanded ? 'Show fewer entries' : `Show all ${matches} entries`;
    }
  }

  const fields = [['q', input], ['class', classFilter], ['behavior', behaviorFilter]];
  function restore() {
    const params = new URL(location.href).searchParams;
    for (const [key, field] of fields) field.value = params.get(key) || '';
    update();
  }
  function save() {
    const url = new URL(location.href);
    for (const [key, field] of fields) {
      if (field.value) url.searchParams.set(key, field.value);
      else url.searchParams.delete(key);
    }
    if (url.href !== location.href) history.replaceState(history.state, '', url);
    update();
  }
  controls.addEventListener('submit', (event) => { event.preventDefault(); save(); });
  controls.addEventListener('input', save);
  controls.addEventListener('change', save);
  controls.addEventListener('reset', () => requestAnimationFrame(save));
  if (expand) expand.addEventListener('click', () => { expanded = !expanded; update(); });
  narrow?.addEventListener?.('change', update);
  addEventListener('popstate', restore);
  addEventListener('pageshow', restore);
  restore();
})();
