(function () {
  "use strict";

  var REPO = "An0nym0us-glitch/Smart-board";

  // Sticky nav border once the page scrolls
  var nav = document.querySelector(".nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // Screenshot tour tabs
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs [role=tab]"));
  var img = document.getElementById("shot-img");
  var cap = document.getElementById("shot-cap");
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    img.classList.add("swap");
    setTimeout(function () {
      img.src = tab.dataset.src;
      img.alt = "ClassBoard screenshot: " + tab.textContent.trim();
      cap.textContent = tab.dataset.cap;
      img.classList.remove("swap");
    }, 180);
  }
  tabs.forEach(function (tab, i) {
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.addEventListener("click", function () { select(tab); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); next.focus(); select(next); }
    });
  });
  // Preload screenshots so switching tabs is instant
  tabs.forEach(function (t) { new Image().src = t.dataset.src; });

  // Copy build commands
  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = document.getElementById(btn.dataset.copy).innerText;
      var done = function () {
        btn.textContent = "Copied!";
        setTimeout(function () { btn.textContent = "Copy"; }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  // Reveal sections on scroll
  var revealables = document.querySelectorAll(".card, .section-head, .two-col > div, .dl-card, details, .shot-frame");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealables.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  // Point download buttons straight at the latest installer when the GitHub API answers.
  // Falls back to the releases page (already in the markup) on any failure.
  fetch("https://api.github.com/repos/" + REPO + "/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (release) {
      var version = release.tag_name || "";
      document.querySelectorAll("[data-version]").forEach(function (el) { el.textContent = version; });
      var exe = (release.assets || []).filter(function (a) { return /setup.*\.exe$/i.test(a.name); })[0];
      if (!exe) return;
      document.querySelectorAll("[data-dl]").forEach(function (a) { a.href = exe.browser_download_url; });
      document.querySelectorAll("[data-dl-label]").forEach(function (el) { el.textContent = "Download " + exe.name; });
    })
    .catch(function () {});
})();
