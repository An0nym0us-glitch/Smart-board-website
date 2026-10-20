(function () {
  "use strict";

  var REPO = "An0nym0us-glitch/Smart-board";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  // Sticky nav border and scroll progress bar
  var nav = document.querySelector(".nav");
  var progress = document.querySelector(".progress");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 8);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty("--p", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  }
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

  // Tilt an element towards the pointer while it moves over `area`
  function tilt(el, area, maxDeg, restX, restY) {
    if (reduceMotion || !finePointer) return;
    area.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", (x * maxDeg).toFixed(2) + "deg");
      el.style.setProperty("--rx", (-y * maxDeg).toFixed(2) + "deg");
    });
    area.addEventListener("pointerleave", function () {
      el.style.setProperty("--ry", restY);
      el.style.setProperty("--rx", restX);
    });
  }

  // ---------- Hero: chalk dust ----------
  var hero = document.querySelector(".hero");
  var dust = document.querySelector(".dust");
  if (!reduceMotion && dust.getContext) {
    var dctx = dust.getContext("2d");
    var motes = [];
    var heroVisible = true;
    var resizeDust = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      dust.width = hero.offsetWidth * dpr;
      dust.height = hero.offsetHeight * dpr;
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeDust();
    // the hero changes height as web fonts load, so follow its size rather than the window's
    if ("ResizeObserver" in window) new ResizeObserver(resizeDust).observe(hero);
    else window.addEventListener("resize", resizeDust);
    var count = Math.min(70, Math.round(hero.offsetWidth / 18));
    for (var i = 0; i < count; i++) {
      motes.push({
        x: Math.random() * hero.offsetWidth,
        y: Math.random() * hero.offsetHeight,
        r: Math.random() * 1.8 + 0.4,
        vy: -(Math.random() * 0.25 + 0.05),
        vx: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.4 + 0.1,
        tw: Math.random() * Math.PI * 2
      });
    }
    new IntersectionObserver(function (entries) { heroVisible = entries[0].isIntersecting; }).observe(hero);
    (function frame() {
      if (heroVisible) {
        var w = hero.offsetWidth, h = hero.offsetHeight;
        dctx.clearRect(0, 0, dust.width, dust.height);
        motes.forEach(function (m) {
          m.x += m.vx; m.y += m.vy; m.tw += 0.02;
          if (m.y < -5) { m.y = h + 5; m.x = Math.random() * w; }
          if (m.x < -5) m.x = w + 5; else if (m.x > w + 5) m.x = -5;
          dctx.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(m.tw));
          dctx.fillStyle = "#e9eeeb";
          dctx.beginPath();
          dctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          dctx.fill();
        });
      }
      requestAnimationFrame(frame);
    })();
  }

  // ---------- Hero: board you can draw on ----------
  var board = document.querySelector(".board");
  var ink = document.querySelector(".ink");
  var hint = document.querySelector(".pen-hint");
  tilt(board, document.querySelector(".hero-board"), 10, "3deg", "-6deg");

  if (ink.getContext) {
    var ictx = ink.getContext("2d");
    var strokes = [];
    var current = null;
    var colours = ["#5fd3a5", "#f5f5f0", "#ffb454", "#4fb3ff", "#ffe066"];
    var colourIndex = 0;
    var HOLD = 3000, FADE = 1200; // like the Magic Highlighter: stays, then fades away

    var sizeInk = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      ink.width = ink.offsetWidth * dpr;
      ink.height = ink.offsetHeight * dpr;
      ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ictx.lineCap = "round";
      ictx.lineJoin = "round";
    };
    sizeInk();
    if ("ResizeObserver" in window) new ResizeObserver(sizeInk).observe(ink);
    else window.addEventListener("resize", sizeInk);

    var point = function (e) {
      var r = ink.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    var active = {};
    ink.addEventListener("pointerdown", function (e) {
      ink.setPointerCapture(e.pointerId);
      // every finger gets its own line, just like the app
      var s = { pts: [point(e)], colour: colours[colourIndex++ % colours.length], done: 0 };
      active[e.pointerId] = s;
      strokes.push(s);
      current = s;
      hint.classList.add("gone");
      board.style.setProperty("--ry", "0deg");
      board.style.setProperty("--rx", "0deg");
      loop();
    });
    ink.addEventListener("pointermove", function (e) {
      var s = active[e.pointerId];
      if (!s) return;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      evs.forEach(function (ev) { s.pts.push(point(ev)); });
    });
    var end = function (e) {
      var s = active[e.pointerId];
      if (!s) return;
      s.done = performance.now();
      delete active[e.pointerId];
    };
    ink.addEventListener("pointerup", end);
    ink.addEventListener("pointercancel", end);

    var running = false;
    var loop = function () {
      if (running) return;
      running = true;
      requestAnimationFrame(paint);
    };
    var paint = function (now) {
      ictx.clearRect(0, 0, ink.offsetWidth, ink.offsetHeight);
      strokes = strokes.filter(function (s) { return !s.done || now - s.done < HOLD + FADE; });
      strokes.forEach(function (s) {
        var age = s.done ? now - s.done : 0;
        var alpha = age > HOLD ? 1 - (age - HOLD) / FADE : 1;
        ictx.globalAlpha = Math.max(0, alpha);
        ictx.strokeStyle = s.colour;
        ictx.shadowColor = s.colour;
        ictx.shadowBlur = 8;
        ictx.lineWidth = 4;
        ictx.beginPath();
        var p = s.pts;
        ictx.moveTo(p[0].x, p[0].y);
        if (p.length === 1) ictx.lineTo(p[0].x + 0.1, p[0].y);
        for (var i = 1; i < p.length - 1; i++) {
          ictx.quadraticCurveTo(p[i].x, p[i].y, (p[i].x + p[i + 1].x) / 2, (p[i].y + p[i + 1].y) / 2);
        }
        if (p.length > 1) ictx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
        ictx.stroke();
      });
      if (strokes.length) requestAnimationFrame(paint);
      else running = false;
    };
  }

  // Replay the board's drawing animation now and then
  if (!reduceMotion) {
    setInterval(function () {
      if (document.hidden || board.getBoundingClientRect().bottom < 0) return;
      board.querySelectorAll(".board-svg, .board-label").forEach(function (el) {
        el.replaceWith(el.cloneNode(true));
      });
    }, 16000);
  }

  // ---------- Count-up stats ----------
  var counters = document.querySelectorAll("[data-count]");
  var countUp = function (el) {
    var target = +el.dataset.count;
    var from = target === 0 ? 100 : 0; // "0 internet required" counts down
    var suffix = el.dataset.suffix || "";
    var t0 = performance.now(), dur = 1400;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (target - from) * eased) + suffix;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  };

  // ---------- Reveal on scroll (staggered) ----------
  var groups = [".card", ".section-head", ".two-col > div", ".dl-card", "details", ".steps li"];
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("in");
        io.unobserve(el);
        // drop the reveal styles afterwards so hover transitions behave normally
        setTimeout(function () { el.classList.remove("reveal", "in"); el.style.removeProperty("--d"); }, 1400);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    groups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        el.classList.add("reveal");
        el.style.setProperty("--d", ((i % 4) * 0.08).toFixed(2) + "s");
        io.observe(el);
      });
    });

    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // ---------- Card spotlight ----------
  if (finePointer) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  // ---------- Screenshot tour ----------
  var tour = document.querySelector(".tour");
  var frameEl = document.querySelector(".shot-frame");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs [role=tab]"));
  var img = document.getElementById("shot-img");
  var cap = document.getElementById("shot-cap");
  var AUTO_MS = 6000;
  var autoTimer = null;
  var current_ = 0;
  tour.style.setProperty("--dur", AUTO_MS / 1000 + "s");

  function select(i) {
    current_ = i;
    var tab = tabs[i];
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
    }, 200);
  }
  function startAuto() {
    if (reduceMotion || autoTimer) return;
    tour.classList.add("playing");
    autoTimer = setInterval(function () { select((current_ + 1) % tabs.length); }, AUTO_MS);
  }
  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
    tour.classList.remove("playing");
  }
  tabs.forEach(function (tab, i) {
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.addEventListener("click", function () { stopAuto(); select(i); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
      if (next !== null) { e.preventDefault(); stopAuto(); tabs[next].focus(); select(next); }
    });
  });
  tour.addEventListener("pointerenter", function () { if (finePointer) stopAuto(); });
  if ("IntersectionObserver" in window) {
    var userTouched = false;
    tabs.forEach(function (t) { t.addEventListener("click", function () { userTouched = true; }); });
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !userTouched) startAuto();
      else stopAuto();
    }, { threshold: 0.4 }).observe(tour);
  }
  tilt(frameEl, frameEl, 6, "0deg", "0deg");
  // Preload screenshots so switching tabs is instant
  tabs.forEach(function (t) { new Image().src = t.dataset.src; });

  // ---------- Copy build commands ----------
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

  // ---------- Latest release ----------
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
