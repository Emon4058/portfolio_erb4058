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
      document.querySelector('[data-bind="summary"]').textContent =
        profile.summary;
      document.getElementById("avatar").src = profile.avatar;

      // Skills
      const skillsList = document.getElementById("skills-list");
      profile.skills.forEach((s) => {
        const li = document.createElement("li");
        li.className = "chip";
        li.textContent = s;
        skillsList.appendChild(li);
      });

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

      // Experience
      const expList = document.getElementById("experience-list");
      profile.experience.forEach((e) => {
        const div = document.createElement("div");
        div.className = "experience-item";
        div.innerHTML = `<h4>${e.position} - ${e.company}</h4><div class="period">${e.period} | ${e.location}</div><p>${e.description}</p>`;
        expList.appendChild(div);
      });

      // Education
      const eduList = document.getElementById("education-list");
      profile.education.forEach((e) => {
        const div = document.createElement("div");
        div.className = "education-item";
        div.innerHTML = `<h4>${e.degree}</h4><div class="period">${e.period}</div><p>${e.institution}</p>`;
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
