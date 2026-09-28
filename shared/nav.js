(function () {
  var script = document.currentScript;
  var home = script.getAttribute("data-home") || "index.html";
  var title = script.getAttribute("data-title") || "Just Tools";
  var isHome = script.getAttribute("data-page") === "home";
  var container = document.getElementById("site-header");
  if (!container) return;

  var backLink = isHome
    ? ""
    : '<a class="back-link" href="' + home + '">← Back to ' + title + "</a>";

  container.innerHTML =
    '<div class="site-header-inner">' +
    '<a class="site-brand" href="' + home + '">' + title + '<span class="cursor" aria-hidden="true">_</span></a>' +
    backLink +
    "</div>";
})();
