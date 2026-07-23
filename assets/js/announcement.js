(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const UI = window.ClassSixUI;
  const Storage = window.ClassSixStorage;
  const Search = window.ClassSixSearch;
  window.ClassSixVisitor = window.ClassSixVisitor || {};
  window.ClassSixAdmin = window.ClassSixAdmin || {};

  function sortedAnnouncements(items) {
    return items.slice().sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
  }

  function statusBadge(item) {
    if (item.status === "Draft") return '<span class="badge amber">Draft</span>';
    return '<span class="badge green">Published</span>';
  }

  function announcementCard(item, includeStatus) {
    return `
      <div class="section-title">
        <div class="cluster">
          ${item.pinned ? '<span class="badge">Pinned</span>' : ""}
          <span class="badge violet">${Utils.escapeHtml(item.category || "General")}</span>
          ${includeStatus ? statusBadge(item) : ""}
        </div>
        <small class="muted">${Utils.escapeHtml(Utils.formatDate(`${item.date}T00:00:00`, { day: "2-digit", month: "short", year: "numeric" }))}</small>
      </div>
      <h3>${Utils.escapeHtml(item.title)}</h3>
      <p>${Utils.escapeHtml(item.body).slice(0, 170)}${item.body && item.body.length > 170 ? "..." : ""}</p>
    `;
  }

  window.ClassSixVisitor.pengumuman = function renderVisitorAnnouncements(root, route) {
    const all = sortedAnnouncements(Storage.collection("announcements").filter((item) => item.status === "Published"));
    const categories = Search.unique(all.map((item) => item.category));
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <div class="filters">
        <div class="field"><label for="searchAnnouncement">Search</label><input id="searchAnnouncement" type="search" placeholder="Search announcement"></div>
        <div class="field"><label for="categoryAnnouncement">Category</label><select id="categoryAnnouncement"><option value="">All Categories</option>${categories.map((item) => `<option>${Utils.escapeHtml(item)}</option>`).join("")}</select></div>
        <div class="field"><label for="sortAnnouncement">Sort</label><select id="sortAnnouncement"><option value="latest">Latest First</option><option value="oldest">Oldest First</option></select></div>
      </div>
      <div class="grid" id="announcementList"></div>
    `;
    const list = Utils.$("#announcementList", root);
    function renderList() {
      const query = Utils.$("#searchAnnouncement", root).value;
      const category = Utils.$("#categoryAnnouncement", root).value;
      const sort = Utils.$("#sortAnnouncement", root).value;
      let filtered = all.filter((item) => Search.includes(item, query, ["title", "body", "category"]) && (!category || item.category === category));
      filtered = filtered.sort((a, b) => sort === "oldest" ? String(a.date).localeCompare(String(b.date)) : String(b.date).localeCompare(String(a.date)));
      if (!filtered.length) {
        list.innerHTML = UI.empty("No announcement found", "Try another keyword or category.");
        return;
      }
      list.innerHTML = filtered.map((item) => `<article class="card ripple" role="button" tabindex="0" data-view="${item.id}" style="cursor:pointer">${announcementCard(item, false)}</article>`).join("");
      Utils.$$("[data-view]", list).forEach((card) => {
        const open = () => {
          const item = filtered.find((entry) => entry.id === card.dataset.view);
          UI.openModal(item.title, `
            <div class="cluster">${item.pinned ? '<span class="badge">Pinned</span>' : ""}<span class="badge violet">${Utils.escapeHtml(item.category)}</span><span class="muted">${Utils.escapeHtml(Utils.formatDate(`${item.date}T00:00:00`))}</span></div>
            <p>${Utils.escapeHtml(item.body)}</p>
          `);
        };
        card.addEventListener("click", open);
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        });
      });
    }
    Utils.$("#searchAnnouncement", root).addEventListener("input", renderList);
    Utils.$("#categoryAnnouncement", root).addEventListener("change", renderList);
    Utils.$("#sortAnnouncement", root).addEventListener("change", renderList);
    renderList();
  };

  function announcementFields() {
    return [
      { name: "title", label: "Title", required: true, full: true },
      { name: "category", label: "Category", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "status", label: "Status", type: "select", options: ["Published", "Draft"] },
      { name: "pinned", label: "Pin Announcement", type: "checkbox" },
      { name: "body", label: "Content", type: "textarea", required: true, full: true }
    ];
  }

  window.ClassSixAdmin.pengumuman = function renderAdminAnnouncements(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle, `<button class="btn primary ripple" type="button" id="addAnnouncement">${Utils.icon("plus")}Create</button>`)}
      <div class="filters">
        <div class="field"><label for="searchAnnouncement">Search</label><input id="searchAnnouncement" type="search" placeholder="Search announcement"></div>
        <div class="field"><label for="statusAnnouncement">Status</label><select id="statusAnnouncement"><option value="">All Status</option><option>Published</option><option>Draft</option></select></div>
        <div class="field"><label for="sortAnnouncement">Sort</label><select id="sortAnnouncement"><option value="latest">Latest First</option><option value="oldest">Oldest First</option><option value="title">Title A-Z</option></select></div>
      </div>
      <div class="manager-list" id="announcementList"></div>
    `;

    function save(items, message) {
      Storage.saveCollection("announcements", items, message);
      renderList();
      UI.toast(message, "success");
    }

    function upsert(existing) {
      UI.openForm({
        title: existing ? "Edit Announcement" : "Create Announcement",
        fields: announcementFields(),
        values: existing || { date: new Date().toISOString().slice(0, 10), status: "Published", category: "General" },
        submitText: existing ? "Update" : "Create",
        onSubmit(data) {
          const items = Storage.collection("announcements");
          if (existing) {
            const index = items.findIndex((item) => item.id === existing.id);
            items[index] = Object.assign({}, existing, data);
            save(items, `Announcement updated: ${data.title}.`);
          } else {
            items.unshift(Object.assign({ id: Utils.uid("ann") }, data));
            save(items, `Announcement created: ${data.title}.`);
          }
        }
      });
    }

    function renderList() {
      const query = Utils.$("#searchAnnouncement", root).value;
      const status = Utils.$("#statusAnnouncement", root).value;
      const sort = Utils.$("#sortAnnouncement", root).value;
      let items = Storage.collection("announcements").filter((item) => Search.includes(item, query, ["title", "body", "category"]) && (!status || item.status === status));
      items = items.sort((a, b) => {
        if (sort === "title") return String(a.title).localeCompare(String(b.title));
        return sort === "oldest" ? String(a.date).localeCompare(String(b.date)) : String(b.date).localeCompare(String(a.date));
      });
      const list = Utils.$("#announcementList", root);
      if (!items.length) {
        list.innerHTML = UI.empty("No announcement found", "Create a new announcement or adjust filters.");
        return;
      }
      list.innerHTML = items.map((item) => `
        <article class="card manager-card">
          <div>${announcementCard(item, true)}</div>
          <div class="actions">
            <button class="icon-btn ripple" data-preview="${item.id}" aria-label="Preview">${Utils.icon("eye")}</button>
            <button class="icon-btn ripple" data-pin="${item.id}" aria-label="Pin or unpin">${Utils.icon("pin")}</button>
            <button class="icon-btn ripple" data-status="${item.id}" aria-label="Publish or draft">${Utils.icon("check")}</button>
            <button class="icon-btn ripple" data-edit="${item.id}" aria-label="Edit">${Utils.icon("edit")}</button>
            <button class="icon-btn ripple" data-delete="${item.id}" aria-label="Delete">${Utils.icon("trash")}</button>
          </div>
        </article>
      `).join("");
      Utils.$$("[data-preview]", list).forEach((button) => button.addEventListener("click", () => {
        const item = Storage.collection("announcements").find((entry) => entry.id === button.dataset.preview);
        UI.openModal(item.title, `<div class="cluster">${statusBadge(item)}<span class="badge">${Utils.escapeHtml(item.category)}</span></div><p>${Utils.escapeHtml(item.body)}</p>`);
      }));
      Utils.$$("[data-pin]", list).forEach((button) => button.addEventListener("click", () => {
        const current = Storage.collection("announcements");
        const item = current.find((entry) => entry.id === button.dataset.pin);
        item.pinned = !item.pinned;
        save(current, item.pinned ? `Announcement pinned: ${item.title}.` : `Announcement unpinned: ${item.title}.`);
      }));
      Utils.$$("[data-status]", list).forEach((button) => button.addEventListener("click", () => {
        const current = Storage.collection("announcements");
        const item = current.find((entry) => entry.id === button.dataset.status);
        item.status = item.status === "Published" ? "Draft" : "Published";
        save(current, `${item.title} set to ${item.status}.`);
      }));
      Utils.$$("[data-edit]", list).forEach((button) => button.addEventListener("click", () => upsert(Storage.collection("announcements").find((item) => item.id === button.dataset.edit))));
      Utils.$$("[data-delete]", list).forEach((button) => button.addEventListener("click", () => {
        const item = Storage.collection("announcements").find((entry) => entry.id === button.dataset.delete);
        UI.confirm(`Delete "${item.title}"?`, () => save(Storage.collection("announcements").filter((entry) => entry.id !== item.id), `Announcement deleted: ${item.title}.`));
      }));
    }

    Utils.$("#addAnnouncement", root).addEventListener("click", () => upsert(null));
    Utils.$("#searchAnnouncement", root).addEventListener("input", renderList);
    Utils.$("#statusAnnouncement", root).addEventListener("change", renderList);
    Utils.$("#sortAnnouncement", root).addEventListener("change", renderList);
    renderList();
  };
})();
