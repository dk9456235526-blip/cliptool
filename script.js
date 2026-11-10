/* Page behaviors for Hark's component library: the nav, the theme toggle, tables and images. style-gates: data */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  root.classList.add("js");
  var LOGO = '<svg width="SIZE" height="SIZE" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path fill="currentColor" d="M25.096 30c-.072 0-.12-.048-.168-.12-4.776-6.384-12.216-10.8-20.736-11.688C4.048 18.168 4 18.096 4 18s.048-.168.192-.192c8.52-.888 15.96-5.304 20.736-11.688.048-.072.096-.12.168-.12s.096.024.168.072A15.02 15.02 0 0 1 31.12 18a15.02 15.02 0 0 1-5.856 11.928c-.072.048-.096.072-.168.072"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function each(a, f) { return (a || []).map(f).join(""); }
  function autoNav() {
    var sections = [].slice.call(doc.querySelectorAll("section[data-nav]"));
    var header = doc.querySelector("header.nav[data-auto]");
    if (header) {
      header.innerHTML = '<nav class="seg" aria-label="Sections">' +
        each(sections, function (s) { return '<a href="#' + esc(s.id) + '">' + esc(s.getAttribute("data-nav")) + "</a>"; }) + "</nav>" +
        '<button class="theme-btn" id="theme-btn" type="button" aria-label="Switch to dark theme"></button>';
    }
    [].slice.call(doc.querySelectorAll(".foot nav[data-auto]")).forEach(function (n) {
      n.innerHTML = '<a href="#top">Top</a>' + each(sections, function (s) { return '<a href="#' + esc(s.id) + '">' + esc(s.getAttribute("data-nav")) + "</a>"; });
    });
    [].slice.call(doc.querySelectorAll(".table-wrap table")).forEach(function (t) {
      var names = [].map.call(t.querySelectorAll("thead th"), function (th) { return th.textContent.trim(); });
      [].slice.call(t.querySelectorAll("tbody tr")).forEach(function (tr) {
        [].slice.call(tr.children).forEach(function (c, i) {
          if (c.tagName !== "TD") return;
          if (!c.textContent.trim() && !c.querySelector("img, svg")) c.classList.add("is-empty");
          else if (names[i] && !c.hasAttribute("data-label")) c.setAttribute("data-label", names[i]);
        });
      });
    });
    [].slice.call(doc.querySelectorAll(".compare table")).forEach(function (t) {
      t.parentNode.style.setProperty("--compare-cols", t.querySelectorAll("thead th").length);
      [].slice.call(t.querySelectorAll(".compare__media .chip")).forEach(function (chip) {
        chip.closest("th").appendChild(chip);
      });
      [].slice.call(t.querySelectorAll("tbody tr")).forEach(function (tr) {
        var head = tr.querySelector("th"), label = head ? head.textContent.trim() : "";
        [].slice.call(tr.querySelectorAll("td")).forEach(function (td) {
          if (label && !td.hasAttribute("data-label")) td.setAttribute("data-label", label);
        });
      });
    });
    [].slice.call(doc.querySelectorAll(".step__figure img, .band img")).forEach(function (im) {
      var mark = function () { if (im.naturalHeight > im.naturalWidth) im.parentNode.classList.add("is-portrait"); };
      if (im.complete) mark(); else im.addEventListener("load", mark);
    });
    [].slice.call(doc.querySelectorAll(".hark-mark:empty")).forEach(function (m) { m.innerHTML = LOGO.replace(/SIZE/g, m.getAttribute("data-size") || "20"); });
  }

  // Gives each day of plans a toggle and opens the first day. hark-trip.css shows the toggle, and
  // closes the other days, only on a phone.
  function dayToggles() {
    [].slice.call(doc.querySelectorAll(".timeline > li")).forEach(function (day, i) {
      var what = day.querySelector(".timeline__what");
      if (!what || !what.querySelector(".plan") || what.querySelector(".day__toggle")) return;
      var btn = doc.createElement("button");
      btn.type = "button";
      btn.className = "day__toggle";
      var label = function () {
        var open = day.classList.contains("is-open");
        btn.textContent = open ? "Hide details" : "Show details";
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      };
      if (i === 0) day.classList.add("is-open");
      btn.addEventListener("click", function () { day.classList.toggle("is-open"); label(); });
      label();
      what.appendChild(btn);
    });
  }

  function behaviors() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var btn = doc.getElementById("theme-btn"), mq = window.matchMedia("(prefers-color-scheme: dark)");
    try { var saved = localStorage.getItem("hark-theme"); if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved); } catch (e) { /* storage blocked: follow the system theme */ }
    function current() { var t = root.getAttribute("data-theme"); return t === "light" || t === "dark" ? t : (mq.matches ? "dark" : "light"); }
    function label() { if (btn) btn.setAttribute("aria-label", current() === "dark" ? "Switch to light theme" : "Switch to dark theme"); }
    if (btn) btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("hark-theme", next); } catch (e) { /* storage blocked: the choice lasts this visit */ }
      label();
    });
    label();

    var seg = doc.querySelector(".seg");
    if (seg) {
      var links = [].slice.call(seg.querySelectorAll("a"));
      var targets = links.map(function (a) { return doc.getElementById(a.getAttribute("href").slice(1)); });
      var active = -2;
      var reveal = function (i) {
        if (i < 0) return;
        var a = links[i];
        var l = a.offsetLeft - 8, r = a.offsetLeft + a.offsetWidth + 8;
        if (l < seg.scrollLeft || r > seg.scrollLeft + seg.clientWidth) seg.scrollTo({ left: l, behavior: reduce ? "auto" : "smooth" });
      };
      var sync = function (force) {
        var line = window.innerHeight * 0.32, cur = -1;
        targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) cur = i; });
        if (cur === active && !force) return;
        active = cur;
        links.forEach(function (a, i) { if (i === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
        reveal(cur);
      };
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return; ticking = true;
        window.requestAnimationFrame(function () { sync(false); ticking = false; });
      }, { passive: true });
      window.addEventListener("resize", function () { sync(true); }, { passive: true });
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { sync(true); });
      sync(true);
    }

  }

  function start() {
    autoNav();
    dayToggles();
    behaviors();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start);
  else start();
})();

;
/* Clip Studio */
(function () {
        var $ = function (id) { return document.getElementById(id); };
        var video = $("video"), crop = $("crop"), tl = $("timeline");
        var MODES = { funny: "😂 Funny", hype: "🔥 Hype", emotional: "🥹 Emotional", talky: "💬 Talky", calm: "🌿 Calm", even: "📏 Even split", manual: "✋ Manual" };
        var S = { file: null, name: "", dur: 0, len: 30, count: 5, ar: [9, 16], pos: 0.5, energy: null, clips: [], stopAt: null, playing: null, nextId: 1, mode: "funny" };
        var WIN = 0.5;

        function fmt(t) {
          t = Math.max(0, t);
          var m = Math.floor(t / 60), s = t - m * 60;
          return m + ":" + (s < 10 ? "0" : "") + s.toFixed(1);
        }
        function css(name) { return getComputedStyle(document.body).getPropertyValue(name).trim() || "#888"; }
        function status(msg) { $("status").textContent = msg; }
        function progress(p) { $("bar").style.width = Math.round(p * 100) + "%"; }

        /* ---------- Upload ---------- */
        var drop = $("drop");
        $("file").addEventListener("change", function (e) { if (e.target.files[0]) load(e.target.files[0]); });
        drop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("file").click(); } });
        ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
        ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("is-over"); }); });
        drop.addEventListener("drop", function (e) {
          var f = e.dataTransfer.files[0];
          if (f && /^video\//.test(f.type || "video/")) load(f); else status("That file doesn't look like a video.");
        });

        function load(f) {
          if (video.src) URL.revokeObjectURL(video.src);
          S.file = f; S.name = f.name.replace(/\.[^.]+$/, ""); S.energy = null; S.clips = [];
          video.src = URL.createObjectURL(f);
          $("stage").hidden = false; progress(0);
          status("Loading " + f.name + "…");
        }
        video.addEventListener("loadedmetadata", function () {
          S.dur = video.duration || 0;
          $("meta").innerHTML = "";
          [S.file.name, fmt(S.dur), video.videoWidth + "×" + video.videoHeight].forEach(function (t, i) {
            var s = document.createElement("span"); s.className = i ? "pill" : ""; s.textContent = t; $("meta").appendChild(s);
          });
          $("analyze").disabled = false; $("addClip").disabled = false;
          status("Ready. Choose a mode and press Find clips.");
          renderList(); drawTimeline(); drawCrop();
        });
        video.addEventListener("error", function () { status("This browser can't play that file. Try MP4 (H.264) or WebM."); });

        /* ---------- Settings ---------- */
        function setLen(v) {
          S.len = Math.max(5, Math.min(180, +v)); $("len").value = S.len; $("lenOut").textContent = S.len + "s";
          Array.prototype.forEach.call($("presets").children, function (b) { b.classList.toggle("x-on", +b.dataset.len === S.len); });
        }
        $("presets").addEventListener("click", function (e) { if (e.target.dataset.len) setLen(e.target.dataset.len); });
        $("len").addEventListener("input", function (e) { setLen(e.target.value); });
        $("count").addEventListener("input", function (e) { S.count = +e.target.value; $("countOut").textContent = S.count; });
        $("aspects").addEventListener("click", function (e) {
          var ar = e.target.dataset.ar; if (!ar) return;
          S.ar = ar.split(":").map(Number);
          Array.prototype.forEach.call($("aspects").children, function (b) { b.classList.toggle("x-on", b === e.target); });
          $("cropLabel").textContent = ar + " crop";
          drawCrop();
        });
        $("cropPos").addEventListener("input", function (e) { S.pos = e.target.value / 100; $("cropOut").textContent = e.target.value + "%"; drawCrop(); });

        /* ---------- Crop preview ---------- */
        function cropRect() {
          var vw = video.videoWidth, vh = video.videoHeight, r = S.ar[0] / S.ar[1];
          if (!vw) return null;
          if (vw / vh > r) { var cw = vh * r; return { x: (vw - cw) * S.pos, y: 0, w: cw, h: vh }; }
          var ch = vw / r; return { x: 0, y: (vh - ch) / 2, w: vw, h: ch };
        }
        function drawCrop() {
          var c = crop.getContext("2d"), R = cropRect();
          crop.width = 360; crop.height = Math.round(360 * S.ar[1] / S.ar[0]);
          c.clearRect(0, 0, crop.width, crop.height);
          if (!R) return;
          try { c.drawImage(video, R.x, R.y, R.w, R.h, 0, 0, crop.width, crop.height); } catch (e) {}
          var k = S.clips.find(function (x) { return x.id === S.playing; }) || selClip(), t = video.currentTime;
          if (k && t >= k.start - 0.05 && t <= k.end) drawOverlay(c, crop.width, crop.height, k, t - k.start);
        }

        /* ---------- Captions ---------- */
        var STYLES = [
          { id: "pop", name: "Bold Pop", font: "Arial Black", color: "#ffffff", outline: "#000000", hi: "#ffd400", fx: "word" },
          { id: "karaoke", name: "Karaoke", font: "Arial Black", color: "#ffffff", outline: "#000000", hi: "#22d3ee", fx: "fill" },
          { id: "neon", name: "Neon Glow", font: "Verdana", color: "#e8ffff", outline: "#00e5ff", hi: "#00e5ff", fx: "glow" },
          { id: "boxed", name: "Boxed", font: "Arial", color: "#ffffff", outline: "#000000", hi: "#ffd400", fx: "box" },
          { id: "minimal", name: "Minimal", font: "system-ui", size: 44, color: "#ffffff", outline: "#000000", hi: "#ffffff", fx: "soft" },
          { id: "comic", name: "Comic", font: "Comic Sans MS", color: "#ffe600", outline: "#000000", hi: "#ffffff", fx: "rotate" },
          { id: "type", name: "Typewriter", font: "Courier New", color: "#ffffff", outline: "#000000", hi: "#ffffff", fx: "type" },
          { id: "meme", name: "Meme", font: "Impact", color: "#ffffff", outline: "#000000", hi: "#ffffff", fx: "none", upper: true }
        ];
        var FONTS = ["Impact", "Arial Black", "Arial", "Verdana", "Georgia", "Times New Roman", "Trebuchet MS", "Courier New", "Comic Sans MS", "Brush Script MT", "system-ui"];
        function fam(f) { return f === "system-ui" ? "system-ui, sans-serif" : '"' + f + '", sans-serif'; }
        function tileOf(id) { return STYLES.find(function (s) { return s.id === id; }) || STYLES[0]; }
        function styleFrom(T, old) {
          return { tile: T.id, font: T.font, size: T.size || 64, color: T.color, outline: T.outline, hi: T.hi, upper: !!T.upper,
            pos: old ? old.pos : "bottom", maxWords: old ? old.maxWords : 4 };
        }
        var DEF = { cap: { text: "", title: false, badge: false, style: styleFrom(STYLES[0]) } };
        function capOf(k) { return k.cap || (k.cap = { text: "", title: DEF.cap.title, badge: DEF.cap.badge, style: Object.assign({}, DEF.cap.style) }); }
        function capK() { return selClip() || DEF; }
        function selClip() { return S.clips.find(function (x) { return x.id === S.sel; }); }
        function cues(k) {
          var c = capOf(k), dur = k.end - k.start, lines = c.text.split("\n").map(function (l) { return l.trim(); }).filter(Boolean), n = lines.length, out = [];
          var raw = lines.map(function (l, i) {
            var m = l.match(/^(\d+):(\d{1,2}(?:\.\d+)?)\s+(.*)$/);
            return m ? { s: +m[1] * 60 + +m[2], txt: m[3] } : { s: i * dur / n, txt: l };
          }).sort(function (a, b) { return a.s - b.s; });
          raw.forEach(function (r, i) {
            var e = i + 1 < raw.length ? raw[i + 1].s : dur, w = r.txt.split(/\s+/).filter(Boolean), mw = Math.max(1, +c.style.maxWords || 4);
            var parts = Math.ceil(w.length / mw), d = (e - r.s) / Math.max(1, parts);
            for (var j = 0; j < parts; j++) out.push({ s: r.s + j * d, e: r.s + (j + 1) * d, words: w.slice(j * mw, (j + 1) * mw) });
          });
          return out;
        }
        function rbox(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); ctx.fill(); }
        function drawCue(ctx, w, h, st, words, p) {
          var fx = tileOf(st.tile).fx, size = st.size * w / 1080, weight = fx === "soft" ? "" : "bold ";
          if (st.upper) words = words.map(function (x) { return x.toUpperCase(); });
          ctx.font = weight + size + "px " + fam(st.font);
          var tot = ctx.measureText(words.join(" ")).width;
          if (tot > w * 0.9) { size *= w * 0.9 / tot; ctx.font = weight + size + "px " + fam(st.font); }
          var sp = ctx.measureText(" ").width, ws = words.map(function (x) { return ctx.measureText(x).width; });
          tot = ws.reduce(function (a, b) { return a + b; }, 0) + sp * (words.length - 1);
          var y = { top: 0.2, middle: 0.5, bottom: 0.8 }[st.pos] * h, x = (w - tot) / 2, n = words.length, cur = Math.min(n - 1, Math.floor(p * n));
          ctx.save(); ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
          if (fx === "rotate") { ctx.translate(w / 2, y); ctx.rotate(-0.06); ctx.translate(-w / 2, -y); }
          if (fx === "box") { var pad = size * 0.35; ctx.fillStyle = st.outline; rbox(ctx, x - pad, y - size * 0.75, tot + pad * 2, size * 1.5, size * 0.3); }
          if (fx === "glow") { ctx.shadowColor = st.outline; ctx.shadowBlur = size * 0.6; }
          if (fx === "soft") { ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = size * 0.25; ctx.shadowOffsetY = size * 0.06; }
          var stroke = /word|fill|rotate|type|none/.test(fx), vis = fx === "type" ? Math.ceil(Math.min(1, p * 1.5) * words.join(" ").length) : Infinity;
          words.forEach(function (wd, i) {
            var txt = wd.slice(0, Math.max(0, vis)); vis -= wd.length + 1;
            if (txt) {
              if (stroke) { ctx.lineWidth = size * 0.18; ctx.strokeStyle = st.outline; ctx.strokeText(txt, x, y); }
              ctx.fillStyle = (fx === "word" && i === cur) || (fx === "fill" && i < cur) ? st.hi : st.color;
              ctx.fillText(txt, x, y); if (fx === "glow") ctx.fillText(txt, x, y);
              if (fx === "fill" && i === cur) { ctx.save(); ctx.beginPath(); ctx.rect(x, y - size, ws[i] * (p * n - cur), size * 2); ctx.clip(); ctx.fillStyle = st.hi; ctx.fillText(txt, x, y); ctx.restore(); }
            }
            x += ws[i] + sp;
          });
          ctx.restore();
        }
        function drawOverlay(ctx, w, h, k, t) {
          if (!k) return;
          var c = capOf(k), st = c.style, u = w / 1080;
          ctx.save(); ctx.textBaseline = "middle"; ctx.textAlign = "center";
          if (c.badge) {
            var bt = "Part " + (k.n || 1) + "/" + S.clips.length; ctx.font = "bold " + 34 * u + "px " + fam(st.font);
            var bw = ctx.measureText(bt).width + 36 * u; ctx.fillStyle = "rgba(0,0,0,0.6)"; rbox(ctx, w - bw - 30 * u, 30 * u, bw, 60 * u, 30 * u);
            ctx.fillStyle = "#ffffff"; ctx.fillText(bt, w - bw / 2 - 30 * u, 60 * u);
          }
          if (c.title && k.title && t < 3) {
            var ty = (st.pos === "top" ? 0.38 : 0.2) * h, fs = 72 * u, tt = st.upper ? k.title.toUpperCase() : k.title;
            ctx.globalAlpha = Math.min(1, (3 - t) / 0.4); ctx.font = "bold " + fs + "px " + fam(st.font);
            var tw = Math.min(ctx.measureText(tt).width, w * 0.86); ctx.fillStyle = "rgba(0,0,0,0.7)"; rbox(ctx, (w - tw) / 2 - fs * 0.4, ty - fs * 0.8, tw + fs * 0.8, fs * 1.6, fs * 0.3);
            ctx.fillStyle = "#ffffff"; ctx.fillText(tt, w / 2, ty, w * 0.86); ctx.globalAlpha = 1;
          }
          var cue = cues(k).find(function (q) { return t >= q.s && t < q.e; });
          if (cue && cue.words.length) drawCue(ctx, w, h, st, cue.words, (t - cue.s) / (cue.e - cue.s));
          ctx.restore();
        }
        window.drawOverlay = drawOverlay;

        FONTS.forEach(function (f) { var o = document.createElement("option"); o.value = o.textContent = f; $("capFont").appendChild(o); });
        STYLES.forEach(function (T) {
          var b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.dataset.tile = T.id; b.textContent = T.name; b.style.fontFamily = fam(T.font);
          $("capTiles").appendChild(b);
        });
        function loadCap() {
          var sk = selClip(), k = capK(); $("capFor").textContent = sk ? (sk.title || "Clip " + sk.n) : "Default for new clips";
          $("capText").disabled = !sk;
          var c = capOf(k), st = c.style;
          $("capText").value = c.text; $("capTitle").checked = c.title; $("capBadge").checked = c.badge;
          $("capFont").value = st.font; $("capSize").value = st.size; $("capColor").value = st.color; $("capOutline").value = st.outline; $("capHi").value = st.hi;
          $("capUpper").checked = st.upper; $("capWords").value = st.maxWords;
          Array.prototype.forEach.call($("capTiles").children, function (b) { b.classList.toggle("x-on", b.dataset.tile === st.tile); });
          Array.prototype.forEach.call($("capPos").children, function (b) { b.classList.toggle("x-on", b.dataset.pos === st.pos); });
        }
        function saveCap() {
          var k = capK();
          var c = capOf(k), st = c.style;
          if (k !== DEF) c.text = $("capText").value; c.title = $("capTitle").checked; c.badge = $("capBadge").checked;
          st.font = $("capFont").value; st.size = Math.max(20, Math.min(160, +$("capSize").value || 64));
          st.color = $("capColor").value; st.outline = $("capOutline").value; st.hi = $("capHi").value;
          st.upper = $("capUpper").checked; st.maxWords = Math.max(1, Math.min(12, +$("capWords").value || 4));
          drawCrop();
        }
        $("capBody").addEventListener("input", saveCap);
        $("capBody").addEventListener("change", saveCap);
        $("capTiles").addEventListener("click", function (e) {
          var k = capK(), id = e.target.dataset.tile; if (!id) return;
          capOf(k).style = styleFrom(tileOf(id), capOf(k).style); loadCap(); drawCrop();
        });
        $("capPos").addEventListener("click", function (e) {
          var k = capK(), p = e.target.dataset.pos; if (!p) return;
          capOf(k).style.pos = p; loadCap(); drawCrop();
        });
        $("capAll").addEventListener("click", function () {
          var k = capK(), b = this, n = S.clips.length;
          [DEF].concat(S.clips).forEach(function (x) { if (x !== k) capOf(x).style = Object.assign({}, capOf(k).style); });
          b.textContent = n ? "Applied to " + n + " clip" + (n === 1 ? "" : "s") + " ✓" : "Set as default ✓";
          setTimeout(function () { b.textContent = "Apply style to all clips"; }, 1600);
          status(n ? "Caption style applied to all " + n + " clips." : "Caption style saved as the default for new clips.");
        });
        function selectClip(k) {
          if (S.sel === k.id || S.clips.indexOf(k) < 0) return;
          S.sel = k.id;
          Array.prototype.forEach.call($("list").children, function (c) { c.classList.toggle("is-sel", +c.dataset.id === k.id); });
          loadCap(); drawCrop();
        }
        function loop() {
          drawCrop(); drawTimeline();
          if (!video.paused && !video.ended) requestAnimationFrame(loop);
        }
        video.addEventListener("play", function () { requestAnimationFrame(loop); });
        video.addEventListener("seeked", function () { drawCrop(); drawTimeline(); });
        video.addEventListener("loadeddata", drawCrop);
        video.addEventListener("timeupdate", function () {
          if (S.stopAt != null && video.currentTime >= S.stopAt) { video.pause(); S.stopAt = null; S.playing = null; markPlaying(); }
        });
        video.addEventListener("pause", function () { drawTimeline(); });

        /* ---------- Timeline ---------- */
        function drawTimeline() {
          var dpr = window.devicePixelRatio || 1, W = tl.clientWidth, H = tl.clientHeight;
          if (!W) return;
          tl.width = W * dpr; tl.height = H * dpr;
          var c = tl.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
          var ink = css("--text-primary"), soft = css("--text-secondary"), grid = css("--stroke-secondary");
          var top = 8, bot = H - 22, gh = bot - top;
          c.fillStyle = grid; c.fillRect(0, bot, W, 1);
          if (!S.dur) { c.fillStyle = soft; c.font = "12px Geist, sans-serif"; c.fillText("No video loaded", 12, H / 2); return; }
          S.clips.forEach(function (k) {
            var x0 = k.start / S.dur * W, x1 = k.end / S.dur * W;
            c.globalAlpha = k.id === S.playing ? 0.28 : 0.14; c.fillStyle = ink; c.fillRect(x0, top, Math.max(2, x1 - x0), gh);
            c.globalAlpha = 1; c.fillRect(x0, bot - 3, Math.max(2, x1 - x0), 3);
          });
          if (S.energy) {
            var e = S.energy.rms, n = e.length;
            c.beginPath(); c.moveTo(0, bot);
            for (var i = 0; i < n; i++) c.lineTo(i / n * W, bot - e[i] * gh);
            c.lineTo(W, bot); c.closePath();
            c.globalAlpha = 0.35; c.fillStyle = soft; c.fill(); c.globalAlpha = 1;
          }
          c.fillStyle = soft; c.font = "12px Geist, sans-serif";
          c.fillText("0:00", 2, H - 6);
          var end = fmt(S.dur); c.fillText(end, W - c.measureText(end).width - 2, H - 6);
          S.clips.forEach(function (k, i) { c.fillText(String(k.n || i + 1), k.start / S.dur * W + 3, top + 12); });
          var px = video.currentTime / S.dur * W;
          c.fillStyle = ink; c.fillRect(px - 1, 0, 2, bot + 4);
        }
        tl.addEventListener("click", function (e) {
          if (!S.dur) return; var r = tl.getBoundingClientRect();
          video.currentTime = (e.clientX - r.left) / r.width * S.dur; S.stopAt = null;
        });
        window.addEventListener("resize", drawTimeline);

        /* ---------- Analysis ---------- */
        function wait() { return new Promise(function (r) { setTimeout(r, 0); }); }
        async function analyzeAudio() {
          if (S.energy) return S.energy;
          status("Reading file…"); progress(0.05);
          var buf = await S.file.arrayBuffer(); progress(0.2); status("Decoding audio…");
          var AC = window.AudioContext || window.webkitAudioContext, ctx = new AC();
          var audio;
          try { audio = await ctx.decodeAudioData(buf); } finally { if (ctx.close) ctx.close(); }
          progress(0.45); status("Measuring energy…");
          var sr = audio.sampleRate, step = Math.round(sr * WIN), chs = [];
          for (var c = 0; c < audio.numberOfChannels; c++) chs.push(audio.getChannelData(c));
          var n = Math.ceil(audio.length / step), rms = new Float32Array(n);
          for (var i = 0; i < n; i++) {
            var s0 = i * step, s1 = Math.min(audio.length, s0 + step), sum = 0;
            for (var j = s0; j < s1; j += 2) { var v = 0; for (c = 0; c < chs.length; c++) v += chs[c][j]; v /= chs.length; sum += v * v; }
            rms[i] = Math.sqrt(sum / Math.max(1, (s1 - s0) / 2));
            if (i % 400 === 0) { progress(0.45 + 0.35 * i / n); await wait(); }
          }
          var sorted = Array.from(rms).sort(function (a, b) { return a - b; }), ref = sorted[Math.floor(n * 0.98)] || 1;
          for (i = 0; i < n; i++) rms[i] = Math.min(1, rms[i] / (ref || 1));
          var spike = new Float32Array(n), avg = new Float32Array(n), K = 10;
          var pre = new Float64Array(n + 1); for (i = 0; i < n; i++) pre[i + 1] = pre[i] + rms[i];
          for (i = 0; i < n; i++) {
            var a = Math.max(0, i - K), b = Math.min(n, i + K + 1);
            avg[i] = (pre[b] - pre[a]) / (b - a);
            spike[i] = Math.min(4, rms[i] / (avg[i] + 0.02));
          }
          progress(0.85);
          S.energy = { rms: rms, spike: spike, avg: avg, n: n };
          return S.energy;
        }

        function windowScore(mode, E, i) {
          var r = E.rms[i], sp = Math.max(0, E.spike[i] - 1), prev = i >= 6 ? E.avg[i - 6] : E.avg[0];
          switch (mode) {
            case "funny": return sp * (r > 0.08 ? 1 : 0.3) + (E.spike[i] > 1.8 ? 0.5 : 0);
            case "hype": return r * 0.65 + Math.min(1, sp) * 0.35;
            case "emotional": return Math.max(0, E.avg[i] - prev) * 4 * (1 - Math.abs(r - 0.5) * 1.6) + (1 - Math.abs(r - 0.5) * 2) * 0.2;
            case "talky": return r < 0.08 ? 0 : (1 - Math.abs(r - 0.45) * 2) * (1 - Math.min(1, sp) * 0.5);
            case "calm": return r < 0.02 ? 0.4 : 1 - r;
          }
          return 0;
        }
        function snap(E, t) {
          var i = Math.round(t / WIN), best = i, lo = Math.max(0, i - 3), hi = Math.min(E.n - 1, i + 3);
          for (var k = lo; k <= hi; k++) if (E.rms[k] < E.rms[best]) best = k;
          return best * WIN;
        }
        function pickMoments(mode, E) {
          var L = Math.max(1, Math.round(Math.min(S.len, S.dur) / WIN)), n = E.n, pre = new Float64Array(n + 1);
          for (var i = 0; i < n; i++) pre[i + 1] = pre[i] + windowScore(mode, E, i);
          var cands = [];
          for (i = 0; i + L <= n; i++) cands.push({ i: i, s: (pre[i + L] - pre[i]) / L });
          if (!cands.length) cands.push({ i: 0, s: 0 });
          var ranked = cands.slice().sort(function (a, b) { return a.s - b.s; });
          var rank = new Map(); ranked.forEach(function (c, k) { rank.set(c, k / Math.max(1, ranked.length - 1)); });
          var picks = [];
          for (var k = ranked.length - 1; k >= 0 && picks.length < S.count; k--) {
            var c = ranked[k];
            if (picks.every(function (p) { return c.i + L <= p.i || c.i >= p.i + L; })) picks.push(c);
          }
          return picks.map(function (p) {
            var st = Math.max(0, snap(E, p.i * WIN)), en = Math.min(S.dur, snap(E, (p.i + L) * WIN));
            if (en - st < 2) en = Math.min(S.dur, st + L * WIN);
            return clip(st, en, Math.round(rank.get(p) * 100), mode);
          });
        }
        function evenSplit() {
          var seg = S.dur / S.count, L = Math.min(S.len, seg), out = [];
          for (var i = 0; i < S.count; i++) { var st = i * seg + (seg - L) / 2; out.push(clip(st, st + L, 50, "even")); }
          return out;
        }
        function clip(st, en, score, mode) {
          return { id: S.nextId++, start: +st.toFixed(1), end: +en.toFixed(1), score: score, mode: mode, title: "" };
        }

        $("analyze").addEventListener("click", async function () {
          var mode = $("mode").value, btn = this; S.mode = mode; btn.disabled = true; progress(0);
          var clips, note = "";
          try {
            if (mode === "even") clips = evenSplit();
            else {
              try { clips = pickMoments(mode, await analyzeAudio()); }
              catch (err) { clips = evenSplit(); note = "Couldn't decode this file's audio, so clips are an even split instead."; }
            }
            S.clips = clips.sort(function (a, b) { return a.start - b.start; });
            applyNames(); progress(1);
            status(note || "Found " + S.clips.length + " " + MODES[mode].replace(/^\S+ /, "").toLowerCase() + " clip" + (S.clips.length === 1 ? "" : "s") + ".");
          } finally { btn.disabled = false; renderList(); drawTimeline(); }
        });

        $("addClip").addEventListener("click", function () {
          var st = Math.min(video.currentTime, Math.max(0, S.dur - 1)), k = clip(st, Math.min(S.dur, st + S.len), 0, "manual");
          k.score = null; S.clips.push(k); k.title = nameFor(k, S.clips.length); renderList(); drawTimeline();
        });

        /* ---------- Naming ---------- */
        $("pattern").addEventListener("change", function () { $("prefix").hidden = this.value !== "custom"; });
        function nameFor(k, n) {
          var p = $("pattern").value;
          if (p === "custom") return ($("prefix").value.trim() || "Clip") + " " + n;
          return p.replace("{n}", n).replace("{video}", S.name || "Video").replace("{mode}", MODES[k.mode].replace(/^\S+ /, ""));
        }
        function applyNames() {
          S.clips.slice().sort(function (a, b) { return a.start - b.start; }).forEach(function (k, i) { k.n = i + 1; k.title = nameFor(k, i + 1); });
        }
        $("applyNames").addEventListener("click", function () { applyNames(); renderList(); drawTimeline(); });

        /* ---------- Rendering ---------- */
        var R = { hv: null, ac: null, dest: null, noAudio: false, busy: false };
        function sizeFor() { var a = S.ar.join(":"); return a === "1:1" ? [720, 720] : a === "16:9" ? [1280, 720] : [720, 1280]; }
        function pickMime() {
          var M = window.MediaRecorder, opts = ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
          for (var i = 0; i < opts.length; i++) if (M.isTypeSupported && M.isTypeSupported(opts[i])) return opts[i];
          return "";
        }
        function once(t, ev) {
          return new Promise(function (res, rej) {
            t.addEventListener(ev, res, { once: true });
            t.addEventListener("error", function () { rej(new Error("The video couldn't be read for rendering.")); }, { once: true });
          });
        }
        function hidden() {
          if (!R.hv) { R.hv = document.createElement("video"); R.hv.playsInline = true; R.hv.preload = "auto"; }
          if (R.hv.src !== video.src) R.hv.src = video.src;
          return R.hv;
        }
        function audioTrack() {
          if (R.noAudio) return null;
          try {
            if (!R.ac) {
              var ac = new (window.AudioContext || window.webkitAudioContext)(), dest = ac.createMediaStreamDestination();
              ac.createMediaElementSource(R.hv).connect(dest); R.ac = ac; R.dest = dest;
            }
            if (R.ac.state === "suspended") R.ac.resume();
            return R.dest.stream.getAudioTracks()[0] || null;
          } catch (e) { R.noAudio = true; R.hv.muted = true; return null; }
        }
        function fileName(k, ext) { return ((k.title || "clip").replace(/[\\/:*?"<>|]+/g, "-").trim() || "clip") + "." + ext; }
        function renderBox(k) {
          var r = k.r || {}, box = el("div", "x-render");
          if (r.busy) { var pb = el("div", "x-progress"), i = el("i"); i.style.width = Math.round((r.p || 0) * 100) + "%"; pb.appendChild(i); box.appendChild(pb); }
          if (r.url) {
            var v = el("video"); v.controls = true; v.playsInline = true; v.preload = "metadata"; v.src = r.url; box.appendChild(v);
            var a = el("a", "btn", "Download"); a.href = r.url; a.download = fileName(k, r.ext); box.appendChild(a);
            box.appendChild(el("p", "x-note", "If download doesn't start, right-click the player → Save video as, or open this page in its own tab."));
          }
          if (r.note) box.appendChild(el("p", "x-note", r.note));
          if (r.err) box.appendChild(el("p", "x-note x-err", "Render failed: " + r.err));
          return box;
        }
        function setBar(k, p) {
          k.r.p = Math.max(0, Math.min(1, p));
          var c = document.querySelector('.x-clip[data-id="' + k.id + '"] .x-render i');
          if (c) c.style.width = Math.round(k.r.p * 100) + "%";
        }
        async function renderClip(k) {
          if (k.r && k.r.url) URL.revokeObjectURL(k.r.url);
          k.r = { busy: true, p: 0 }; R.busy = true; renderList();
          var hv = hidden();
          try {
            if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error("This browser can't record video. Try Chrome, Edge or Firefox.");
            if (hv.readyState < 1) await once(hv, "loadedmetadata");
            hv.pause(); hv.currentTime = k.start; await once(hv, "seeked");
            var sz = sizeFor(), cv = document.createElement("canvas"); cv.width = sz[0]; cv.height = sz[1];
            var ctx = cv.getContext("2d"), stream = cv.captureStream(30), at = audioTrack(), mime = pickMime();
            if (at) stream.addTrack(at); else k.r.note = "Audio couldn't be captured in this browser, so this clip is video only.";
            var chunks = [], rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
            rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
            var stopped = new Promise(function (res, rej) { rec.onstop = res; rec.onerror = function (e) { rej(e.error || new Error("The recorder stopped unexpectedly.")); }; });
            var draw = function () {
              var C = cropRect(); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width, cv.height);
              if (C) ctx.drawImage(hv, C.x, C.y, C.w, C.h, 0, 0, cv.width, cv.height);
              drawOverlay(ctx, cv.width, cv.height, k, Math.max(0, hv.currentTime - k.start));
            };
            draw(); rec.start(250);
            try { await hv.play(); } catch (e) {
              if (e.name !== "NotAllowedError") throw e;
              hv.muted = true; await hv.play(); k.r.note = "The browser blocked sound, so this clip is video only.";
            }
            await new Promise(function (res) {
              (function tick() {
                draw(); setBar(k, (hv.currentTime - k.start) / (k.end - k.start));
                if (hv.currentTime >= k.end || hv.ended) return res();
                requestAnimationFrame(tick);
              })();
            });
            hv.pause(); rec.stop(); await stopped;
            stream.getVideoTracks().forEach(function (t) { t.stop(); });
            var type = (rec.mimeType || mime || "video/webm").split(";")[0];
            k.r.ext = type.indexOf("mp4") >= 0 ? "mp4" : "webm";
            k.r.url = URL.createObjectURL(new Blob(chunks, { type: type }));
          } catch (e) { hv.pause(); k.r.err = (e && e.message) || String(e); }
          finally { k.r.busy = false; R.busy = false; renderList(); }
        }
        $("renderAll").addEventListener("click", async function () {
          if (R.busy) return;
          var all = S.clips.slice().sort(function (a, b) { return a.start - b.start; });
          for (var i = 0; i < all.length; i++) if (S.clips.indexOf(all[i]) >= 0) await renderClip(all[i]);
        });

        /* ---------- Clip list ---------- */
        $("sort").addEventListener("change", renderList);
        function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
        function renderList() {
          var list = $("list"); list.innerHTML = "";
          S.clips.slice().sort(function (a, b) { return a.start - b.start; }).forEach(function (k, i) { k.n = i + 1; });
          var items = S.clips.slice().sort($("sort").value === "score"
            ? function (a, b) { return (b.score || 0) - (a.score || 0); }
            : function (a, b) { return a.start - b.start; });
          $("clipCount").textContent = items.length ? items.length + " clip" + (items.length === 1 ? "" : "s") : "No clips yet";
          $("renderAll").disabled = R.busy || !items.length;
          if (!selClip()) S.sel = items.length ? items[0].id : null;
          loadCap();
          if (!items.length) { list.appendChild(el("p", "x-empty", S.dur ? "Press Find clips, or add one at the playhead." : "Load a video to start making clips.")); return; }
          items.forEach(function (k) {
            var card = el("article", "x-clip"); card.dataset.id = k.id;
            if (k.id === S.playing) card.classList.add("is-playing");
            if (k.id === S.sel) card.classList.add("is-sel");
            card.addEventListener("click", function () { selectClip(k); });
            var top = el("div", "x-row");
            var title = el("input"); title.type = "text"; title.value = k.title; title.className = "x-title"; title.setAttribute("aria-label", "Clip title");
            title.addEventListener("input", function () { k.title = title.value; });
            top.appendChild(title);
            if (k.score != null) { var sc = el("span", "x-score", String(k.score)); sc.title = "Score out of 100"; sc.style.flex = "0 0 auto"; top.appendChild(sc); }
            card.appendChild(top);
            var meta = el("div", "x-meta");
            meta.appendChild(el("span", "", fmt(k.start) + " – " + fmt(k.end)));
            meta.appendChild(el("span", "pill", (k.end - k.start).toFixed(1) + "s"));
            meta.appendChild(el("span", "pill", MODES[k.mode]));
            card.appendChild(meta);
            var times = el("div", "x-times");
            ["start", "end"].forEach(function (f) {
              var lab = el("label", "", f === "start" ? "Start (s)" : "End (s)"), inp = el("input");
              inp.type = "number"; inp.step = "0.1"; inp.min = 0; inp.max = S.dur.toFixed(1); inp.value = k[f];
              inp.addEventListener("change", function () {
                var v = Math.max(0, Math.min(S.dur, +inp.value || 0));
                if (f === "start") k.start = Math.min(v, k.end - 0.5); else k.end = Math.max(v, k.start + 0.5);
                k.start = +k.start.toFixed(1); k.end = +k.end.toFixed(1); renderList(); drawTimeline();
              });
              lab.appendChild(inp); times.appendChild(lab);
            });
            card.appendChild(times);
            var acts = el("div", "links");
            var pv = el("button", "btn", k.id === S.playing ? "■ Stop" : "▶ Preview");
            pv.addEventListener("click", function () { preview(k); });
            var del = el("button", "btn", "Delete");
            del.addEventListener("click", function () { S.clips = S.clips.filter(function (x) { return x !== k; }); if (S.playing === k.id) { video.pause(); S.playing = null; } renderList(); drawTimeline(); });
            var rd = el("button", "btn", k.r && k.r.busy ? "Rendering…" : "Render"); rd.disabled = R.busy;
            rd.addEventListener("click", function (e) { e.stopPropagation(); if (!R.busy) renderClip(k); });
            acts.appendChild(pv); acts.appendChild(del); acts.appendChild(rd);
            card.appendChild(acts);
            card.appendChild(renderBox(k));
            list.appendChild(card);
          });
        }
        function preview(k) {
          if (S.playing === k.id) { video.pause(); S.playing = null; S.stopAt = null; markPlaying(); return; }
          S.sel = k.id; S.playing = k.id; S.stopAt = k.end; video.currentTime = k.start; video.play();
          markPlaying(); video.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        function markPlaying() { renderList(); drawTimeline(); }

        renderList(); drawTimeline(); drawCrop();
      })();
