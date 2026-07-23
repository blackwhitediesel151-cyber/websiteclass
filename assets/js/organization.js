(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const UI = window.ClassSixUI;
  const Storage = window.ClassSixStorage;
  const Search = window.ClassSixSearch;
  window.ClassSixVisitor = window.ClassSixVisitor || {};
  window.ClassSixAdmin = window.ClassSixAdmin || {};

  function ordered(items) {
    return items.slice().sort((a, b) => Number(a.order) - Number(b.order));
  }

  function orgNode(item) {
    return `
      <article class="org-node">
        ${UI.avatar(item.name, item.photo)}
        <div>
          <span class="badge">${Utils.escapeHtml(item.position)}</span>
          <h3>${Utils.escapeHtml(item.name)}</h3>
          <p class="muted">${Utils.escapeHtml(item.description || "")}</p>
        </div>
      </article>
    `;
  }

  function fields() {
    const names = Storage.collection("students").map((item) => item.name);
    return [
      { name: "position", label: "Position", required: true },
      { name: "name", label: "Name", type: "select", options: names.length ? names : ["Member"] },
      { name: "photo", label: "Photo URL", full: true },
      { name: "order", label: "Order", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", full: true }
    ];
  }

  window.ClassSixVisitor.organisasi = function renderVisitorOrganization(root, route) {
    const items = ordered(Storage.collection("organization"));
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <section class="org-chart">${items.map(orgNode).join("")}</section>
    `;
  };

  window.ClassSixAdmin.organisasi = function renderAdminOrganization(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle, `<button class="btn primary ripple" type="button" id="addOrg">${Utils.icon("plus")}Add Position</button>`)}
      <div class="filters">
        <div class="field"><label for="orgSearch">Search</label><input id="orgSearch" type="search" placeholder="Search position or name"></div>
        <div class="panel"><strong>${Storage.collection("organization").length}</strong><span class="muted"> organization roles</span></div>
        <div class="panel"><span class="muted">Drag cards to reorder</span></div>
      </div>
      <div class="manager-list" id="orgList"></div>
    `;

    function save(items, message) {
      const next = ordered(items).map((item, index) => Object.assign({}, item, { order: index + 1 }));
      Storage.saveCollection("organization", next, message);
      renderList();
      UI.toast(message, "success");
    }

    function upsert(existing) {
      UI.openForm({
        title: existing ? "Edit Position" : "Add Position",
        fields: fields(),
        values: existing || { order: Storage.collection("organization").length + 1 },
        submitText: existing ? "Update" : "Add",
        onSubmit(data) {
          const items = Storage.collection("organization");
          if (existing) {
            items[items.findIndex((item) => item.id === existing.id)] = Object.assign({}, existing, data);
            save(items, `Organization updated: ${data.position}.`);
          } else {
            items.push(Object.assign({ id: Utils.uid("org") }, data));
            save(items, `Organization role added: ${data.position}.`);
          }
        }
      });
    }

    function renderList() {
      const query = Utils.$("#orgSearch", root).value;
      const items = ordered(Storage.collection("organization").filter((item) => Search.includes(item, query, ["position", "name", "description"])));
      const list = Utils.$("#orgList", root);
      list.innerHTML = items.length ? items.map((item) => `
        <article class="card manager-card" draggable="true" data-id="${item.id}">
          <div class="person-row">
            ${UI.avatar(item.name, item.photo)}
            <div><strong>${Utils.escapeHtml(item.position)}</strong><span class="muted">${Utils.escapeHtml(item.name)} - order ${Utils.escapeHtml(item.order)}</span></div>
          </div>
          <div class="actions">
            <button class="icon-btn ripple" data-edit="${item.id}" aria-label="Edit">${Utils.icon("edit")}</button>
            <button class="icon-btn ripple" data-delete="${item.id}" aria-label="Delete">${Utils.icon("trash")}</button>
          </div>
        </article>
      `).join("") : UI.empty("No organization role found", "Add a role or clear filters.");
      Utils.$$("[data-edit]", list).forEach((button) => button.addEventListener("click", () => upsert(Storage.collection("organization").find((item) => item.id === button.dataset.edit))));
      Utils.$$("[data-delete]", list).forEach((button) => button.addEventListener("click", () => {
        const item = Storage.collection("organization").find((entry) => entry.id === button.dataset.delete);
        UI.confirm(`Delete "${item.position}"?`, () => save(Storage.collection("organization").filter((entry) => entry.id !== item.id), `Organization role deleted: ${item.position}.`));
      }));
      let draggingId = null;
      Utils.$$("[draggable='true']", list).forEach((card) => {
        card.addEventListener("dragstart", () => {
          draggingId = card.dataset.id;
          card.classList.add("is-dragging");
        });
        card.addEventListener("dragend", () => card.classList.remove("is-dragging"));
        card.addEventListener("dragover", (event) => event.preventDefault());
        card.addEventListener("drop", (event) => {
          event.preventDefault();
          const targetId = card.dataset.id;
          if (!draggingId || draggingId === targetId) return;
          const current = ordered(Storage.collection("organization"));
          const from = current.findIndex((item) => item.id === draggingId);
          const to = current.findIndex((item) => item.id === targetId);
          const [moved] = current.splice(from, 1);
          current.splice(to, 0, moved);
          save(current, "Organization order updated.");
        });
      });
    }

    Utils.$("#addOrg", root).addEventListener("click", () => upsert(null));
    Utils.$("#orgSearch", root).addEventListener("input", renderList);
    renderList();
  };
})();
