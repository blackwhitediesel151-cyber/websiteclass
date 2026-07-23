(function () {
  "use strict";

  const Utils = window.ClassSixUtils;

  function includes(item, query, fields) {
    const normalized = Utils.normalize(query);
    if (!normalized) return true;
    return fields.some((field) => Utils.normalize(item[field]).includes(normalized));
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
  }

  window.ClassSixSearch = { includes, unique };
})();
