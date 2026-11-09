// Local TeX-to-SVG rendering. Ordinary pages do not load the renderer.
window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    packages: ["base", "ams", "newcommand", "noundefined", "configmacros"],
    processEscapes: true,
    tags: "ams"
  },
  svg: { fontCache: "local" },
  options: {
    enableMenu: false,
    enableAssistiveMml: true,
    ignoreHtmlClass: "tex2jax_ignore",
    processHtmlClass: "math-inline|math-display",
    skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"]
  }
};
