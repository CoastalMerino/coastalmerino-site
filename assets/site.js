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

  /* Product gallery dots (mobile carousel) */
  var gallery = document.querySelector(".gallery");
  var dots = document.querySelector(".gallery-dots");
  if (gallery && dots) {
    var slides = gallery.querySelectorAll(".photo");
    Array.prototype.forEach.call(slides, function (s, i) {
      var d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", "Show image " + (i + 1) + " of " + slides.length);
      d.addEventListener("click", function () {
        gallery.scrollTo({ left: s.offsetLeft - gallery.offsetLeft, behavior: "smooth" });
      });
      dots.appendChild(d);
    });
    var setActive = function () {
      var i = Math.round(gallery.scrollLeft / Math.max(1, gallery.clientWidth));
      Array.prototype.forEach.call(dots.children, function (d, j) {
        d.setAttribute("aria-current", String(i === j));
      });
    };
    gallery.addEventListener("scroll", function () { window.requestAnimationFrame(setActive); }, { passive: true });
    setActive();
  }

  /* Product page: focus the email field when "Get first access" is pressed */
  var focusBtn = document.querySelector("[data-focus-email]");
  if (focusBtn) {
    focusBtn.addEventListener("click", function () {
      var f = document.getElementById(focusBtn.getAttribute("data-focus-email"));
      if (f) { f.hidden = false; focusBtn.hidden = true; f.querySelector("input[type=email]").focus(); }
    });
  }
})();
