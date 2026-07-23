(function () {
  "use strict";

  const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const DAY_NAMES = {
    sunday: "Minggu",
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu"
  };

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value ?? "").toLowerCase().trim();
  }

  function uid(prefix) {
    return `${prefix || "id"}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function initials(name) {
    const parts = String(name || "Class Six").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "CS";
    return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  function todayKey(date) {
    return DAY_KEYS[(date || new Date()).getDay()];
  }

  function dayName(key) {
    return DAY_NAMES[key] || key || "";
  }

  function dayIndex(key) {
    const order = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    return order.indexOf(key);
  }

  function sortByDay(a, b) {
    return dayIndex(a.dayKey) - dayIndex(b.dayKey) || String(a.start || "").localeCompare(String(b.start || ""));
  }

  function formatDate(dateValue, options) {
    const date = dateValue ? new Date(dateValue) : new Date();
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("id-ID", options || {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function formatTime(dateValue) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(dateValue || new Date());
  }

  function monthInputValue(date) {
    const selected = date || new Date();
    return `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}`;
  }

  function fromMonthInput(value) {
    const [year, month] = String(value || monthInputValue()).split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  function assetBase() {
    const path = window.location.pathname.replace(/\\/g, "/");
    return path.includes("/visitor/") || path.includes("/admin/") ? "../" : "./";
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type: type || "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  function parseJson(value) {
    try {
      return { ok: true, data: JSON.parse(value) };
    } catch (error) {
      return { ok: false, error };
    }
  }

  function debounce(fn, wait) {
    let timer = null;
    return function debounced() {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  const icons = {
    activity: "<polyline points='22 12 18 12 15 21 9 3 6 12 2 12'/>",
    backup: "<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><polyline points='7 10 12 15 17 10'/><line x1='12' y1='15' x2='12' y2='3'/>",
    bell: "<path d='M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/>",
    book: "<path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/><path d='M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z'/>",
    calendar: "<rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/>",
    calculator: "<rect x='4' y='2' width='16' height='20' rx='2'/><line x1='8' y1='6' x2='16' y2='6'/><line x1='8' y1='10' x2='8' y2='10'/><line x1='12' y1='10' x2='12' y2='10'/><line x1='16' y1='10' x2='16' y2='10'/><line x1='8' y1='14' x2='8' y2='14'/><line x1='12' y1='14' x2='12' y2='14'/><line x1='16' y1='14' x2='16' y2='18'/>",
    chart: "<line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/>",
    check: "<polyline points='20 6 9 17 4 12'/>",
    clock: "<circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>",
    copy: "<rect x='9' y='9' width='13' height='13' rx='2'/><rect x='2' y='2' width='13' height='13' rx='2'/>",
    dashboard: "<rect x='3' y='3' width='7' height='9' rx='1'/><rect x='14' y='3' width='7' height='5' rx='1'/><rect x='14' y='12' width='7' height='9' rx='1'/><rect x='3' y='16' width='7' height='5' rx='1'/>",
    download: "<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><polyline points='7 10 12 15 17 10'/><line x1='12' y1='15' x2='12' y2='3'/>",
    edit: "<path d='M12 20h9'/><path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z'/>",
    eye: "<path d='M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z'/><circle cx='12' cy='12' r='3'/>",
    globe: "<circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20'/>",
    home: "<path d='M3 11 12 3l9 8'/><path d='M5 10v10h14V10'/>",
    info: "<circle cx='12' cy='12' r='10'/><line x1='12' y1='16' x2='12' y2='12'/><line x1='12' y1='8' x2='12.01' y2='8'/>",
    leaf: "<path d='M11 20A7 7 0 0 1 4 13c0-5 8-9 16-9 0 8-4 16-9 16Z'/><path d='M6 18c3-3 7-6 14-14'/>",
    logout: "<path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/><polyline points='16 17 21 12 16 7'/><line x1='21' y1='12' x2='9' y2='12'/>",
    menu: "<line x1='3' y1='6' x2='21' y2='6'/><line x1='3' y1='12' x2='21' y2='12'/><line x1='3' y1='18' x2='21' y2='18'/>",
    message: "<path d='M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z'/>",
    monitor: "<rect x='2' y='3' width='20' height='14' rx='2'/><line x1='8' y1='21' x2='16' y2='21'/><line x1='12' y1='17' x2='12' y2='21'/>",
    moon: "<path d='M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z'/>",
    org: "<circle cx='12' cy='5' r='3'/><circle cx='5' cy='19' r='3'/><circle cx='19' cy='19' r='3'/><path d='M12 8v4M6.5 16.5 12 12l5.5 4.5'/>",
    palette: "<path d='M12 3a9 9 0 0 0 0 18h1.5a1.8 1.8 0 0 0 .7-3.5 1.8 1.8 0 0 1 .7-3.5H16a5 5 0 0 0 0-10h-4z'/><circle cx='7.5' cy='10.5' r='.5'/><circle cx='10' cy='7.5' r='.5'/><circle cx='14' cy='7.5' r='.5'/>",
    pin: "<path d='m15 4 5 5-4 1-4 7-2-2 7-4 1-4-5-5z'/><path d='m9 15-6 6'/>",
    plus: "<line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/>",
    reset: "<path d='M3 12a9 9 0 1 0 3-6.7'/><polyline points='3 3 3 9 9 9'/>",
    search: "<circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/>",
    settings: "<circle cx='12' cy='12' r='3'/><path d='M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.3.6.9 1 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z'/>",
    shield: "<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/>",
    star: "<polygon points='12 2 15 9 22 9 16.5 13.5 18.5 21 12 16.8 5.5 21 7.5 13.5 2 9 9 9 12 2'/>",
    students: "<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>",
    sun: "<circle cx='12' cy='12' r='4'/><path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'/>",
    teachers: "<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/><path d='M2 3h20v6'/>",
    trash: "<polyline points='3 6 5 6 21 6'/><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'/><path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/>",
    upload: "<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/>",
    vote: "<path d='M9 11l3 3L22 4'/><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'/>",
    x: "<line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>"
  };

  function icon(name) {
    return `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24">${icons[name] || icons.info}</svg></span>`;
  }

  window.ClassSixUtils = {
    $,
    $$,
    assetBase,
    clone,
    debounce,
    downloadFile,
    escapeHtml,
    formatDate,
    formatTime,
    fromMonthInput,
    icon,
    initials,
    monthInputValue,
    normalize,
    parseJson,
    readFileAsText,
    sortByDay,
    todayKey,
    dayName,
    uid
  };
})();
