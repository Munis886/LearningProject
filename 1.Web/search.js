(function () {
  if (document.getElementById("project-search-widget")) {
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    #project-search-widget {
      position: fixed;
      top: var(--project-search-top, 6px);
      right: 16px;
      z-index: 3000;
      width: min(360px, calc(100vw - 32px));
      color: #1f2937;
      font: 14px/1.45 Arial, sans-serif;
    }
    #project-search-form {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 10px;
      border: 1px solid #9ca3af;
      border-radius: 999px;
      background: #fff;
      box-shadow: 0 1px 3px #0002;
    }
    #project-search-form:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px #2563eb33;
    }
    #project-search-form::before {
      content: "⌕";
      color: #4b5563;
      font-size: 22px;
      line-height: 1;
    }
    #project-search-input {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      padding: 5px 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: inherit;
      font: inherit;
    }
    #project-search-status {
      margin: 8px 12px;
      color: #4b5563;
      font-size: 13px;
    }
    #project-search-results {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      box-sizing: border-box;
      width: min(520px, calc(100vw - 24px));
      max-height: min(70vh, 620px);
      overflow-y: auto;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 12px 32px #11182733;
    }
    #project-search-results[hidden] {
      display: none;
    }
    #project-search-results ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    #project-search-results li + li {
      border-top: 1px solid #e5e7eb;
    }
    #project-search-results a {
      display: block;
      padding: 12px 16px;
      color: #1f2937;
      text-decoration: none;
    }
    #project-search-results a:hover,
    #project-search-results a:focus-visible {
      outline: 0;
      background: #eff6ff;
    }
    .project-search-result-title {
      display: block;
      margin-bottom: 3px;
      color: #1756a9;
      font-size: 16px;
      font-weight: 600;
    }
    .project-search-result-path {
      display: block;
      margin-bottom: 6px;
      color: #6b7280;
      font-size: 12px;
    }
    .project-search-result-snippet {
      display: block;
      color: #374151;
      font-size: 13px;
    }
    .project-search-result-snippet mark {
      border-radius: 2px;
      background: #fef08a;
      color: inherit;
    }
    @media (max-width: 760px) {
      #project-search-widget {
        position: relative;
        top: auto;
        right: auto;
        width: min(420px, calc(100% - 24px));
        margin: 8px 12px 10px auto;
      }
    }
  `;
  document.head.append(style);

  const widget = document.createElement("div");
  widget.id = "project-search-widget";

  const form = document.createElement("form");
  form.id = "project-search-form";
  form.setAttribute("role", "search");

  const label = document.createElement("label");
  label.htmlFor = "project-search-input";
  label.textContent = "Loyiha sahifalaridan qidirish";
  label.className = "visually-hidden";
  label.style.cssText =
    "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";

  const input = document.createElement("input");
  input.id = "project-search-input";
  input.type = "search";
  input.placeholder = "Loyiha bo‘ylab qidirish...";
  input.autocomplete = "off";
  input.setAttribute("aria-controls", "project-search-results");
  input.setAttribute("aria-expanded", "false");

  form.append(label, input);

  const status = document.createElement("p");
  status.id = "project-search-status";
  status.setAttribute("aria-live", "polite");

  const results = document.createElement("div");
  results.id = "project-search-results";
  results.setAttribute("aria-label", "Qidiruv natijalari");
  results.hidden = true;

  widget.append(form, status, results);
  const host = document.getElementById("menyu");
  if (host) {
    widget.style.setProperty(
      "--project-search-top",
      `${Math.max(6, host.getBoundingClientRect().top + 6)}px`,
    );
  }
  (host || document.body).append(widget);

  let indexPromise;
  let debounceTimer;
  let requestNumber = 0;

  function closeResults() {
    results.hidden = true;
    input.setAttribute("aria-expanded", "false");
  }

  function openResults() {
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  async function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch("/search-index.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Search index request failed: ${response.status}`);
          }
          return response.json();
        })
        .then((items) => {
          if (!Array.isArray(items)) {
            throw new Error("Search index has an invalid format.");
          }
          return items.map((item) => ({
            ...item,
            searchable: `${item.title} ${item.path} ${item.description} ${item.text}`
              .toLocaleLowerCase(),
            normalizedTitle: item.title.toLocaleLowerCase(),
          }));
        })
        .catch((error) => {
          indexPromise = undefined;
          throw error;
        });
    }
    return indexPromise;
  }

  function appendHighlightedText(container, text, terms) {
    const escapedTerms = terms
      .slice()
      .sort((a, b) => b.length - a.length)
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(escapedTerms.join("|"), "gi");
    let start = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      container.append(document.createTextNode(text.slice(start, match.index)));
      const mark = document.createElement("mark");
      mark.textContent = match[0];
      container.append(mark);
      start = match.index + match[0].length;
    }
    container.append(document.createTextNode(text.slice(start)));
  }

  function makeSnippet(item, query, terms) {
    const lowerText = item.text.toLocaleLowerCase();
    const phrasePosition = lowerText.indexOf(query);
    const position =
      phrasePosition >= 0
        ? phrasePosition
        : Math.min(
            ...terms
              .map((term) => lowerText.indexOf(term))
              .filter((index) => index >= 0),
          );
    if (!Number.isFinite(position)) {
      return item.description || item.text.slice(0, 180);
    }

    const start = Math.max(0, position - 80);
    const end = Math.min(item.text.length, position + query.length + 120);
    const prefix = start > 0 ? "…" : "";
    const suffix = end < item.text.length ? "…" : "";
    return `${prefix}${item.text.slice(start, end).replace(/\s+/g, " ").trim()}${suffix}`;
  }

  function renderResults(matches, query, terms) {
    results.replaceChildren();
    const list = document.createElement("ul");
    const visibleMatches = matches.slice(0, 15);

    visibleMatches.forEach((item) => {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = item.href;

      const title = document.createElement("span");
      title.className = "project-search-result-title";
      appendHighlightedText(title, item.title, terms);

      const path = document.createElement("span");
      path.className = "project-search-result-path";
      path.textContent = item.path;

      const snippet = document.createElement("span");
      snippet.className = "project-search-result-snippet";
      appendHighlightedText(snippet, makeSnippet(item, query, terms), terms);

      link.append(title, path, snippet);
      listItem.append(link);
      list.append(listItem);
    });

    results.append(list);
    status.textContent =
      matches.length > visibleMatches.length
        ? `${matches.length} ta sahifa topildi. Birinchi ${visibleMatches.length} tasi ko‘rsatilmoqda.`
        : `${matches.length} ta sahifa topildi.`;
    openResults();
  }

  async function search(query, currentRequest) {
    status.textContent = "Loyiha sahifalari qidirilmoqda...";
    openResults();

    try {
      const index = await loadIndex();
      if (currentRequest !== requestNumber) {
        return;
      }

      const normalizedQuery = query.toLocaleLowerCase();
      const terms = normalizedQuery.split(/\s+/).filter(Boolean);
      const matches = [];

      index.forEach((item) => {
        if (!terms.every((term) => item.searchable.includes(term))) {
          return;
        }

        const titleMatches = terms.filter((term) =>
          item.normalizedTitle.includes(term),
        ).length;
        const exactTitleMatch = item.normalizedTitle.includes(normalizedQuery);
        matches.push({
          ...item,
          score: titleMatches * 10 + (exactTitleMatch ? 50 : 0),
        });
      });

      matches.sort(
        (a, b) =>
          b.score - a.score || a.title.localeCompare(b.title, "uz"),
      );
      renderResults(matches, normalizedQuery, terms);
    } catch (error) {
      console.error("Project search could not load the search index.", error);
      if (currentRequest === requestNumber) {
        results.replaceChildren();
        status.textContent =
          "Qidiruv ma’lumotlari yuklanmadi. Sahifani mahalliy HTTP server orqali oching.";
        openResults();
      }
    }
  }

  form.addEventListener("submit", (event) => event.preventDefault());
  input.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);
    const query = input.value.trim();
    requestNumber += 1;

    if (!query) {
      status.textContent = "";
      results.replaceChildren();
      closeResults();
      return;
    }
    if (query.length < 2) {
      status.textContent = "Qidirish uchun kamida 2 ta belgi kiriting.";
      results.replaceChildren();
      openResults();
      return;
    }

    const currentRequest = requestNumber;
    debounceTimer = window.setTimeout(
      () => search(query, currentRequest),
      180,
    );
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeResults();
      input.blur();
    }
  });

  document.addEventListener("click", (event) => {
    if (!widget.contains(event.target)) {
      closeResults();
    }
  });
})();
