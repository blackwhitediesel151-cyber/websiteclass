(function () {
  "use strict";

  function apply(value) {
    const Storage = window.ClassSixStorage;
    const settings = Storage ? Storage.settings() : {};
    const dark = typeof value === "boolean" ? value : Boolean(settings.darkMode);
    document.body.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("dark", dark);
    const color = settings.themeColor || "#2563eb";
    document.documentElement.style.setProperty("--primary", color);
    document.querySelectorAll("[data-action='theme']").forEach((button) => {
      button.innerHTML = window.ClassSixUtils.icon(dark ? "sun" : "moon");
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  function toggle() {
    const Storage = window.ClassSixStorage;
    const settings = Storage.settings();
    const next = !settings.darkMode;
    Storage.saveSettings({ darkMode: next }, next ? "Dark mode enabled." : "Light mode enabled.");
    apply(next);
    if (window.ClassSixUI) window.ClassSixUI.toast(next ? "Dark mode enabled" : "Light mode enabled", "success");
  }

  window.ClassSixTheme = { apply, toggle };
})();
