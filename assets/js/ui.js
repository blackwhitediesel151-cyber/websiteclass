(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const Routes = window.ClassSixRoutes;
  let rippleBound = false;

  function brandHtml(settings) {
    const logo = settings.logo || `${Utils.assetBase()}assets/images/class-six-mark.svg`;
    return `
      <a class="brand" href="${Utils.assetBase()}index.html" aria-label="Back to landing page">
        <img src="${Utils.escapeHtml(logo)}" alt="" loading="lazy">
        <span>
          <strong>${Utils.escapeHtml(settings.websiteName || "CLASS SIX")}</strong>
          <span>${Utils.escapeHtml(settings.className || "Class Six")}</span>
        </span>
      </a>
    `;
  }

  function navHtml(area, page) {
    const nav = area === "admin" ? Routes.admin : Routes.visitor;
    return `
      <nav class="nav-group" aria-label="${area === "admin" ? "Admin" : "Visitor"} navigation">
        ${nav.map((item) => `
          <a class="nav-link ${item.id === page ? "is-active" : ""}" href="${item.href}">
            ${Utils.icon(item.icon)}
            <span>${Utils.escapeHtml(item.title)}</span>
          </a>
        `).join("")}
      </nav>
    `;
  }

  function renderShell(area, page) {
    const settings = window.ClassSixStorage.settings();
    const route = Routes.get(area, page) || Routes.get(area, "dashboard");
    const app = Utils.$("#app");
    document.title = `${route.title} - ${settings.websiteName || "CLASS SIX"}`;
    app.innerHTML = `
      <div class="app-shell ${area}-shell">
        <aside class="sidebar" id="sidebar">
          ${brandHtml(settings)}
          <p class="nav-label">${area === "admin" ? "Admin Menu" : "Class Menu"}</p>
          ${navHtml(area, page)}
          <p class="footer-note">${Utils.escapeHtml(settings.footerText || "")}</p>
        </aside>
        <section class="content-area">
          <header class="topbar">
            <div class="topbar-left">
              <button class="icon-btn mobile-menu ripple" type="button" data-action="toggle-nav" aria-label="Open menu">${Utils.icon("menu")}</button>
              <div>
                <p class="breadcrumb">${area === "admin" ? "Admin" : "Visitor"} / ${Utils.escapeHtml(route.title)}</p>
                <strong>${Utils.escapeHtml(settings.websiteName || "CLASS SIX")}</strong>
              </div>
            </div>
            <div class="topbar-actions">
              ${area === "admin" ? '<span class="admin-kicker">Logged in</span>' : `<span class="muted" id="topClock">${Utils.formatTime()}</span>`}
              <button class="icon-btn ripple" type="button" data-action="search" aria-label="Open global search">${Utils.icon("search")}</button>
              <button class="icon-btn ripple" type="button" data-action="theme" aria-label="Toggle dark mode">${Utils.icon("moon")}</button>
              ${area === "admin" ? `<button class="icon-btn ripple" type="button" data-action="logout" aria-label="Logout">${Utils.icon("logout")}</button>` : ""}
            </div>
          </header>
          <main class="page" id="pageRoot" tabindex="-1"></main>
        </section>
      </div>
      <button class="fab ripple" type="button" data-action="scroll-top" aria-label="Scroll to top">${Utils.icon("home")}</button>
      <div class="modal-backdrop" id="modalRoot" aria-hidden="true"></div>
      <div class="toast-stack" id="toastStack" aria-live="polite" aria-atomic="true"></div>
    `;
    bindCommonEvents();
    return Utils.$("#pageRoot");
  }

  function bindCommonEvents() {
    if (!rippleBound) {
      document.addEventListener("click", rippleListener);
      rippleBound = true;
    }
    Utils.$$("[data-action='toggle-nav']").forEach((button) => {
      button.addEventListener("click", () => document.body.classList.toggle("nav-open"));
    });
    Utils.$$(".nav-link").forEach((link) => {
      link.addEventListener("click", () => document.body.classList.remove("nav-open"));
    });
    Utils.$$("[data-action='theme']").forEach((button) => {
      button.addEventListener("click", () => window.ClassSixTheme.toggle());
    });
    Utils.$$('[data-action="search"]').forEach((button) => {
      button.addEventListener("click", () => openSearch());
    });
    Utils.$$('[data-action="logout"]').forEach((button) => {
      button.addEventListener("click", () => {
        window.ClassSixStorage.logout();
        window.location.href = "login.html";
      });
    });
    Utils.$$('[data-action="scroll-top"]').forEach((button) => {
      button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") {
        const modal = Utils.$("#modalRoot.is-open");
        if (modal) UI.closeModal();
      }
    });
  }

  function rippleListener(event) {
    const target = event.target.closest(".ripple");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--ripple-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--ripple-y", `${event.clientY - rect.top}px`);
    target.classList.remove("is-rippling");
    void target.offsetWidth;
    target.classList.add("is-rippling");
    window.setTimeout(() => target.classList.remove("is-rippling"), 560);
  }

  function pageHeader(title, subtitle, actions) {
    return `
      <header class="page-header">
        <div>
          <p class="eyebrow">CLASS SIX</p>
          <h1 class="page-title">${Utils.escapeHtml(title)}</h1>
          ${subtitle ? `<p class="page-subtitle">${Utils.escapeHtml(subtitle)}</p>` : ""}
        </div>
        ${actions ? `<div class="toolbar">${actions}</div>` : ""}
      </header>
    `;
  }

  function statCard(iconName, label, value, note) {
    return `
      <article class="stat-card">
        ${Utils.icon(iconName)}
        <strong>${Utils.escapeHtml(value)}</strong>
        <span>${Utils.escapeHtml(label)}</span>
        ${note ? `<small class="muted">${Utils.escapeHtml(note)}</small>` : ""}
      </article>
    `;
  }

  function avatar(name, url) {
    if (url) return `<span class="avatar"><img src="${Utils.escapeHtml(url)}" alt="${Utils.escapeHtml(name)}" loading="lazy"></span>`;
    return `<span class="avatar">${Utils.escapeHtml(Utils.initials(name))}</span>`;
  }

  function empty(title, text) {
    return `<div class="empty-state"><div><strong>${Utils.escapeHtml(title)}</strong><p>${Utils.escapeHtml(text || "")}</p></div></div>`;
  }

  function toast(message, type, action) {
    const stack = Utils.$("#toastStack") || createToastStack();
    const node = document.createElement("div");
    node.className = `toast ${type || ""}`;
    const content = document.createElement("div");
    content.className = "toast-content";
    content.textContent = message;
    node.appendChild(content);
    if (action && typeof action.onClick === "function") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "toast-action";
      button.textContent = action.label || "Undo";
      button.addEventListener("click", () => {
        action.onClick();
        node.remove();
      });
      node.appendChild(button);
    }
    stack.appendChild(node);
    window.setTimeout(() => {
      if (!stack.contains(node)) return;
      node.style.opacity = "0";
      node.style.transform = "translateY(-6px)";
      window.setTimeout(() => node.remove(), 220);
    }, action ? 5200 : 2800);
  }

  function createToastStack() {
    const stack = document.createElement("div");
    stack.id = "toastStack";
    stack.className = "toast-stack";
    document.body.appendChild(stack);
    return stack;
  }

  function closeModal() {
    const root = Utils.$("#modalRoot");
    if (!root) return;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

  function openModal(title, body, footer) {
    let root = Utils.$("#modalRoot");
    if (!root) {
      root = document.createElement("div");
      root.id = "modalRoot";
      root.className = "modal-backdrop";
      document.body.appendChild(root);
    }
    root.innerHTML = `
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <header class="modal-header">
          <h2 id="modalTitle">${Utils.escapeHtml(title)}</h2>
          <button class="icon-btn ripple" type="button" data-close-modal aria-label="Close modal">${Utils.icon("x")}</button>
        </header>
        <div class="modal-body">${body}</div>
        ${footer ? `<footer class="modal-footer">${footer}</footer>` : ""}
      </section>
    `;
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    root.onclick = (event) => {
      if (event.target === root || event.target.closest("[data-close-modal]")) closeModal();
    };
    root.onkeydown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    const focusable = root.querySelector("button, input, select, textarea, a");
    if (focusable) focusable.focus();
  }

  function confirm(message, onConfirm) {
    openModal("Confirm Action", `<p>${Utils.escapeHtml(message)}</p>`, `
      <button class="btn ghost ripple" type="button" data-close-modal>Cancel</button>
      <button class="btn danger ripple" type="button" data-confirm-action>${Utils.icon("trash")}Confirm</button>
    `);
    const button = Utils.$("[data-confirm-action]");
    button.addEventListener("click", () => {
      closeModal();
      onConfirm();
    });
  }

  function openSearch(initialQuery) {
    const state = window.ClassSixStorage ? window.ClassSixStorage.getState() : null;
    const Search = window.ClassSixSearch;
    const base = Utils.assetBase();
    openModal("Search CLASS SIX", `
      <div class="field"><label for="globalSearchQuery">Search</label><input id="globalSearchQuery" type="search" value="${Utils.escapeHtml(initialQuery || "")}" placeholder="Search announcements, students, teachers, subjects..." autocomplete="off"></div>
      <div id="globalSearchResults" class="search-results"></div>
    `, `<button class="btn ghost ripple" type="button" data-close-modal>Close</button>`);
    const queryInput = Utils.$("#globalSearchQuery");
    const resultsRoot = Utils.$("#globalSearchResults");

    function renderResults() {
      const query = queryInput.value;
      const normalized = Utils.normalize(query);
      const results = [];

      function pushItem(category, label, description, href) {
        results.push({ category, label, description, href });
      }

      if (!state) {
        resultsRoot.innerHTML = empty("Search not available", "State is still loading.");
        return;
      }

      if (!normalized) {
        const pages = [
          { label: "Dashboard", href: `${base}visitor/dashboard.html`, description: "Class overview and quick links" },
          { label: "Announcements", href: `${base}visitor/pengumuman.html`, description: "Latest announcements and updates" },
          { label: "Schedule", href: `${base}visitor/jadwal.html`, description: "Weekly lesson plan" },
          { label: "Subjects", href: `${base}visitor/mapel.html`, description: "Subjects and teacher assignments" },
          { label: "Students", href: `${base}visitor/siswa.html`, description: "Class student list" },
          { label: "Teachers", href: `${base}visitor/guru.html`, description: "Teacher profiles" },
          { label: "Voting", href: `${base}visitor/voting.html`, description: "Active polls" }
        ];
        resultsRoot.innerHTML = `<div class="search-section"><h3>Quick links</h3>${pages.map((page) => `<a class="search-result" href="${Utils.escapeHtml(page.href)}"><strong>${Utils.escapeHtml(page.label)}</strong><span>${Utils.escapeHtml(page.description)}</span></a>`).join("")}</div>`;
        return;
      }

      const announcements = state.announcements.filter((item) => Search.includes(item, query, ["title", "body", "category"]));
      announcements.slice(0, 4).forEach((item) => pushItem("Announcements", item.title, item.category, `${base}visitor/pengumuman.html`));
      const students = state.students.filter((item) => Search.includes(item, query, ["name", "number", "note"]));
      students.slice(0, 4).forEach((item) => pushItem("Students", item.name, `No. ${item.number}`, `${base}visitor/siswa.html`));
      const teachers = state.teachers.filter((item) => Search.includes(item, query, ["name", "subject", "position", "bio"]));
      teachers.slice(0, 4).forEach((item) => pushItem("Teachers", item.name, item.subject, `${base}visitor/guru.html`));
      const subjects = state.subjects.filter((item) => Search.includes(item, query, ["name", "teacher", "description"]));
      subjects.slice(0, 4).forEach((item) => pushItem("Subjects", item.name, item.teacher, `${base}visitor/mapel.html`));
      const events = state.calendar.filter((item) => Search.includes(item, query, ["title", "description", "type"]));
      events.slice(0, 4).forEach((item) => pushItem("Calendar", item.title, item.type, `${base}visitor/kalender.html`));
      const votes = state.voting.filter((item) => Search.includes(item, query, ["title", "description", "status"]));
      votes.slice(0, 4).forEach((item) => pushItem("Voting", item.title, item.status, `${base}visitor/voting.html`));

      if (!results.length) {
        resultsRoot.innerHTML = UI.empty("No results", "Try a different keyword.");
        return;
      }

      resultsRoot.innerHTML = `
        <div class="search-section">${results.map((item) => `
          <a class="search-result" href="${Utils.escapeHtml(item.href)}">
            <strong>${Utils.escapeHtml(item.label)}</strong>
            <span>${Utils.escapeHtml(item.description)}</span>
            <small>${Utils.escapeHtml(item.category)}</small>
          </a>
        `).join("")}</div>
      `;
    }

    queryInput.addEventListener("input", Utils.debounce(renderResults, 140));
    window.setTimeout(renderResults, 80);
  }

  function observeReveal(scope) {
    const root = scope || document;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    Utils.$$(".reveal-item", root).forEach((element) => observer.observe(element));
  }

  function fieldHtml(field, value) {
    const id = `field-${field.name}`;
    const fieldValue = value ?? field.value ?? "";
    const required = field.required ? "required" : "";
    const label = `<label for="${id}">${Utils.escapeHtml(field.label)}</label>`;
    if (field.type === "textarea") {
      return `<div class="field ${field.full ? "span-2" : ""}">${label}<textarea id="${id}" name="${field.name}" ${required}>${Utils.escapeHtml(fieldValue)}</textarea></div>`;
    }
    if (field.type === "select") {
      const options = (field.options || []).map((option) => {
        const val = typeof option === "string" ? option : option.value;
        const text = typeof option === "string" ? option : option.label;
        return `<option value="${Utils.escapeHtml(val)}" ${String(val) === String(fieldValue) ? "selected" : ""}>${Utils.escapeHtml(text)}</option>`;
      }).join("");
      return `<div class="field ${field.full ? "span-2" : ""}">${label}<select id="${id}" name="${field.name}" ${required}>${options}</select></div>`;
    }
    if (field.type === "checkbox") {
      return `<div class="field ${field.full ? "span-2" : ""}"><label><input type="checkbox" name="${field.name}" ${fieldValue ? "checked" : ""}> ${Utils.escapeHtml(field.label)}</label></div>`;
    }
    return `<div class="field ${field.full ? "span-2" : ""}">${label}<input id="${id}" name="${field.name}" type="${field.type || "text"}" value="${Utils.escapeHtml(fieldValue)}" ${required}></div>`;
  }

  function openForm(config) {
    const values = config.values || {};
    const body = `
      <form id="modalForm" class="admin-form-grid">
        ${config.fields.map((field) => fieldHtml(field, values[field.name])).join("")}
      </form>
    `;
    openModal(config.title, body, `
      <button class="btn ghost ripple" type="button" data-close-modal>Cancel</button>
      <button class="btn primary ripple" type="submit" form="modalForm">${Utils.icon("check")}${Utils.escapeHtml(config.submitText || "Save")}</button>
    `);
    const form = Utils.$("#modalForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = {};
      config.fields.forEach((field) => {
        if (field.type === "checkbox") {
          data[field.name] = Boolean(form.elements[field.name].checked);
        } else if (field.type === "number") {
          data[field.name] = Number(form.elements[field.name].value || 0);
        } else {
          data[field.name] = form.elements[field.name].value.trim();
        }
      });
      config.onSubmit(data);
      closeModal();
    });
  }

function renderMiniCalendar(date) {
  const selected = date || new Date();

  const year = selected.getFullYear();
  const month = selected.getMonth();

  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();

  const offset = (first.getDay() + 6) % 7;

  const today = new Date();

  const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  let html = "";

  labels.forEach(label => {
    html += `
      <div class="calendar-cell calendar-header">
        <strong>${label}</strong>
      </div>
    `;
  });

  for (let i = 0; i < offset; i++) {
    html += `<div class="calendar-cell empty"></div>`;
  }

  for (let day = 1; day <= days; day++) {

    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    html += `
      <div class="calendar-cell ${isToday ? "is-today" : ""}">
        ${day}
      </div>
    `;
  }

  return `
    <div class="calendar-grid mini-calendar">
      ${html}
    </div>
  `;
}
  
    }
    return `<div class="mini-calendar">${html}</div>`;
  }

  window.ClassSixUI = {
    avatar,
    closeModal,
    confirm,
    empty,
    openForm,
    openModal,
    openSearch,
    observeReveal,
    pageHeader,
    renderMiniCalendar,
    renderShell,
    bindCommonEvents,
    statCard,
    toast
  };
})();
