(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const UI = window.ClassSixUI;
  const Storage = window.ClassSixStorage;
  const Search = window.ClassSixSearch;
  window.ClassSixVisitor = window.ClassSixVisitor || {};
  window.ClassSixAdmin = window.ClassSixAdmin || {};

  const days = [
    { value: "monday", label: "Senin" },
    { value: "tuesday", label: "Selasa" },
    { value: "wednesday", label: "Rabu" },
    { value: "thursday", label: "Kamis" },
    { value: "friday", label: "Jumat" },
    { value: "saturday", label: "Sabtu" }
  ];

  function groupSchedule(items) {
    return days.map((day) => ({
      day,
      lessons: items.filter((item) => item.dayKey === day.value).sort((a, b) => String(a.start).localeCompare(String(b.start)))
    }));
  }

  function dayCard(group, adminActions) {
    const isToday = group.day.value === Utils.todayKey();
    const dismissal = (group.lessons[0] || {}).dismissal || (["friday", "saturday"].includes(group.day.value) ? "10.10 WIB" : "12.10 WIB");
    return `
      <article class="card schedule-day ${isToday ? "is-today" : ""}">
        <div class="section-title">
          <div class="cluster"><h3>${Utils.escapeHtml(group.day.label)}</h3>${isToday ? '<span class="badge green">Today</span>' : ""}</div>
          <span class="badge amber">Dismissal ${Utils.escapeHtml(dismissal)}</span>
        </div>
        ${group.lessons.length ? `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th>${adminActions ? "<th>Actions</th>" : ""}</tr></thead>
              <tbody>
                ${group.lessons.map((item) => `
                  <tr>
                    <td>${Utils.escapeHtml(item.start)} - ${Utils.escapeHtml(item.end)}</td>
                    <td><strong>${Utils.escapeHtml(item.subject)}</strong></td>
                    <td>${Utils.escapeHtml(item.teacher)}</td>
                    <td>${Utils.escapeHtml(item.room || "Kelas VI")}</td>
                    ${adminActions ? `<td><div class="actions"><button class="icon-btn ripple" data-edit="${item.id}" aria-label="Edit">${Utils.icon("edit")}</button><button class="icon-btn ripple" data-delete="${item.id}" aria-label="Delete">${Utils.icon("trash")}</button></div></td>` : ""}
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : UI.empty("No lesson", "This day has no scheduled lesson.")}
      </article>
    `;
  }

  window.ClassSixVisitor.jadwal = function renderVisitorSchedule(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <div class="grid" id="scheduleList"></div>
    `;
    const items = Storage.collection("schedule").sort(Utils.sortByDay);
    Utils.$("#scheduleList", root).innerHTML = groupSchedule(items).map((group) => dayCard(group, false)).join("");
  };

  function scheduleFields(existing) {
    const subjects = Storage.collection("subjects");
    const teachers = Storage.collection("teachers");
    const defaultSubject = subjects[0] || {};
    const value = existing || {};
    return [
      { name: "dayKey", label: "Day", type: "select", options: days },
      { name: "start", label: "Start", type: "time", required: true },
      { name: "end", label: "End", type: "time", required: true },
      { name: "subject", label: "Subject", type: "select", options: subjects.map((item) => item.name).concat(value.subject && !subjects.some((item) => item.name === value.subject) ? [value.subject] : []) },
      { name: "teacher", label: "Teacher", type: "select", options: teachers.map((item) => item.name).concat(value.teacher && !teachers.some((item) => item.name === value.teacher) ? [value.teacher] : []) },
      { name: "room", label: "Room", required: true },
      { name: "dismissal", label: "Dismissal Time", required: true }
    ].map((field) => {
      if (field.name === "subject" && !value.subject) field.value = defaultSubject.name || "";
      if (field.name === "teacher" && !value.teacher) field.value = defaultSubject.teacher || (teachers[0] || {}).name || "";
      if (field.name === "dayKey" && !value.dayKey) field.value = "monday";
      if (field.name === "room" && !value.room) field.value = "Kelas VI";
      if (field.name === "dismissal" && !value.dismissal) field.value = "12.10 WIB";
      return field;
    });
  }

  window.ClassSixAdmin.jadwal = function renderAdminSchedule(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle, `
        <button class="btn secondary ripple" type="button" id="previewSchedule">${Utils.icon("eye")}Preview</button>
        <button class="btn secondary ripple" type="button" id="copySchedule">${Utils.icon("copy")}Copy Day</button>
        <button class="btn danger ripple" type="button" id="resetSchedule">${Utils.icon("reset")}Reset</button>
        <button class="btn primary ripple" type="button" id="addLesson">${Utils.icon("plus")}Add Lesson</button>
      `)}
      <div class="filters">
        <div class="field"><label for="scheduleSearch">Search</label><input id="scheduleSearch" type="search" placeholder="Search lesson"></div>
        <div class="field"><label for="scheduleDay">Day</label><select id="scheduleDay"><option value="">All Days</option>${days.map((day) => `<option value="${day.value}">${day.label}</option>`).join("")}</select></div>
        <div class="panel"><strong>${Storage.collection("schedule").length}</strong><span class="muted"> lessons</span></div>
      </div>
      <div class="grid" id="scheduleList"></div>
    `;
    function save(items, message) {
      Storage.saveCollection("schedule", items.sort(Utils.sortByDay), message);
      renderList();
      UI.toast(message, "success");
    }
    function upsert(existing) {
      UI.openForm({
        title: existing ? "Edit Lesson" : "Add Lesson",
        fields: scheduleFields(existing),
        values: existing || {},
        submitText: existing ? "Update" : "Add",
        onSubmit(data) {
          data.day = Utils.dayName(data.dayKey);
          const items = Storage.collection("schedule");
          if (existing) {
            items[items.findIndex((item) => item.id === existing.id)] = Object.assign({}, existing, data);
            save(items, `Lesson updated: ${data.subject}.`);
          } else {
            items.push(Object.assign({ id: Utils.uid("sch") }, data));
            save(items, `Lesson added: ${data.subject}.`);
          }
        }
      });
    }
    function renderList() {
      const query = Utils.$("#scheduleSearch", root).value;
      const day = Utils.$("#scheduleDay", root).value;
      const items = Storage.collection("schedule")
        .filter((item) => Search.includes(item, query, ["subject", "teacher", "room", "day"]))
        .filter((item) => !day || item.dayKey === day)
        .sort(Utils.sortByDay);
      const list = Utils.$("#scheduleList", root);
      list.innerHTML = items.length ? groupSchedule(items).filter((group) => group.lessons.length).map((group) => dayCard(group, true)).join("") : UI.empty("No lesson found", "Add a lesson or clear filters.");
      Utils.$$("[data-edit]", list).forEach((button) => button.addEventListener("click", () => upsert(Storage.collection("schedule").find((item) => item.id === button.dataset.edit))));
      Utils.$$("[data-delete]", list).forEach((button) => button.addEventListener("click", () => {
        const item = Storage.collection("schedule").find((entry) => entry.id === button.dataset.delete);
        UI.confirm(`Delete ${item.subject} on ${item.day}?`, () => save(Storage.collection("schedule").filter((entry) => entry.id !== item.id), `Lesson deleted: ${item.subject}.`));
      }));
    }
    Utils.$("#addLesson", root).addEventListener("click", () => upsert(null));
    Utils.$("#previewSchedule", root).addEventListener("click", () => {
      UI.openModal("Schedule Preview", `<div class="grid">${groupSchedule(Storage.collection("schedule").sort(Utils.sortByDay)).map((group) => dayCard(group, false)).join("")}</div>`);
    });
    Utils.$("#copySchedule", root).addEventListener("click", () => {
      UI.openForm({
        title: "Copy Schedule",
        fields: [
          { name: "from", label: "From Day", type: "select", options: days },
          { name: "to", label: "To Day", type: "select", options: days }
        ],
        values: { from: "monday", to: "tuesday" },
        submitText: "Copy",
        onSubmit(data) {
          const items = Storage.collection("schedule");
          const copied = items.filter((item) => item.dayKey === data.from).map((item) => Object.assign({}, item, {
            id: Utils.uid("sch"),
            dayKey: data.to,
            day: Utils.dayName(data.to),
            dismissal: ["friday", "saturday"].includes(data.to) ? "10.10 WIB" : item.dismissal
          }));
          const next = items.filter((item) => item.dayKey !== data.to).concat(copied);
          save(next, `Schedule copied from ${Utils.dayName(data.from)} to ${Utils.dayName(data.to)}.`);
        }
      });
    });
    Utils.$("#resetSchedule", root).addEventListener("click", () => {
      UI.confirm("Reset schedule to the generated default weekly data?", () => save(Utils.clone(Storage.defaultState.schedule), "Schedule reset to default data."));
    });
    Utils.$("#scheduleSearch", root).addEventListener("input", renderList);
    Utils.$("#scheduleDay", root).addEventListener("change", renderList);
    renderList();
  };
})();
