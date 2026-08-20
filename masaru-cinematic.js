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
    /* ทำงานเฉพาะหน้าแรก (Hub) เท่านั้น — หน้าอื่นไม่มีผู้ช่วยมารบกวน */
    if (page !== 'index') return;

    /* ล้างค่า "ปิดถาวร" ที่เคยกดไว้ (เลิกใช้ฟีเจอร์นี้แล้ว) */
    try { localStorage.removeItem('msr_mascot_off'); } catch (e) {}

    /* ---------- ข้อความประจำแต่ละหน้า ---------- */
    var info = ['ศูนย์รวมระบบ HR', 'ชี้ที่การ์ดระบบ เพื่อดูว่าระบบนั้นใช้ทำอะไร'];

    function greeting() {
      var h = new Date().getHours();
      if (h < 12) return 'สวัสดีตอนเช้าครับ';
      if (h < 17) return 'สวัสดีตอนบ่ายครับ';
      if (h < 21) return 'สวัสดีตอนเย็นครับ';
      return 'ดึกแล้วนะครับ';
    }

    /* ---------- สร้างตัวหุ่น ---------- */
    var mascot = document.createElement('div');
    mascot.className = 'msr-mascot';
    mascot.setAttribute('aria-hidden', 'true');
    mascot.innerHTML = [
      '<div class="msr-mascot-note"><strong></strong><span></span></div>',
      '<div class="msr-mascot-body" title="คลิกเพื่อดูคำแนะนำ">',
        '<i class="msr-mascot-antenna"></i>',
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
        '<i class="msr-mascot-spark s1"></i>',
        '<i class="msr-mascot-spark s2"></i>',
        '<i class="msr-mascot-spark s3"></i>',
      '</div>'
    ].join('');
    document.body.appendChild(mascot);

    var body = mascot.querySelector('.msr-mascot-body');
    var noteTitle = mascot.querySelector('.msr-mascot-note strong');
    var noteText = mascot.querySelector('.msr-mascot-note span');
    var hub = document.getElementById('hubScreen');
    var grid = document.getElementById('appGrid');
    var noteTimer = 0, moodTimer = 0, quietTimer = 0, idleTimer = 0;

    resetExplanation();

    /* ---------- พูด (ปิดเองอัตโนมัติ ไม่ค้างบังจอ) ---------- */
    function say(title, text, ms) {
      if (mascot.classList.contains('is-quiet')) return;
      if (title) noteTitle.textContent = title;
      if (text) noteText.textContent = text;
      mascot.classList.add('is-explaining');
      window.clearTimeout(noteTimer);
      noteTimer = window.setTimeout(function () {
        mascot.classList.remove('is-explaining');
      }, ms || 6000);
    }
    function mood(name, ms) {
      mascot.classList.remove('mood-happy', 'mood-alert', 'mood-sleep');
      if (name) mascot.classList.add('mood-' + name);
      window.clearTimeout(moodTimer);
      if (name && ms) moodTimer = window.setTimeout(function () {
        mascot.classList.remove('mood-' + name);
      }, ms);
    }
    function wave() {
      mascot.classList.add('is-waving');
      window.setTimeout(function () { mascot.classList.remove('is-waving'); }, 1800);
    }
    function resetExplanation() {
      noteTitle.textContent = info[0];
      noteText.textContent = info[1];
      mascot.classList.remove('is-explaining');
    }

    /* ---------- โหมดเงียบ: ไม่ขวางตอนทำงาน ---------- */
    function quiet(ms) {
      mascot.classList.add('is-quiet');
      mascot.classList.remove('is-explaining');
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(function () {
        mascot.classList.remove('is-quiet');
      }, ms || 1400);
    }
    function isTyping() {
      var el = document.activeElement;
      if (!el) return false;
      var t = (el.tagName || '').toLowerCase();
      return t === 'input' || t === 'textarea' || t === 'select' || el.isContentEditable;
    }
    document.addEventListener('focusin', function () { if (isTyping()) quiet(60000); }, true);
    document.addEventListener('focusout', function () {
      window.setTimeout(function () { if (!isTyping()) quiet(200); }, 60);
    }, true);
    window.addEventListener('scroll', function () { quiet(1200); }, { passive: true });
    document.addEventListener('keydown', function () { if (isTyping()) quiet(60000); }, true);

    /* ---------- ตื่น/หลับตามการใช้งาน ---------- */
    function awake() {
      if (mascot.classList.contains('mood-sleep')) mood(null);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(function () { mood('sleep'); }, 90000);
    }
    ['pointermove', 'keydown', 'click'].forEach(function (ev) {
      window.addEventListener(ev, awake, { passive: true });
    });
    awake();

    /* ---------- แสดง/ซ่อน: ซ่อนตอนอยู่หน้า login ---------- */
    var LOGIN_SEL = '#authScreen, #login, #login-overlay, #authGate';
    function loginVisible() {
      var list = document.querySelectorAll(LOGIN_SEL);
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        if (el.classList.contains('hide')) continue;
        var st = getComputedStyle(el);
        if (st.display !== 'none' && st.visibility !== 'hidden') return true;
      }
      return false;
    }
    function overlayOpen() {
      // popup/modal เปิดอยู่ → หลบให้
      var b = document.body;
      if (b.classList.contains('locked')) return true;
      try { if (getComputedStyle(b).overflow === 'hidden' && b.scrollHeight > window.innerHeight) return true; } catch (e) {}
      return false;
    }

    var greeted = false;
    function syncVisibility() {
      var ok = !loginVisible();
      if (ok && hub) ok = !hub.classList.contains('hide');
      mascot.classList.toggle('is-visible', ok);
      if (!ok) { mascot.classList.remove('is-explaining'); return; }
      if (overlayOpen()) { quiet(1500); return; }
      if (!greeted) {
        greeted = true;
        window.setTimeout(function () {
          wave();
          say(greeting(), info[1], 6500);
        }, 900);
      }
    }

    var syncFrame = 0;
    new MutationObserver(function () {
      cancelAnimationFrame(syncFrame);
      syncFrame = requestAnimationFrame(syncVisibility);
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'] });
    syncVisibility();

    /* ---------- คลิกตัวหุ่น = ขอคำแนะนำหน้านี้ ---------- */
    body.addEventListener('click', function () {
      mood('happy', 2200);
      wave();
      say(info[0], info[1], 6000);
    });

    /* ---------- รู้ผลลัพธ์จาก toast ของระบบ (อ่านอย่างเดียว) ---------- */
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (!n || n.nodeType !== 1) continue;
          var cls = (typeof n.className === 'string' ? n.className : '').toLowerCase();
          if (cls.indexOf('toast') < 0 && (n.id || '').toLowerCase().indexOf('toast') < 0) continue;
          var txt = (n.textContent || '');
          if (/ไม่สำเร็จ|ผิดพลาด|error|ล้มเหลว/i.test(txt)) mood('alert', 3000);
          else mood('happy', 2600);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });

    /* ---------- หน้า Hub: อธิบายการ์ดระบบ (ของเดิม) ---------- */
    if (grid) {
      grid.addEventListener('pointerover', function (event) {
        var tile = event.target.closest('.app-tile');
        if (!tile || !grid.contains(tile)) return;
        var title = tile.querySelector('.app-name');
        var description = tile.querySelector('.app-desc');
        if (!title || !description) return;
        say(title.textContent.trim(), description.textContent.trim(), 8000);
      }, { passive: true });
      grid.addEventListener('pointerout', function (event) {
        var tile = event.target.closest('.app-tile');
        if (!tile) return;
        if (event.relatedTarget && tile.contains(event.relatedTarget)) return;
        resetExplanation();
      }, { passive: true });
      grid.addEventListener('focusin', function (event) {
        var tile = event.target.closest('.app-tile');
        if (!tile || !grid.contains(tile)) return;
        var t = tile.querySelector('.app-name'), d = tile.querySelector('.app-desc');
        if (t && d) say(t.textContent.trim(), d.textContent.trim(), 8000);
      });
      grid.addEventListener('focusout', resetExplanation);
    }

    /* ---------- เอียงตัว + ตามองตามเมาส์ ---------- */
    if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
      window.addEventListener('pointermove', function (event) {
        var nx = (event.clientX / Math.max(window.innerWidth, 1)) - .5;
        var ny = (event.clientY / Math.max(window.innerHeight, 1)) - .5;
        body.style.setProperty('--mx', (nx * 13).toFixed(2) + 'deg');
        body.style.setProperty('--my', (ny * -9).toFixed(2) + 'deg');
        mascot.style.setProperty('--eyeX', (nx * 3.2).toFixed(2) + 'px');
        mascot.style.setProperty('--eyeY', (ny * 2.4).toFixed(2) + 'px');
      }, { passive: true });
    }

    /* ---------- เรียกใช้จากคอนโซลได้ ---------- */
    window.msrMascot = { say: say };
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

/* ============================================================
   MASARU — Logout Redirect
   ออกจากระบบจากหน้าไหนก็ตาม → เด้งกลับหน้า Login ของพอร์ทัล
   ทำงานโดยเฝ้าดู session key ของ Supabase ใน localStorage
   จึงไม่ต้องแก้โค้ด logout เดิมของแต่ละระบบเลย
   ============================================================ */
(function () {
  'use strict';

  var TARGET = 'index.html';
  var FLAG = 'msr_logout_pending';
  var RE = /^sb-.+-auth-token$/;

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var here = file.replace(/\.html?$/, '') || 'index';
  if (here === 'index') return;                 // หน้าพอร์ทัลจัดการเองอยู่แล้ว

  function sessionKeys() {
    var out = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && RE.test(k) && localStorage.getItem(k)) out.push(k);
      }
    } catch (e) { return null; }               // localStorage ถูกบล็อก → ไม่ทำอะไร
    return out.sort();
  }

  function lostAny(before, now) {
    if (!before || !now) return false;
    for (var i = 0; i < before.length; i++) {
      if (now.indexOf(before[i]) < 0) return true;
    }
    return false;
  }

  function leave() {
    try { sessionStorage.removeItem(FLAG); } catch (e) {}
    location.replace(TARGET);
  }

  /* 1) กรณีระบบเดิมสั่ง location.reload() หลัง signOut
        → อ่านธงที่ตั้งไว้ตอนกดปุ่ม แล้วเทียบว่า session หายจริงไหม */
  try {
    var raw = sessionStorage.getItem(FLAG);
    if (raw) {
      sessionStorage.removeItem(FLAG);
      var snapshot = JSON.parse(raw);
      if (lostAny(snapshot, sessionKeys())) { leave(); return; }
    }
  } catch (e) {}

  /* 2) ตั้งธงตอนผู้ใช้กดปุ่ม "ออกจากระบบ" (รองรับทุกรูปแบบปุ่มในพอร์ทัล) */
  document.addEventListener('click', function (ev) {
    var el = ev.target;
    for (var hop = 0; el && hop < 6; hop++, el = el.parentElement) {
      var id = (el.id || '').toLowerCase();
      var cls = '';
      try { cls = (typeof el.className === 'string' ? el.className : '').toLowerCase(); } catch (e) {}
      var oc = '';
      var title = '';
      try {
        oc = (el.getAttribute && el.getAttribute('onclick') || '').toLowerCase();
        title = (el.getAttribute && el.getAttribute('title') || '');
      } catch (e) {}
      var txt = (el.textContent || '').trim();

      var isLogout =
        /logout|signout/.test(id) ||
        /logout|signout/.test(cls) ||
        /logout|signout/.test(oc) ||
        title.indexOf('ออกจากระบบ') > -1 ||
        (txt.length < 40 && txt.indexOf('ออกจากระบบ') > -1);

      if (isLogout) {
        try { sessionStorage.setItem(FLAG, JSON.stringify(sessionKeys() || [])); } catch (e) {}
        return;
      }
    }
  }, true);

  /* 3) เฝ้าดู session แบบต่อเนื่อง — ครอบคลุมกรณีที่ระบบไม่ reload
        และกรณี session หมดอายุเอง (ต้องหาย 2 รอบติดกันจึงเด้ง กัน false positive
        ตอน Supabase ต่ออายุ token) */
  var prev = sessionKeys();
  if (!prev || !prev.length) return;            // ยังไม่เคยล็อกอินในหน้านี้ → ไม่ต้องเฝ้า
  var miss = 0;
  setInterval(function () {
    var now = sessionKeys();
    if (!now) return;
    if (lostAny(prev, now)) {
      if (++miss >= 2) leave();
    } else {
      miss = 0;
      prev = now;
    }
  }, 350);
})();