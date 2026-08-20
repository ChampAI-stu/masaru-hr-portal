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
      // กันกรณี CSS เก่าค้าง cache — บังคับให้ตัวหุ่นชัดเต็มที่เสมอ
      mascot.style.opacity = '';
      mascot.style.transform = '';
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
          var line = openingLine();
          say(line[0], line[1], 7000);
          loadWorkSummary();
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
      if (mascot.dataset.moved === '1') { mascot.dataset.moved = ''; return; }  // เพิ่งลากย้าย ไม่นับเป็นคลิก
      if (comboClick()) return;                                                 // คลิกรัว = โหมดลับ
      mood('happy', 2000);
      wave();
      if (alerts.length && Math.random() < .35) { say('สรุปงานวันนี้', alerts.join(' · '), 8000); return; }
      var t = nextTip();
      say(t[0], t[1], 7000);
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
      grid.addEventListener('click', function (event) {
        var tile = event.target.closest('.app-tile');
        if (!tile || !grid.contains(tile)) return;
        var url = tile.dataset.url;
        if (!url) return;
        var o = stats();
        o.apps = o.apps || {};
        o.apps[url] = (o.apps[url] || 0) + 1;
        saveStats(o);
      }, true);

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


    /* ==========================================================
       A · รู้จักผู้ใช้ — ชื่อ + สถิติการใช้งาน (เก็บในเครื่อง)
       ========================================================== */
    var ST_KEY = 'msr_hub_stats';
    function stats() {
      try { return JSON.parse(localStorage.getItem(ST_KEY) || '{}') || {}; } catch (e) { return {}; }
    }
    function saveStats(o) { try { localStorage.setItem(ST_KEY, JSON.stringify(o)); } catch (e) {} }

    var st = stats();
    var today = new Date().toISOString().slice(0, 10);
    var lastSeen = st.last || '';
    st.visits = (st.visits || 0) + 1;
    st.last = today;
    st.apps = st.apps || {};
    saveStats(st);

    var userName = '';
    (function loadUser() {
      try {
        var client = (typeof sb !== 'undefined' && sb) ? sb : null;
        if (!client || !client.auth) return;
        client.auth.getSession().then(function (r) {
          var u = r && r.data && r.data.session && r.data.session.user;
          if (!u) return;
          userName = (u.user_metadata && (u.user_metadata.name || u.user_metadata.full_name))
                     || (u.email || '').split('@')[0] || '';
        }).catch(function () {});
      } catch (e) {}
    })();

    function daysAgo(iso) {
      if (!iso) return null;
      var d = Math.round((Date.parse(today) - Date.parse(iso)) / 86400000);
      return isFinite(d) ? d : null;
    }
    function topApp() {
      var best = null, n = 0;
      for (var k in st.apps) if (st.apps[k] > n) { n = st.apps[k]; best = k; }
      return n >= 3 ? { url: best, n: n } : null;
    }

    /* ==========================================================
       D · ข้อความ: ทักตามวัน / วันพิเศษ / ทิปหมุนเวียน
       ========================================================== */
    var TIPS = [
      ['รู้หรือไม่', 'กด “แท็บใหม่” บนการ์ด เพื่อเปิดหลายระบบพร้อมกันได้'],
      ['รู้หรือไม่', 'ในระบบรับสมัครงาน กดที่ผู้สมัครแล้วสั่งพิมพ์ใบสรุปเป็น PDF ได้เลย'],
      ['รู้หรือไม่', 'ระบบประเมินทดลองงานเตือนอัตโนมัติที่ 30 / 60 / 90 วัน'],
      ['รู้หรือไม่', 'แท็บวันเริ่มงาน กดปุ่มรูปตาเพื่อซ่อนคนที่เริ่มงานแล้วได้ ข้อมูลยังอยู่ครบ'],
      ['รู้หรือไม่', 'ระบบอบรมสร้าง QR ให้พนักงานเช็คอินเองได้ ไม่ต้องขานชื่อ'],
      ['รู้หรือไม่', 'ออกจากระบบจากหน้าไหนก็ได้ ระบบจะพากลับมาหน้าเข้าสู่ระบบอัตโนมัติ'],
      ['เคล็ดลับ', 'กดปุ่ม ? บนคีย์บอร์ด เพื่อดูคีย์ลัดของพอร์ทัล']
    ];
    var tipIdx = Math.floor(Math.random() * TIPS.length);
    function nextTip() { tipIdx = (tipIdx + 1) % TIPS.length; return TIPS[tipIdx]; }

    function specialDay() {
      var d = new Date(), m = d.getMonth() + 1, dd = d.getDate();
      if (m === 1 && dd <= 2) return ['สวัสดีปีใหม่ครับ 🎉', 'ขอให้ปีนี้เป็นปีที่ดีของทุกคนใน MASARU'];
      if (m === 4 && dd >= 13 && dd <= 15) return ['สุขสันต์วันสงกรานต์ 💦', 'ขอให้เดินทางปลอดภัย พักผ่อนเต็มที่นะครับ'];
      if (m === 12 && dd === 31) return ['วันสุดท้ายของปีแล้ว 🎊', 'ปิดงานให้เรียบร้อย แล้วพักยาวเลยครับ'];
      return null;
    }
    function dayVibe() {
      var w = new Date().getDay();
      if (w === 1) return 'วันจันทร์แล้ว เริ่มสัปดาห์ด้วยพลังเต็มร้อยครับ 💪';
      if (w === 5) return 'ศุกร์แล้ว! อีกนิดเดียวก็ได้พักแล้วครับ 🎈';
      if (w === 0 || w === 6) return 'วันหยุดยังทำงานอยู่เหรอครับ อย่าลืมพักบ้างนะ';
      return '';
    }

    function openingLine() {
      var sp = specialDay();
      if (sp) { confetti(); return sp; }
      var head = greeting() + (userName ? ' คุณ' + userName : '');
      var gap = daysAgo(lastSeen);
      if (st.visits === 1) return [head, 'ยินดีต้อนรับสู่ MASARU HR Portal ครับ — ชี้ที่การ์ดระบบเพื่อดูรายละเอียด'];
      if (gap !== null && gap >= 3) return [head, 'ไม่ได้เจอกัน ' + gap + ' วันเลยครับ ยินดีต้อนรับกลับมา'];
      var vibe = dayVibe();
      if (vibe) return [head, vibe];
      var t = topApp();
      if (t) return [head, 'ระบบที่คุณใช้บ่อยที่สุดคือ “' + (APP_NAME[t.url] || t.url) + '” (' + t.n + ' ครั้ง)'];
      return [head, info[1]];
    }

    var APP_NAME = {
      'recruitment.html': 'ระบบรับสมัครงาน',
      'deadline.html': 'ระบบประเมินทดลองงาน',
      'leave.html': 'ระบบใบลา',
      'training.html': 'ระบบฝึกอบรม',
      'exam.html': 'ระบบแบบทดสอบ',
      'hrtime.html': 'ระบบเวลาทำงาน',
      'chack.html': 'ระบบบันทึกการมาทำงาน',
      'dashboard.html': 'ผลแบบทดสอบผู้สมัคร'
    };

    /* ==========================================================
       C · คอนเฟตติ + โหมดปาร์ตี้
       ========================================================== */
    function confetti(n) {
      if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      var layer = document.createElement('div');
      layer.className = 'msr-confetti';
      layer.setAttribute('data-html2canvas-ignore', 'true');
      var colors = ['#e11d3f', '#ffd166', '#2e75b6', '#4be0a6', '#a97818', '#fff'];
      var frag = '';
      var count = n || 26;
      for (var i = 0; i < count; i++) {
        frag += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;'
              + 'background:' + colors[i % colors.length] + ';'
              + 'animation-duration:' + (2 + Math.random() * 1.6).toFixed(2) + 's;'
              + 'animation-delay:' + (Math.random() * .5).toFixed(2) + 's"></i>';
      }
      layer.innerHTML = frag;
      document.body.appendChild(layer);
      window.setTimeout(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, 4200);
    }
    function party(msg) {
      mascot.classList.add('is-party');
      confetti(40);
      say('โหมดพิเศษ! 🎉', msg || 'เจอโหมดลับแล้ว เก่งมากครับ', 5000);
      window.setTimeout(function () { mascot.classList.remove('is-party'); }, 6000);
    }

    /* คลิกรัว 5 ครั้งใน 2 วินาที */
    var clickTimes = [];
    function comboClick() {
      var now = Date.now();
      clickTimes.push(now);
      clickTimes = clickTimes.filter(function (t) { return now - t < 2000; });
      if (clickTimes.length >= 5) { clickTimes = []; party('คลิกรัวขนาดนี้ ต้องขยันมากแน่ ๆ เลยครับ'); return true; }
      return false;
    }

    /* Konami code */
    (function konami() {
      var seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
      var pos = 0;
      window.addEventListener('keydown', function (e) {
        if (isTyping()) return;
        var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        pos = (k === seq[pos]) ? pos + 1 : (k === seq[0] ? 1 : 0);
        if (pos === seq.length) { pos = 0; mascot.classList.remove('is-quiet'); party('รหัสลับ Konami! เหนือกว่า ทุกวัน 🚀'); }
      });
    })();

    /* ==========================================================
       C · ลากย้ายตำแหน่ง (จำไว้ในเครื่อง)
       ========================================================== */
    var POS_KEY = 'msr_mascot_pos';
    (function applyPos() {
      try {
        var p = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
        if (p && isFinite(p.r) && isFinite(p.b)) {
          mascot.style.right = Math.max(4, p.r) + 'px';
          mascot.style.bottom = Math.max(4, p.b) + 'px';
        }
      } catch (e) {}
    })();

    (function dragging() {
      var sx = 0, sy = 0, sr = 0, sbm = 0, moved = false, active = false;
      body.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        active = true; moved = false;
        sx = e.clientX; sy = e.clientY;
        var cs = getComputedStyle(mascot);
        sr = parseFloat(cs.right) || 0; sbm = parseFloat(cs.bottom) || 0;
        try { body.setPointerCapture(e.pointerId); } catch (err) {}
      });
      body.addEventListener('pointermove', function (e) {
        if (!active) return;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
        moved = true;
        mascot.classList.add('is-dragging');
        mascot.style.right = Math.min(window.innerWidth - 60, Math.max(4, sr - dx)) + 'px';
        mascot.style.bottom = Math.min(window.innerHeight - 60, Math.max(4, sbm - dy)) + 'px';
      });
      function endDrag(e) {
        if (!active) return;
        active = false;
        mascot.classList.remove('is-dragging');
        try { body.releasePointerCapture(e.pointerId); } catch (err) {}
        if (moved) {
          var cs = getComputedStyle(mascot);
          try { localStorage.setItem(POS_KEY, JSON.stringify({ r: parseFloat(cs.right) || 26, b: parseFloat(cs.bottom) || 20 })); } catch (err) {}
          say('ย้ายที่แล้วครับ', 'จำตำแหน่งนี้ไว้ให้เลย — ลากย้ายได้ตลอดเวลานะครับ', 3200);
        }
        mascot.dataset.moved = moved ? '1' : '';
      }
      body.addEventListener('pointerup', endDrag);
      body.addEventListener('pointercancel', endDrag);
    })();

    /* ==========================================================
       D · คีย์ลัด — กด ?
       ========================================================== */
    window.addEventListener('keydown', function (e) {
      if (isTyping()) return;
      if (e.key !== '?' && !(e.key === '/' && e.shiftKey)) return;
      mascot.classList.remove('is-quiet');
      say('คีย์ลัดของพอร์ทัล', '? = ดูคีย์ลัด · คลิกตัวผมเพื่อดูทิป · ลากตัวผมย้ายที่ได้ · ลองพิมพ์ ↑↑↓↓←→←→BA ดูสิครับ', 9000);
    });

    /* ==========================================================
       B · สรุปงานจริงจาก Supabase (อ่านอย่างเดียว)
       ========================================================== */
    var alerts = [];
    function addTileBadge(url, text) {
      var tile = document.querySelector('.app-tile[data-url="' + url + '"]');
      if (!tile || tile.querySelector('.msr-tile-badge')) return;
      var b = document.createElement('span');
      b.className = 'msr-tile-badge';
      b.setAttribute('data-html2canvas-ignore', 'true');
      b.innerHTML = '<i class="ti ti-bell-ringing"></i>' + text;
      tile.appendChild(b);
    }

    function loadWorkSummary() {
      var client = (typeof sb !== 'undefined' && sb) ? sb : null;
      if (!client || !client.from) return;
      var t = new Date(), iso = function (d) { return d.toISOString().slice(0, 10); };
      var todayS = iso(t);
      var week = new Date(t.getTime() + 7 * 86400000); var weekS = iso(week);

      // 1) สัมภาษณ์วันนี้ + เริ่มงานใน 7 วัน
      client.from('applicants').select('int_date,offer_start').then(function (r) {
        var rows = (r && r.data) || [];
        var intToday = rows.filter(function (x) { return x.int_date === todayS; }).length;
        var starting = rows.filter(function (x) { return x.offer_start && x.offer_start >= todayS && x.offer_start <= weekS; }).length;
        if (intToday) { alerts.push('วันนี้มีสัมภาษณ์ ' + intToday + ' คน'); addTileBadge('recruitment.html', 'สัมภาษณ์วันนี้ ' + intToday); }
        else if (starting) { alerts.push(starting + ' คนจะเริ่มงานภายใน 7 วัน'); addTileBadge('recruitment.html', 'เริ่มงานเร็ว ๆ นี้ ' + starting); }
        announce();
      }).catch(function () {});

      // 2) ใกล้ครบทดลองงานใน 7 วัน
      client.from('hr_deadlines').select('due_date').then(function (r) {
        var rows = (r && r.data) || [];
        var n = rows.filter(function (x) { return x.due_date && x.due_date >= todayS && x.due_date <= weekS; }).length;
        if (n) { alerts.push(n + ' คนใกล้ครบทดลองงานใน 7 วัน'); addTileBadge('deadline.html', 'ครบกำหนด ' + n); }
        announce();
      }).catch(function () {});

      // 3) ใบลารออนุมัติ
      client.from('leave_requests').select('status').eq('status', 'pending').then(function (r) {
        var n = ((r && r.data) || []).length;
        if (n) { alerts.push('ใบลารออนุมัติ ' + n + ' ใบ'); addTileBadge('leave.html', 'รออนุมัติ ' + n); }
        announce();
      }).catch(function () {});
    }

    var announced = false, announceT = 0;
    function announce() {
      window.clearTimeout(announceT);
      announceT = window.setTimeout(function () {
        if (announced || !alerts.length) return;
        if (!mascot.classList.contains('is-visible')) return;
        announced = true;
        mood('alert', 2600);
        say('สรุปงานวันนี้', alerts.join(' · '), 9000);
      }, 900);
    }

    /* ---------- เรียกใช้จากคอนโซลได้ ---------- */
    window.msrMascot = { say: say, party: party, confetti: confetti, stats: stats };
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
