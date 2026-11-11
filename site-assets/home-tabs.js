(() => {
  const tablist = document.querySelector('[data-home-tabs]');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[data-home-tab]')];
  const panels = tabs.map((tab) => document.getElementById(tab.hash.slice(1)));
  if (tabs.length !== 2 || panels.some((panel) => !panel)) return;

  tablist.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
  });

  function activate(index) {
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[tabIndex].hidden = !selected;
    });
  }

  function select(index, focus = false) {
    const url = new URL(location.href);
    url.hash = tabs[index].hash;
    if (url.href !== location.href) history.pushState(history.state, '', url);
    activate(index);
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(index);
    });
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
    });
  });

  function restoreFromHash(scroll = false) {
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch { /* Leave malformed fragments untouched. */ }
    const target = id ? document.getElementById(id) : null;
    const index = panels.findIndex((panel) => panel === target || (target && panel.contains(target)));
    activate(index < 0 ? 0 : index);
    if (scroll && index >= 0) requestAnimationFrame(() => {
      if (target === panels[index]) tablist.scrollIntoView();
      else target.scrollIntoView();
    });
  }
  addEventListener('hashchange', () => restoreFromHash(true));
  addEventListener('popstate', () => restoreFromHash());
  restoreFromHash(Boolean(location.hash));
  tablist.hidden = false;
})();
