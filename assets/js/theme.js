// Shared theme controller — included on index.html and assets/projects/project.html.
// Runs synchronously (not deferred) so data-theme is set before first paint.
(function () {
  var root = document.documentElement;
  var STORAGE_KEY = "theme"; // values: "dark" | "light" | "system"
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
    var buttons = document.querySelectorAll("[data-theme-option]");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var isActive = btn.getAttribute("data-theme-option") === currentMode;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    }
  }

  function setMode(mode) {
    currentMode = mode;
    localStorage.setItem(STORAGE_KEY, mode);
    apply();
    updateControlUI();
  }

  function initControl() {
    var group = document.getElementById("theme-toggle");
    if (!group) return;
    group.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-theme-option]");
      if (!btn) return;
      setMode(btn.getAttribute("data-theme-option"));
    });
    updateControlUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initControl);
  } else {
    initControl();
  }
})();
