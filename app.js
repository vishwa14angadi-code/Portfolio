(function () {
  "use strict";

  /* ---------------- Theme handling ---------------- */
  var THEME_KEY = "portfolio-theme";
  var root = document.documentElement;
  var toggleBtn = document.getElementById("theme-toggle");
  var themeIcon = document.getElementById("theme-icon");
  var themeLabel = document.getElementById("theme-label");

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    var isDark =
      theme === "dark" ||
      (theme !== "light" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-pressed", String(isDark));
    }
    if (themeIcon) {
      themeIcon.textContent = isDark ? "☀️" : "🌙";
    }
    if (themeLabel) {
      themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
    }
  }

  var storedTheme = null;
  try {
    storedTheme = window.localStorage.getItem(THEME_KEY);
  } catch (e) {
    /* localStorage unavailable; ignore */
  }
  applyTheme(storedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var isDarkNow =
        current === "dark" ||
        (!current &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = isDarkNow ? "light" : "dark";
      applyTheme(next);
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* ignore */
      }
    });
  }

  /* ---------------- Helpers ---------------- */
  function el(tag, opts) {
    var node = document.createElement(tag);
    opts = opts || {};
    if (opts.className) node.className = opts.className;
    if (opts.text) node.textContent = opts.text;
    if (opts.html) node.innerHTML = opts.html;
    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (key) {
        node.setAttribute(key, opts.attrs[key]);
      });
    }
    return node;
  }

  function formatMonthYear(value) {
    if (!value) return "";
    var parts = value.split("-");
    var year = parseInt(parts[0], 10);
    var month = parts.length > 1 ? parseInt(parts[1], 10) : null;
    if (!year) return value;
    if (month) {
      var date = new Date(year, month - 1, 1);
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    return String(year);
  }

  function dateRange(start, end) {
    var startLabel = formatMonthYear(start);
    var endLabel = end ? formatMonthYear(end) : "Present";
    if (!startLabel) return "";
    return startLabel + " – " + endLabel;
  }

  function showSection(sectionId) {
    var section = document.getElementById(sectionId);
    if (section) section.hidden = false;
  }

  /* ---------------- Renderers ---------------- */
  function renderBasics(basics) {
    if (!basics) return;

    var nameEl = document.getElementById("basics-name");
    var labelEl = document.getElementById("basics-label");
    var contactList = document.getElementById("contact-list");

    if (basics.name) {
      nameEl.textContent = basics.name;
      document.title = basics.name + " — Portfolio";
    } else {
      nameEl.textContent = "Portfolio";
    }

    if (basics.label) {
      labelEl.textContent = basics.label;
    } else {
      labelEl.remove();
    }

    var items = [];

    if (basics.email) {
      items.push({
        html:
          '<a href="mailto:' +
          basics.email +
          '">' +
          basics.email +
          "</a>",
      });
    }

    if (basics.phone) {
      items.push({
        html:
          '<a href="tel:' +
          basics.phone.replace(/\s+/g, "") +
          '">' +
          basics.phone +
          "</a>",
      });
    }

    if (basics.location) {
      var loc = [basics.location.city, basics.location.countryCode]
        .filter(Boolean)
        .join(", ");
      if (loc) items.push({ text: loc });
    }

    if (basics.url) {
      items.push({
        html:
          '<a href="' +
          basics.url +
          '" target="_blank" rel="noopener noreferrer">Website</a>',
      });
    }

    if (Array.isArray(basics.profiles)) {
      basics.profiles.forEach(function (profile) {
        if (profile.url) {
          items.push({
            html:
              '<a href="' +
              profile.url +
              '" target="_blank" rel="noopener noreferrer">' +
              (profile.network || profile.username || "Profile") +
              "</a>",
          });
        }
      });
    }

    items.forEach(function (item) {
      var li = el("li");
      if (item.html) {
        li.innerHTML = item.html;
      } else {
        li.textContent = item.text;
      }
      contactList.appendChild(li);
    });

    if (!items.length) {
      contactList.remove();
    }
  }

  function renderExperience(work) {
    if (!Array.isArray(work) || !work.length) return;
    var list = document.getElementById("experience-list");

    work.forEach(function (job) {
      var item = el("article", { className: "timeline-item" });

      var titleParts = [job.position, job.name].filter(Boolean).join(" — ");
      if (titleParts) {
        item.appendChild(el("h3", { text: titleParts }));
      }

      var metaParts = [];
      var range = dateRange(job.startDate, job.endDate);
      if (range) metaParts.push(range);
      if (job.location) metaParts.push(job.location);
      if (metaParts.length) {
        item.appendChild(
          el("p", { className: "timeline-meta", text: metaParts.join(" · ") })
        );
      }

      if (job.summary) {
        item.appendChild(
          el("p", { className: "timeline-summary", text: job.summary })
        );
      }

      if (Array.isArray(job.highlights) && job.highlights.length) {
        var ul = el("ul");
        job.highlights.forEach(function (highlight) {
          ul.appendChild(el("li", { text: highlight }));
        });
        item.appendChild(ul);
      }

      list.appendChild(item);
    });

    showSection("experience-section");
  }

  function renderProjects(projects) {
    if (!Array.isArray(projects) || !projects.length) return;
    var list = document.getElementById("projects-list");

    projects.forEach(function (project) {
      var card = el("article", { className: "card" });

      if (project.name) {
        card.appendChild(el("h3", { text: project.name }));
      }

      if (project.description) {
        card.appendChild(el("p", { text: project.description }));
      }

      var links = [];
      if (project.url) {
        links.push(
          '<a href="' +
            project.url +
            '" target="_blank" rel="noopener noreferrer">View project</a>'
        );
      }
      if (Array.isArray(project.keywords) && project.keywords.length) {
        links.push(
          '<span>' + project.keywords.join(", ") + "</span>"
        );
      }
      if (links.length) {
        var linkWrap = el("div", { className: "card-links" });
        linkWrap.innerHTML = links.join("");
        card.appendChild(linkWrap);
      }

      list.appendChild(card);
    });

    showSection("projects-section");
  }

  function renderEducation(education) {
    if (!Array.isArray(education) || !education.length) return;
    var list = document.getElementById("education-list");

    education.forEach(function (edu) {
      var item = el("article", { className: "timeline-item" });

      var titleParts = [edu.studyType, edu.area].filter(Boolean).join(" in ");
      if (titleParts) {
        item.appendChild(el("h3", { text: titleParts }));
      }

      var metaParts = [];
      if (edu.institution) metaParts.push(edu.institution);
      var range = dateRange(edu.startDate, edu.endDate);
      if (range) metaParts.push(range);
      if (metaParts.length) {
        item.appendChild(
          el("p", { className: "timeline-meta", text: metaParts.join(" · ") })
        );
      }

      list.appendChild(item);
    });

    showSection("education-section");
  }

  function renderCertificates(certificates) {
    if (!Array.isArray(certificates) || !certificates.length) return;
    var list = document.getElementById("certificates-list");

    certificates.forEach(function (cert) {
      var li = el("li");
      if (cert.name) {
        li.appendChild(el("span", { className: "cert-name", text: cert.name }));
      }
      var metaParts = [];
      if (cert.issuer) metaParts.push(cert.issuer);
      if (cert.date) metaParts.push(formatMonthYear(cert.date));
      if (metaParts.length) {
        li.appendChild(
          el("span", { className: "cert-meta", text: metaParts.join(" · ") })
        );
      }
      list.appendChild(li);
    });

    showSection("certificates-section");
  }

  function renderSkills(skills) {
    if (!Array.isArray(skills) || !skills.length) return;
    var list = document.getElementById("skills-list");

    skills.forEach(function (skill) {
      var group = el("div", { className: "skill-group" });
      if (skill.name) {
        group.appendChild(el("h3", { text: skill.name }));
      }
      if (Array.isArray(skill.keywords) && skill.keywords.length) {
        var ul = el("ul", { className: "skill-tags" });
        skill.keywords.forEach(function (keyword) {
          ul.appendChild(el("li", { text: keyword }));
        });
        group.appendChild(ul);
      }
      list.appendChild(group);
    });

    showSection("skills-section");
  }

  function renderFooter(basics) {
    var yearEl = document.getElementById("footer-year");
    var footerText = document.getElementById("footer-text");
    var year = new Date().getFullYear();
    if (yearEl) yearEl.textContent = String(year);
    if (footerText && basics && basics.name) {
      footerText.append(" " + basics.name + ". All rights reserved.");
    }
  }

  function showLoadError() {
    var errorEl = document.getElementById("load-error");
    if (errorEl) errorEl.hidden = false;
    var nameEl = document.getElementById("basics-name");
    if (nameEl) nameEl.textContent = "Portfolio";
  }

  /* ---------------- Bootstrap ---------------- */
  fetch("resume.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Failed to load resume.json");
      return response.json();
    })
    .then(function (resume) {
      renderBasics(resume.basics);
      renderExperience(resume.work);
      renderProjects(resume.projects);
      renderEducation(resume.education);
      renderCertificates(resume.certificates);
      renderSkills(resume.skills);
      renderFooter(resume.basics);
    })
    .catch(function () {
      showLoadError();
    });
})();
