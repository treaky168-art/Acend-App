// Full-screen level-up celebration. The app calls window.__acLevel on every render;
// this only fires when the level goes up after the first render of a session.
(function () {
  var prev = null, prevRank = null, open = null;
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rgba(c, a) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c || "").trim());
    if (!m) return "rgba(120,180,255," + a + ")";
    var h = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1];
    var n = parseInt(h, 16);
    return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")";
  }

  var css = [
    "@keyframes lvFlash{0%{opacity:.9}100%{opacity:0}}",
    "@keyframes lvIn{from{opacity:0}to{opacity:1}}",
    "@keyframes lvOut{to{opacity:0;transform:scale(1.04)}}",
    "@keyframes lvSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}",
    "@keyframes lvRing{0%{transform:translate(-50%,-50%) scale(.2);opacity:.95}100%{transform:translate(-50%,-50%) scale(3.2);opacity:0}}",
    "@keyframes lvSlam{0%{transform:scale(2.6);opacity:0;filter:blur(8px)}55%{transform:scale(.94);opacity:1;filter:blur(0)}75%{transform:scale(1.05)}100%{transform:scale(1)}}",
    "@keyframes lvNum{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}",
    "@keyframes lvUp{from{transform:translateY(18px);opacity:0}to{transform:none;opacity:1}}",
    "@keyframes lvPulse{0%,100%{text-shadow:0 0 28px var(--g1),0 0 70px var(--g2)}50%{text-shadow:0 0 44px var(--g1),0 0 110px var(--g2)}}",
    "@keyframes lvShake{0%,100%{transform:none}20%{transform:translate(-6px,3px)}40%{transform:translate(5px,-4px)}60%{transform:translate(-4px,2px)}80%{transform:translate(3px,-1px)}}",
    "@keyframes lvSheen{from{background-position:200% 0}to{background-position:-200% 0}}",
    ".lv-wrap{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;flex-direction:column;overflow:hidden;cursor:pointer;-webkit-user-select:none;user-select:none;font-family:system-ui,-apple-system,'SF Pro Display',sans-serif;animation:lvIn .25s ease both;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}",
    ".lv-wrap.lv-bye{animation:lvOut .4s ease forwards}",
    ".lv-rays{position:absolute;left:50%;top:44%;width:190vmax;height:190vmax;transform:translate(-50%,-50%);animation:lvSpin 14s linear infinite;opacity:.55;pointer-events:none}",
    ".lv-ring{position:absolute;left:50%;top:44%;width:44vmin;height:44vmin;border-radius:50%;transform:translate(-50%,-50%) scale(.2);animation:lvRing 1.3s cubic-bezier(.1,.7,.2,1) both;pointer-events:none}",
    ".lv-flash{position:absolute;inset:0;background:#fff;animation:lvFlash .55s ease-out both;pointer-events:none}",
    ".lv-cv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}",
    ".lv-body{position:relative;text-align:center;padding:0 24px;margin-top:-6vh}",
    ".lv-title{font-size:clamp(40px,13vw,64px);font-weight:900;letter-spacing:.06em;line-height:1;background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:lvSlam .7s cubic-bezier(.2,.9,.3,1) .12s both,lvSheen 2.4s linear .8s infinite}",
    ".lv-lbl{margin-top:26px;font-size:13px;font-weight:800;letter-spacing:.32em;color:rgba(255,255,255,.7);animation:lvUp .5s ease .5s both}",
    ".lv-num{font-size:clamp(110px,40vw,170px);font-weight:900;line-height:.95;color:#fff;font-variant-numeric:tabular-nums;animation:lvNum .6s cubic-bezier(.2,.9,.3,1.2) .45s both,lvPulse 2.2s ease-in-out 1.1s infinite}",
    ".lv-rank{display:inline-flex;align-items:center;gap:12px;margin-top:22px;padding:10px 18px 10px 10px;border-radius:18px;animation:lvUp .55s cubic-bezier(.2,.9,.3,1.2) 1.2s both}",
    ".lv-rank b{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;font-size:24px;font-weight:900;color:#fff}",
    ".lv-rank span{text-align:left;font-size:12px;letter-spacing:.2em;font-weight:800;color:#fff}",
    ".lv-rank i{display:block;font-style:normal;letter-spacing:0;font-weight:500;font-size:13px;opacity:.75;margin-top:3px;max-width:230px}",
    ".lv-tap{position:absolute;bottom:calc(34px + env(safe-area-inset-bottom));left:0;right:0;text-align:center;font-size:12px;letter-spacing:.2em;color:rgba(255,255,255,.45);animation:lvUp .5s ease 1.8s both}",
    ".lv-shake{animation:lvShake .45s ease both}",
    ".lv-epi{position:absolute;left:28px;right:28px;bottom:calc(74px + env(safe-area-inset-bottom));text-align:center;animation:lvUp .7s ease 1.6s both}",
    ".lv-epi q{display:block;font:italic 15px/1.5 ui-serif,'New York',Georgia,serif;color:rgba(255,255,255,.82)}",
    ".lv-epi cite{display:block;margin-top:8px;font:600 10.5px system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;font-style:normal;color:rgba(255,255,255,.5)}"
  ].join("\n");

  function ensureCss() {
    if (document.getElementById("lv-css")) return;
    var st = document.createElement("style");
    st.id = "lv-css"; st.textContent = css;
    document.head.appendChild(st);
  }

  function fanfare(big) {
    try {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      var ctx = fanfare.ctx || (fanfare.ctx = new C());
      if (ctx.state === "suspended") ctx.resume();
      var t0 = ctx.currentTime + .05;
      var notes = big ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [523.25, 659.25, 783.99, 1046.5];
      notes.forEach(function (f, i) {
        ["triangle", "sine"].forEach(function (type, j) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = type; o.frequency.value = f * (j ? 2 : 1);
          var t = t0 + i * .11, last = i === notes.length - 1;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(j ? .04 : .13, t + .015);
          g.gain.exponentialRampToValueAtTime(.0008, t + (last ? 1.8 : .5));
          o.connect(g); g.connect(ctx.destination);
          o.start(t); o.stop(t + (last ? 1.9 : .6));
        });
      });
    } catch (e) {}
  }

  function particles(cv, colors) {
    var ctx = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr;
    var cx = W / 2, cy = H * .44, ps = [], start = performance.now();
    function spawn(n, speed) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, v = (speed * .4 + Math.random() * speed) * dpr;
        ps.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2 * dpr, life: 1, decay: .006 + Math.random() * .012,
          r: (1.5 + Math.random() * 3.5) * dpr, c: colors[i % colors.length], spark: Math.random() < .55 });
      }
    }
    spawn(150, 13);
    setTimeout(function () { spawn(90, 9); }, 260);
    (function frame(now) {
      if (!cv.isConnected) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      // Embers keep rising from the bottom while the overlay is up.
      if (now - start < 3600 && Math.random() < .6) {
        ps.push({ x: Math.random() * W, y: H + 10, vx: (Math.random() - .5) * dpr, vy: -(2 + Math.random() * 3.5) * dpr, life: 1,
          decay: .004 + Math.random() * .005, r: (1 + Math.random() * 2.2) * dpr, c: colors[(Math.random() * colors.length) | 0], spark: false });
      }
      for (var i = ps.length - 1; i >= 0; i--) {
        var p = ps[i];
        p.x += p.vx; p.y += p.vy; p.vx *= .975; p.vy = p.vy * .975 + .09 * dpr; p.life -= p.decay;
        if (p.life <= 0) { ps.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.strokeStyle = ctx.fillStyle = p.c;
        if (p.spark) {
          ctx.lineWidth = p.r * .7; ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        }
      }
      requestAnimationFrame(frame);
    })(start);
  }

  function show(from, to, rank, note, rankColor, acc, acc2, rankUp) {
    ensureCss();
    if (open) open.remove();
    var w = document.createElement("div");
    w.className = "lv-wrap";
    w.setAttribute("role", "dialog");
    w.setAttribute("aria-label", "Level up. Level " + to + (rankUp ? ". Rank " + rank : ""));
    w.style.background = "radial-gradient(circle at 50% 44%, " + rgba(acc, .42) + ", " + rgba(acc2, .22) + " 38%, rgba(3,4,9,.93) 72%)";
    w.style.setProperty("--g1", rgba(acc, .9));
    w.style.setProperty("--g2", rgba(acc2, .7));

    var html = "";
    if (!reduced) {
      html += '<div class="lv-rays" style="background:repeating-conic-gradient(from 0deg, ' + rgba(acc, .22) + ' 0deg 6deg, transparent 6deg 18deg);-webkit-mask:radial-gradient(circle, #000 0, transparent 58%);mask:radial-gradient(circle, #000 0, transparent 58%)"></div>';
      html += '<div class="lv-ring" style="border:3px solid ' + rgba(acc, .9) + ';box-shadow:0 0 40px ' + rgba(acc, .8) + '"></div>';
      html += '<div class="lv-ring" style="animation-delay:.18s;border:2px solid ' + rgba(acc2, .8) + '"></div>';
      html += '<div class="lv-ring" style="animation-delay:.36s;border:1px solid rgba(255,255,255,.6)"></div>';
      html += '<canvas class="lv-cv"></canvas><div class="lv-flash"></div>';
    }
    html += '<div class="lv-body">';
    html += '<div class="lv-title" style="background-image:linear-gradient(100deg,#fff 20%,' + acc + ' 40%,#fff 50%,' + acc2 + ' 65%,#fff 80%)">LEVEL UP</div>';
    html += '<div class="lv-lbl">LEVEL</div>';
    html += '<div class="lv-num">' + (reduced ? to : from) + '</div>';
    if (rankUp) {
      html += '<div class="lv-rank" style="background:' + rgba(rankColor, .18) + ';border:1px solid ' + rgba(rankColor, .6) + ';box-shadow:0 0 34px ' + rgba(rankColor, .45) + '">' +
        '<b style="background:' + rgba(rankColor, .55) + '"></b><span>PROMOTED<i></i></span></div>';
    }
    var Q = window.__acEpigraphs || [], q = Q.length ? Q[Math.floor(Math.random() * Q.length)] : null;
    html += '</div>';
    if (q) html += '<div class="lv-epi"><q></q><cite></cite></div>';
    html += '<div class="lv-tap">TAP TO CONTINUE</div>';
    w.innerHTML = html;
    if (q) { w.querySelector(".lv-epi q").textContent = q[0]; w.querySelector(".lv-epi cite").textContent = q[1]; }
    if (rankUp) {
      w.querySelector(".lv-rank b").textContent = rank;
      w.querySelector(".lv-rank i").textContent = note || "";
    }
    document.body.appendChild(w);
    open = w;

    var num = w.querySelector(".lv-num");
    if (!reduced && to > from) {
      var steps = to - from, i = 0;
      setTimeout(function tick() {
        num.textContent = from + (++i);
        if (i < steps) setTimeout(tick, Math.max(90, 420 / steps));
      }, 700);
    }
    if (!reduced) {
      particles(w.querySelector(".lv-cv"), [acc, acc2, "#ffffff", rankUp ? rankColor : acc]);
      var root = document.querySelector(".ac-root");
      if (root) { root.classList.remove("lv-shake"); void root.offsetWidth; root.classList.add("lv-shake"); setTimeout(function () { root.classList.remove("lv-shake"); }, 500); }
    }
    fanfare(rankUp);
    try { navigator.vibrate && navigator.vibrate([30, 40, 30, 40, 90]); } catch (e) {}

    var born = Date.now();
    function close() {
      if (!w.isConnected || w.classList.contains("lv-bye")) return;
      w.classList.add("lv-bye");
      setTimeout(function () { w.remove(); if (open === w) open = null; }, 400);
    }
    w.addEventListener("click", function () { if (Date.now() - born > 700) close(); });
    setTimeout(close, rankUp ? 5200 : 4200);
  }

  window.__acLevel = function (level, rank, note, rankColor, acc, acc2) {
    if (prev === null) { prev = level; prevRank = rank; return 0; }
    if (level > prev) {
      var from = prev, rankUp = rank !== prevRank;
      // Let the tap that earned the XP finish rendering first.
      setTimeout(function () { show(from, level, rank, note, rankColor, acc, acc2, rankUp); }, 120);
    }
    prev = level; prevRank = rank;
    return 0;
  };
})();
