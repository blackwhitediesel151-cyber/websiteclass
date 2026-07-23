(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const UI = window.ClassSixUI;
  const Storage = window.ClassSixStorage;
  const Search = window.ClassSixSearch;
  window.ClassSixVisitor = window.ClassSixVisitor || {};
  window.ClassSixAdmin = window.ClassSixAdmin || {};

  function teacherCard(item) {
    return `
      <article class="card">
        <div class="person-row">
          ${UI.avatar(item.name, item.avatar)}
          <div>
            <strong>${Utils.escapeHtml(item.name)}</strong>
            <span class="muted">${Utils.escapeHtml(item.position || "Teacher")}</span>
          </div>
        </div>
        <p><span class="badge">${Utils.escapeHtml(item.subject || "General")}</span></p>
        <p>${Utils.escapeHtml(item.bio || "Class Six teacher profile.")}</p>
      </article>
    `;
  }

  function fields() {
    return [
      { name: "name", label: "Teacher Name", required: true },
      { name: "subject", label: "Subject", required: true },
      { name: "position", label: "Position", required: true },
      { name: "avatar", label: "Avatar URL", full: true },
      { name: "bio", label: "Profile", type: "textarea", full: true }
    ];
  }

  window.ClassSixVisitor.guru = function renderVisitorTeachers(root, route) {
    const subjects = Search.unique(Storage.collection("teachers").map((item) => item.subject));
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <div class="filters">
        <div class="field"><label for="teacherSearch">Search</label><input id="teacherSearch" type="search" placeholder="Search teacher"></div>
        <div class="field"><label for="teacherSubject">Subject</label><select id="teacherSubject"><option value="">All Subjects</option>${subjects.map((item) => `<option>${Utils.escapeHtml(item)}</option>`).join("")}</select></div>
        <div class="field"><label for="teacherPosition">Position</label><input id="teacherPosition" type="search" placeholder="Filter position"></div>
      </div>
      <div class="grid auto" id="teacherList"></div>
    `;
    function renderList() {
      const query = Utils.$("#teacherSearch", root).value;
      const subject = Utils.$("#teacherSubject", root).value;
      const position = Utils.$("#teacherPosition", root).value;
      const items = Storage.collection("teachers")
        .filter((item) => Search.includes(item, query, ["name", "subject", "position", "bio"]))
        .filter((item) => !subject || item.subject === subject)
        .filter((item) => !position || Utils.normalize(item.position).includes(Utils.normalize(position)))
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
      Utils.$("#teacherList", root).innerHTML = items.length ? items.map(teacherCard).join("") : UI.empty("No teacher found", "Try another filter.");
    }
    Utils.$("#teacherSearch", root).addEventListener("input", renderList);
    Utils.$("#teacherSubject", root).addEventListener("change", renderList);
    Utils.$("#teacherPosition", root).addEventListener("input", renderList);
    renderList();
  };

  window.ClassSixAdmin.guru = function renderAdminTeachers(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle, `<button class="btn primary ripple" type="button" id="addTeacher">${Utils.icon("plus")}Add Teacher</button>`)}
      <div class="filters">
        <div class="field"><label for="teacherSearch">Search</label><input id="teacherSearch" type="search" placeholder="Search teacher"></div>
        <div class="field"><label for="teacherSubject">Subject</label><input id="teacherSubject" type="search" placeholder="Filter subject"></div>
        <div class="field"><label for="teacherPosition">Position</label><input id="teacherPosition" type="search" placeholder="Filter position"></div>
      </div>
      <div class="manager-list" id="teacherList"></div>
    `;
    function save(items, message) {
      Storage.saveCollection("teachers", items, message);
      renderList();
      UI.toast(message, "success");
    }
    function upsert(existing) {
      UI.openForm({
        title: existing ? "Edit Teacher" : "Add Teacher",
        fields: fields(),
        values: existing || { position: "Guru Mapel", avatar: "" },
        submitText: existing ? "Update" : "Add",
        onSubmit(data) {
          const items = Storage.collection("teachers");
          if (existing) {
            items[items.findIndex((item) => item.id === existing.id)] = Object.assign({}, existing, data);
            save(items, `Teacher updated: ${data.name}.`);
          } else {
            items.push(Object.assign({ id: Utils.uid("tch") }, data));
            save(items, `Teacher added: ${data.name}.`);
          }
        }
      });
    }
    function renderList() {
      const query = Utils.$("#teacherSearch", root).value;
      const subject = Utils.$("#teacherSubject", root).value;
      const position = Utils.$("#teacherPosition", root).value;
      const items = Storage.collection("teachers")
        .filter((item) => Search.includes(item, query, ["name", "subject", "position", "bio"]))
        .filter((item) => !subject || Utils.normalize(item.subject).includes(Utils.normalize(subject)))
        .filter((item) => !position || Utils.normalize(item.position).includes(Utils.normalize(position)))
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
      const list = Utils.$("#teacherList", root);
      list.innerHTML = items.length ? items.map((item) => `
        <article class="card manager-card">
          <div class="person-row">${UI.avatar(item.name, item.avatar)}<div><strong>${Utils.escapeHtml(item.name)}</strong><span class="muted">${Utils.escapeHtml(item.subject)} - ${Utils.escapeHtml(item.position)}</span></div></div>
          <div class="actions">
            <button class="icon-btn ripple" data-edit="${item.id}" aria-label="Edit">${Utils.icon("edit")}</button>
            <button class="icon-btn ripple" data-delete="${item.id}" aria-label="Delete">${Utils.icon("trash")}</button>
          </div>
        </article>
      `).join("") : UI.empty("No teacher found", "Add a teacher or clear filters.");
      Utils.$$("[data-edit]", list).forEach((button) => button.addEventListener("click", () => upsert(Storage.collection("teachers").find((item) => item.id === button.dataset.edit))));
      Utils.$$("[data-delete]", list).forEach((button) => button.addEventListener("click", () => {
        const item = Storage.collection("teachers").find((entry) => entry.id === button.dataset.delete);
        UI.confirm(`Delete "${item.name}"?`, () => save(Storage.collection("teachers").filter((entry) => entry.id !== item.id), `Teacher deleted: ${item.name}.`));
      }));
    }
    Utils.$("#addTeacher", root).addEventListener("click", () => upsert(null));
    ["#teacherSearch", "#teacherSubject", "#teacherPosition"].forEach((selector) => Utils.$(selector, root).addEventListener("input", renderList));
    renderList();
  };
})();
