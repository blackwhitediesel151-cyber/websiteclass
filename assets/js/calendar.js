(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const UI = window.ClassSixUI;
  const Storage = window.ClassSixStorage;
  const Search = window.ClassSixSearch;
  window.ClassSixVisitor = window.ClassSixVisitor || {};
  window.ClassSixAdmin = window.ClassSixAdmin || {};

  const types = ["Holiday", "Event", "Exam", "School Activity"];

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function renderCalendar(monthValue, events) {
    const selected = Utils.fromMonthInput(monthValue);
    const year = selected.getFullYear();
    const month = selected.getMonth();
    const first = new Date(year, month, 1);
    const days = new Date(year, month + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7;
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let html = labels.map((label) => `<div class="calendar-cell"><strong>${label}</strong></div>`).join("");
    for (let i = 0; i < offset; i += 1) html += '<div class="calendar-cell is-muted"></div>';
    for (let day = 1; day <= days; day += 1) {
      const key = dateKey(new Date(year, month, day));
      const dayEvents = events.filter((event) => event.date === key);
      html += `
        <div class="calendar-cell">
          <strong>${day}</strong>
          ${dayEvents.map((event) => `<span class="event-chip" style="background:${Utils.escapeHtml(event.color || "#2563eb")}">${Utils.escapeHtml(event.title)}</span>`).join("")}
        </div>
      `;
    }
    return `<div class="calendar-grid">${html}</div>`;
  }

  function eventCard(event, admin) {
    return `
      <article class="card manager-card">
        <div>
          <div class="cluster"><span class="color-dot" style="background:${Utils.escapeHtml(event.color || "#2563eb")}"></span><strong>${Utils.escapeHtml(event.title)}</strong><span class="badge">${Utils.escapeHtml(event.type)}</span></div>
          <p class="muted">${Utils.escapeHtml(Utils.formatDate(`${event.date}T00:00:00`))}</p>
          <p>${Utils.escapeHtml(event.description || "")}</p>
        </div>
        ${admin ? `<div class="actions"><button class="icon-btn ripple" data-edit="${event.id}" aria-label="Edit">${Utils.icon("edit")}</button><button class="icon-btn ripple" data-delete="${event.id}" aria-label="Delete">${Utils.icon("trash")}</button></div>` : ""}
      </article>
    `;
  }

  function fields() {
    return [
      { name: "title", label: "Event Title", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "type", label: "Type", type: "select", options: types },
      { name: "color", label: "Color Label", type: "color" },
      { name: "description", label: "Description", type: "textarea", full: true }
    ];
  }

  window.ClassSixVisitor.kalender = function renderVisitorCalendar(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <div class="filters">
        <div class="field"><label for="calendarMonth">Month</label><input id="calendarMonth" type="month" value="${Utils.monthInputValue()}"></div>
        <div class="field"><label for="calendarType">Type</label><select id="calendarType"><option value="">All Types</option>${types.map((type) => `<option>${type}</option>`).join("")}</select></div>
        <div class="panel"><strong>${Storage.collection("calendar").length}</strong><span class="muted"> events</span></div>
      </div>
      <div class="panel" id="calendarGrid"></div>
      <div class="grid" id="eventList" style="margin-top:16px"></div>
    `;
    function render() {
      const month = Utils.$("#calendarMonth", root).value;
      const type = Utils.$("#calendarType", root).value;
      const events = Storage.collection("calendar").filter((event) => event.date.startsWith(month) && (!type || event.type === type)).sort((a, b) => String(a.date).localeCompare(String(b.date)));
      Utils.$("#calendarGrid", root).innerHTML = renderCalendar(month, events);
      Utils.$("#eventList", root).innerHTML = events.length ? events.map((event) => eventCard(event, false)).join("") : UI.empty("No event this month", "Try another month or type.");
    }
    Utils.$("#calendarMonth", root).addEventListener("change", render);
    Utils.$("#calendarType", root).addEventListener("change", render);
    render();
  };

  window.ClassSixAdmin.kalender = function renderAdminCalendar(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle, `<button class="btn primary ripple" type="button" id="addEvent">${Utils.icon("plus")}Add Event</button>`)}
      <div class="filters">
        <div class="field"><label for="eventSearch">Search</label><input id="eventSearch" type="search" placeholder="Search calendar"></div>
        <div class="field"><label for="calendarMonth">Month</label><input id="calendarMonth" type="month" value="${Utils.monthInputValue()}"></div>
        <div class="field"><label for="calendarType">Type</label><select id="calendarType"><option value="">All Types</option>${types.map((type) => `<option>${type}</option>`).join("")}</select></div>
      </div>
      <div class="panel" id="calendarGrid"></div>
      <div class="manager-list" id="eventList" style="margin-top:16px"></div>
    `;
    function save(items, message) {
      Storage.saveCollection("calendar", items, message);
      render();
      UI.toast(message, "success");
    }
    function upsert(existing) {
      UI.openForm({
        title: existing ? "Edit Calendar Event" : "Add Calendar Event",
        fields: fields(),
        values: existing || { date: new Date().toISOString().slice(0, 10), type: "Event", color: "#2563eb" },
        submitText: existing ? "Update" : "Add",
        onSubmit(data) {
          const items = Storage.collection("calendar");
          if (existing) {
            items[items.findIndex((item) => item.id === existing.id)] = Object.assign({}, existing, data);
            save(items, `Calendar event updated: ${data.title}.`);
          } else {
            items.push(Object.assign({ id: Utils.uid("cal") }, data));
            save(items, `Calendar event added: ${data.title}.`);
          }
        }
      });
    }
    function render() {
      const query = Utils.$("#eventSearch", root).value;
      const month = Utils.$("#calendarMonth", root).value;
      const type = Utils.$("#calendarType", root).value;
      const monthEvents = Storage.collection("calendar").filter((event) => event.date.startsWith(month));
      const events = monthEvents
        .filter((event) => Search.includes(event, query, ["title", "type", "description"]))
        .filter((event) => !type || event.type === type)
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));
      Utils.$("#calendarGrid", root).innerHTML = renderCalendar(month, monthEvents);
      const list = Utils.$("#eventList", root);
      list.innerHTML = events.length ? events.map((event) => eventCard(event, true)).join("") : UI.empty("No event found", "Add an event or clear filters.");
      Utils.$$("[data-edit]", list).forEach((button) => button.addEventListener("click", () => upsert(Storage.collection("calendar").find((event) => event.id === button.dataset.edit))));
      Utils.$$("[data-delete]", list).forEach((button) => button.addEventListener("click", () => {
        const event = Storage.collection("calendar").find((item) => item.id === button.dataset.delete);
        UI.confirm(`Delete "${event.title}"?`, () => save(Storage.collection("calendar").filter((item) => item.id !== event.id), `Calendar event deleted: ${event.title}.`));
      }));
    }
    Utils.$("#addEvent", root).addEventListener("click", () => upsert(null));
    Utils.$("#eventSearch", root).addEventListener("input", render);
    Utils.$("#calendarMonth", root).addEventListener("change", render);
    Utils.$("#calendarType", root).addEventListener("change", render);
    render();
    .mini-calendar{
    display:grid;
    grid-template-columns:repeat(7,minmax(0,1fr));
    gap:8px;
}
  };
})();
