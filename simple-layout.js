/* Shared subject layout. Move existing content, retaining answer IDs and handlers. */
(() => {
  'use strict';
  const pages = LAB.list;
  const site = window.ALP_SITE || '';
  const science = /physics|chemistry|biology|science|combined/.test(site);
  const labLabel = science || site === 'alevel-pe' ? 'Lab' : 'Explore';
  const units = window.HUB_UNITS || [];
  const secondary = new Set(['lab','labs','gcse-labs','models','tools','research','writing']);
  const header = document.querySelector('header.top');
  const subtitle = header.querySelector('.brand p');
  if (subtitle) subtitle.textContent = subtitle.textContent.split(/\.\s/)[0].replace(/\.$/,'');
  const actions = header.querySelector('.top-actions');
  const tools = document.createElement('details');
  tools.className = 'simple-tools';
  tools.innerHTML = '<summary class="btn">Tools</summary><div class="simple-tools-panel"></div>';
  header.append(tools);
  const menu = tools.querySelector('.simple-tools-panel');
  if (actions) menu.append(actions);
  for (const shortcut of header.querySelectorAll(':scope > a.btn,:scope > button.btn')) menu.append(shortcut);
  const papers = document.createElement('a');
  papers.href = '#u-papers'; papers.className = 'btn simple-papers'; papers.textContent = 'Practice papers';
  tools.before(papers);
  for (const unit of units.filter(u => secondary.has(u.key))) {
    if ([...menu.querySelectorAll('a')].some(a => a.textContent.trim() === unit.title)) continue;
    const link = document.createElement('a'); link.href = '#u-' + unit.key; link.className = 'btn';
    link.textContent = /maths/.test(site) && unit.key === 'models' ? 'Maths explorations' : unit.key === 'lab' ? 'All labs' : unit.title;
    menu.append(link);
  }
  // Remove the old cross-course selector, retaining any adjacent study-tier control.
  for (const select of document.querySelectorAll('[aria-label="Choose a course"]')) {
    const host = select.closest('.lcard'); select.closest('label')?.remove();
    host?.querySelectorAll(':scope > span').forEach(el => el.remove());
    if (host && !host.querySelector('input,select,button')) host.remove();
    else host?.classList.add('simple-study-tier');
  }
  for (const control of document.querySelectorAll('.psych-options,.fm-options')) {
    const disclosure = document.createElement('details'); disclosure.className = 'simple-options';
    const summary = document.createElement('summary'); summary.textContent = control.matches('.fm-options') ? 'Optional papers' : 'Course options';
    disclosure.append(summary,control); menu.append(disclosure);
  }
  // Tier is a core choice, not an extra tool.
  const tier = menu.querySelector('.tier-switch[aria-label="Tier"]');
  if (tier) { tier.classList.add('simple-tier'); header.after(tier); }

  const assign = document.createElement('button');
  assign.type = 'button'; assign.className = 'btn'; assign.textContent = 'Assign this lesson or paper'; assign.hidden = true;
  menu.append(assign);
  const currentAssign = () => document.getElementById('lab-' + location.hash.slice(1))?.querySelector(':scope > .assignment-actions button');
  assign.addEventListener('click', () => { currentAssign()?.click(); tools.open = false; });
  const updateAssign = () => { assign.hidden = !currentAssign(); };
  tools.addEventListener('toggle', updateAssign);
  const title = header.querySelector('h1');
  const home = document.createElement('a'); home.href = '#'; home.textContent = title.textContent;
  home.setAttribute('aria-label', title.textContent + ' — all units'); title.replaceChildren(home);
  document.addEventListener('click', e => {
    if (!tools.contains(e.target)) tools.open = false;
    if (e.target.closest('.simple-tools a')) tools.open = false;
  });
  tools.addEventListener('keydown', e => {
    if (e.key === 'Escape') { tools.open = false; tools.querySelector('summary').focus(); }
  });

  // The paper and lab collections remain reachable from the header/tools.
  function tidyHub() {
    for (const card of document.querySelectorAll('#hub [data-go]')) {
      const key = card.dataset.go.slice(2);
      if (key === 'papers' || secondary.has(key)) { card.classList.add('simple-secondary'); card.hidden = true; }
    }
  }
  tidyHub();
  new MutationObserver(tidyHub).observe(document.querySelector('#hub-cards'), {childList:true});

  for (const page of pages) {
    const section = document.getElementById('lab-' + page.id);
    const content = section?.querySelector('.lsec');
    // Timed papers retain one uninterrupted question flow and their timers.
    if (!page.unit || page.group.startsWith('papers:') || secondary.has(page.unit) || !content || section.querySelector('.xtimer')) continue;
    // KS3 already has swipeable Learn / Definition cards / Practice views.
    if (content.querySelector('[data-learning]')) {
      const goal = content.querySelector('.lo')?.closest('.lcard');
      if (goal) {
        const detail = document.createElement('details'); detail.className = 'lesson-objectives';
        const summary = document.createElement('summary'); summary.textContent = 'Lesson goals';
        detail.append(summary);
        const intro = section.querySelector('.lab-head > p'); if (intro) detail.append(intro);
        detail.append(goal.querySelector('.lo')); goal.remove(); content.append(detail);
      }
      continue;
    }
    const blocks = [...content.children];
    let goals;
    const tabs = document.createElement('div');
    tabs.className = 'lesson-tabs'; tabs.setAttribute('role','tablist'); tabs.setAttribute('aria-label','Lesson sections');
    const panels = {};
    for (const name of ['Learn','Practice',labLabel]) {
      const key = name === labLabel ? 'lab' : name.toLowerCase(), id = 'lesson-' + page.id + '-' + key;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'btn'; button.id = id + '-tab'; button.textContent = name;
      button.setAttribute('role','tab'); button.setAttribute('aria-controls',id);
      const panel = document.createElement('div'); panel.id = id; panel.className = 'lesson-panel';
      panel.setAttribute('role','tabpanel'); panel.setAttribute('aria-labelledby',button.id); panel.tabIndex = 0;
      tabs.append(button); content.append(panel); panels[key] = {button,panel};
    }
    for (const block of blocks) {
      const label = block.querySelector('.kind')?.textContent.trim();
      const key = block.matches('.exam') || block.querySelector('.qz') || label === 'Practice' ? 'practice'
        : block.matches('.sim') || block.querySelector('.prac-link,.pe-model,.ks-model') ? 'lab' : 'learn';
      // Objectives remain available without pushing the explanation below the fold.
      if (block.querySelector('.lo')) {
        const detail = document.createElement('details'); detail.className = 'lesson-objectives';
        const summary = document.createElement('summary'); summary.textContent = 'Lesson goals';
        const intro = section.querySelector('.lab-head > p');
        detail.append(summary);
        if (intro) detail.append(intro);
        detail.append(block.querySelector('.lo')); goals = detail;
        block.remove();
      } else panels[key].panel.append(block);
    }
    if (goals) panels.learn.panel.append(goals);
    const available = Object.values(panels).filter(({panel,button}) => {
      if (panel.children.length) return true;
      panel.remove(); button.remove(); return false;
    });
    content.before(tabs);
    function select(item, focus = false) {
      for (const entry of available) {
        const active = entry === item;
        entry.panel.hidden = !active; entry.button.setAttribute('aria-selected',String(active));
        entry.button.tabIndex = active ? 0 : -1;
      }
      if (focus) item.button.focus();
      if (item === panels.lab && !section.hidden) {
        requestAnimationFrame(() => {
          (page.redraw || page.onShow)?.();
          window.dispatchEvent(new Event('resize'));
        });
      }
    }
    available.forEach((entry,i) => {
      entry.button.addEventListener('click',() => select(entry));
      entry.button.addEventListener('keydown', e => {
        const index = e.key === 'ArrowRight' ? (i+1)%available.length : e.key === 'ArrowLeft' ? (i+available.length-1)%available.length : e.key === 'Home' ? 0 : e.key === 'End' ? available.length-1 : -1;
        if (index < 0) return;
        e.preventDefault(); select(available[index],true);
      });
    });
    select(available[0]);
  }
})();
