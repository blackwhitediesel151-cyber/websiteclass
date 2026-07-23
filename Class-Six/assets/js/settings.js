(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const UI = window.ClassSixUI;
  const Storage = window.ClassSixStorage;
  window.ClassSixVisitor = window.ClassSixVisitor || {};
  window.ClassSixAdmin = window.ClassSixAdmin || {};

  function latestAnnouncement() {
    return Storage.collection("announcements")
      .filter((item) => item.status === "Published")
      .sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return String(b.date).localeCompare(String(a.date));
      })[0];
  }

  function todaySchedule() {
    return Storage.collection("schedule")
      .filter((item) => item.dayKey === Utils.todayKey())
      .sort((a, b) => String(a.start).localeCompare(String(b.start)));
  }

  function activityList(limit) {
    const items = Storage.collection("activity").slice(0, limit || 5);
    return items.length ? items.map((item) => `
      <article class="card">
        <strong>${Utils.escapeHtml(item.text)}</strong>
        <p class="muted">${Utils.escapeHtml(Utils.formatDate(item.time, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }))}</p>
      </article>
    `).join("") : UI.empty("No recent activity", "Activity appears after content changes.");
  }

  window.ClassSixVisitor.dashboard = function renderVisitorDashboard(root, route) {
    const state = Storage.getState();
    const latest = latestAnnouncement();
    const today = todaySchedule();
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <section class="visitor-hero-card card">
        <span class="badge green">${Utils.escapeHtml(Utils.formatDate())}</span>
        <h2>Welcome back to ${Utils.escapeHtml(state.settings.websiteName)}.</h2>
        <p>Check today schedule, announcements, voting, and academic activities from one quiet classroom dashboard.</p>
      </section>
      <section class="grid four" style="margin-top:16px">
        ${UI.statCard("students", "Student Count", state.students.length, "Class members")}
        ${UI.statCard("teachers", "Teacher Count", state.teachers.length, "Mentors")}
        ${UI.statCard("book", "Subject Count", state.subjects.length, "Subjects")}
        ${UI.statCard("clock", "Live Clock", Utils.formatTime(), "WIB")}
      </section>
      <section class="grid two" style="margin-top:16px">
        <article class="panel">
          <div class="section-title"><h2>Latest Announcement</h2><a class="btn secondary ripple" href="pengumuman.html">${Utils.icon("bell")}Open</a></div>
          ${latest ? `<span class="badge">${Utils.escapeHtml(latest.category)}</span><h3>${Utils.escapeHtml(latest.title)}</h3><p>${Utils.escapeHtml(latest.body)}</p>` : UI.empty("No announcement", "Published announcements appear here.")}
        </article>
        <article class="panel">
          <div class="section-title"><h2>Today's Schedule</h2><span class="badge green">${Utils.escapeHtml(Utils.dayName(Utils.todayKey()))}</span></div>
          ${today.length ? `<div class="table-wrap"><table><thead><tr><th>Time</th><th>Subject</th><th>Teacher</th></tr></thead><tbody>${today.map((item) => `<tr><td>${item.start} - ${item.end}</td><td><strong>${Utils.escapeHtml(item.subject)}</strong></td><td>${Utils.escapeHtml(item.teacher)}</td></tr>`).join("")}</tbody></table></div>` : UI.empty("No schedule today", "Enjoy the day or check weekly schedule.")}
        </article>
      </section>
      <section class="grid two" style="margin-top:16px">
        <article class="panel"><div class="section-title"><h2>Mini Calendar</h2><span class="muted">${Utils.escapeHtml(Utils.formatDate(null, { month: "long", year: "numeric" }))}</span></div>${UI.renderMiniCalendar()}</article>
        <article class="panel"><div class="section-title"><h2>Quick Navigation</h2></div><div class="quick-nav">${window.ClassSixRoutes.visitor.filter((item) => item.id !== "dashboard").slice(0, 8).map((item) => `<a class="quick-link ripple" href="${item.href}">${Utils.icon(item.icon)}<span>${Utils.escapeHtml(item.title)}</span></a>`).join("")}</div></article>
      </section>
      <section style="margin-top:16px">
        <div class="section-title"><h2>Recent Activity</h2></div>
        <div class="grid">${activityList(4)}</div>
      </section>
    `;
    const clockCard = root.querySelector(".stat-card:nth-child(4) strong");
    window.setInterval(() => { if (clockCard) clockCard.textContent = Utils.formatTime(); }, 1000);
  };

  window.ClassSixAdmin.dashboard = function renderAdminDashboard(root, route) {
    const state = Storage.getState();
    const activeVote = state.voting.filter((item) => item.status === "Active").length;
    const upcoming = state.calendar.filter((item) => new Date(`${item.date}T00:00:00`) >= new Date()).sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(0, 4);
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <section class="grid four">
        ${UI.statCard("students", "Total Students", state.students.length, "CRUD ready")}
        ${UI.statCard("teachers", "Total Teachers", state.teachers.length, "Profiles")}
        ${UI.statCard("book", "Total Subjects", state.subjects.length, "Managed")}
        ${UI.statCard("bell", "Total Announcements", state.announcements.length, "Draft + published")}
      </section>
      <section class="grid three" style="margin-top:16px">
        ${UI.statCard("vote", "Active Voting", activeVote, "Visitor voting")}
        ${UI.statCard("calendar", "Upcoming Events", upcoming.length, "Next activities")}
        ${UI.statCard("activity", "Recent Activity", state.activity.length, "Audit trail")}
      </section>
      <section class="grid two" style="margin-top:16px">
        <article class="panel">
          <div class="section-title"><h2>Upcoming Events</h2><a class="btn secondary ripple" href="kalender.html">${Utils.icon("calendar")}Manage</a></div>
          <div class="grid">${upcoming.length ? upcoming.map((event) => `<article class="card"><span class="badge">${Utils.escapeHtml(event.type)}</span><h3>${Utils.escapeHtml(event.title)}</h3><p class="muted">${Utils.escapeHtml(Utils.formatDate(`${event.date}T00:00:00`))}</p></article>`).join("") : UI.empty("No upcoming event", "Add events in calendar management.")}</div>
        </article>
        <article class="panel">
          <div class="section-title"><h2>Recent Activity</h2></div>
          <div class="grid">${activityList(6)}</div>
        </article>
      </section>
    `;
  };

  window.ClassSixVisitor.tentang = function renderAbout(root, route) {
    const state = Storage.getState();
    const settings = state.settings;
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <section class="about-band">
        <div class="motto"><strong>${Utils.escapeHtml(settings.motto || "Learn together, grow together.")}</strong></div>
        <div class="grid">
          <article class="panel"><span class="badge">History</span><p>${Utils.escapeHtml(settings.history || "")}</p></article>
          <article class="panel"><span class="badge green">Vision</span><p>${Utils.escapeHtml(settings.vision || "")}</p></article>
          <article class="panel"><span class="badge amber">Mission</span><p>${Utils.escapeHtml(settings.mission || "")}</p></article>
        </div>
      </section>
      <section class="grid four" style="margin-top:16px">
        ${UI.statCard("students", "Students", state.students.length, "Class size")}
        ${UI.statCard("teachers", "Teachers", state.teachers.length, "Mentors")}
        ${UI.statCard("book", "Subjects", state.subjects.length, "Learning areas")}
        ${UI.statCard("calendar", "Calendar Events", state.calendar.length, "Activities")}
      </section>
    `;
  };

  function settingsField(name, label, value, type, full) {
    if (type === "textarea") {
      return `<div class="field ${full ? "span-2" : ""}"><label for="${name}">${label}</label><textarea id="${name}" name="${name}">${Utils.escapeHtml(value || "")}</textarea></div>`;
    }
    if (type === "checkbox") {
      return `<div class="field ${full ? "span-2" : ""}"><label><input type="checkbox" name="${name}" ${value ? "checked" : ""}> ${label}</label></div>`;
    }
    return `<div class="field ${full ? "span-2" : ""}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type || "text"}" value="${Utils.escapeHtml(value || "")}"></div>`;
  }

  window.ClassSixAdmin.pengaturan = function renderSettings(root, route) {
    const settings = Storage.settings();
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <form class="panel admin-form-grid" id="settingsForm">
        ${settingsField("websiteName", "Website Name", settings.websiteName)}
        ${settingsField("className", "Class Name", settings.className)}
        ${settingsField("logo", "Logo URL", settings.logo, "text", true)}
        ${settingsField("favicon", "Favicon URL", settings.favicon, "text", true)}
        ${settingsField("tiktok", "TikTok Link", settings.tiktok, "url", true)}
        ${settingsField("themeColor", "Theme Color", settings.themeColor, "color")}
        ${settingsField("darkMode", "Enable Dark Mode", settings.darkMode, "checkbox")}
        ${settingsField("footerText", "Footer Text", settings.footerText, "textarea", true)}
        ${settingsField("history", "History", settings.history, "textarea", true)}
        ${settingsField("vision", "Vision", settings.vision, "textarea", true)}
        ${settingsField("mission", "Mission", settings.mission, "textarea", true)}
        ${settingsField("motto", "Motto", settings.motto, "text", true)}
        <div class="span-2 actions">
          <button class="btn primary ripple" type="submit">${Utils.icon("check")}Save Settings</button>
          <button class="btn secondary ripple" type="button" id="exportSettings">${Utils.icon("download")}Export JSON</button>
          <button class="btn secondary ripple" type="button" id="importSettings">${Utils.icon("upload")}Import JSON</button>
          <button class="btn danger ripple" type="button" id="resetWebsite">${Utils.icon("reset")}Reset Website</button>
        </div>
      </form>
      <section class="panel danger-zone" style="margin-top:16px">
        <div class="section-title"><h2>Backup localStorage</h2><a class="btn secondary ripple" href="backup.html">${Utils.icon("backup")}Open Backup</a></div>
        <p class="muted">Export and restore the full static portal data from the backup page.</p>
      </section>
    `;
    Utils.$("#settingsForm", root).addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const next = {
        websiteName: form.websiteName.value.trim(),
        className: form.className.value.trim(),
        logo: form.logo.value.trim(),
        favicon: form.favicon.value.trim(),
        tiktok: form.tiktok.value.trim(),
        footerText: form.footerText.value.trim(),
        themeColor: form.themeColor.value,
        darkMode: form.darkMode.checked,
        history: form.history.value.trim(),
        vision: form.vision.value.trim(),
        mission: form.mission.value.trim(),
        motto: form.motto.value.trim()
      };
      Storage.saveSettings(next, "Website settings updated.");
      window.ClassSixTheme.apply(next.darkMode);
      UI.toast("Settings saved", "success");
    });
    Utils.$("#exportSettings", root).addEventListener("click", () => {
      Utils.downloadFile("class-six-settings.json", JSON.stringify(Storage.settings(), null, 2));
      UI.toast("Settings exported", "success");
    });
    Utils.$("#importSettings", root).addEventListener("click", () => {
      UI.openModal("Import Settings JSON", `<div class="field"><label for="settingsImport">Paste settings JSON</label><textarea id="settingsImport" class="backup-box"></textarea></div>`, `<button class="btn ghost ripple" data-close-modal type="button">Cancel</button><button class="btn primary ripple" type="button" id="doImportSettings">${Utils.icon("upload")}Import</button>`);
      Utils.$("#doImportSettings").addEventListener("click", () => {
        const parsed = Utils.parseJson(Utils.$("#settingsImport").value);
        if (!parsed.ok || typeof parsed.data !== "object" || Array.isArray(parsed.data)) {
          UI.toast("Paste a valid settings object", "error");
          return;
        }
        Storage.saveSettings(parsed.data, "Website settings imported.");
        UI.closeModal();
        UI.toast("Settings imported", "success");
        window.location.reload();
      });
    });
    Utils.$("#resetWebsite", root).addEventListener("click", () => {
      UI.confirm("Reset all website data to defaults? This clears local edits and visitor votes.", () => {
        Storage.resetAll();
        UI.toast("Website reset", "success");
        window.setTimeout(() => window.location.reload(), 400);
      });
    });
  };
})();
