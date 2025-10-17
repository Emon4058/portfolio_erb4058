(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  // Theme toggle
  const savedTheme = localStorage.getItem("theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", initialTheme);
  updateThemeIcon();

  function updateThemeIcon() {
    themeToggle.innerHTML =
      root.getAttribute("data-theme") === "light"
        ? '<i class="fa-regular fa-moon"></i>'
        : '<i class="fa-regular fa-sun"></i>';
  }

  themeToggle.addEventListener("click", () => {
    const theme =
      root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    updateThemeIcon();
  });

  // Mobile nav
  navToggle.addEventListener("click", () => navMenu.classList.toggle("show"));

  // Load profile.json
  fetch("data/profile.json")
    .then((r) => r.json())
    .then((profile) => {
      document.querySelector('[data-bind="name"]').textContent = profile.name;
      document.querySelector('[data-bind="headline"]').textContent =
        profile.headline;
      // About summary: clamp + linkify company + Read more / Read less toggle
      const summaryEl = document.querySelector('[data-bind="summary"]');
      const readMore = document.getElementById("about-readmore");
      const readLess = document.getElementById("about-readless");
      const fullSummary = profile.summary || "";
      const companyUrl = profile.companyLink || "https://cyberneticsbd.com/";
      let isExpanded = false;

      // Render text with a hyperlink for "Cybernetics Hi‑Tech Solutions (Pvt.) Ltd."
      const variants = [
        "Cybernetics Hi-Tech Solutions (Pvt.) Ltd.",
        "Cybernetics Hi‑Tech Solutions (Pvt.) Ltd.", // NB hyphen
        "Cybernetics Hi–Tech Solutions (Pvt.) Ltd.", // en dash
        "Cybernetics Hi—Tech Solutions (Pvt.) Ltd.", // em dash
      ];

      function renderSummaryWithCompanyLink(target, text) {
        target.innerHTML = ""; // clear
        let hit = null,
          idx = -1;
        for (const v of variants) {
          idx = text.indexOf(v);
          if (idx !== -1) {
            hit = v;
            break;
          }
        }

        // append text preserving line breaks
        const appendTextWithBreaks = (parent, s) => {
          const parts = String(s || "").split(/\r?\n/g);
          parts.forEach((p, i) => {
            parent.appendChild(document.createTextNode(p));
            if (i < parts.length - 1) {
              parent.appendChild(document.createElement("br"));
              parent.appendChild(document.createElement("br"));
            }
          });
        };

        if (idx === -1) {
          appendTextWithBreaks(target, text);
          return;
        }

        appendTextWithBreaks(target, text.slice(0, idx));

        const a = document.createElement("a");
        a.href = companyUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Cybernetics Hi‑Tech Solutions (Pvt.) Ltd.";
        target.appendChild(a);

        appendTextWithBreaks(target, text.slice(idx + hit.length));
      }

      // Initial render (clamped)
      renderSummaryWithCompanyLink(summaryEl, fullSummary);
      summaryEl.classList.add("clamp");

      // Show Read more only if text is actually clamped and not expanded
      function updateToggleVisibility() {
        const isClamped = summaryEl.scrollHeight > summaryEl.clientHeight + 1;
        if (!isExpanded && isClamped) {
          if (readMore) readMore.style.display = "inline";
          if (readLess) readLess.style.display = "none";
        } else if (isExpanded) {
          if (readMore) readMore.style.display = "none";
          if (readLess) readLess.style.display = "inline";
        } else {
          if (readMore) readMore.style.display = "none";
          if (readLess) readLess.style.display = "none";
        }
      }
      updateToggleVisibility();
      window.addEventListener("resize", updateToggleVisibility);

      // Expand/collapse handlers
      function expandSummary() {
        isExpanded = true;
        summaryEl.classList.remove("clamp");
        updateToggleVisibility();
      }
      function collapseSummary() {
        isExpanded = false;
        summaryEl.classList.add("clamp");
        updateToggleVisibility();
      }

      readMore?.addEventListener("click", (e) => {
        e.preventDefault();
        expandSummary();
      });
      readLess?.addEventListener("click", (e) => {
        e.preventDefault();
        collapseSummary();
      });
      // Force collapsed on load/reload and when navigating away from About
      function ensureCollapsedOnInit() {
        collapseSummary(); // enforce collapsed state
      }
      window.addEventListener("pageshow", ensureCollapsedOnInit);
      ensureCollapsedOnInit();

      window.addEventListener("hashchange", () => {
        if (location.hash && location.hash.toLowerCase() !== "#about") {
          collapseSummary();
        }
      });

      navMenu?.addEventListener("click", (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const hash = (a.getAttribute("href") || "").toLowerCase();
        if (hash && hash !== "#about") {
          collapseSummary();
        }
      });
      document.addEventListener("click", (e) => {
        if (!isExpanded) return;
        const sec = e.target.closest("section");
        if (sec && sec.id && sec.id !== "about") {
          collapseSummary();
        }
      });
      document.getElementById("avatar").src = profile.avatar;

      // Skills
      const skillsGrid =
        document.getElementById("skills-grid") ||
        document.getElementById("skills-list");
      if (skillsGrid) {
        skillsGrid.innerHTML = "";

        let groups = [];
        if (
          Array.isArray(profile.skillsGrouped) &&
          profile.skillsGrouped.length
        ) {
          groups = profile.skillsGrouped;
        } else if (Array.isArray(profile.skills) && profile.skills.length) {
          groups = [{ category: "Skills", items: profile.skills }];
        }

        groups.forEach((g) => {
          const col = document.createElement("div");
          col.className = "skill-group";
          col.innerHTML = `
      <h3 class="skill-cat">${g.category}</h3>
      <ul class="skill-items">
        ${(g.items || []).map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `;
          skillsGrid.appendChild(col);
        });
      }

      // Projects
      const projectsGrid = document.getElementById("projects-grid");
      if (projectsGrid && Array.isArray(profile.projects)) {
        projectsGrid.innerHTML = "";

        profile.projects.forEach((p, idx) => {
          // Use custom page if provided, else dynamic page with index
          const href = p.url ? p.url : `assets/projects/project.html?i=${idx}`;

          const card = document.createElement("a");
          card.className = "card";
          card.href = href;

          card.innerHTML = `
      <img src="${p.image}" alt="${
            p.title || "Project"
          }" loading="lazy" decoding="async">
      <div class="card-body">
        <h3 class="card-title">${p.title || ""}</h3>
        <p class="card-text">${p.description || ""}</p>
        <div class="card-tags">${(p.tags || [])
          .map((t) => `<span>${t}</span>`)
          .join("")}</div>
        <span class="a-link" style="display:inline-block;margin-top:6px">View details</span>
      </div>
    `;
          projectsGrid.appendChild(card);
        });
      }

      // Experience — group by company and collapse roles with periods
      const expList = document.getElementById("experience-list");

      function formatPeriodCompact(period) {
        if (!period) return "";
        const parts = String(period).split("-");
        // YYYY-MM-Present
        if (
          parts.length === 3 &&
          String(parts[2]).toLowerCase() === "present"
        ) {
          return `${parts[0]}-${parts[1]} – Present`;
        }
        // YYYY-MM-YYYY2-MM2
        if (parts.length === 4) {
          return `${parts[0]}-${parts[1]} – ${parts[2]}-${parts[3]}`;
        }
        // Fallback
        return period;
      }

      // Merge entries by company + location; support arrays for position/period
      function normalizeExperience(list) {
        const map = new Map();
        (list || []).forEach((item) => {
          const key = `${item.company || ""}|${
            item.location || ""
          }`.toLowerCase();
          const entry = map.get(key) || {
            company: item.company || "",
            location: item.location || "",
            roles: [],
            highlights: item.highlights || [],
            tech: item.tech || [],
            description: item.description || "",
          };

          const posArr = Array.isArray(item.position)
            ? item.position
            : [item.position];
          const perArr = Array.isArray(item.period)
            ? item.period
            : [item.period];
          const len = Math.max(posArr.length, perArr.length);

          for (let i = 0; i < len; i++) {
            const pos = (posArr[i] ?? posArr[0] ?? "").trim();
            const per = (perArr[i] ?? perArr[0] ?? "").trim();
            if (pos || per) entry.roles.push({ position: pos, period: per });
          }

          // Prefer keeping any existing highlights/tech/description already captured
          if (!entry.highlights?.length && item.highlights?.length)
            entry.highlights = item.highlights;
          if (!entry.tech?.length && item.tech?.length) entry.tech = item.tech;
          if (!entry.description && item.description)
            entry.description = item.description;

          map.set(key, entry);
        });

        // Deduplicate identical role lines
        map.forEach((e) => {
          const seen = new Set();
          e.roles = e.roles.filter((r) => {
            const k = `${r.position}|${r.period}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        });

        return Array.from(map.values());
      }

      const grouped = normalizeExperience(profile.experience);

      // Render
      expList.innerHTML = "";
      grouped.forEach((e) => {
        const div = document.createElement("div");
        div.className = "experience-item";

        // Role lines (Position ..... Period)
        const rolesHtml = e.roles
          .map(
            (r) => `
    <div class="role-line">
      <span class="position">${r.position || ""}</span>
      <span class="dotline"></span>
      <span class="period">${formatPeriodCompact(r.period)}</span>
    </div>
  `
          )
          .join("");

        // Optional extras
        const highlightsHtml =
          Array.isArray(e.highlights) && e.highlights.length
            ? `<ul class="highlights">${e.highlights
                .map((h) => `<li>${h}</li>`)
                .join("")}</ul>`
            : e.description
            ? `<p>${e.description}</p>`
            : "";

        const techHtml =
          Array.isArray(e.tech) && e.tech.length
            ? `<p class="exp-tech"><strong>Technical Skills:</strong> ${e.tech.join(
                ", "
              )}</p>`
            : "";

        div.innerHTML = `
    <h4><span class="company">${e.company}</span>${
          e.location ? ` <span class="location">${e.location}</span>` : ""
        }</h4>
    ${rolesHtml}
    ${highlightsHtml}
    ${techHtml}
  `;
        expList.appendChild(div);
      });

      // Education (with location and highlights)

      const eduList = document.getElementById("education-list");

      function formatEduPeriod(period) {
        const parts = String(period || "").split("-");
        if (parts.length === 4) return `${parts[0]} – ${parts[2]}`; // YYYY-MM-YYYY2-MM2 -> YYYY – YYYY2
        if (parts.length === 2) return `${parts[0]} – ${parts[1]}`;
        return period || "";
      }

      profile.education.forEach((e) => {
        const div = document.createElement("div");
        div.className = "education-item";

        const highlightsHtml =
          Array.isArray(e.highlights) && e.highlights.length
            ? `<ul class="highlights">${e.highlights
                .map((h) => `<li>${h}</li>`)
                .join("")}</ul>`
            : "";

        div.innerHTML = `
    <h4><span class="institution">${e.institution}</span>${
          e.location ? ` <span class="location">${e.location}</span>` : ""
        }</h4>
    <div class="degree-line"><span class="degree">${
      e.degree || ""
    }</span> <span class="period">${formatEduPeriod(e.period)}</span></div>
    ${highlightsHtml}
  `;
        eduList.appendChild(div);
      });

      // Certifications
      const certList = document.getElementById("certifications-list");
      if (certList && Array.isArray(profile.certifications)) {
        certList.innerHTML = "";
        profile.certifications.forEach((c) => {
          const div = document.createElement("div");
          div.className = "cert-item";
          div.innerHTML = `
      <h4 class="cert-title">${c.title || ""}</h4>
      ${c.issuer ? `<div class="cert-issuer">${c.issuer}</div>` : ""}
      ${c.description ? `<p class="cert-desc">${c.description}</p>` : ""}
      ${
        c.link
          ? `<a class="a-link cert-link" href="${c.link}" target="_blank" rel="noopener noreferrer">View Certificate</a>`
          : ""
      }
    `;
          certList.appendChild(div);
        });
      }

      // Achievements (Title, Position, Year)
      const achievementsList = document.getElementById("achievements-list");
      if (achievementsList && Array.isArray(profile.achievements)) {
        achievementsList.innerHTML = "";

        const sorted = [...profile.achievements].sort((a, b) => {
          const ya = parseInt(
            String(a.year || "").match(/\d{4}/)?.[0] || "0",
            10
          );
          const yb = parseInt(
            String(b.year || "").match(/\d{4}/)?.[0] || "0",
            10
          );
          return yb - ya;
        });

        sorted.forEach((a) => {
          const div = document.createElement("div");
          div.className = "achievement-item";

          const positionBadge = a.position
            ? `<span class="ach-badge position">${a.position}</span>`
            : "";
          const yearBadge = a.year
            ? `<span class="ach-badge year">${a.year}</span>`
            : "";
          const orgHref = a.organizerUrl
            ? a.organizerUrl
            : a.organizer
            ? `https://www.google.com/search?q=${encodeURIComponent(
                a.organizer
              )}`
            : null;

          const orgLine = a.organizer
            ? `<div class="achievement-org">${
                orgHref
                  ? `<a href="${orgHref}" target="_blank" rel="noopener noreferrer">${a.organizer}</a>`
                  : a.organizer
              }</div>`
            : "";
          const linkLine = ""; // disables the extra hyperlink

          const blockLink = a.link || "#"; // fallback if no link
          
          const extraInfoLine = a.note
          ? `<div class="achievement-extra">${a.note}</div>`
          : "";


          div.innerHTML = `
          <a href="${blockLink}" target="_blank" rel="noopener noreferrer" class="achievement-wrapper">
          <div class="achievement-top">
          <h4 class="achievement-title">${a.title || ""}</h4>
          <div class="achievement-meta">
          ${positionBadge}${yearBadge}
          </div>
          </div>
          ${orgLine}
          </a>
          ${linkLine}
          ${extraInfoLine}
          `;
          
          achievementsList.appendChild(div);
        });
      }

      // Contact
      if (profile.email)
        document.querySelector(
          "[data-bind-mailto]"
        ).href = `mailto:${profile.email}`;
      if (profile.linkedin)
        document.querySelector('[data-bind-href="linkedin"]').href =
          profile.linkedin;
      if (profile.github) {
        const g = document.querySelector('[data-bind-href="github"]');
        if (g) g.href = profile.github;
      }
    });
})();

// Reveal on scroll
const revealEls = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

// Back to top
const toTop = document.getElementById("to-top");
window.addEventListener("scroll", () => {
  const y = window.scrollY || document.documentElement.scrollTop;
  if (y > 400) toTop.classList.add("show");
  else toTop.classList.remove("show");
});
toTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);
