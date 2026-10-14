// Hero de prueba: secuencia de imágenes ligada al scroll (96 fotogramas WebP del loop de ADN).
(function () {
  var container = document.getElementById('gvScroll');
  var canvas = document.getElementById('gvCanvas');
  var overlay = document.getElementById('gvOverlay');
  if (!container || !canvas || !overlay) return;

  var panels = Array.prototype.slice.call(overlay.querySelectorAll('.gv-panel'));
  var ctx = canvas.getContext('2d', { alpha: false });
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var FRAME_COUNT = 96, W = 1280, H = 720, LERP_TAU = 8, SNAP = 0.01;
  var PATH = 'assets/video/hero-frames/f';
  canvas.width = W; canvas.height = H;

  var frames = new Array(FRAME_COUNT);   // Image ya cargadas
  var start = 0, span = 1, current = 0, target = 0, lastTime = performance.now();
  var activeIndex = -1, lastDrawn = -1;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function pad(n) { return (n < 10 ? '00' : n < 100 ? '0' : '') + n; }

  function measure() {
    start = container.offsetTop;
    span = Math.max(1, container.offsetHeight - window.innerHeight);
  }
  var resizeTimer;
  function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 100); }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  window.addEventListener('load', measure);
  measure();

  // ── Carga progresiva: primero fotogramas espaciados, luego se rellenan los huecos ──
  function loadFrame(i) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () { frames[i] = img; resolve(); };
      img.onerror = function () { resolve(); };
      img.src = PATH + pad(i + 1) + '.webp';
    });
  }
  function loadOrder() {
    var order = [], seen = {};
    [16, 8, 4, 2, 1].forEach(function (step) {
      for (var i = 0; i < FRAME_COUNT; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); }
    });
    if (!seen[FRAME_COUNT - 1]) order.push(FRAME_COUNT - 1);
    return order;
  }
  (async function loadAll() {
    var order = loadOrder(), idx = 0, PARALLEL = 4;
    async function worker() {
      while (idx < order.length) { var i = order[idx++]; await loadFrame(i); }
    }
    var workers = [];
    for (var k = 0; k < PARALLEL; k++) workers.push(worker());
    await Promise.all(workers);
  })();

  // Fotograma cargado más cercano al pedido
  function nearestLoaded(f) {
    for (var d = 0; d < FRAME_COUNT; d++) {
      if (frames[f - d]) return f - d;
      if (frames[f + d]) return f + d;
    }
    return -1;
  }

  function render(pos) {
    var f = clamp(Math.round(pos), 0, FRAME_COUNT - 1);
    var n = nearestLoaded(f);
    if (n < 0 || n === lastDrawn) return;
    ctx.drawImage(frames[n], 0, 0, W, H);
    lastDrawn = n;
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
    target = p * (FRAME_COUNT - 1);
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
})();
