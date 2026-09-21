// Shared theme controller — included on index.html and assets/projects/project.html.
// Runs synchronously (not deferred) so data-theme is set before first paint.
(function () {
  var root = document.documentElement;
  var STORAGE_KEY = "theme"; // values: "dark" | "light" | "system"
  var MODES = ["system", "light", "dark"];
  var ICONS = {
    system: "fa-solid fa-circle-half-stroke",
    light: "fa-regular fa-sun",
    dark: "fa-regular fa-moon",
  };
  var LABELS = {
    system: "System",
    light: "Light",
    dark: "Dark",
  };
  var media =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

  function getMode() {
    var stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" || stored === "system"
      ? stored
      : "system";
  }

  function effectiveTheme(mode) {
    if (mode === "system") return media && media.matches ? "dark" : "light";
    return mode;
  }

  var currentMode = getMode();

  function apply() {
    root.setAttribute("data-theme", effectiveTheme(currentMode));
  }

  // Apply immediately, before the rest of the DOM paints.
  apply();

  if (media) {
    media.addEventListener("change", function () {
      if (currentMode === "system") apply();
    });
  }

  function updateControlUI() {
    var groups = document.querySelectorAll("#theme-toggle");
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      var btn = group;
      var icon = group.querySelector(".theme-icon i");
      var label = group.querySelector(".theme-label");
      if (icon) icon.className = ICONS[currentMode];
      if (label) label.textContent = LABELS[currentMode];
      if (btn) btn.setAttribute("title", LABELS[currentMode]);
      if (btn) btn.setAttribute("aria-label", "Theme: " + LABELS[currentMode]);
    }
  }

  function setMode(mode) {
    currentMode = mode;
    localStorage.setItem(STORAGE_KEY, mode);
    apply();
    updateControlUI();
  }

  function nextMode() {
    var index = MODES.indexOf(currentMode);
    setMode(MODES[(index + 1) % MODES.length]);
  }

  function initControl() {
    var groups = document.querySelectorAll("#theme-toggle");
    for (var i = 0; i < groups.length; i++) {
      groups[i].addEventListener("click", nextMode);
      groups[i].addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nextMode();
        }
      });
    }
    updateControlUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initControl);
  } else {
    initControl();
  }
})();
