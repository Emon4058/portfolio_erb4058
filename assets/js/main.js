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
      // About summary: clamp + linkify company reliably
      const summaryEl = document.querySelector('[data-bind="summary"]');
      const fullSummary = profile.summary || "";
      summaryEl.classList.add("clamp");

      const companyUrl = profile.companyLink || "https://cyberneticsbd.com/";
      const variants = [
        "Cybernetics Hi-Tech Solutions (Pvt.) Ltd.",
        "Cybernetics Hi‑Tech Solutions (Pvt.) Ltd.",
        "Cybernetics Hi–Tech Solutions (Pvt.) Ltd.",
        "Cybernetics Hi—Tech Solutions (Pvt.) Ltd.",
      ];

      function renderSummaryWithCompanyLink(target, text) {
        target.innerHTML = "";
        let hit = null,
          idx = -1;
        for (const v of variants) {
          idx = text.indexOf(v);
          if (idx !== -1) {
            hit = v;
            break;
          }
        }

        const appendTextWithBreaks = (parent, s) => {
          const parts = s.split(/\r?\n/g);
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

        // before
        appendTextWithBreaks(target, text.slice(0, idx));

        // anchor
        const a = document.createElement("a");
        a.href = companyUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Cybernetics Hi‑Tech Solutions (Pvt.) Ltd.";
        target.appendChild(a);

        // after
        appendTextWithBreaks(target, text.slice(idx + hit.length));
      }

      renderSummaryWithCompanyLink(summaryEl, fullSummary);

      // Modal for full about
      const aboutReadMore = document.getElementById("about-readmore");
      const aboutModal = document.getElementById("about-modal");
      const aboutModalBody = document.getElementById("about-modal-body");
      const aboutModalClose = document.getElementById("about-modal-close");

      function openAboutModal() {
        aboutModal.classList.add("open");
        aboutModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        aboutModalClose?.focus();
      }
      function closeAboutModal() {
        aboutModal.classList.remove("open");
        aboutModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }

      aboutReadMore?.addEventListener("click", (e) => {
        e.preventDefault();
        aboutModalBody.innerHTML = "";
        renderSummaryWithCompanyLink(aboutModalBody, fullSummary);
        openAboutModal();
      });
      aboutModalClose?.addEventListener("click", closeAboutModal);
      aboutModal?.addEventListener("click", (e) => {
        if (e.target === aboutModal) closeAboutModal();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && aboutModal?.classList.contains("open"))
          closeAboutModal();
      });
      aboutModalClose?.addEventListener("click", closeAboutModal);
      aboutModal?.addEventListener("click", (e) => {
        if (e.target === aboutModal) closeAboutModal();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && aboutModal?.classList.contains("open"))
          closeAboutModal();
      });
      document.getElementById("avatar").src = profile.avatar;

      // Skills
      const skillsList = document.getElementById("skills-list");
      skillsList.innerHTML = "";

      if (
        Array.isArray(profile.skillsGrouped) &&
        profile.skillsGrouped.length
      ) {
        profile.skillsGrouped.forEach((g) => {
          const li = document.createElement("li");
          li.className = "skills-group";
          li.innerHTML = `
      <h3 class="skills-group-title">${g.category}</h3>
      <div class="chip-list">
        ${(g.items || []).map((s) => `<span class="chip">${s}</span>`).join("")}
      </div>
    `;
          skillsList.appendChild(li);
        });
      } else if (Array.isArray(profile.skills)) {
        // fallback to flat chips
        profile.skills.forEach((s) => {
          const li = document.createElement("li");
          li.className = "chip";
          li.textContent = s;
          skillsList.appendChild(li);
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

      // Experience (with highlights and tech)
      const expList = document.getElementById("experience-list");

      function formatPeriodPretty(period) {
        if (!period) return "";
        const parts = String(period).split("-");
        if (
          parts.length === 3 &&
          String(parts[2]).toLowerCase() === "present"
        ) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) || 1;
          const d = new Date(y, m - 1, 1);
          // "01 July 2024 – Present"
          return (
            d.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }) + " – Present"
          );
        }
        if (parts.length === 4) {
          const sy = parseInt(parts[0], 10),
            sm = parseInt(parts[1], 10) || 1;
          const ey = parseInt(parts[2], 10),
            em = parseInt(parts[3], 10) || 1;
          const sd = new Date(sy, sm - 1, 1);
          const ed = new Date(ey, em - 1, 1);
          return (
            sd.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) +
            " – " +
            ed.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
          );
        }
        if (parts.length === 2) return `${parts[0]} – ${parts[1]}`;
        return period;
      }

      profile.experience.forEach((e) => {
        const div = document.createElement("div");
        div.className = "experience-item";

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
    <div class="role-line"><span class="position">${
      e.position || ""
    }</span> <span class="period">${formatPeriodPretty(e.period)}</span></div>
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
          const orgLine = a.organizer
            ? `<div class="achievement-org">${a.organizer}</div>`
            : "";
          const linkLine = a.link
            ? `<a class="a-link achievement-link" href="${a.link}" target="_blank" rel="noopener noreferrer">Details</a>`
            : "";

          div.innerHTML = `
      <div class="achievement-top">
        <h4 class="achievement-title">${a.title || ""}</h4>
        <div class="achievement-meta">
          ${positionBadge}${yearBadge}
        </div>
      </div>
      ${orgLine}
      ${linkLine}
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
