(() => {
  // With JavaScript disabled the regions remain focusable. Once enhanced,
  // avoid a tab stop and scroll hint when the visible figure actually fits.
  const structureScrollRegions = [...document.querySelectorAll('[data-structure-scroll]')];
  const initializedStructureScrollRegions = new WeakSet();
  let refreshStructureScroll = () => {};
  if (structureScrollRegions.length) {
    const syncStructureScroll = (region) => {
      const overflowing = region.clientWidth > 0 && region.scrollWidth > region.clientWidth + 1;
      region.tabIndex = overflowing ? 0 : -1;
      region.classList.toggle('is-not-overflowing', !overflowing);
      // Show the center of long molecules first, but never reset a reader's scroll.
      // Hidden tabs have no width, so initialize only once the region is visible.
      if (overflowing && !initializedStructureScrollRegions.has(region)) {
        region.scrollLeft = Math.round((region.scrollWidth - region.clientWidth) / 2);
        initializedStructureScrollRegions.add(region);
      }
    };
    refreshStructureScroll = () => structureScrollRegions.forEach(syncStructureScroll);
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver((entries) => entries.forEach(({ target }) => syncStructureScroll(target)));
      structureScrollRegions.forEach((region) => observer.observe(region));
    }
    addEventListener('resize', refreshStructureScroll);
    document.addEventListener('click', () => requestAnimationFrame(refreshStructureScroll));
    addEventListener('load', refreshStructureScroll, { once: true });
    refreshStructureScroll();
  }

  const systems = [
    ...[...document.querySelectorAll('[data-article-tabs]')].map((root) => ({
      root,
      tablistSelector: '[data-article-tablist]',
      tabSelector: '[data-article-tab]',
      panelSelector: '[data-article-panel]',
      verticalOnCompact: false,
      preferPopulated: false
    })),
    ...[...document.querySelectorAll('[data-core-attributes]')].map((root) => ({
      root,
      tablistSelector: '[data-core-tablist]',
      tabSelector: '[data-core-tab]',
      panelSelector: '[data-core-panel]',
      verticalOnCompact: true,
      preferPopulated: true
    }))
  ];

  const decodeFragment = (hash) => {
    try {
      return decodeURIComponent(hash.replace(/^#/, ''));
    } catch {
      return '';
    }
  };

  for (const system of systems) {
    const { root, tablistSelector, tabSelector, panelSelector, verticalOnCompact, preferPopulated } = system;
    const tablist = root.querySelector(tablistSelector);
    const tabs = [...root.querySelectorAll(tabSelector)];
    const panels = [...root.querySelectorAll(panelSelector)];
    const targets = tabs.map((tab) => document.getElementById(decodeFragment(tab.hash)));
    if (!tablist || tabs.length === 0 || tabs.length !== panels.length ||
        targets.some((panel, index) => panel !== panels[index])) continue;

    const bringTabIntoView = (tab) => {
      requestAnimationFrame(() => {
        const tabBounds = tab.getBoundingClientRect();
        const listBounds = tablist.getBoundingClientRect();
        if (tabBounds.left < listBounds.left) tablist.scrollLeft -= listBounds.left - tabBounds.left;
        else if (tabBounds.right > listBounds.right) tablist.scrollLeft += tabBounds.right - listBounds.right;
      });
    };

    const activate = (nextTab, { focus = false, historyMode = null, normalizeScroll = false } = {}) => {
      const targetId = decodeFragment(nextTab.hash);
      const activePanel = document.activeElement?.closest?.(panelSelector);
      const restoreFocus = focus || (activePanel && activePanel.id !== targetId);
      const previousScrollY = scrollY;
      const stickyDock = normalizeScroll ? root.querySelector('.article-tabs__sticky') : null;
      const articleSurface = normalizeScroll ? root.querySelector('.article-profile__surface') : null;
      const surfaceTop = articleSurface ? articleSurface.getBoundingClientRect().top + previousScrollY : null;
      const stickyTop = stickyDock ? Number.parseFloat(getComputedStyle(stickyDock).top) || 0 : 0;
      const stickyHeight = stickyDock?.getBoundingClientRect().height || 0;
      for (const tab of tabs) {
        const selected = tab === nextTab;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      }
      for (const panel of panels) panel.hidden = panel.id !== targetId;
      requestAnimationFrame(refreshStructureScroll);
      bringTabIntoView(nextTab);
      if (restoreFocus) nextTab.focus({ preventScroll: true });
      if (surfaceTop !== null) {
        const normalizedScrollY = Math.max(0, Math.min(previousScrollY, surfaceTop - stickyTop - stickyHeight));
        requestAnimationFrame(() => scrollTo({ top: normalizedScrollY, left: scrollX, behavior: 'instant' }));
      }
      if (historyMode === 'push') history.pushState(null, '', `#${targetId}`);
      if (historyMode === 'replace') history.replaceState(null, '', `#${targetId}`);
    };

    const tabForHash = (hash = location.hash) => {
      const target = document.getElementById(decodeFragment(hash));
      const panel = target?.closest(panelSelector);
      return panel ? tabs[panels.indexOf(panel)] : null;
    };

    const revealFragment = (hash = location.hash, { scrollPanel = true } = {}) => {
      const target = document.getElementById(decodeFragment(hash));
      const panel = target?.closest(panelSelector);
      if (!target || !panel) return;
      const disclosure = target.matches('details') ? target : target.closest('details');
      if (disclosure) disclosure.open = true;
      const destination = target.classList.contains('legacy-fragment-target') ? panel : target;
      if (destination === panel && !scrollPanel) return;
      requestAnimationFrame(() => {
        destination.scrollIntoView({ block: 'start' });
        const hadTabIndex = destination.hasAttribute('tabindex');
        if (!hadTabIndex) destination.tabIndex = -1;
        destination.focus({ preventScroll: true });
        if (!hadTabIndex) destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
      });
    };

    tablist.setAttribute('role', 'tablist');
    const compactLayout = matchMedia('(max-width: 600px)');
    const syncOrientation = () => {
      const vertical = verticalOnCompact && compactLayout.matches;
      tablist.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
    };
    syncOrientation();
    if (compactLayout.addEventListener) compactLayout.addEventListener('change', syncOrientation);
    else compactLayout.addListener(syncOrientation);

    tabs.forEach((tab, index) => {
      tab.id = `tab-${panels[index].id}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[index].id);
      tab.setAttribute('aria-selected', 'false');
      tab.tabIndex = -1;
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].tabIndex = 0;
    });

    const firstPopulated = preferPopulated
      ? panels.find((panel) => !panel.classList.contains('article-section--empty')) || panels[0]
      : panels[0];
    const defaultTab = tabs[panels.indexOf(firstPopulated)];
    root.setAttribute('data-tabs-enhanced', 'true');
    const initialTab = tabForHash();
    activate(initialTab || defaultTab);
    if (initialTab) {
      const initialTarget = document.getElementById(decodeFragment(location.hash));
      const initialPanel = initialTarget?.closest(panelSelector);
      const isPanelRoute = initialTarget === initialPanel || initialTarget?.classList.contains('legacy-fragment-target');
      if (isPanelRoute && root.closest('[data-article-profile]')) {
        const routeHash = location.hash;
        const routeState = history.state;
        const restoreTop = () => scrollTo({ top: 0, left: 0, behavior: 'instant' });
        history.replaceState(routeState, '', `${location.pathname}${location.search}`);
        restoreTop();
        requestAnimationFrame(() => {
          history.replaceState(routeState, '', routeHash);
          restoreTop();
          requestAnimationFrame(restoreTop);
        });
        if (document.readyState === 'complete') requestAnimationFrame(restoreTop);
        else addEventListener('load', () => requestAnimationFrame(restoreTop), { once: true });
      }
      else revealFragment();
    }

    tablist.addEventListener('click', (event) => {
      const tab = event.target.closest(tabSelector);
      if (!tab || !tabs.includes(tab)) return;
      event.preventDefault();
      activate(tab, { historyMode: 'push', normalizeScroll: Boolean(root.closest('[data-article-profile]')) });
    });

    tablist.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(event.target);
      if (current < 0) return;
      let next = current;
      const vertical = tablist.getAttribute('aria-orientation') === 'vertical';
      if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next = (current + 1) % tabs.length;
      else if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next = (current - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === 'Enter' || event.key === ' ') next = current;
      else return;
      event.preventDefault();
      activate(tabs[next], {
        focus: true,
        historyMode: 'replace',
        normalizeScroll: Boolean(root.closest('[data-article-profile]'))
      });
    });

    const activateFromLocation = () => {
      const articleProfile = root.closest('[data-article-profile]');
      if (!location.hash) {
        activate(defaultTab, {
          focus: tablist.contains(document.activeElement),
          normalizeScroll: Boolean(articleProfile)
        });
        return;
      }
      const tab = tabForHash();
      if (!tab) return;
      const target = document.getElementById(decodeFragment(location.hash));
      const panel = target?.closest(panelSelector);
      const isPanelRoute = target === panel || target?.classList.contains('legacy-fragment-target');
      activate(tab, {
        focus: tablist.contains(document.activeElement),
        normalizeScroll: Boolean(articleProfile && isPanelRoute)
      });
      revealFragment(location.hash, { scrollPanel: !articleProfile });
    };
    addEventListener('hashchange', activateFromLocation);
    addEventListener('popstate', activateFromLocation);

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || tabs.includes(link)) return;
      const tab = tabForHash(link.hash);
      if (!tab || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      activate(tab);
      history.pushState(null, '', link.hash);
      revealFragment(link.hash);
    });
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  for (const gallery of document.querySelectorAll('[data-structure-gallery]')) {
    const track = gallery.querySelector('[data-structure-gallery-track]');
    const items = track ? [...track.children].filter((item) => item.classList.contains('structure-card')) : [];
    const toolbar = gallery.querySelector('[data-structure-gallery-toolbar]');
    const status = gallery.querySelector('[data-structure-gallery-current]');
    const controls = gallery.querySelector('[data-structure-gallery-controls]');
    const previous = gallery.querySelector('[data-structure-gallery-previous]');
    const next = gallery.querySelector('[data-structure-gallery-next]');
    if (!track || items.length < 2 || !toolbar || !status || !controls || !previous || !next) continue;

    let activeIndex = 0;
    let frame = null;
    const itemStart = (item) => item.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    const renderState = (hasOverflow) => {
      status.textContent = String(activeIndex + 1);
      previous.disabled = !hasOverflow || activeIndex === 0;
      next.disabled = !hasOverflow || activeIndex === items.length - 1;
    };
    const update = () => {
      frame = null;
      const hasOverflow = track.scrollWidth > track.clientWidth + 2;
      controls.hidden = !hasOverflow;
      track.tabIndex = hasOverflow ? 0 : -1;
      if (!hasOverflow) activeIndex = 0;
      else {
        const viewportCenter = track.scrollLeft + track.clientWidth / 2;
        activeIndex = items.reduce((best, item, index) => (
          Math.abs(itemStart(item) + item.offsetWidth / 2 - viewportCenter) <
            Math.abs(itemStart(items[best]) + items[best].offsetWidth / 2 - viewportCenter) ? index : best
        ), 0);
      }
      renderState(hasOverflow);
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    const goTo = (index) => {
      const bounded = Math.max(0, Math.min(items.length - 1, index));
      activeIndex = bounded;
      renderState(true);
      track.scrollTo({
        left: itemStart(items[bounded]),
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    };

    previous.addEventListener('click', () => goTo(activeIndex - 1));
    next.addEventListener('click', () => goTo(activeIndex + 1));
    track.addEventListener('keydown', (event) => {
      // Nested structure scroll regions have their own native arrow-key behavior.
      if (event.target !== track) return;
      if (event.key === 'ArrowRight') goTo(activeIndex + 1);
      else if (event.key === 'ArrowLeft') goTo(activeIndex - 1);
      else if (event.key === 'Home') goTo(0);
      else if (event.key === 'End') goTo(items.length - 1);
      else return;
      event.preventDefault();
    });
    track.addEventListener('scroll', scheduleUpdate, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(track);
    else addEventListener('resize', scheduleUpdate);
    track.setAttribute('aria-label', `Structural depiction gallery with ${items.length} items; use Left and Right Arrow keys or the previous and next controls`);
    toolbar.hidden = false;
    update();
  }
})();
