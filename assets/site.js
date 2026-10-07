/* Coastal Merino site script. Shared by every page. No external libraries. */
(function () {
  "use strict";

  var KIT_FORM_ID = "9974631";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* Email signup: any <form data-kit> posts to Kit. */
  Array.prototype.forEach.call(document.querySelectorAll("form[data-kit]"), function (form) {
    var note = document.getElementById(form.getAttribute("data-note"));
    var btn = form.querySelector("button[type=submit]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.email_address.value.trim();
      note.className = note.className.replace(/\s*ok\b/, "");

      if (form.company && form.company.value) return; /* honeypot */
      if (!EMAIL_RE.test(email)) {
        note.textContent = "Enter a valid email address.";
        return;
      }

      btn.disabled = true;
      note.textContent = "";

      var data = new FormData();
      data.append("email_address", email);

      fetch("https://app.kit.com/forms/" + KIT_FORM_ID + "/subscriptions", {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      })
        .then(function (r) { if (!r.ok) throw new Error(); })
        .then(function () {
          form.reset();
          note.className += " ok";
          note.textContent = "You're on the list.";
        })
        .catch(function () {
          note.textContent = "Something went wrong. Email us at hello@coastalmerino.com.";
        })
        .then(function () { btn.disabled = false; });
    });
  });

  /* Mobile menu */
  var menuBtn = document.querySelector(".menu-btn");
  var mobileNav = document.getElementById("mobile-nav");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      menuBtn.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Open menu");
        mobileNav.hidden = true;
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobileNav.hidden) {
        mobileNav.hidden = true;
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }
    });
  }

  /* Toggle groups (color swatches, sizes, unit toggle): one pressed at a time. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-toggle-group]"), function (group) {
    var out = document.getElementById(group.getAttribute("data-output"));
    group.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || !group.contains(b)) return;
      Array.prototype.forEach.call(group.querySelectorAll("button"), function (x) {
        x.setAttribute("aria-pressed", String(x === b));
      });
      if (out) out.textContent = b.getAttribute("data-value");
      group.dispatchEvent(new CustomEvent("change-option", { detail: b.getAttribute("data-value") }));
    });
  });

  /* Size guide units */
  var units = document.querySelector("[data-units]");
  if (units) {
    units.addEventListener("change-option", function (e) {
      var unit = e.detail;
      Array.prototype.forEach.call(document.querySelectorAll("[data-in]"), function (td) {
        var v = td.getAttribute(unit === "cm" ? "data-cm" : "data-in");
        if (v) td.textContent = v;
      });
    });
  }

  /* Product image viewer: arrows, counter, thumbnails, swipe */
  var slides = document.getElementById("slides");
  if (slides) {
    var items = slides.querySelectorAll(".photo");
    var count = document.getElementById("viewer-count");
    var thumbs = document.getElementById("thumbs");
    var prev = document.querySelector('.viewer-ctrls [data-dir="-1"]');
    var next = document.querySelector('.viewer-ctrls [data-dir="1"]');
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var current = function () { return Math.round(slides.scrollLeft / Math.max(1, slides.clientWidth)); };
    var go = function (i) {
      i = Math.max(0, Math.min(items.length - 1, i));
      slides.scrollTo({ left: i * slides.clientWidth, behavior: "smooth" });
    };
    Array.prototype.forEach.call(items, function (it, i) {
      if (!thumbs) return;
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show image " + (i + 1) + " of " + items.length);
      var img = it.querySelector("img");
      var t = document.createElement("img");
      t.src = img.currentSrc || img.src;
      t.alt = "";
      t.loading = "lazy";
      b.appendChild(t);
      b.addEventListener("click", function () { go(i); });
      thumbs.appendChild(b);
    });
    var update = function () {
      var i = current();
      if (count) count.textContent = pad(i + 1) + " / " + pad(items.length);
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === items.length - 1;
      if (thumbs) Array.prototype.forEach.call(thumbs.children, function (b, j) { b.setAttribute("aria-current", String(i === j)); });
    };
    if (prev) prev.addEventListener("click", function () { go(current() - 1); });
    if (next) next.addEventListener("click", function () { go(current() + 1); });
    slides.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(current() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(current() - 1); }
    });
    slides.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* Product page: sticky "Get first access" bar on phones once the form scrolls away */
  var buybar = document.getElementById("buybar");
  var cta = document.getElementById("pdp-cta");
  if (buybar && cta && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var hidden = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      buybar.classList.toggle("show", hidden);
      buybar.setAttribute("aria-hidden", String(!hidden));
      buybar.querySelector("a").tabIndex = hidden ? 0 : -1;
    }).observe(cta);
    buybar.querySelector("a").addEventListener("click", function () {
      setTimeout(function () { var f = document.getElementById("pdp-email"); if (f) f.focus({ preventScroll: true }); }, 400);
    });
  }
})();
