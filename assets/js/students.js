(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const UI = window.ClassSixUI;
  const Storage = window.ClassSixStorage;
  const Search = window.ClassSixSearch;
  window.ClassSixVisitor = window.ClassSixVisitor || {};
  window.ClassSixAdmin = window.ClassSixAdmin || {};

  function studentCard(item) {
    return `
      <article class="card">
        <div class="person-row">
          ${UI.avatar(item.name, item.avatar)}
          <div>
            <strong>${Utils.escapeHtml(item.name)}</strong>
            <span class="muted">No. ${Utils.escapeHtml(item.number)}</span>
          </div>
        </div>
        <p>${Utils.escapeHtml(item.note || "Student of Class Six")}</p>
      </article>
    `;
  }

  function sorted(items, sort) {
    const list = items.slice();
    if (sort === "name") return list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    if (sort === "name-desc") return list.sort((a, b) => String(b.name).localeCompare(String(a.name)));
    return list.sort((a, b) => Number(a.number) - Number(b.number));
  }

  window.ClassSixVisitor.siswa = function renderVisitorStudents(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <div class="filters">
        <div class="field"><label for="studentSearch">Search</label><input id="studentSearch" type="search" placeholder="Search student"></div>
        <div class="field"><label for="studentSort">Sort</label><select id="studentSort"><option value="number">Sort Number</option><option value="name">Sort A-Z</option><option value="name-desc">Sort Z-A</option></select></div>
        <div class="panel"><strong id="studentCounter">0</strong><span class="muted"> students found</span></div>
      </div>
      <div class="grid auto" id="studentList"></div>
    `;
    function renderList() {
      const query = Utils.$("#studentSearch", root).value;
      const sort = Utils.$("#studentSort", root).value;
      const items = sorted(Storage.collection("students").filter((item) => Search.includes(item, query, ["name", "number", "note"])), sort);
      Utils.$("#studentCounter", root).textContent = items.length;
      Utils.$("#studentList", root).innerHTML = items.length ? items.map(studentCard).join("") : UI.empty("No student found", "Try another keyword.");
    }
    Utils.$("#studentSearch", root).addEventListener("input", renderList);
    Utils.$("#studentSort", root).addEventListener("change", renderList);
    renderList();
  };

  function fields() {
    return [
      { name: "number", label: "Student Number", type: "number", required: true },
      { name: "name", label: "Full Name", required: true },
      { name: "avatar", label: "Avatar URL", full: true },
      { name: "note", label: "Note", type: "textarea", full: true }
    ];
  }

  window.ClassSixAdmin.siswa = function renderAdminStudents(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle, `
        <button class="btn secondary ripple" type="button" id="importStudents">${Utils.icon("upload")}Import JSON</button>
        <button class="btn secondary ripple" type="button" id="exportStudents">${Utils.icon("download")}Export JSON</button>
        <button class="btn primary ripple" type="button" id="addStudent">${Utils.icon("plus")}Add Student</button>
      `)}
      <div class="filters">
        <div class="field"><label for="studentSearch">Search</label><input id="studentSearch" type="search" placeholder="Search student"></div>
        <div class="field"><label for="studentSort">Sort</label><select id="studentSort"><option value="number">Number</option><option value="name">A-Z</option><option value="name-desc">Z-A</option></select></div>
        <div class="panel"><strong id="studentCounter">0</strong><span class="muted"> total records</span></div>
      </div>
      <div class="manager-list" id="studentList"></div>
    `;
    function save(items, message) {
      Storage.saveCollection("students", items, message);
      renderList();
      UI.toast(message, "success");
    }
    function upsert(existing) {
      UI.openForm({
        title: existing ? "Edit Student" : "Add Student",
        fields: fields(),
        values: existing || { number: Storage.collection("students").length + 1, note: "Student of Class Six" },
        submitText: existing ? "Update" : "Add",
        onSubmit(data) {
          const items = Storage.collection("students");
          if (existing) {
            items[items.findIndex((item) => item.id === existing.id)] = Object.assign({}, existing, data);
            save(items, `Student updated: ${data.name}.`);
          } else {
            items.push(Object.assign({ id: Utils.uid("stu") }, data));
            save(items, `Student added: ${data.name}.`);
          }
        }
      });
    }
    function renderList() {
      const query = Utils.$("#studentSearch", root).value;
      const sort = Utils.$("#studentSort", root).value;
      const items = sorted(Storage.collection("students").filter((item) => Search.includes(item, query, ["name", "number", "note"])), sort);
      Utils.$("#studentCounter", root).textContent = Storage.collection("students").length;
      const list = Utils.$("#studentList", root);
      list.innerHTML = items.length ? items.map((item) => `
        <article class="card manager-card">
          <div class="person-row">${UI.avatar(item.name, item.avatar)}<div><strong>${Utils.escapeHtml(item.name)}</strong><span class="muted">No. ${Utils.escapeHtml(item.number)} - ${Utils.escapeHtml(item.note || "Student")}</span></div></div>
          <div class="actions">
            <button class="icon-btn ripple" data-edit="${item.id}" aria-label="Edit">${Utils.icon("edit")}</button>
            <button class="icon-btn ripple" data-delete="${item.id}" aria-label="Delete">${Utils.icon("trash")}</button>
          </div>
        </article>
      `).join("") : UI.empty("No student found", "Add or import student data.");
      Utils.$$("[data-edit]", list).forEach((button) => button.addEventListener("click", () => upsert(Storage.collection("students").find((item) => item.id === button.dataset.edit))));
      Utils.$$("[data-delete]", list).forEach((button) => button.addEventListener("click", () => {
        const item = Storage.collection("students").find((entry) => entry.id === button.dataset.delete);
        UI.confirm(`Delete "${item.name}"?`, () => save(Storage.collection("students").filter((entry) => entry.id !== item.id), `Student deleted: ${item.name}.`));
      }));
    }
    Utils.$("#addStudent", root).addEventListener("click", () => upsert(null));
    Utils.$("#exportStudents", root).addEventListener("click", () => {
      Utils.downloadFile("class-six-students.json", JSON.stringify(Storage.collection("students"), null, 2));
      UI.toast("Student JSON exported", "success");
    });
    Utils.$("#importStudents", root).addEventListener("click", () => {
      UI.openModal("Import Students JSON", `
        <div class="grid">
          <div class="field"><label for="studentImportFile">JSON file</label><input id="studentImportFile" type="file" accept="application/json,.json"></div>
          <div class="field"><label for="studentImportText">Or paste JSON array</label><textarea id="studentImportText" class="backup-box" placeholder='[{"number":1,"name":"Student Name"}]'></textarea></div>
        </div>
      `, `<button class="btn ghost ripple" type="button" data-close-modal>Cancel</button><button class="btn primary ripple" type="button" id="doImportStudents">${Utils.icon("upload")}Import</button>`);
      Utils.$("#studentImportFile").addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) Utils.$("#studentImportText").value = await Utils.readFileAsText(file);
      });
      Utils.$("#doImportStudents").addEventListener("click", () => {
        const parsed = Utils.parseJson(Utils.$("#studentImportText").value);
        if (!parsed.ok || !Array.isArray(parsed.data)) {
          UI.toast("Import requires a JSON array", "error");
          return;
        }
        const imported = parsed.data.map((item, index) => Object.assign({ id: Utils.uid("stu"), number: index + 1, avatar: "", note: "Student of Class Six" }, item, { id: item.id || Utils.uid("stu") }));
        UI.closeModal();
        save(imported, "Student JSON imported.");
      });
    });
    Utils.$("#studentSearch", root).addEventListener("input", renderList);
    Utils.$("#studentSort", root).addEventListener("change", renderList);
    renderList();
  };
})();
