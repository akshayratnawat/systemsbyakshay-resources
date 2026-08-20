// @systemsbyakshay — Interview Questions filter/toggle app
(function () {
  const state = {
    topics: new Set(),
    difficulties: new Set(),
    companies: new Set(),
    search: ""
  };

  const TOPICS = [...new Set(QUESTIONS.map(q => q.topic))];
  const DIFFICULTIES = ["easy", "medium", "hard"];
  const COMPANIES = [...new Set(QUESTIONS.flatMap(q => q.companies))].sort();

  const topicChipsEl = document.getElementById("topicChips");
  const diffChipsEl = document.getElementById("diffChips");
  const companyChipsEl = document.getElementById("companyChips");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");
  const qListEl = document.getElementById("qList");
  const resultsCountEl = document.getElementById("resultsCount");
  const recentScrollEl = document.getElementById("recentScroll");

  function makeChip(label, onClick, extraClass) {
    const chip = document.createElement("div");
    chip.className = "chip" + (extraClass ? " " + extraClass : "");
    chip.textContent = label;
    chip.addEventListener("click", onClick);
    return chip;
  }

  function renderChips() {
    topicChipsEl.innerHTML = "";
    TOPICS.forEach(topic => {
      const active = state.topics.has(topic);
      const chip = makeChip(topic, () => {
        state.topics.has(topic) ? state.topics.delete(topic) : state.topics.add(topic);
        render();
      });
      if (active) chip.classList.add("active");
      topicChipsEl.appendChild(chip);
    });

    diffChipsEl.innerHTML = "";
    DIFFICULTIES.forEach(diff => {
      const active = state.difficulties.has(diff);
      const chip = makeChip(diff[0].toUpperCase() + diff.slice(1), () => {
        state.difficulties.has(diff) ? state.difficulties.delete(diff) : state.difficulties.add(diff);
        render();
      }, "diff-" + diff);
      if (active) chip.classList.add("active");
      diffChipsEl.appendChild(chip);
    });

    companyChipsEl.innerHTML = "";
    if (COMPANIES.length === 0) {
      const none = document.createElement("div");
      none.style.fontSize = "13px";
      none.style.color = "var(--brand-muted)";
      none.textContent = "Not tagged yet — company filters appear here once questions are tagged.";
      companyChipsEl.appendChild(none);
    } else {
      COMPANIES.forEach(company => {
        const active = state.companies.has(company);
        const chip = makeChip(company, () => {
          state.companies.has(company) ? state.companies.delete(company) : state.companies.add(company);
          render();
        });
        if (active) chip.classList.add("active");
        companyChipsEl.appendChild(chip);
      });
    }
  }

  function matches(q) {
    if (state.topics.size && !state.topics.has(q.topic)) return false;
    if (state.difficulties.size && !state.difficulties.has(q.difficulty)) return false;
    if (state.companies.size && !q.companies.some(c => state.companies.has(c))) return false;
    if (state.search) {
      const s = state.search.toLowerCase();
      if (!q.question.toLowerCase().includes(s) && !q.topic.toLowerCase().includes(s)) return false;
    }
    return true;
  }

  function renderList() {
    const filtered = QUESTIONS.filter(matches);
    resultsCountEl.textContent = `${filtered.length} question${filtered.length === 1 ? "" : "s"}`;

    qListEl.innerHTML = "";
    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No questions match these filters. Try clearing some.";
      qListEl.appendChild(empty);
      return;
    }

    filtered.forEach(q => qListEl.appendChild(renderCard(q)));
  }

  function renderCard(q) {
    const card = document.createElement("div");
    card.className = "q-card";

    const meta = document.createElement("div");
    meta.className = "q-meta";

    const topicBadge = document.createElement("span");
    topicBadge.className = "badge badge-topic";
    topicBadge.textContent = q.topic;
    meta.appendChild(topicBadge);

    const diffBadge = document.createElement("span");
    diffBadge.className = "badge badge-" + q.difficulty;
    diffBadge.textContent = q.difficulty[0].toUpperCase() + q.difficulty.slice(1);
    meta.appendChild(diffBadge);

    q.companies.forEach(c => {
      const cb = document.createElement("span");
      cb.className = "badge badge-company";
      cb.textContent = c;
      meta.appendChild(cb);
    });

    const num = document.createElement("span");
    num.className = "q-num";
    num.textContent = "Q" + q.id;
    meta.appendChild(num);

    const text = document.createElement("div");
    text.className = "q-text";
    text.textContent = q.question;

    card.appendChild(meta);
    card.appendChild(text);
    return card;
  }

  function renderRecent() {
    const recent = [...QUESTIONS].sort((a, b) => {
      if (a.dateAdded !== b.dateAdded) return b.dateAdded.localeCompare(a.dateAdded);
      return b.id - a.id;
    }).slice(0, 8);

    recentScrollEl.innerHTML = "";
    recent.forEach(q => {
      const card = document.createElement("div");
      card.className = "recent-card";
      card.innerHTML = `<div class="rc-topic">${q.topic}</div><div class="rc-q">${q.question.length > 110 ? q.question.slice(0, 110) + "…" : q.question}</div>`;
      card.addEventListener("click", () => {
        state.topics.clear(); state.difficulties.clear(); state.companies.clear();
        state.search = q.question.slice(0, 30);
        searchInput.value = state.search;
        render();
        qListEl.scrollIntoView({ behavior: "smooth" });
      });
      recentScrollEl.appendChild(card);
    });
  }

  function render() {
    renderChips();
    renderList();
  }

  searchInput.addEventListener("input", e => {
    state.search = e.target.value.trim();
    renderList();
  });

  clearBtn.addEventListener("click", () => {
    state.topics.clear();
    state.difficulties.clear();
    state.companies.clear();
    state.search = "";
    searchInput.value = "";
    render();
  });

  renderRecent();
  render();
})();
