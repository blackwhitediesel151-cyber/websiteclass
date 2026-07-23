(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const UI = window.ClassSixUI;
  const Storage = window.ClassSixStorage;
  const Search = window.ClassSixSearch;
  window.ClassSixVisitor = window.ClassSixVisitor || {};
  window.ClassSixAdmin = window.ClassSixAdmin || {};

  function totalVotes(vote) {
    return vote.options.reduce((sum, item) => sum + Number(item.votes || 0), 0);
  }

  function resultsHtml(vote) {
    const total = totalVotes(vote);
    return `
      <div class="grid">
        ${vote.options.map((option) => {
          const count = Number(option.votes || 0);
          const percent = total ? Math.round((count / total) * 100) : 0;
          return `
            <div>
              <div class="section-title"><strong>${Utils.escapeHtml(option.label)}</strong><span class="muted">${count} votes - ${percent}%</span></div>
              <div class="progress"><span style="width:${percent}%"></span></div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function statusBadge(vote) {
    return vote.status === "Active" ? '<span class="badge green">Active</span>' : '<span class="badge amber">Inactive</span>';
  }

  window.ClassSixVisitor.voting = function renderVisitorVoting(root, route) {
    const active = Storage.collection("voting").filter((vote) => vote.status === "Active");
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <div class="grid" id="voteList">
        ${active.length ? active.map((vote) => {
          const voted = Storage.hasVoted(vote.id);
          return `
            <article class="card">
              <div class="section-title">
                <div><h3>${Utils.escapeHtml(vote.title)}</h3><p class="muted">${Utils.escapeHtml(vote.description || "")}</p></div>
                ${statusBadge(vote)}
              </div>
              ${voted ? `
                <p class="badge green">You have voted</p>
                ${resultsHtml(vote)}
              ` : `
                <form class="grid" data-vote-form="${vote.id}">
                  ${vote.options.map((option) => `
                    <label class="vote-option">
                      <input type="radio" name="option" value="${option.id}">
                      <span>${Utils.escapeHtml(option.label)}</span>
                    </label>
                  `).join("")}
                  <button class="btn primary ripple" type="submit">${Utils.icon("vote")}Submit Vote</button>
                </form>
              `}
            </article>
          `;
        }).join("") : UI.empty("No active voting", "Please check again later.")}
      </div>
    `;
    Utils.$$("[data-vote-form]", root).forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const voteId = form.dataset.voteForm;
        if (Storage.hasVoted(voteId)) {
          UI.toast("You already voted in this poll", "error");
          return;
        }
        const selected = form.querySelector("input[name='option']:checked");
        if (!selected) {
          UI.toast("Choose one option first", "error");
          return;
        }
        const voting = Storage.collection("voting");
        const vote = voting.find((item) => item.id === voteId);
        const option = vote.options.find((item) => item.id === selected.value);
        option.votes = Number(option.votes || 0) + 1;
        Storage.recordVote(voteId, selected.value);
        Storage.saveCollection("voting", voting, `Visitor voted in: ${vote.title}.`);
        UI.toast("Vote submitted", "success");
        renderVisitorVoting(root, route);
      });
    });
  };

  function optionRow(option) {
    return `
      <div class="option-row" data-option-row data-id="${Utils.escapeHtml(option.id || "")}">
        <input class="option-label" value="${Utils.escapeHtml(option.label || "")}" placeholder="Option label" required>
        <input class="option-votes" type="number" value="${Utils.escapeHtml(option.votes || 0)}" min="0" aria-label="Votes">
        <button class="icon-btn ripple" type="button" data-remove-option aria-label="Delete option">${Utils.icon("trash")}</button>
      </div>
    `;
  }

  function openVotingForm(existing, onSave) {
    const value = existing || { title: "", description: "", status: "Inactive", options: [{ label: "", votes: 0 }, { label: "", votes: 0 }] };
    UI.openModal(existing ? "Edit Voting" : "Create Voting", `
      <form id="votingForm" class="grid">
        <div class="input-row">
          <div class="field"><label for="voteTitle">Title</label><input id="voteTitle" required value="${Utils.escapeHtml(value.title)}"></div>
          <div class="field"><label for="voteStatus">Status</label><select id="voteStatus"><option ${value.status === "Active" ? "selected" : ""}>Active</option><option ${value.status !== "Active" ? "selected" : ""}>Inactive</option></select></div>
        </div>
        <div class="field"><label for="voteDescription">Description</label><textarea id="voteDescription">${Utils.escapeHtml(value.description || "")}</textarea></div>
        <div class="section-title"><h3>Options</h3><button class="btn secondary ripple" type="button" id="addOption">${Utils.icon("plus")}Add Option</button></div>
        <div class="option-builder" id="optionBuilder">${value.options.map(optionRow).join("")}</div>
      </form>
    `, `
      <button class="btn ghost ripple" type="button" data-close-modal>Cancel</button>
      <button class="btn primary ripple" type="submit" form="votingForm">${Utils.icon("check")}Save Voting</button>
    `);
    const builder = Utils.$("#optionBuilder");
    function bindRemove() {
      Utils.$$("[data-remove-option]", builder).forEach((button) => {
        button.onclick = () => {
          if (Utils.$$("[data-option-row]", builder).length <= 2) {
            UI.toast("Voting needs at least two options", "error");
            return;
          }
          button.closest("[data-option-row]").remove();
        };
      });
    }
    Utils.$("#addOption").addEventListener("click", () => {
      builder.insertAdjacentHTML("beforeend", optionRow({ label: "", votes: 0 }));
      bindRemove();
    });
    bindRemove();
    Utils.$("#votingForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const options = Utils.$$("[data-option-row]", builder).map((row) => ({
        id: row.dataset.id || Utils.uid("opt"),
        label: row.querySelector(".option-label").value.trim(),
        votes: Number(row.querySelector(".option-votes").value || 0)
      })).filter((option) => option.label);
      if (options.length < 2) {
        UI.toast("Voting needs at least two options", "error");
        return;
      }
      onSave({
        id: existing ? existing.id : Utils.uid("vote"),
        title: Utils.$("#voteTitle").value.trim(),
        description: Utils.$("#voteDescription").value.trim(),
        status: Utils.$("#voteStatus").value,
        createdAt: existing ? existing.createdAt : new Date().toISOString().slice(0, 10),
        options
      });
      UI.closeModal();
    });
  }

  window.ClassSixAdmin.voting = function renderAdminVoting(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle, `<button class="btn primary ripple" type="button" id="addVote">${Utils.icon("plus")}Create Voting</button>`)}
      <div class="filters">
        <div class="field"><label for="voteSearch">Search</label><input id="voteSearch" type="search" placeholder="Search voting"></div>
        <div class="field"><label for="voteStatusFilter">Status</label><select id="voteStatusFilter"><option value="">All Status</option><option>Active</option><option>Inactive</option></select></div>
        <div class="panel"><strong>${Storage.collection("voting").filter((item) => item.status === "Active").length}</strong><span class="muted"> active voting</span></div>
      </div>
      <div class="manager-list" id="votingList"></div>
    `;

    function save(items, message) {
      Storage.saveCollection("voting", items, message);
      renderList();
      UI.toast(message, "success");
    }

    function renderList() {
      const query = Utils.$("#voteSearch", root).value;
      const status = Utils.$("#voteStatusFilter", root).value;
      const items = Storage.collection("voting")
        .filter((item) => Search.includes(item, query, ["title", "description", "status"]))
        .filter((item) => !status || item.status === status)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      const list = Utils.$("#votingList", root);
      list.innerHTML = items.length ? items.map((vote) => `
        <article class="card">
          <div class="section-title">
            <div><h3>${Utils.escapeHtml(vote.title)}</h3><p class="muted">${Utils.escapeHtml(vote.description || "")}</p></div>
            <div class="cluster">${statusBadge(vote)}<span class="badge">${totalVotes(vote)} votes</span></div>
          </div>
          ${resultsHtml(vote)}
          <div class="actions" style="margin-top:14px">
            <button class="btn secondary ripple" data-preview="${vote.id}" type="button">${Utils.icon("eye")}Preview</button>
            <button class="btn secondary ripple" data-stats="${vote.id}" type="button">${Utils.icon("chart")}Statistics</button>
            <button class="btn secondary ripple" data-toggle="${vote.id}" type="button">${vote.status === "Active" ? "Deactivate" : "Activate"}</button>
            <button class="icon-btn ripple" data-duplicate="${vote.id}" aria-label="Duplicate">${Utils.icon("copy")}</button>
            <button class="icon-btn ripple" data-reset="${vote.id}" aria-label="Reset result">${Utils.icon("reset")}</button>
            <button class="icon-btn ripple" data-edit="${vote.id}" aria-label="Edit">${Utils.icon("edit")}</button>
            <button class="icon-btn ripple" data-delete="${vote.id}" aria-label="Delete">${Utils.icon("trash")}</button>
          </div>
        </article>
      `).join("") : UI.empty("No voting found", "Create a voting item to begin.");
      Utils.$$("[data-preview]", list).forEach((button) => button.addEventListener("click", () => {
        const vote = Storage.collection("voting").find((item) => item.id === button.dataset.preview);
        UI.openModal(vote.title, `<p>${Utils.escapeHtml(vote.description || "")}</p>${resultsHtml(vote)}`);
      }));
      Utils.$$("[data-stats]", list).forEach((button) => button.addEventListener("click", () => {
        const vote = Storage.collection("voting").find((item) => item.id === button.dataset.stats);
        UI.openModal("Voting Statistics", `<p><strong>${Utils.escapeHtml(vote.title)}</strong></p><p>Total votes: ${totalVotes(vote)}</p>${resultsHtml(vote)}`);
      }));
      Utils.$$("[data-toggle]", list).forEach((button) => button.addEventListener("click", () => {
        const items = Storage.collection("voting");
        const vote = items.find((item) => item.id === button.dataset.toggle);
        vote.status = vote.status === "Active" ? "Inactive" : "Active";
        save(items, `${vote.title} is now ${vote.status}.`);
      }));
      Utils.$$("[data-duplicate]", list).forEach((button) => button.addEventListener("click", () => {
        const items = Storage.collection("voting");
        const source = items.find((item) => item.id === button.dataset.duplicate);
        const duplicate = Utils.clone(source);
        duplicate.id = Utils.uid("vote");
        duplicate.title = `${source.title} Copy`;
        duplicate.status = "Inactive";
        duplicate.createdAt = new Date().toISOString().slice(0, 10);
        duplicate.options = duplicate.options.map((option) => ({ id: Utils.uid("opt"), label: option.label, votes: 0 }));
        items.unshift(duplicate);
        save(items, `Voting duplicated: ${duplicate.title}.`);
      }));
      Utils.$$("[data-reset]", list).forEach((button) => button.addEventListener("click", () => {
        const items = Storage.collection("voting");
        const vote = items.find((item) => item.id === button.dataset.reset);
        UI.confirm(`Reset results for "${vote.title}"?`, () => {
          vote.options.forEach((option) => { option.votes = 0; });
          Storage.clearVotes(vote.id);
          save(items, `Voting results reset: ${vote.title}.`);
        });
      }));
      Utils.$$("[data-edit]", list).forEach((button) => button.addEventListener("click", () => {
        const vote = Storage.collection("voting").find((item) => item.id === button.dataset.edit);
        openVotingForm(vote, (data) => {
          const items = Storage.collection("voting");
          items[items.findIndex((item) => item.id === vote.id)] = data;
          save(items, `Voting updated: ${data.title}.`);
        });
      }));
      Utils.$$("[data-delete]", list).forEach((button) => button.addEventListener("click", () => {
        const vote = Storage.collection("voting").find((item) => item.id === button.dataset.delete);
        UI.confirm(`Delete "${vote.title}"?`, () => {
          Storage.clearVotes(vote.id);
          save(Storage.collection("voting").filter((item) => item.id !== vote.id), `Voting deleted: ${vote.title}.`);
        });
      }));
    }

    Utils.$("#addVote", root).addEventListener("click", () => {
      openVotingForm(null, (data) => {
        const items = Storage.collection("voting");
        items.unshift(data);
        save(items, `Voting created: ${data.title}.`);
      });
    });
    Utils.$("#voteSearch", root).addEventListener("input", renderList);
    Utils.$("#voteStatusFilter", root).addEventListener("change", renderList);
    renderList();
  };
})();
