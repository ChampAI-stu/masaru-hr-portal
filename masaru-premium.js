(() => {
  "use strict";

  const page = (location.pathname.split("/").pop() || "index.html").replace(".html", "");
  document.documentElement.classList.add("premium-ui");
  document.body.dataset.premiumPage = page;

  const atmosphere = document.createElement("div");
  atmosphere.className = "premium-atmosphere";
  atmosphere.setAttribute("aria-hidden", "true");
  atmosphere.innerHTML = '<span class="premium-orb one"></span><span class="premium-orb two"></span><span class="premium-orb three"></span>';
  document.body.prepend(atmosphere);

  const corner = document.createElement("div");
  corner.className = "premium-corner-mark";
  corner.setAttribute("aria-hidden", "true");
  corner.textContent = "MASARU  /  PEOPLE OS";
  document.body.appendChild(corner);

  const scene = document.createElement("section");
  scene.className = "premium-auth-scene";
  scene.setAttribute("aria-hidden", "true");
  scene.innerHTML = `
    <div class="premium-auth-rings"></div>
    <div class="premium-auth-kicker">MASARU PEOPLE OPERATIONS</div>
    <h1>People.<span>Elevated.</span></h1>
    <p>ระบบบริหารบุคลากรที่เชื่อมทุกช่วงเวลาสำคัญ ตั้งแต่วันแรกของการสมัคร จนถึงการเติบโตของทุกคนในองค์กร</p>
    <div class="premium-auth-metrics">
      <div class="premium-auth-metric"><b>ONE</b><span>UNIFIED PORTAL</span></div>
      <div class="premium-auth-metric"><b>LIVE</b><span>CONNECTED DATA</span></div>
      <div class="premium-auth-metric"><b>360°</b><span>PEOPLE VIEW</span></div>
    </div>`;
  const sceneHost = document.querySelector("#authScreen, #authGate, #login-overlay, #login") || document.body;
  sceneHost.appendChild(scene);

  const authSelectors = ["#authScreen", "#authGate", "#login-overlay", "#login"];
  const isVisible = el => {
    if (!el || el.classList.contains("hide")) return false;
    const style = getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) !== 0;
  };
  const syncAuthState = () => {
    const active = authSelectors.some(selector => isVisible(document.querySelector(selector)));
    document.body.classList.toggle("premium-auth-active", active);
  };

  const labels = {
    index: "EXECUTIVE PEOPLE PORTAL",
    dashboard: "TALENT INSIGHT CENTER",
    deadline: "PROBATION & DEADLINE CONTROL",
    exam: "KNOWLEDGE & ASSESSMENT CENTER",
    hrtime: "WORKFORCE TIME INTELLIGENCE",
    leave: "LEAVE & ATTENDANCE WORKFLOW",
    recruitment: "TALENT ACQUISITION COMMAND",
    training: "LEARNING & DEVELOPMENT CENTER",
    chack: "DAILY WORKFORCE OPERATIONS"
  };
  const eyebrow = labels[page] || "MASARU PEOPLE OPERATIONS";
  document.querySelectorAll(".page-title, .hub-title, .rep-title").forEach(el => {
    el.dataset.premiumEyebrow = eyebrow;
  });

  const reveal = () => {
    const selectors = ".app-tile, .kpi, .card, .panel, .scard, .course-card, .day-card, .stat";
    document.querySelectorAll(selectors).forEach((el, index) => {
      if (el.classList.contains("premium-reveal")) return;
      el.classList.add("premium-reveal");
      el.style.setProperty("--premium-delay", `${Math.min(index, 10) * 42}ms`);
    });
  };

  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      syncAuthState();
      reveal();
      document.documentElement.classList.add("premium-ui-ready");
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"] });
  window.addEventListener("pageshow", schedule);
  window.addEventListener("resize", schedule, { passive: true });

  if (matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    window.addEventListener("pointermove", event => {
      const x = (event.clientX / innerWidth - .5);
      const y = (event.clientY / innerHeight - .5);
      atmosphere.style.setProperty("transform", `translate3d(${x * -6}px, ${y * -6}px, 0)`);
    }, { passive: true });
  }

  schedule();
})();
