(function () {
  var cfg = window.HEARTWOOD_CONFIG || {};

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function phoneIsPlaceholder() {
    var value = String(cfg.phoneTel || cfg.phoneDisplay || "");
    return value.indexOf("TODO") !== -1 || value === "";
  }

  function formIsPlaceholder() {
    var value = String(cfg.formEndpoint || "");
    return value.indexOf("TODO") !== -1 || value === "";
  }

  function fillPhones() {
    var label = cfg.phoneDisplay || "Phone";
    var pending = phoneIsPlaceholder();
    document.querySelectorAll("[data-phone]").forEach(function (el) {
      el.textContent = label;
      if (el.tagName !== "A") return;
      if (pending) {
        el.removeAttribute("href");
        el.setAttribute("role", "text");
        el.setAttribute("aria-label", "Phone number not set yet. Placeholder " + label);
      } else {
        el.href = "tel:" + String(cfg.phoneTel).replace(/[^\d+]/g, "");
        el.removeAttribute("role");
        el.removeAttribute("aria-label");
      }
    });
  }

  function fillEmails() {
    if (!cfg.email) return;
    document.querySelectorAll("[data-email]").forEach(function (el) {
      el.textContent = cfg.email;
      if (el.tagName === "A") el.href = "mailto:" + cfg.email;
    });
  }

  function fillSchemaPhone() {
    var node = document.getElementById("business-schema");
    if (!node || phoneIsPlaceholder()) return;
    try {
      var data = JSON.parse(node.textContent);
      data.telephone = String(cfg.phoneTel).replace(/\s/g, "");
      node.textContent = JSON.stringify(data);
    } catch (err) {
      /* Leave the static schema if it cannot be parsed. */
    }
  }

  function fillPhotos() {
    document.querySelectorAll(".photo-slot[data-photo]").forEach(function (slot) {
      var src = slot.getAttribute("data-photo");
      var alt = slot.getAttribute("data-alt") || "";
      var caption = slot.getAttribute("data-caption") || alt;
      var img = new Image();
      img.alt = alt;
      img.decoding = "async";
      img.onload = function () {
        if (!img.naturalWidth) return;
        slot.classList.add("has-photo");
        var frame = slot.querySelector(".photo-frame");
        if (frame) frame.appendChild(img);
        var cap = slot.querySelector("figcaption");
        if (cap && caption) cap.textContent = caption;
      };
      img.src = src;
    });
  }

  function setupNav() {
    var button = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!button || !nav) return;
    var label = button.querySelector(".nav-toggle-label");

    function closeNav() {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      if (label) label.textContent = "Menu";
    }

    function openNav() {
      nav.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
      if (label) label.textContent = "Close";
    }

    button.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) closeNav();
      else openNav();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
        button.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 960px)").matches) closeNav();
    });
  }

  function applyEnquiryHash() {
    var select = document.getElementById("enquiry-type");
    if (!select) return;
    var map = { "#register": "register", "#callback": "callback", "#callup": "callup" };
    var value = map[window.location.hash];
    if (value) select.value = value;
  }

  function enquiryLabel(value) {
    if (value === "callback") return "Request a callback";
    if (value === "callup") return "Site call-up";
    return "Register Heartwood as a trade";
  }

  function setupForm() {
    var form = document.getElementById("enquiry-form");
    if (!form) return;
    var status = document.getElementById("form-status");
    var button = form.querySelector("[type='submit']");

    function say(message, state) {
      if (!status) return;
      status.textContent = message;
      if (state) status.setAttribute("data-state", state);
      else status.removeAttribute("data-state");
    }

    applyEnquiryHash();
    window.addEventListener("hashchange", applyEnquiryHash);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      if (String(data.get("_gotcha") || "").trim() !== "") {
        say("Thanks. We've got that and will be in touch.");
        form.reset();
        return;
      }

      var kind = enquiryLabel(String(data.get("enquiry") || "register"));
      if (button) button.disabled = true;

      if (formIsPlaceholder()) {
        var lines = [
          "Enquiry: " + kind,
          "Name: " + (data.get("name") || ""),
          "Company: " + (data.get("company") || ""),
          "Role: " + (data.get("role") || ""),
          "Phone: " + (data.get("phone") || ""),
          "Email: " + (data.get("email") || ""),
          "Site or estate: " + (data.get("site") || ""),
          "",
          String(data.get("message") || "")
        ];
        var subject = "Heartwood enquiry — " + kind;
        var href = "mailto:" + (cfg.email || "alex@heartwoodew.com")
          + "?subject=" + encodeURIComponent(subject)
          + "&body=" + encodeURIComponent(lines.join("\n"));
        window.location.href = href;
        say("Your email app should open with this enquiry. If it doesn't, write to " + (cfg.email || "alex@heartwoodew.com") + ".");
        if (button) button.disabled = false;
        return;
      }

      data.set("_subject", "Heartwood enquiry — " + kind);
      fetch(cfg.formEndpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      }).then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        form.hidden = true;
        var done = document.getElementById("form-success");
        if (done) {
          done.hidden = false;
          done.focus();
        }
      }).catch(function () {
        say("That didn't send. Email " + (cfg.email || "alex@heartwoodew.com") + " and it will get through.", "error");
        if (button) button.disabled = false;
      });
    });
  }

  ready(function () {
    fillPhones();
    fillEmails();
    fillSchemaPhone();
    fillPhotos();
    setupNav();
    setupForm();
  });
})();
