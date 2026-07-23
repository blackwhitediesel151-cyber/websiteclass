(function () {
  "use strict";

  const Utils = window.ClassSixUtils;
  const UI = window.ClassSixUI;
  const Storage = window.ClassSixStorage;
  window.ClassSixAdmin = window.ClassSixAdmin || {};

  window.ClassSixAdmin.backup = function renderBackup(root, route) {
    root.innerHTML = `
      ${UI.pageHeader(route.title, route.subtitle)}
      <section class="grid two">
        <article class="panel">
          <div class="section-title">
            <h2>Current Backup</h2>
            <div class="actions">
              <button class="btn secondary ripple" type="button" id="refreshBackup">${Utils.icon("reset")}Refresh</button>
              <button class="btn primary ripple" type="button" id="downloadBackup">${Utils.icon("download")}Download</button>
            </div>
          </div>
          <textarea id="backupText" class="backup-box" aria-label="Backup JSON">${Utils.escapeHtml(Storage.exportState())}</textarea>
        </article>
        <article class="panel">
          <div class="section-title"><h2>Restore localStorage</h2></div>
          <p class="muted">Paste a full CLASS SIX backup JSON or import a file, then restore it into localStorage.</p>
          <div class="grid" style="margin-top:14px">
            <div class="field"><label for="backupFile">Import JSON file</label><input id="backupFile" type="file" accept="application/json,.json"></div>
            <button class="btn secondary ripple" type="button" id="restoreBackup">${Utils.icon("upload")}Restore From Text</button>
          </div>
        </article>
      </section>
      <section class="panel danger-zone" style="margin-top:16px">
        <div class="section-title">
          <div><h2>Reset Website</h2><p class="muted">Clears local data and returns to generated defaults.</p></div>
          <button class="btn danger ripple" type="button" id="resetBackup">${Utils.icon("reset")}Reset</button>
        </div>
      </section>
    `;
    const textarea = Utils.$("#backupText", root);
    function refresh() {
      textarea.value = Storage.exportState();
    }
    Utils.$("#refreshBackup", root).addEventListener("click", () => {
      refresh();
      UI.toast("Backup refreshed", "success");
    });
    Utils.$("#downloadBackup", root).addEventListener("click", () => {
      Utils.downloadFile("class-six-backup.json", Storage.exportState());
      UI.toast("Backup downloaded", "success");
    });
    Utils.$("#backupFile", root).addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      textarea.value = await Utils.readFileAsText(file);
      UI.toast("Backup file loaded", "success");
    });
    Utils.$("#restoreBackup", root).addEventListener("click", () => {
      UI.confirm("Restore this backup into localStorage?", () => {
        try {
          Storage.importState(textarea.value);
          UI.toast("Backup restored", "success");
          window.setTimeout(() => window.location.reload(), 400);
        } catch (error) {
          UI.toast("Backup JSON is invalid", "error");
        }
      });
    });
    Utils.$("#resetBackup", root).addEventListener("click", () => {
      UI.confirm("Reset the full website to default generated data?", () => {
        Storage.resetAll();
        UI.toast("Website reset", "success");
        window.setTimeout(() => window.location.reload(), 400);
      });
    });
  };
})();
