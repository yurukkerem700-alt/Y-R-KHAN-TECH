/* Yörükhan Tech — hafif atmosfer müziği (tarayıcıda üretilir, dosya yok).
   Sakin, yumuşak bir pad + ara sıra tınlayan çan sesleri. İlk tıklama/dokunuşta başlar.
   Sağ alttaki düğmeyle kapatılır; tercih hatırlanır. */
(function () {
  "use strict";
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  var KEY = "yt-sound", pref = "on";
  try { pref = localStorage.getItem(KEY) || "on"; } catch (e) {}

  var btn = document.createElement("button");
  btn.className = "snd"; btn.type = "button";
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="w1" d="M16 9a4 4 0 0 1 0 6"/><path class="w2" d="M18.5 6.5a8 8 0 0 1 0 11"/><path class="x" d="M17 9l5 6M22 9l-5 6"/></svg><i></i><i></i><i></i>';
  document.body.appendChild(btn);

  var ctx, master, bus, timers = [], started = false, running = false;
  function ui() {
    btn.classList.toggle("on", running && pref === "on");
    btn.setAttribute("aria-pressed", running && pref === "on");
    btn.setAttribute("aria-label", running && pref === "on" ? "Sesi kapat" : "Sesi aç");
    btn.title = running && pref === "on" ? "Sesi kapat" : "Atmosfer sesini aç";
  }

  function impulse(c, sec) {
    var len = Math.floor(c.sampleRate * sec), buf = c.createBuffer(2, len, c.sampleRate);
    for (var ch = 0; ch < 2; ch++) { var d = buf.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    return buf;
  }
  function build() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = .4;
    var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .05; lg.gain.value = 260; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    var dry = ctx.createGain(); dry.gain.value = .75;
    var wet = ctx.createGain(); wet.gain.value = .6;
    var conv = ctx.createConvolver(); conv.buffer = impulse(ctx, 3.4);
    bus = ctx.createGain(); bus.gain.value = 1;
    bus.connect(lp); lp.connect(dry); lp.connect(conv); conv.connect(wet); dry.connect(master); wet.connect(master);
    /* çan sesleri için yankı */
    var dl = ctx.createDelay(1.5); dl.delayTime.value = .46; var fb = ctx.createGain(); fb.gain.value = .34;
    dl.connect(fb); fb.connect(dl); dl.connect(conv);
    ctx._bellIn = ctx.createGain(); ctx._bellIn.gain.value = 1; ctx._bellIn.connect(master); ctx._bellIn.connect(dl); ctx._bellIn.connect(conv);
  }
  var CHORDS = [[146.83, 174.61, 220, 261.63, 329.63], [116.54, 174.61, 220, 293.66, 349.23], [87.31, 130.81, 220, 261.63, 329.63], [130.81, 196, 293.66, 329.63, 392]];
  var ci = 0;
  function chord() {
    if (!running) return;
    var now = ctx.currentTime, notes = CHORDS[ci++ % CHORDS.length];
    notes.forEach(function (f, i) {
      [["sine", 0], ["triangle", 5]].forEach(function (v) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = v[0]; o.frequency.value = f; o.detune.value = v[1] + (Math.random() - .5) * 6;
        var peak = v[0] === "sine" ? .085 : .028;
        g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(peak, now + 3.2 + i * .15); g.gain.setValueAtTime(peak, now + 7); g.gain.linearRampToValueAtTime(0, now + 13);
        o.connect(g); g.connect(bus); o.start(now); o.stop(now + 13.5);
      });
    });
    timers.push(setTimeout(chord, 9000));
  }
  var PENT = [587.33, 698.46, 783.99, 880, 1046.5, 1174.66];
  function bell() {
    if (!running) return;
    var now = ctx.currentTime, f = PENT[Math.floor(Math.random() * PENT.length)];
    [[1, .05], [2.005, .014]].forEach(function (h) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f * h[0];
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(h[1], now + .02); g.gain.exponentialRampToValueAtTime(.0005, now + 3.6);
      o.connect(g); g.connect(ctx._bellIn); o.start(now); o.stop(now + 3.8);
    });
    timers.push(setTimeout(bell, 4200 + Math.random() * 4800));
  }
  function play() {
    if (!ctx) build();
    var go = function () {
      running = true; ui();
      var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(.55, t + 5);
      if (!started) { started = true; chord(); timers.push(setTimeout(bell, 2500)); }
    };
    if (ctx.state === "suspended") ctx.resume().then(go).catch(function () {}); else go();
  }
  function stop() {
    running = false; ui();
    if (!ctx) return;
    var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + 1.2);
    timers.forEach(clearTimeout); timers = []; started = false;
  }

  /* ilk kullanıcı hareketinde başlat (tarayıcılar kendiliğinden ses çalmaya izin vermez) */
  var gesture = ["pointerdown", "keydown", "touchend", "click"];
  function first() {
    gesture.forEach(function (g) { window.removeEventListener(g, first, true); });
    if (pref === "on") play(); else ui();
  }
  gesture.forEach(function (g) { window.addEventListener(g, first, true); });
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    gesture.forEach(function (g) { window.removeEventListener(g, first, true); });
    if (running && pref === "on") { pref = "off"; stop(); } else { pref = "on"; play(); }
    try { localStorage.setItem(KEY, pref); } catch (er) {}
  });
  document.addEventListener("visibilitychange", function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (running) ctx.resume();
  });
  ui();
})();
