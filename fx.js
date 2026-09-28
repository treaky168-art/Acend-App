// Interaction layer on top of the app: tab scroll memory, tap-to-top, edge-swipe back,
// a press ripple, and sparks with a floating "+XP" when a task is completed.
(function () {
  // Each tab remembers its scroll position; tapping the active tab returns to the top.
  var pos = {};
  function activeTab() { var b = document.querySelector(".ac-nav button .ac-navdot"); b = b && b.closest("button"); return b ? b.textContent.trim() : ""; }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".ac-nav button");
    if (!b) return;
    var cur = activeTab(), next = b.textContent.trim();
    if (cur === next) { scrollTo({ top: 0, behavior: "smooth" }); return; }
    pos[cur] = scrollY;
    requestAnimationFrame(function () { requestAnimationFrame(function () { scrollTo(0, pos[next] || 0); }); });
  }, true);

  // Swipe right from the left edge on an Everyday sub-page to go back.
  var sx = 0, sy = 0, dx = 0, tracking = false, page = null;
  document.addEventListener("touchstart", function (e) {
    var back = document.querySelector(".ac-tab .ac-back");
    if (!back || e.touches.length > 1 || e.touches[0].clientX > 28 || document.querySelector(".ac-sheet")) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; tracking = true; page = document.querySelector(".ac-tab");
  }, { passive: true });
  document.addEventListener("touchmove", function (e) {
    if (!tracking || !page) return;
    dx = e.touches[0].clientX - sx;
    var dy = Math.abs(e.touches[0].clientY - sy);
    if (dy > 40 && dx < 30) { tracking = false; page.style.transform = ""; page.classList.remove("ac-swiping"); return; }
    if (dx > 0) { page.classList.add("ac-swiping"); page.style.transform = "translateX(" + Math.min(dx, innerWidth) * .6 + "px)"; page.style.opacity = String(1 - Math.min(dx, 300) / 600); }
  }, { passive: true });
  document.addEventListener("touchend", function () {
    if (!tracking || !page) return;
    tracking = false;
    var p = page; p.classList.remove("ac-swiping"); p.classList.add("ac-swipe-back");
    if (dx > 90) {
      var back = document.querySelector(".ac-tab .ac-back");
      p.style.transform = "translateX(40%)"; p.style.opacity = "0";
      setTimeout(function () { p.style.transform = ""; p.style.opacity = ""; p.classList.remove("ac-swipe-back"); back && back.click(); }, 180);
    } else {
      p.style.transform = ""; p.style.opacity = "";
      setTimeout(function () { p.classList.remove("ac-swipe-back"); }, 240);
    }
  }, { passive: true });

  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  function accent() {
    var root = document.querySelector(".ac-root");
    var cs = root ? getComputedStyle(root) : null;
    return [cs && cs.getPropertyValue("--acc").trim() || "#4CC2FF", cs && cs.getPropertyValue("--acc2").trim() || "#8A6BFF"];
  }

  // Ripple from the point of contact. Artwork tiles let their glow spill outside their edges,
  // so their ripple goes in a clipping layer of its own.
  document.addEventListener("pointerdown", function (e) {
    var el = e.target.closest && e.target.closest(".ac-btn, .ac-art, .ac-card, .ac-row");
    if (!el || el.closest(".ac-nav")) return;
    var art = el.classList.contains("ac-art");
    if (!art && getComputedStyle(el).overflow !== "hidden") return;
    var r = el.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 2.2;
    var dot = document.createElement("span"), host = el;
    dot.className = "ac-ripple";
    dot.style.width = dot.style.height = size + "px";
    dot.style.left = e.clientX - r.left + "px";
    dot.style.top = e.clientY - r.top + "px";
    if (art) { host = document.createElement("span"); host.className = "ac-ripple-clip"; el.appendChild(host); }
    host.appendChild(dot);
    setTimeout(function () { (art ? host : dot).remove(); }, 650);
  }, { passive: true });

  function burst(x, y, colors, n, spread) {
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      var a = Math.random() * Math.PI * 2, d = spread * (.45 + Math.random() * .75);
      s.className = "ac-spark";
      s.style.left = x + "px"; s.style.top = y + "px";
      s.style.background = colors[i % colors.length];
      s.style.boxShadow = "0 0 8px " + colors[i % colors.length];
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", Math.sin(a) * d - 10 + "px");
      s.style.animationDelay = Math.random() * 60 + "ms";
      document.body.appendChild(s);
      (function (node) { setTimeout(function () { node.remove(); }, 900); })(s);
    }
  }

  function float(x, y, text, color) {
    var f = document.createElement("div");
    f.className = "ac-float";
    f.textContent = text;
    f.style.left = x + "px"; f.style.top = y - 12 + "px"; f.style.color = color;
    document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 1250);
  }

  // Celebrate completions. Runs in the capture phase, before the card re-renders.
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button");
    if (!b) return;
    var label = (b.textContent || "").trim();
    var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var c = accent();
    if (label === "Complete") {
      var card = b.closest(".ac-card");
      var m = card && /Worth (\d+) XP/.exec(card.textContent || "");
      burst(x, y, [c[0], c[1], "#ffffff", "#FFD98A"], 18, 70);
      if (m) float(x, y, "+" + m[1] + " XP", "#FFD98A");
    } else if (/^\+\d+ mL$/.test(label)) {
      burst(x, y, ["#60A5FA", "#67E8F9", "#ffffff"], 10, 44);
    } else if (label === "Save entry") {
      burst(x, y, [c[0], c[1], "#ffffff"], 14, 60);
    }
  }, true);

  // Pages slide in from the direction you're heading: along the nav bar left or right,
  // deeper into Everyday from the right, and back out from the left.
  var html = document.documentElement;
  function navIndex(b) { return Array.prototype.indexOf.call(b.parentNode.querySelectorAll("button"), b); }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target;
    if (!t) return;
    var nb = t.closest(".ac-nav button");
    if (nb) {
      var cur = document.querySelector(".ac-nav button .ac-navdot");
      cur = cur && cur.closest("button");
      if (cur && cur !== nb) html.setAttribute("data-acdir", navIndex(nb) > navIndex(cur) ? "r" : "l");
      return;
    }
    if (t.closest(".ac-back")) { html.setAttribute("data-acdir", "l"); return; }
    if (t.closest(".ac-tab .ac-art, .ac-tab .ac-mini")) html.setAttribute("data-acdir", "in");
  }, true);

  // A number that changes gives a small bump, so ticks, XP and totals feel alive.
  var root = document.getElementById("root");
  var skip = ".ac-tf, .ac-tp, .ac-toast, input, textarea, select, .ac-float";
  // Changes are collected and handled once per frame: all reads first, then the class changes a
  // frame later, so nothing forces an extra layout in the middle of React's update.
  if (root && window.MutationObserver) {
    var bumps = [], bumpQueued = false;
    var flushBumps = function () {
      bumpQueued = false;
      var plan = [];
      for (var i = 0; i < bumps.length; i++) {
        var el = bumps[i];
        if (!el.isConnected || plan.some(function (p) { return p[0] === el; })) continue;
        plan.push([el, getComputedStyle(el).display === "inline" || el.offsetWidth > 170 ? "ac-bump-g" : "ac-bump"]);
        el.classList.remove("ac-bump", "ac-bump-g");
      }
      bumps = [];
      requestAnimationFrame(function () {
        plan.forEach(function (p) {
          p[0].classList.add(p[1]);
          setTimeout(function () { p[0].classList.remove(p[1]); }, 750);
        });
      });
    };
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i], el = m.target.parentElement, v = m.target.nodeValue || "";
        if (!el || m.oldValue === v || !/\d/.test(v) || v.length > 14 || el.closest(skip)) continue;
        bumps.push(el);
      }
      if (bumps.length && !bumpQueued) { bumpQueued = true; requestAnimationFrame(flushBumps); }
    }).observe(root, { characterData: true, characterDataOldValue: true, subtree: true });
  }

  // Cards below the fold rise in as they scroll into view. Cards already on screen when they
  // appear are left alone (they have their own entrance).
  if (root && window.IntersectionObserver) {
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        var el = en.target;
        if (!seen.has(el)) {
          seen.add(el);
          if (en.isIntersecting || en.boundingClientRect.top < innerHeight) { io.unobserve(el); return; }
          el.classList.add("ac-rv");
          return;
        }
        if (en.isIntersecting) {
          io.unobserve(el);
          el.classList.add("ac-rv-in");
          setTimeout(function () { el.classList.remove("ac-rv", "ac-rv-in"); }, 700);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    // Only newly added nodes are searched, once per frame.
    var SEL = ".ac-panel, .ac-art", added = [], queued = false;
    var consider = function (el) {
      if (el.__acRv || !el.closest(".ac-tab") || el.closest(".ac-sheet")) return;
      el.__acRv = 1; io.observe(el);
    };
    var scan = function () {
      queued = false;
      var nodes = added; added = [];
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!n.isConnected) continue;
        if (n.matches(SEL)) consider(n);
        var inner = n.querySelectorAll(SEL);
        for (var j = 0; j < inner.length; j++) consider(inner[j]);
      }
    };
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var a = list[i].addedNodes;
        for (var j = 0; j < a.length; j++) if (a[j].nodeType === 1) added.push(a[j]);
      }
      if (added.length && !queued) { queued = true; requestAnimationFrame(scan); }
    }).observe(root, { childList: true, subtree: true });
    added.push(root); scan();
  }
})();
