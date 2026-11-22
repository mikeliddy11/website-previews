(function () {
  "use strict";
  var HOOK = "https://website-leads-hq.base44.app/api/quote";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------- estimate form (2 steps) ---------- */
  var form = $("#estform"), box = $("#estimate");
  function smsLink(body) {
    var ios = /iP(hone|ad|od)/.test(navigator.userAgent);
    return "sms:" + form.dataset.sms + (ios ? "&" : "?") + "body=" + encodeURIComponent(body);
  }
  function setErr(el, msg) {
    var wrap = el.closest(".field"), p = wrap && wrap.querySelector(".err");
    if (msg) { el.setAttribute("aria-invalid", "true"); if (p) { p.textContent = msg; p.hidden = false; } }
    else { el.removeAttribute("aria-invalid"); if (p) { p.hidden = true; p.textContent = ""; } }
  }
  function goStep(n) {
    $$("[data-step]", form).forEach(function (s) { s.hidden = s.dataset.step !== String(n); });
    $$(".steps span", box).forEach(function (s, i) { s.className = i < n ? "on" : ""; });
    var first = $('[data-step="' + n + '"] input, [data-step="' + n + '"] select', form);
    if (first) try { first.focus({ preventScroll: true }); } catch (x) { first.focus(); }
  }
  function digitsOf(p) { var d = (p || "").replace(/\D/g, ""); if (d.length === 11 && d[0] === "1") d = d.slice(1); return d; }
  function focusName() {
    if (!box) return;
    box.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    var i = $("#e-name");
    if (i) setTimeout(function () { try { i.focus({ preventScroll: true }); } catch (x) { i.focus(); } }, reduce ? 0 : 450);
  }
  $$("[data-est]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      if (!form) return;
      ev.preventDefault();
      var svc = a.dataset.svc;
      if (svc) { var r = $$('input[name="service"]', form).filter(function (x) { return x.value === svc; })[0]; if (r) r.checked = true; }
      if ($('[data-step="1"]', form).hidden) goStep(1);
      focusName();
    });
  });
  if (form) {
    var back = $(".back", form);
    if (back) back.addEventListener("click", function () { goStep(1); });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var step = $('[data-step="1"]', form).hidden ? 2 : 1;
      var name = form.name.value.trim(), phone = form.phone.value.trim(), d = digitsOf(phone);
      if (step === 1) {
        var bad = null;
        setErr(form.name, name ? "" : "Please add your name.");
        if (!name) bad = form.name;
        var ok = d.length === 10;
        setErr(form.phone, ok ? "" : "Please enter a 10-digit phone number so Mike can call you back.");
        if (!ok && !bad) bad = form.phone;
        var svcSet = $('input[name="service"]:checked', form);
        var fs = $("fieldset.field", form), pe = fs.querySelector(".err");
        if (!svcSet) { pe.textContent = "Pick the closest match. You can add details next."; pe.hidden = false; if (!bad) bad = $('input[name="service"]', form); }
        else pe.hidden = true;
        if (bad) { bad.focus(); return; }
        goStep(2);
        return;
      }
      var email = form.email.value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr(form.email, "That email doesn't look right. Leave it blank if you prefer."); form.email.focus(); return; }
      setErr(form.email, "");
      var p = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
      var svc = $('input[name="service"]:checked', form).value;
      var details = [form.details.value.trim(), "Property: " + form.property.value, email ? "Email: " + email : ""].filter(Boolean).join("\n");
      var rec = { site: form.dataset.site, business: form.dataset.biz, name: name, phone: p, email: email, service: svc, city: form.city.value, details: details, page: location.href, status: "new", website: form.website.value || "" };
      if (window.CPW_QC) rec.qc = true;
      var text = "Estimate request for " + form.dataset.biz + "\nName: " + name + "\nPhone: " + p + "\nService: " + svc + "\nTown: " + rec.city + "\n" + details;
      var btn = $('[data-step="2"] button[type=submit]', form);
      if (btn.disabled) return; // no double submits
      btn.disabled = true; btn.style.opacity = 0.7;
      function post() {
        return fetch(HOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) })
          .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r; });
      }
      var done = $(".done", box);
      var safe = function (s) { return String(s).replace(/[<>&"]/g, ""); };
      post().catch(function () { return new Promise(function (r) { setTimeout(r, 1500); }).then(post); })
        .then(function () {
          form.hidden = true; $(".steps", box).hidden = true;
          done.innerHTML = '<h3 class="disp h-md">Got it, ' + safe(name.split(" ")[0]) + ".</h3><p>Your request is in. Mike will call or text you at <b>" + safe(p) + "</b>.</p><p>Have photos of the area? <a href=\"" + smsLink(text) + "\">Text them to Mike</a>; they help him price it.</p>";
          done.hidden = false; done.focus();
        })
        .catch(function () {
          done.innerHTML = "<p>Opening a text to Mike with your details. If nothing opens, call or text <b>" + form.dataset.phone + "</b>.</p>";
          done.hidden = false; location.href = smsLink(text);
        })
        .then(function () { btn.disabled = false; btn.style.opacity = 1; });
    });
  }

  /* ---------- before/after slider ---------- */
  $$(".ba").forEach(function (ba) {
    var r = $("input[type=range]", ba);
    var set = function (v) { ba.style.setProperty("--x", v + "%"); };
    r.addEventListener("input", function () { set(r.value); });
    set(r.value);
  });

  /* ---------- lightbox ---------- */
  var dlg = $("dialog.lb"), P = window.CPW_PHOTOS || {}, list = [], at = 0;
  function show(k) {
    at = (k + list.length) % list.length;
    var p = P[list[at]]; if (!p) return;
    var im = $("img", dlg); im.src = p.src; im.alt = p.alt;
    $(".c", dlg).textContent = p.cap; $(".cr", dlg).textContent = p.credit;
    $(".count", dlg).textContent = (at + 1) + " / " + list.length;
    var multi = list.length > 1; $(".prev", dlg).hidden = !multi; $(".next", dlg).hidden = !multi;
  }
  if (dlg && dlg.showModal) {
    document.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-lb]"); if (!b) return;
      if (b.dataset.set) list = b.dataset.set.split(",");
      else if (b.closest(".gal")) list = $$(".gal [data-lb]").filter(function (x) { return !x.hidden; }).map(function (x) { return x.dataset.lb; });
      else list = [b.dataset.lb];
      show(Math.max(0, list.indexOf(b.dataset.lb)));
      dlg.showModal();
    });
    $(".x", dlg).addEventListener("click", function () { dlg.close(); });
    $(".prev", dlg).addEventListener("click", function () { show(at - 1); });
    $(".next", dlg).addEventListener("click", function () { show(at + 1); });
    dlg.addEventListener("keydown", function (ev) { if (ev.key === "ArrowLeft") show(at - 1); if (ev.key === "ArrowRight") show(at + 1); });
    dlg.addEventListener("click", function (ev) { if (ev.target === dlg) dlg.close(); });
  }

  /* ---------- gallery filters ---------- */
  $$(".filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".filters button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var f = b.dataset.f;
      $$(".gal [data-lb]").forEach(function (g) { g.hidden = !(f === "all" || g.dataset.cats.split(" ").indexOf(f) > -1); });
    });
  });

  /* ---------- reviews: filter + show more ---------- */
  var rvs = $$(".rv"), more = $("#rv-more"), countEl = $("#rv-count"), theme = "all", shown = 9;
  function renderRv() {
    var match = rvs.filter(function (r) { return theme === "all" || r.dataset.themes.split(" ").indexOf(theme) > -1; });
    rvs.forEach(function (r) { r.hidden = true; });
    match.slice(0, shown).forEach(function (r) { r.hidden = false; });
    var vis = Math.min(shown, match.length);
    if (more) more.hidden = vis >= match.length;
    if (countEl) countEl.textContent = "Showing " + (vis + (theme === "all" ? 3 : 0)) + " of " + (match.length + (theme === "all" ? 3 : 0)) + (theme === "all" ? " reviews, including the 3 above" : " more reviews that mention this");
  }
  $$(".rv-filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".rv-filters button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      theme = b.dataset.t; shown = 9; renderRv();
    });
  });
  if (more) more.addEventListener("click", function () { shown += 12; renderRv(); });
  if (rvs.length) renderRv();

  /* ---------- reveal ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    document.documentElement.classList.add("reveal-on");
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    $$("[data-reveal]").forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); else io.observe(el); });
  }
})();
