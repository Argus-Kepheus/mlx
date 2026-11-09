// Palette switch. Without JavaScript the page follows the system preference.
(function () {
  var KEY = "mlx-palette";
  var root = document.documentElement;
  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode: keep for this page only */ }
  }
  var saved = stored();
  if (saved === "light" || saved === "dark") root.setAttribute("data-palette", saved);

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector("[data-palette-toggle]");
    if (!button) return;
    button.hidden = false;
    function current() {
      var set = root.getAttribute("data-palette");
      if (set) return set;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    function show() { button.setAttribute("aria-pressed", current() === "dark" ? "true" : "false"); }
    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-palette", next);
      store(next);
      show();
    });
    show();
  });
})();

// Reference filters. Without JavaScript the full list stays visible and the form stays hidden.
(function () {
  function norm(text) {
    text = (text || "").toLowerCase();
    return text.normalize ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : text;
  }
  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector("[data-ref-filters]");
    var list = document.querySelector("[data-ref-list]");
    if (!form || !list) return;
    form.hidden = false;
    var items = Array.prototype.slice.call(list.children);
    var texts = items.map(function (li) { return norm(li.getAttribute("data-text")); });
    var count = form.querySelector("[data-ref-count]");
    function field(name) { return form.elements[name] ? form.elements[name].value : ""; }
    function apply() {
      var words = norm(field("q")).split(/\s+/).filter(Boolean);
      var front = field("front"), domain = field("domain"), type = field("type");
      var access = field("access"), language = field("language");
      var from = parseInt(field("from"), 10), to = parseInt(field("to"), 10);
      var shown = 0;
      items.forEach(function (li, i) {
        var year = parseInt(li.getAttribute("data-year"), 10);
        var ok = (!front || li.getAttribute("data-fronts").split(" ").indexOf(front) >= 0)
          && (!domain || li.getAttribute("data-domains").split(" ").indexOf(domain) >= 0)
          && (!type || li.getAttribute("data-type") === type)
          && (!access || li.getAttribute("data-access") === access)
          && (!language || li.getAttribute("data-language") === language)
          && (isNaN(from) || year >= from) && (isNaN(to) || year <= to)
          && words.every(function (w) { return texts[i].indexOf(w) >= 0; });
        li.hidden = !ok;
        if (ok) shown += 1;
      });
      count.textContent = count.getAttribute("data-template")
        .replace("{shown}", String(shown)).replace("{total}", String(items.length));
    }
    form.addEventListener("input", apply);
    form.addEventListener("change", apply);
    form.addEventListener("submit", function (event) { event.preventDefault(); });
    apply();
  });
})();
