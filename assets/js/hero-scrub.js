// Hero de prueba: video con scroll-scrub. Ver docs/DECISIONS.md si se adopta.
(function () {
  var container = document.getElementById('gvScroll');
  var video = document.getElementById('gvVideo');
  var canvas = document.getElementById('gvCanvas');
  var overlay = document.getElementById('gvOverlay');
  if (!container || !video || !canvas || !overlay) return;

  var panels = Array.prototype.slice.call(overlay.querySelectorAll('.gv-panel'));
  var ctx = canvas.getContext('2d', { alpha: false });
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var smallScreen = window.matchMedia('(max-width: 768px)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  var MAX_TIME = 7.5, LERP_TAU = 8, SNAP = 0.002, LEAD = 24, LRU_MAX = 30;
  var MP4BOX_URL = 'https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js';

  var start = 0, span = 1, duration = 0, current = 0, target = 0, lastTime = performance.now();
  var activeIndex = -1;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function measure() {
    start = container.offsetTop;
    span = Math.max(1, start + container.offsetHeight - window.innerHeight - start);
  }

  function onMeta() {
    duration = Math.min(video.duration || MAX_TIME, MAX_TIME);
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    video.pause();
  }
  video.addEventListener('loadedmetadata', onMeta);
  if (video.readyState >= 1) onMeta();

  var resizeTimer;
  function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 100); }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  measure();

  // ── Banco de fotogramas ──
  var bank = [], bankReady = false, bankFailed = false;
  var lru = new Map(), lastDrawn = -1;

  function nearestIndex(t) {
    var us = t * 1e6, lo = 0, hi = bank.length - 1;
    while (lo < hi) {
      var m = (lo + hi) >> 1;
      if (bank[m].ts < us) lo = m + 1; else hi = m;
    }
    if (lo > 0 && Math.abs(bank[lo - 1].ts - us) <= Math.abs(bank[lo].ts - us)) lo--;
    return lo;
  }

  function getBitmap(i) {
    if (i < 0 || i >= bank.length) return null;
    if (lru.has(i)) {
      var v = lru.get(i); lru.delete(i); lru.set(i, v);
      return v.bm || null;
    }
    var entry = { bm: null };
    lru.set(i, entry);
    createImageBitmap(bank[i].blob).then(function (bm) { entry.bm = bm; }).catch(function () {});
    while (lru.size > LRU_MAX) {
      var k = lru.keys().next().value, old = lru.get(k);
      if (old && old.bm) old.bm.close();
      lru.delete(k);
    }
    return null;
  }

  function warm(i) { for (var j = i - 1; j <= i + 2; j++) getBitmap(j); }

  function drawFromBank(t) {
    var i = nearestIndex(t);
    var bm = getBitmap(i);
    warm(i);
    if (bm && i !== lastDrawn) {
      ctx.drawImage(bm, 0, 0, canvas.width, canvas.height);
      lastDrawn = i;
      canvas.classList.add('is-live');
    }
  }

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  async function buildFrameBank() {
    if (reduced || smallScreen || saveData || !('VideoDecoder' in window)) return;
    try {
      await loadScript(MP4BOX_URL);
      if (!window.MP4Box || !window.DataStream) throw new Error('mp4box');

      var buf = await (await fetch(video.currentSrc || video.src)).arrayBuffer();
      var file = MP4Box.createFile();
      var samples = [], track = null, timescale = 1, description;

      var ready = new Promise(function (resolve, reject) {
        file.onError = reject;
        file.onReady = function (info) {
          track = info.videoTracks[0];
          timescale = track.timescale;
          var trak = file.getTrackById(track.id);
          var entry = trak.mdia.minf.stbl.stsd.entries[0];
          var box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
          if (box) {
            var s = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
            box.write(s);
            description = new Uint8Array(s.buffer, 8);
          }
          file.setExtractionOptions(track.id, null, { nbSamples: Infinity });
          file.start();
          resolve();
        };
        file.onSamples = function (id, user, s) { samples = samples.concat(s); };
      });

      buf.fileStart = 0;
      file.appendBuffer(buf);
      file.flush();
      await ready;
      await sleep(50);
      if (!samples.length) throw new Error('sin muestras');

      var out = 0, chain = Promise.resolve();
      var off = document.createElement('canvas');
      off.width = canvas.width; off.height = canvas.height;
      var octx = off.getContext('2d');

      var decoder = new VideoDecoder({
        output: function (vf) {
          if (vf.timestamp / 1e6 <= MAX_TIME + 0.05) {
            octx.drawImage(vf, 0, 0, off.width, off.height);
            var ts = vf.timestamp;
            chain = chain.then(function () {
              return new Promise(function (res) {
                off.toBlob(function (b) { if (b) bank.push({ ts: ts, blob: b }); res(); }, 'image/webp', 0.82);
              });
            });
          }
          vf.close();
          out++;
        },
        error: function () { bankFailed = true; }
      });

      var config = { codec: track.codec, codedWidth: track.video.width, codedHeight: track.video.height };
      if (description) config.description = description;
      var support = await VideoDecoder.isConfigSupported(config);
      if (!support.supported) throw new Error('codec');
      decoder.configure(config);

      var fed = 0;
      for (var i = 0; i < samples.length; i++) {
        var sm = samples[i];
        if (sm.dts / sm.timescale > MAX_TIME + 1) break;
        while (i - out > LEAD) { if (bankFailed) throw new Error('decoder'); await sleep(5); }
        decoder.decode(new EncodedVideoChunk({
          type: sm.is_sync ? 'key' : 'delta',
          timestamp: sm.cts * 1e6 / sm.timescale,
          duration: sm.duration * 1e6 / sm.timescale,
          data: sm.data
        }));
        fed++;
      }
      await decoder.flush();
      await chain;
      decoder.close();
      bank.sort(function (a, b) { return a.ts - b.ts; });
      if (bank.length) bankReady = true; else bankFailed = true;
    } catch (e) {
      bankFailed = true;
    }
  }

  function render(t) {
    if (bankReady && !bankFailed) { drawFromBank(t); return; }
    if (!video.seeking && Math.abs(video.currentTime - t) > 0.01) {
      try { video.currentTime = t; } catch (e) {}
    }
  }

  function updateSections(p) {
    var idx = Math.min(panels.length - 1, Math.floor(p * panels.length));
    if (idx !== activeIndex) {
      panels.forEach(function (el, i) { el.classList.toggle('active', i === idx); });
      activeIndex = idx;
    }
    var y = window.scrollY || window.pageYOffset;
    overlay.style.display = y > start + span + window.innerHeight ? 'none' : '';
  }

  function update(now) {
    var y = window.scrollY || window.pageYOffset;
    var p = clamp((y - start) / span, 0, 1);
    var dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    target = p * Math.min(duration || MAX_TIME, MAX_TIME);
    if (reduced) {
      current = target;
    } else {
      current += (target - current) * (1 - Math.exp(-dt * LERP_TAU));
      if (Math.abs(target - current) < SNAP) current = target;
    }
    render(current);
    updateSections(p);
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);

  document.querySelectorAll('[data-gv-goto]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var dest = document.querySelector(a.getAttribute('data-gv-goto'));
      if (!dest) return;
      e.preventDefault();
      dest.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  if (document.readyState === 'complete') buildFrameBank();
  else window.addEventListener('load', buildFrameBank);
})();
