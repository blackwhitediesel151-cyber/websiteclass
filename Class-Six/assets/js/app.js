(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const Storage = window.ClassSixStorage;
  const UI = window.ClassSixUI;
  const Routes = window.ClassSixRoutes;

  function hideLoader() {
    const loader = Utils.$("#loadingScreen");
    if (!loader) return;
    loader.classList.add("is-hidden");
    window.setTimeout(() => loader.remove(), 320);
  }

  function animateCounters() {
    Utils.$$(".stat-card strong").forEach((element) => {
      const end = Number(element.textContent.replace(/\D/g, "")) || 0;
      if (!end) return;
      let current = 0;
      const duration = 700;
      const stepTime = Math.max(16, duration / end);
      const interval = window.setInterval(() => {
        current += 1;
        element.textContent = current;
        if (current >= end) window.clearInterval(interval);
      }, stepTime);
    });
  }

  function renderLanding() {
    const state = Storage.getState();
    const settings = state.settings;
    document.title = settings.websiteName || "CLASS SIX";
    const app = Utils.$("#app");
    app.innerHTML = `
      <main class="landing">
        <span class="landing-bg-shape shape-a" aria-hidden="true"></span>
        <span class="landing-bg-shape shape-b" aria-hidden="true"></span>
        <span class="landing-bg-shape shape-c" aria-hidden="true"></span>
        <nav class="landing-nav">
          <a class="brand" href="index.html" aria-label="CLASS SIX home">
            <img src="assets/images/class-six-mark.svg" alt="" loading="lazy">
            <span><strong>${Utils.escapeHtml(settings.websiteName)}</strong><span>${Utils.escapeHtml(settings.className)}</span></span>
          </a>
          <div class="topbar-actions">
            <a class="btn ghost ripple" href="admin/login.html">${Utils.icon("settings")}Admin</a>
            <button class="icon-btn ripple" type="button" data-action="theme" aria-label="Toggle dark mode">${Utils.icon("moon")}</button>
          </div>
        </nav>
        <section class="landing-hero" id="welcome">
          <div class="hero-copy fade-in">
            <span class="hello">Hello Visitor</span>
            <h1 class="hero-title">WELCOME TO <span>CLASS SIX</span></h1>
            <p class="hero-description">${Utils.escapeHtml(settings.history)}</p>
            <div class="hero-actions">
              <a class="btn primary ripple" href="visitor/dashboard.html">${Utils.icon("dashboard")}Explore</a>
              <a class="btn secondary ripple" href="#stats">${Utils.icon("chart")}Statistics</a>
            </div>
            <div class="stats-preview" id="stats">
              ${UI.statCard("students", "Students", state.students.length, "Real class data")}
              ${UI.statCard("teachers", "Teachers", state.teachers.length, "Subject mentors")}
              ${UI.statCard("book", "Subjects", state.subjects.length, "Weekly learning")}
            </div>
          </div>
          <div class="portal-preview fade-in" aria-label="Dashboard preview">
            <div class="preview-screen glass">
              <div class="preview-bar">
                <span class="preview-line wide"></span>
                <span class="preview-line short"></span>
              </div>
              <div class="grid three">
                <div class="stat-card"><strong>${state.announcements.filter((item) => item.status === "Published").length}</strong><span>Announcements</span></div>
                <div class="stat-card"><strong>${state.voting.filter((item) => item.status === "Active").length}</strong><span>Active Vote</span></div>
                <div class="stat-card"><strong id="landingClock">${Utils.formatTime()}</strong><span>Live Clock</span></div>
              </div>
              <div class="preview-chart"><span></span><span></span><span></span></div>
            </div>
          </div>
        </section>
        <div class="wave" aria-hidden="true"></div>
      </main>
      <div class="modal-backdrop" id="modalRoot" aria-hidden="true"></div>
      <div class="toast-stack" id="toastStack" aria-live="polite" aria-atomic="true"></div>
    `;
    UI.renderMiniCalendar();
    UI.bindCommonEvents();
    window.ClassSixTheme.apply();
    UI.observeReveal();
    animateCounters();
    window.setInterval(() => {
      const clock = Utils.$("#landingClock");
      if (clock) clock.textContent = Utils.formatTime();
    }, 1000);
  }

  function renderLogin() {
    const state = Storage.getState();
    const app = Utils.$("#app");
    document.title = `Admin Login - ${state.settings.websiteName}`;
    app.innerHTML = `
      <main class="login-page">
        <section class="login-card glass">
          <a class="brand" href="../index.html" aria-label="Back to landing page">
            <img src="../assets/images/class-six-mark.svg" alt="" loading="lazy">
            <span><strong>${Utils.escapeHtml(state.settings.websiteName)}</strong><span>Admin Area</span></span>
          </a>
          <p class="eyebrow">Secure Local Session</p>
          <h1 class="page-title">Admin Login</h1>
          <p class="page-subtitle">Use the classroom admin password to manage localStorage content.</p>
          <form id="loginForm" class="grid" style="margin-top:18px">
            <div class="field">
              <label for="password">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required>
            </div>
            <button class="btn primary ripple" type="submit">${Utils.icon("check")}Login</button>
          </form>
          <p class="footer-note">Default password: admin123</p>
        </section>
      </main>
      <div class="toast-stack" id="toastStack" aria-live="polite" aria-atomic="true"></div>
    `;
    UI.bindCommonEvents();
    window.ClassSixTheme.apply();
    Utils.$("#loginForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (Storage.login(event.currentTarget.password.value)) {
        UI.toast("Login successful", "success");
        window.setTimeout(() => { window.location.href = "dashboard.html"; }, 350);
      } else {
        UI.toast("Wrong password", "error");
      }
    });
  }

  function renderArea(area, page) {
    if (area === "admin" && !Storage.isAuthed()) {
      window.location.href = "login.html";
      return;
    }
    const route = Routes.get(area, page) || Routes.get(area, "dashboard");
    const root = UI.renderShell(area, route.id);
    window.ClassSixTheme.apply();
    const registry = area === "admin" ? window.ClassSixAdmin : window.ClassSixVisitor;
    const render = registry && registry[route.id];
    if (render) render(root, route);
    else root.innerHTML = UI.pageHeader(route.title, route.subtitle) + UI.empty("Page not ready", "This route exists, but the renderer is missing.");
    const topClock = Utils.$("#topClock");
    if (topClock) {
      window.setInterval(() => { topClock.textContent = Utils.formatTime(); }, 1000);
    }
    root.focus();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await Storage.init();
    window.ClassSixTheme.apply();
    const body = document.body;
    const area = body.dataset.area;
    const page = body.dataset.page;
    if (page === "landing") renderLanding();
    else if (area === "admin" && page === "login") renderLogin();
    else renderArea(area, page);
    hideLoader();
  });
})();
