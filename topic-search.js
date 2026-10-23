/* Course-wide navigation; no account is needed to search or resume. */
(() => {
  "use strict";
  const {list, store} = LAB;
  const host = document.createElement("section");
  host.className = "course-tools lcard";
  host.setAttribute("aria-label", "Find a topic or resume learning");
  host.innerHTML = `<div class="course-tool-row"><form role="search" class="topic-search"><label for="topic-query">Find a topic</label><input id="topic-query" type="search" placeholder="Try fractions, quadratics or probability" autocomplete="off" aria-controls="topic-results" aria-describedby="topic-status"><button class="btn" type="submit">Search</button></form><button class="btn primary" id="resume-lesson" hidden></button></div><p id="topic-status" class="muted" role="status" aria-live="polite"></p><ul id="topic-results" class="topic-results" hidden></ul>`;
  document.querySelector("header.top").after(host);
  const style = document.createElement("style");
  style.textContent = `.course-tools{gap:8px}.course-tool-row{display:flex;align-items:end;gap:14px;flex-wrap:wrap}.topic-search{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;flex:1 1 320px}.topic-search label{grid-column:1/-1;font-weight:700}.topic-search input{min-width:0;width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)}.topic-results{list-style:none;margin:0;padding:0;display:grid;gap:6px;max-height:420px;overflow:auto}.topic-results button{width:100%;text-align:left;display:flex;flex-direction:column;gap:3px}.topic-results small{color:var(--muted);font-weight:400}#topic-status:empty{display:none}#resume-lesson{max-width:100%;white-space:normal;text-align:left}@media(max-width:520px){.course-tool-row{align-items:stretch}.course-tool-row>button{width:100%}}`;
  document.head.appendChild(style);
  const input = host.querySelector("input"), results = host.querySelector("ul");
  const status = host.querySelector("#topic-status"), resume = host.querySelector("#resume-lesson");
  const plainName = value => { const element = document.createElement("span"); element.innerHTML = value; return element.textContent || ""; };
  const normalise = value => value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[’']/g, "").replace(/uncertaint(?:y|ies)/g, "uncertaint");
  let index = null, debounce;
  function search() {
    clearTimeout(debounce);
    const query = normalise(input.value.trim()), words = query.split(/\s+/);
    results.replaceChildren();
    results.hidden = true;
    if (!query) { status.textContent = ""; return; }
    if (query.length < 2) { status.textContent = "Type at least two characters to search."; return; }
    // Build once, on demand, after all lessons and exam cards have been registered.
    index ||= list.map(page => {
      const section = document.getElementById("lab-" + page.id);
      const unit = (window.HUB_UNITS || []).find(u => u.groups.some(([g]) => g === page.group));
      const heading = normalise(`${plainName(page.name)} ${unit?.title || ""} ${page.lvl || ""} ${page.pag ? "PAG " + page.pag : ""}`);
      return {page, unit, heading, text: heading + " " + normalise(section?.textContent || "")};
    });
    const matches = index.filter(item => !(window.LAB_HIDE&&window.LAB_HIDE(item.page)) && words.every(word => item.text.includes(word)))
      .sort((a, b) => Number(b.heading.includes(query)) - Number(a.heading.includes(query)) || a.page.name.localeCompare(b.page.name));
    const shown = matches.slice(0, 20);
    status.textContent = matches.length ? `${matches.length} topic${matches.length === 1 ? "" : "s"} found${matches.length > shown.length ? "; showing the first 20. Add more words to narrow your search." : "."}` : "No topics found. Try a shorter phrase or a different term.";
    for (const {page, unit} of shown) {
      const li = document.createElement("li"), button = document.createElement("button"), subtitle = document.createElement("small");
      button.className = "btn";
      button.type = "button";
      button.textContent = plainName(page.name);
      subtitle.textContent = `${unit?.title || "Practical Lab"}${page.lvl ? " · " + page.lvl : page.pag ? " · PAG " + page.pag : ""}`;
      button.appendChild(subtitle);
      button.addEventListener("click", () => {
        input.value = "";
        search();
        location.hash = page.id;
        // Also focus the destination when selecting the currently open result.
        requestAnimationFrame(() => {
          const heading = document.querySelector(`#lab-${page.id} h2`);
          if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
        });
      });
      li.appendChild(button);
      results.appendChild(li);
    }
    results.hidden = !shown.length;
  }
  const lastKey = "learn-last-lesson-gcse-maths";
  function updateResume(remember = true) {
    const id = location.hash.slice(1), current = list.find(p => p.id === id && p.unit && !p.group.startsWith("papers:"));
    if (current && remember !== false && store.get(lastKey) !== current.id) store.set(lastKey, current.id);
    // Existing visitors already have the most recently opened page in pl-tab.
    const previous = store.get(lastKey) || store.get("pl-tab");
    const page = list.find(p => p.id === previous && p.unit && !p.group.startsWith("papers:"));
    resume.hidden = !page || !!(page&&window.LAB_HIDE&&window.LAB_HIDE(page));
    if (page) { resume.textContent = `Resume: ${plainName(page.name)}`; resume.dataset.lesson = page.id; }
  }
  input.addEventListener("input", () => { clearTimeout(debounce); debounce = setTimeout(search, 150); });
  input.addEventListener("keydown", event => {
    if (event.key === "Escape") { input.value = ""; search(); }
    if (event.key === "ArrowDown" && !results.hidden) { event.preventDefault(); results.querySelector("button")?.focus(); }
  });
  host.querySelector("form").addEventListener("submit", event => { event.preventDefault(); search(); });
  resume.addEventListener("click", () => { location.hash = resume.dataset.lesson; });
  window.addEventListener("hashchange", updateResume);
  window.addEventListener("popstate", updateResume);
  // LAB.go uses pushState; observe the existing navigation state after it routes.
  new MutationObserver(updateResume).observe(document.body, {attributes:true,attributeFilter:["data-unit"]});
  window.addEventListener("storage", event => { if (event.key === lastKey) updateResume(false); });
  window.addEventListener("prodigy-tier-change",()=>{search();updateResume(false);});
  updateResume();
})();
