(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const UI = window.ClassSixUI;
  const Storage = window.ClassSixStorage;
  const Search = window.ClassSixSearch;
  window.ClassSixVisitor = window.ClassSixVisitor || {};
  window.ClassSixAdmin = window.ClassSixAdmin || {};

  const iconOptions = ["book", "calculator", "leaf", "palette", "star", "activity", "message", "shield", "monitor", "globe"];

  function subjectCard(item) {
    return `
      <article class="card subject-card" style="--subject-color:${Utils.escapeHtml(item.color || "#2563eb")}">
        <div class="section-title">
          <span style="color:${Utils.escapeHtml(item.color || "#2563eb")}">${Utils.icon(item.icon || "book")}</span>
          <span class="badge" style="background:${Utils.escapeHtml(item.color || "#2563eb")}22;color:${Utils.escapeHtml(item.color || "#2563eb")}">${Utils.escapeHtml(item.teacher || "Teacher")}</span>
        </div>
        <h3>${Utils.escapeHtml(item.name)}</h3>
        <p>${Utils.escapeHtml(item.description || "")}</p>
      </article>
    `;
  }

  function fields() {
    const teachers = Storage.collection("teachers").map((item) => item.name);
    return [
      { name: "name", label: "Subject Name", required: true },
      { name: "icon", label: "Icon", type: "select", options: iconOptions },
      { name: "color", label: "Color", type: "color" },
      { name: "teacher", label: "Teacher", type: "select", options: teachers.length ? teachers : ["Teacher"] },
      { name: "description", label: "Description", type: "textarea", full: true }
    ];
  }

  window.ClassSixVisitor.mapel = function renderVisitorSubjects(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <div class="filters">
        <div class="field"><label for="subjectSearch">Search</label><input id="subjectSearch" type="search" placeholder="Search subject"></div>
        <div class="panel"><strong>${Storage.collection("subjects").length}</strong><span class="muted"> subjects available</span></div>
        <div class="panel"><strong>${Search.unique(Storage.collection("subjects").map((item) => item.teacher)).length}</strong><span class="muted"> subject teachers</span></div>
      </div>
      <div class="grid auto" id="subjectList"></div>
    `;
    function renderList() {
      const query = Utils.$("#subjectSearch", root).value;
      const items = Storage.collection("subjects").filter((item) => Search.includes(item, query, ["name", "teacher", "description"])).sort((a, b) => String(a.name).localeCompare(String(b.name)));
      Utils.$("#subjectList", root).innerHTML = items.length ? items.map(subjectCard).join("") : UI.empty("No subject found", "Try another keyword.");
    }
    Utils.$("#subjectSearch", root).addEventListener("input", renderList);
    renderList();
  };

  window.ClassSixAdmin.mapel = function renderAdminSubjects(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle, `<button class="btn primary ripple" type="button" id="addSubject">${Utils.icon("plus")}Add Subject</button>`)}
      <div class="filters">
        <div class="field"><label for="subjectSearch">Search</label><input id="subjectSearch" type="search" placeholder="Search subject"></div>
        <div class="field"><label for="teacherSearch">Teacher</label><input id="teacherSearch" type="search" placeholder="Filter teacher"></div>
        <div class="field"><label for="subjectSort">Sort</label><select id="subjectSort"><option value="name">Name</option><option value="teacher">Teacher</option></select></div>
      </div>
      <div class="manager-list" id="subjectList"></div>
    `;
    function save(items, message) {
      Storage.saveCollection("subjects", items, message);
      renderList();
      UI.toast(message, "success");
    }
    function upsert(existing) {
      UI.openForm({
        title: existing ? "Edit Subject" : "Add Subject",
        fields: fields(),
        values: existing || { icon: "book", color: "#2563eb", teacher: (Storage.collection("teachers")[0] || {}).name || "" },
        submitText: existing ? "Update" : "Add",
        onSubmit(data) {
          const items = Storage.collection("subjects");
          if (existing) {
            items[items.findIndex((item) => item.id === existing.id)] = Object.assign({}, existing, data);
            save(items, `Subject updated: ${data.name}.`);
          } else {
            items.push(Object.assign({ id: Utils.uid("sub") }, data));
            save(items, `Subject added: ${data.name}.`);
          }
        }
      });
    }
    function renderList() {
      const query = Utils.$("#subjectSearch", root).value;
      const teacher = Utils.$("#teacherSearch", root).value;
      const sort = Utils.$("#subjectSort", root).value;
      const items = Storage.collection("subjects")
        .filter((item) => Search.includes(item, query, ["name", "teacher", "description"]))
        .filter((item) => !teacher || Utils.normalize(item.teacher).includes(Utils.normalize(teacher)))
        .sort((a, b) => String(a[sort]).localeCompare(String(b[sort])));
      const list = Utils.$("#subjectList", root);
      list.innerHTML = items.length ? items.map((item) => `
        <article class="card manager-card">
          <div>
            <div class="cluster"><span class="color-dot" style="background:${Utils.escapeHtml(item.color)}"></span><strong>${Utils.escapeHtml(item.name)}</strong><span class="badge">${Utils.escapeHtml(item.teacher)}</span></div>
            <p class="muted">${Utils.escapeHtml(item.description || "")}</p>
          </div>
          <div class="actions">
            <button class="icon-btn ripple" data-edit="${item.id}" aria-label="Edit">${Utils.icon("edit")}</button>
            <button class="icon-btn ripple" data-delete="${item.id}" aria-label="Delete">${Utils.icon("trash")}</button>
          </div>
        </article>
      `).join("") : UI.empty("No subject found", "Add a subject or clear filters.");
      Utils.$$("[data-edit]", list).forEach((button) => button.addEventListener("click", () => upsert(Storage.collection("subjects").find((item) => item.id === button.dataset.edit))));
      Utils.$$("[data-delete]", list).forEach((button) => button.addEventListener("click", () => {
        const item = Storage.collection("subjects").find((entry) => entry.id === button.dataset.delete);
        UI.confirm(`Delete "${item.name}"?`, () => save(Storage.collection("subjects").filter((entry) => entry.id !== item.id), `Subject deleted: ${item.name}.`));
      }));
    }
    Utils.$("#addSubject", root).addEventListener("click", () => upsert(null));
    Utils.$("#subjectSearch", root).addEventListener("input", renderList);
    Utils.$("#teacherSearch", root).addEventListener("input", renderList);
    Utils.$("#subjectSort", root).addEventListener("change", renderList);
    renderList();
  };
})();
