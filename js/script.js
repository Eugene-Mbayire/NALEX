/* =========================================================
   NALEX — Car Rental & Tours
   Vanilla JS: nav, scroll reveal, driver modal, gallery
   lightbox, and the booking/request form.
   ========================================================= */
(function () {
  "use strict";

  var qs = function (s, ctx) { return (ctx || document).querySelector(s); };
  var qsa = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ---------- Footer year ---------- */
  var yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero image carousel: auto-fades, no user interaction needed ---------- */
  var heroSlides = qsa(".hero-slide");
  if (heroSlides.length > 1) {
    var heroIndex = heroSlides.findIndex(function (el) { return el.classList.contains("is-active"); });
    if (heroIndex < 0) heroIndex = 0;
    var HERO_INTERVAL = 6000;
    var heroTimer = null;

    var advanceHero = function () {
      var next = (heroIndex + 1) % heroSlides.length;
      heroSlides[heroIndex].classList.remove("is-active");
      heroSlides[next].classList.add("is-active");
      heroIndex = next;
    };

    var startHero = function () {
      if (heroTimer) return;
      heroTimer = setInterval(advanceHero, HERO_INTERVAL);
    };
    var stopHero = function () {
      clearInterval(heroTimer);
      heroTimer = null;
    };

    // Respect reduced-motion preference: show the first image, no auto-play.
    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) startHero();

    // Pause while the tab is hidden — no point animating (or burning battery)
    // on a page nobody is looking at; resume when it's visible again.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopHero();
      else if (!prefersReducedMotion) startHero();
    });
  }

  /* ---------- Header scroll state + back-to-top visibility ---------- */
  var header = qs("#site-header");
  var backToTop = qs("#back-to-top");
  var onScroll = function () {
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");

    if (backToTop) {
      if (window.scrollY > window.innerHeight * 0.6) backToTop.classList.add("is-visible");
      else backToTop.classList.remove("is-visible");
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Back to top ---------- */
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
      var heading = qs("#page-top");
      if (heading) setTimeout(function () { heading.focus({ preventScroll: true }); }, 500);
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  var toggle = qs("#nav-toggle");
  var nav = qs("#main-nav");
  var closeNav = function () {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  qsa(".nav-link", nav).forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = qsa(".nav-link");
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Scroll-reveal animations ---------- */
  var revealEls = qsa(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Service CTA -> pre-fill booking form ---------- */
  var serviceSelect = qs("#f-service");
  var messageField = qs("#f-message");
  var nameField = qs("#f-name");

  qsa("[data-service]").forEach(function (el) {
    el.addEventListener("click", function () {
      var service = el.getAttribute("data-service");
      var message = el.getAttribute("data-message");
      if (serviceSelect && service) {
        setTimeout(function () {
          serviceSelect.value = service;
        }, 350);
      }
      if (messageField && message) {
        setTimeout(function () {
          messageField.value = message;
        }, 350);
      }
    });
  });

  /* ---------- Booking form ---------- */
  var form = qs("#booking-form");
  var successBox = qs("#form-success");

  var WHATSAPP_NUMBER = "250788206126";

  function buildWhatsAppMessage(data) {
    var lines = [
      "Hello NALEX, I'd like to make a request:",
      "Name: " + data.name,
      "Phone: " + data.phone,
      "Email: " + data.email
    ];
    if (data.country) lines.push("Country: " + data.country);
    if (data.service) lines.push("Service: " + data.service);
    if (data.travellers) lines.push("Travellers: " + data.travellers);
    if (data.pickup) lines.push("Pickup: " + data.pickup);
    if (data.destination) lines.push("Destination: " + data.destination);
    if (data.start) lines.push("Start date: " + data.start);
    if (data.end) lines.push("End date: " + data.end);
    if (data.guide) lines.push("Preferred driver-guide: " + data.guide);
    if (data.message) lines.push("Message: " + data.message);
    return lines.join("\n");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = {
        name: nameField.value.trim(),
        phone: qs("#f-phone").value.trim(),
        email: qs("#f-email").value.trim(),
        country: qs("#f-country").value.trim(),
        service: serviceSelect.value,
        travellers: qs("#f-travellers").value.trim(),
        pickup: qs("#f-pickup").value.trim(),
        destination: qs("#f-destination").value.trim(),
        start: qs("#f-start").value,
        end: qs("#f-end").value,
        guide: qs("#f-guide").value,
        message: messageField.value.trim()
      };

      var text = encodeURIComponent(buildWhatsAppMessage(data));
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;

      if (successBox) {
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      window.open(url, "_blank", "noopener");
      form.reset();
    });
  }

  /* ---------- Driver-guide data & modal ---------- */
  var GUIDES = {
    eugene: {
      name: "Eugene MBAYIRE",
      role: "Driver-Guide",
      photo: "assets/images/eugene-profile.jpg",
      bio: "Eugene MBAYIRE is a professional driver and driver-guide focused on safe, reliable and customer-centred transportation. He combines defensive driving, route planning, customer service and local travel support to help clients enjoy smooth and comfortable journeys — with experience across corporate fleets, tourism and logistics.",
      facts: [
        "Languages: Kinyarwanda &amp; English (fluent), French (fluent), Swahili (intermediate)",
        "Background across corporate fleet, tourism and logistics driving",
        "Personal portfolio documents experience, licenses and certifications"
      ],
      links: {
        linkedin: "https://www.linkedin.com/in/eugene-mbayire-18891b34b",
        portfolio: "https://eugene-mbayire.github.io/my_portfolio_as_driver/"
      }
    },
    bryan: {
      name: "Bryan MPAMBARA",
      role: "CEO",
      photo: "assets/images/bryan-profile.jpg",
      bio: "Bryan MPAMBARA is a NALEX CEO and driver-guide dedicated to helping travellers enjoy safe, comfortable and memorable journeys. As a guide, he supports customers throughout their travel experience while providing dependable transportation and personal service.",
      facts: [
        "Position: CEO & Driver-Guide, NALEX Car Rental &amp; Tours",
        "Direct contact for bookings and journey planning"
      ],
      phone: "0788206126",
      email: "mpambarabryan@gmail.com"
    }
  };

  var guideBackdrop = qs("#guide-modal-backdrop");
  var guideModal = qs("#guide-modal");
  var guideImg = qs("#guide-modal-img");
  var guideRole = qs("#guide-modal-role");
  var guideName = qs("#guide-modal-name");
  var guideBio = qs("#guide-modal-bio");
  var guideFacts = qs("#guide-modal-facts");
  var guideActions = qs("#guide-modal-actions");
  var lastFocused = null;

  function openBackdrop(backdrop) {
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    requestAnimationFrame(function () { backdrop.classList.add("is-visible"); });
    document.body.style.overflow = "hidden";
  }
  function closeBackdrop(backdrop) {
    backdrop.classList.remove("is-visible");
    document.body.style.overflow = "";
    setTimeout(function () {
      backdrop.hidden = true;
      if (lastFocused) lastFocused.focus();
    }, 300);
  }

  function openGuide(key) {
    var g = GUIDES[key];
    if (!g) return;
    guideImg.src = g.photo;
    guideImg.alt = g.name + ", NALEX driver-guide";
    guideRole.textContent = g.role;
    guideName.textContent = g.name;
    guideBio.textContent = g.bio;
    guideFacts.innerHTML = g.facts.map(function (f) { return "<li>" + f + "</li>"; }).join("");

    var actions = [];
    if (g.links && g.links.portfolio) {
      actions.push('<a class="btn btn-navy" href="' + g.links.portfolio + '" target="_blank" rel="noopener"><svg class="icon" aria-hidden="true"><use href="#i-link"/></svg>View Portfolio</a>');
    }
    if (g.links && g.links.linkedin) {
      actions.push('<a class="btn btn-outline-light" style="border-color:#173a66;color:#173a66" href="' + g.links.linkedin + '" target="_blank" rel="noopener"><svg class="icon" aria-hidden="true"><use href="#i-linkedin"/></svg>LinkedIn</a>');
    }
    if (g.phone) {
      actions.push('<a class="btn btn-navy" href="tel:+25' + g.phone + '"><svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg>Call</a>');
      actions.push('<a class="btn btn-outline-light" style="border-color:#128C7E;color:#128C7E" href="https://wa.me/25' + g.phone + '" target="_blank" rel="noopener"><svg class="icon" aria-hidden="true"><use href="#i-whatsapp"/></svg>WhatsApp</a>');
    }
    if (g.email) {
      actions.push('<a class="btn btn-outline-light" style="border-color:#a97f34;color:#a97f34" href="mailto:' + g.email + '"><svg class="icon" aria-hidden="true"><use href="#i-mail"/></svg>Email</a>');
    }
    actions.push('<a class="btn btn-gold" href="#contact" data-service="Driver-Guide" data-guide-name="' + g.name + '">Book with ' + g.name.split(" ")[0] + "</a>");
    guideActions.innerHTML = actions.join("");

    var bookBtn = qs('[data-guide-name]', guideActions);
    if (bookBtn) {
      bookBtn.addEventListener("click", function (e) {
        // Handle navigation ourselves: a plain href="#contact" click is a
        // no-op in most browsers when the URL hash is already "#contact"
        // (e.g. after using the header's "Book Now" link), which made this
        // button look broken. Always force the scroll instead.
        e.preventDefault();
        closeBackdrop(guideBackdrop);
        setTimeout(function () {
          if (serviceSelect) serviceSelect.value = "Driver-Guide";
          var guideSelect = qs("#f-guide");
          if (guideSelect) guideSelect.value = g.name;
          var contactSection = document.getElementById("contact");
          if (contactSection) contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
          if (window.history && window.history.pushState) window.history.pushState(null, "", "#contact");
        }, 320);
      });
    }

    openBackdrop(guideBackdrop);
  }

  qsa("[data-guide]").forEach(function (card) {
    card.addEventListener("click", function () { openGuide(card.getAttribute("data-guide")); });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openGuide(card.getAttribute("data-guide"));
      }
    });
  });

  qs("#guide-modal-close").addEventListener("click", function () { closeBackdrop(guideBackdrop); });
  guideBackdrop.addEventListener("click", function (e) {
    if (e.target === guideBackdrop) closeBackdrop(guideBackdrop);
  });

  /* ---------- Gallery lightbox ---------- */
  var lightboxBackdrop = qs("#lightbox-backdrop");
  var lightboxImg = qs("#lightbox-img");

  qsa(".gallery-item[data-full]").forEach(function (item) {
    var open = function () {
      lightboxImg.src = item.getAttribute("data-full");
      lightboxImg.alt = item.querySelector("img") ? item.querySelector("img").alt : "";
      openBackdrop(lightboxBackdrop);
    };
    item.addEventListener("click", open);
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
  qs("#lightbox-close").addEventListener("click", function () { closeBackdrop(lightboxBackdrop); });
  lightboxBackdrop.addEventListener("click", function (e) {
    if (e.target === lightboxBackdrop) closeBackdrop(lightboxBackdrop);
  });

  /* ---------- Shared Escape-to-close ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!guideBackdrop.hidden) closeBackdrop(guideBackdrop);
    if (!lightboxBackdrop.hidden) closeBackdrop(lightboxBackdrop);
  });
})();
