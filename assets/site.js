// Keep anchor targets clear of the persistent header as its navigation wraps.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function measure() {
      document.documentElement.style.setProperty("--header-height", Math.ceil(header.getBoundingClientRect().height) + "px");
    }
    measure();
    if (window.ResizeObserver) new ResizeObserver(measure).observe(header);
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", measure);
    if (document.fonts) document.fonts.ready.then(measure);
  });
})();

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
    var preference = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    button.hidden = false;
    function current() {
      var set = root.getAttribute("data-palette");
      if (set) return set;
      return preference && preference.matches ? "dark" : "light";
    }
    function show() { button.setAttribute("aria-pressed", current() === "dark" ? "true" : "false"); }
    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-palette", next);
      store(next);
      show();
    });
    if (preference && preference.addEventListener) preference.addEventListener("change", show);
    show();
  });
})();

// Native language disclosure also works without JavaScript.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var menu = document.querySelector(".language-menu");
    if (!menu) return;
    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target)) menu.open = false;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.open) {
        menu.open = false;
        menu.querySelector("summary").focus();
      }
    });
    document.addEventListener("focusin", function (event) {
      if (!menu.contains(event.target)) menu.open = false;
    });
  });
})();

// Reading size changes only the reading area, leaving the controls usable.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var main = document.querySelector("main");
    var control = document.querySelector("[data-reading-control]");
    var slider = document.querySelector("#reading-size");
    var output = document.querySelector("[data-reading-value]");
    var top = document.querySelector(".control-top");
    if (!main || !control || !slider || !output || !top) return;
    var key = "mlx-reading-size";
    function updateTop() {
      if (document.activeElement !== top) top.hidden = window.scrollY < 200;
    }
    function apply(value) {
      var size = Number(value);
      if (!Number.isFinite(size) || size < 100 || size > 200) size = 100;
      size = Math.round(size / 5) * 5;
      main.style.setProperty("--reading-scale", String(size / 100));
      slider.value = String(size);
      slider.setAttribute("aria-valuetext", size + "%");
      output.value = size + "%";
      updateTop();
      return size;
    }
    var initial = 100;
    try { initial = localStorage.getItem(key); } catch (e) { /* Optional preference. */ }
    apply(initial);
    control.hidden = false;
    slider.addEventListener("input", function () {
      var size = apply(slider.value);
      try { localStorage.setItem(key, String(size)); } catch (e) { /* Still adjustable. */ }
    });
    top.addEventListener("click", function (event) {
      event.preventDefault();
      main.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
      updateTop();
    });
    window.addEventListener("scroll", updateTop, { passive: true });
    window.addEventListener("resize", updateTop);
    window.addEventListener("pageshow", updateTop);
    updateTop();
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
