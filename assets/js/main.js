(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  // Theme toggle
  const savedTheme = localStorage.getItem("theme") || "light";
  root.setAttribute("data-theme", savedTheme);
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
      profile.projects.forEach((p) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${p.image}" alt="${p.title}">
          <div class="card-body">
            <h3 class="card-title">${p.title}</h3>
            <p class="card-text">${p.description}</p>
            <div class="card-tags">${(p.tags || [])
              .map((t) => `<span>${t}</span>`)
              .join("")}</div>
          </div>
        `;
        projectsGrid.appendChild(card);
      });

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

      // Achievements & Certifications
      const achievementsList = document.getElementById("achievements-list");
      profile.achievements.forEach((a) => {
        const div = document.createElement("div");
        div.className = "achievement-item";
        div.innerHTML = `
            <h4>${a.title}</h4>
            <div class="issuer">${a.issuer}</div>
            <p>${a.description}</p>
            <a href="${a.link}" target="_blank">View Certificate</a>`;
        achievementsList.appendChild(div);
      });

      // Contact
      if (profile.email)
        document.querySelector(
          "[data-bind-mailto]"
        ).href = `mailto:${profile.email}`;
      if (profile.website)
        document.querySelector('[data-bind-href="website"]').href =
          profile.website;
      if (profile.linkedin)
        document.querySelector('[data-bind-href="linkedin"]').href =
          profile.linkedin;
    });
  // .catch((err) => console.error(err));
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
