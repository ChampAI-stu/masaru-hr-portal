(function () {
  'use strict';

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var page = file.replace(/\.html?$/, '') || 'index';

  function buildAtmosphere() {
    var stage = document.createElement('div');
    stage.className = 'msr-atmosphere';
    stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML = [
      '<div class="msr-aurora"></div>',
      '<div class="msr-orb one"></div>',
      '<div class="msr-orb two"></div>',
      '<div class="msr-ribbon"></div>',
      '<i class="msr-spark s1"></i>',
      '<i class="msr-spark s2"></i>',
      '<i class="msr-spark s3"></i>',
      '<i class="msr-spark s4"></i>'
    ].join('');
    document.body.appendChild(stage);
  }

  function buildMascot() {
    if (page !== 'index') return;

    var mascot = document.createElement('div');
    mascot.className = 'msr-mascot';
    mascot.setAttribute('aria-hidden', 'true');
    mascot.innerHTML = [
      '<div class="msr-mascot-note"><strong>ผู้ช่วย MASARU</strong><span>ชี้ที่การ์ดระบบ เพื่อดูว่าระบบนั้นใช้ทำอะไร</span></div>',
      '<div class="msr-mascot-body">',
        '<div class="msr-mascot-ear left"></div>',
        '<div class="msr-mascot-ear right"></div>',
        '<div class="msr-mascot-head">',
          '<div class="msr-mascot-face">',
            '<i class="msr-mascot-eye left"></i>',
            '<i class="msr-mascot-eye right"></i>',
            '<i class="msr-mascot-mouth"></i>',
          '</div>',
        '</div>',
        '<div class="msr-mascot-arm left"></div>',
        '<div class="msr-mascot-arm right"></div>',
        '<div class="msr-mascot-torso"></div>',
        '<div class="msr-mascot-shadow"></div>',
      '</div>'
    ].join('');
    document.body.appendChild(mascot);

    var body = mascot.querySelector('.msr-mascot-body');
    var noteTitle = mascot.querySelector('.msr-mascot-note strong');
    var noteText = mascot.querySelector('.msr-mascot-note span');
    var hub = document.getElementById('hubScreen');
    var grid = document.getElementById('appGrid');
    var introTimer = 0;

    function syncVisibility() {
      var visible = hub && !hub.classList.contains('hide');
      mascot.classList.toggle('is-visible', !!visible);
      if (!visible) {
        mascot.classList.remove('is-intro', 'is-explaining');
        return;
      }
      mascot.classList.add('is-intro');
      window.clearTimeout(introTimer);
      introTimer = window.setTimeout(function () {
        mascot.classList.remove('is-intro');
      }, 4200);
    }

    function explain(tile) {
      var title = tile && tile.querySelector('.app-name');
      var description = tile && tile.querySelector('.app-desc');
      if (!title || !description) return;
      noteTitle.textContent = title.textContent.trim();
      noteText.textContent = description.textContent.trim();
      mascot.classList.remove('is-intro');
      mascot.classList.add('is-explaining');
    }

    function resetExplanation() {
      noteTitle.textContent = 'ผู้ช่วย MASARU';
      noteText.textContent = 'ชี้ที่การ์ดระบบ เพื่อดูว่าระบบนั้นใช้ทำอะไร';
      mascot.classList.remove('is-explaining');
    }

    if (hub) {
      syncVisibility();
      new MutationObserver(syncVisibility).observe(hub, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    if (grid) {
      grid.addEventListener('pointerover', function (event) {
        var tile = event.target.closest('.app-tile');
        if (tile && grid.contains(tile)) explain(tile);
      }, { passive: true });
      grid.addEventListener('pointerout', function (event) {
        var tile = event.target.closest('.app-tile');
        if (!tile) return;
        if (event.relatedTarget && tile.contains(event.relatedTarget)) return;
        resetExplanation();
      }, { passive: true });
      grid.addEventListener('focusin', function (event) {
        var tile = event.target.closest('.app-tile');
        if (tile && grid.contains(tile)) explain(tile);
      });
      grid.addEventListener('focusout', resetExplanation);
    }

    window.addEventListener('pointermove', function (event) {
      var x = ((event.clientX / Math.max(window.innerWidth, 1)) - .5) * 13;
      var y = ((event.clientY / Math.max(window.innerHeight, 1)) - .5) * -9;
      body.style.setProperty('--mx', x.toFixed(2) + 'deg');
      body.style.setProperty('--my', y.toFixed(2) + 'deg');
    }, { passive: true });
  }


  /* ---------- PDF-safe guard ----------
     ปิดสไตล์ cinematic ชั่วคราวระหว่าง html2canvas สร้าง PDF
     เพื่อให้ฟอร์ม PDF เหมือนเวอร์ชันเดิม 100% */
  function msrCinematicLink() {
    return document.querySelector('link[href*="masaru-cinematic.css"]');
  }

  function wrapHtml2Canvas(orig) {
    if (!orig || orig.__msrWrapped) return orig;
    function wrapped(el, opts) {
      var link = msrCinematicLink();
      var parent = link && link.parentNode;
      var next = link && link.nextSibling;
      var pageAttr = document.body.getAttribute('data-msr-page');
      if (link && parent) parent.removeChild(link);
      if (pageAttr !== null) document.body.removeAttribute('data-msr-page');
      function restore() {
        if (link && parent) parent.insertBefore(link, next);
        if (pageAttr !== null) document.body.setAttribute('data-msr-page', pageAttr);
      }
      var result;
      try {
        result = orig.apply(this, arguments);
      } catch (e) {
        restore();
        throw e;
      }
      return Promise.resolve(result).then(function (v) { restore(); return v; },
                                          function (e) { restore(); throw e; });
    }
    wrapped.__msrWrapped = true;
    for (var k in orig) { try { wrapped[k] = orig[k]; } catch (e) {} }
    return wrapped;
  }

  (function installGuard() {
    var current = window.html2canvas;
    if (typeof current === 'function') {
      window.html2canvas = wrapHtml2Canvas(current);
      return;
    }
    try {
      Object.defineProperty(window, 'html2canvas', {
        configurable: true,
        get: function () { return current; },
        set: function (v) { current = (typeof v === 'function') ? wrapHtml2Canvas(v) : v; }
      });
    } catch (e) {
      var tries = 0;
      var t = setInterval(function () {
        if (typeof window.html2canvas === 'function' && !window.html2canvas.__msrWrapped) {
          window.html2canvas = wrapHtml2Canvas(window.html2canvas);
          clearInterval(t);
        } else if (++tries > 100) { clearInterval(t); }
      }, 100);
    }
  })();

  function markIgnored() {
    var nodes = document.querySelectorAll('.msr-atmosphere, .msr-mascot, .msr-login-story');
    for (var i = 0; i < nodes.length; i++) nodes[i].setAttribute('data-html2canvas-ignore', 'true');
  }

  function enhance() {
    document.body.setAttribute('data-msr-page', page);
    buildAtmosphere();
    buildMascot();
    markIgnored();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance, { once: true });
  } else {
    enhance();
  }
})();
