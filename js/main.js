/* ============================================================
   АГРЕГАТОР СТОМАТОЛОГИЙ МИНСКА — Логика
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Рендер каталога клиник ---------- */
  const grid = document.getElementById("clinics-grid");
  const empty = document.getElementById("catalog-empty");
  const searchInput = document.getElementById("clinic-search");
  const chipBar = document.getElementById("chip-bar");
  const countLabel = document.getElementById("clinic-count");

  const FILTERS = [
    { key: "all", label: "Все клиники", test: () => true },
    { key: "network", label: "Сети", test: c => c.type.toLowerCase().includes("сеть") || c.type.toLowerCase().includes("центр") },
    { key: "premium", label: "Премиум", test: c => c.tags.some(t => t.toLowerCase().includes("премиум") || t.toLowerCase().includes("эстетик")) },
    { key: "kids", label: "Детские", test: c => c.tags.some(t => t.toLowerCase().includes("детск")) || c.type.toLowerCase().includes("детск") },
    { key: "implants", label: "Имплантация", test: c => c.tags.some(t => t.toLowerCase().includes("имплант")) },
    { key: "state", label: "Гос. клиники", test: c => c.type.toLowerCase().includes("государствен") }
  ];

  let activeFilter = "all";
  let query = "";

  FILTERS.forEach(f => {
    const btn = document.createElement("button");
    btn.className = "filter-chip" + (f.key === "all" ? " active" : "");
    btn.textContent = f.label;
    btn.dataset.filter = f.key;
    btn.addEventListener("click", () => {
      activeFilter = f.key;
      chipBar.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("active", b === btn));
      render();
    });
    chipBar.appendChild(btn);
  });

  function matches(c) {
    const f = FILTERS.find(x => x.key === activeFilter);
    if (!f.test(c)) return false;
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  function render() {
    const list = CLINICS.filter(matches);
    grid.innerHTML = "";
    countLabel.textContent = list.length;
    empty.classList.toggle("show", list.length === 0);

    list.forEach((c, i) => {
      const card = document.createElement("article");
      card.className = "clinic-card reveal" + (i % 3 === 0 ? "" : i % 3 === 1 ? " reveal-delay-1" : " reveal-delay-2");
      card.innerHTML = `
        <div class="clinic-card__top">
          <div class="clinic-card__head">
            <h3 class="clinic-card__name">${c.name}</h3>
            <span class="clinic-card__rating">★ ${c.rating.toFixed(1)}</span>
          </div>
          <div class="clinic-card__type">${c.type}</div>
          <div class="clinic-card__addr">
            <span class="ico">📍</span>
            <span>${c.address} <a href="https://${c.site}" target="_blank" rel="noopener">${c.site}</a></span>
          </div>
        </div>
        <div class="clinic-card__tags">
          ${c.tags.map(t => `<span class="clinic-card__tag">${t}</span>`).join("")}
        </div>
        <div class="clinic-card__foot">
          <a class="clinic-card__phone" href="tel:${c.phoneLink}">${c.phone}</a>
          <a class="clinic-card__link" href="https://${c.site}" target="_blank" rel="noopener">На сайт →</a>
        </div>
      `;
      grid.appendChild(card);
    });

    observeReveal(grid);
  }

  searchInput.addEventListener("input", e => {
    query = e.target.value.trim();
    render();
  });

  render();

  /* ---------- Таймер отслеживания reveal ---------- */
  let revealObserver = null;
  function observeReveal(container) {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    container.querySelectorAll(".reveal:not(.visible)").forEach(el => revealObserver.observe(el));
  }

  /* ---------- Мобильное меню ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  burger.addEventListener("click", () => nav.classList.toggle("open"));

  /* ---------- FAQ ---------- */
  document.querySelectorAll(".faq-item__q").forEach(q => {
    q.addEventListener("click", () => {
      const item = q.parentElement;
      const answer = item.querySelector(".faq-item__a");
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(i => {
        i.classList.remove("open");
        i.querySelector(".faq-item__a").style.maxHeight = "0";
      });
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ---------- Модалка ---------- */
  const modal = document.getElementById("contact-modal");
  const modalBtn = document.getElementById("modal-btn");

  function openModal() {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-open-modal]").forEach(el => el.addEventListener("click", openModal));
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  modalBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  /* ---------- Reveal для статичных секций ---------- */
  document.querySelectorAll(".reveal:not(.clinic-card)").forEach(el => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { el.classList.add("visible"); io.unobserve(el); }
      });
    }, { threshold: 0.12 });
    io.observe(el);
  });
});
