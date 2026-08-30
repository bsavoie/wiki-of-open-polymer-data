(() => {
  const roots = document.querySelectorAll('[data-core-attributes]');

  for (const root of roots) {
    const tablist = root.querySelector('[data-core-tablist]');
    const tabs = [...root.querySelectorAll('[data-core-tab]')];
    const panels = [...root.querySelectorAll('[data-core-panel]')];
    const decodeFragment = (hash) => {
      try {
        return decodeURIComponent(hash.slice(1));
      } catch {
        return '';
      }
    };
    const targets = tabs.map((tab) => document.getElementById(decodeFragment(tab.hash)));
    if (!tablist || tabs.length === 0 || tabs.length !== panels.length ||
        targets.some((panel, index) => panel !== panels[index])) continue;

    const activate = (nextTab, { focus = false, historyMode = null } = {}) => {
      const targetId = nextTab.hash.slice(1);
      for (const tab of tabs) {
        const selected = tab === nextTab;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      }
      for (const panel of panels) panel.hidden = panel.id !== targetId;
      if (focus) nextTab.focus();
      if (historyMode === 'push') history.pushState(null, '', `#${targetId}`);
      if (historyMode === 'replace') history.replaceState(null, '', `#${targetId}`);
    };

    const tabForHash = () => {
      const target = document.getElementById(decodeFragment(location.hash));
      const panel = target?.closest('[data-core-panel]');
      return panel ? tabs[panels.indexOf(panel)] : null;
    };

    tablist.setAttribute('role', 'tablist');
    const compactLayout = matchMedia('(max-width: 600px)');
    const syncOrientation = () => {
      tablist.setAttribute('aria-orientation', compactLayout.matches ? 'vertical' : 'horizontal');
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

    const firstPopulated = panels.find((panel) => !panel.classList.contains('article-section--empty')) || panels[0];
    const defaultTab = tabs[panels.indexOf(firstPopulated)];
    root.setAttribute('data-tabs-enhanced', 'true');
    activate(tabForHash() || defaultTab);

    tablist.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-core-tab]');
      if (!tab || !tabs.includes(tab)) return;
      event.preventDefault();
      activate(tab, { historyMode: 'push' });
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
      activate(tabs[next], { focus: true, historyMode: 'replace' });
    });

    const activateFromLocation = () => {
      activate(tabForHash() || defaultTab);
    };
    addEventListener('hashchange', activateFromLocation);
    addEventListener('popstate', activateFromLocation);

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || tabs.includes(link)) return;
      const target = document.getElementById(decodeFragment(link.hash));
      const panel = target?.closest('[data-core-panel]');
      if (panel) activate(tabs[panels.indexOf(panel)]);
    });
  }
})();
