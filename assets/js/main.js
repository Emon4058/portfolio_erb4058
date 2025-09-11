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

      //       // Projects
      //       const projectsGrid = document.getElementById("projects-grid");
      //       const modal = document.getElementById("project-modal");
      //       const modalTitle = document.getElementById("modal-title");
      //       const modalDesc = document.getElementById("modal-description");
      //       const carouselImages = document.getElementById("carousel-images");
      //       const closeModal = document.getElementById("modal-close");
      //       let currentSlide = 0;

      //       let autoTimer = null;
      //       function startAutoCarousel() {
      //         stopAutoCarousel();
      //         autoTimer = setInterval(() => changeSlide(1), 2000); // 2s per slide
      //       }
      //       function stopAutoCarousel() {
      //         if (autoTimer) {
      //           clearInterval(autoTimer);
      //           autoTimer = null;
      //         }
      //       }

      //       profile.projects.forEach((p, idx) => {
      //         const card = document.createElement("div");
      //         card.className = "card";
      //         const linkHTML = p.url
      //           ? `<a class="a-link" href="${p.url}">View case study</a>`
      //           : `<a href="#" class="read-more a-link" role="button" data-index="${idx}">Read More</a>`;

      //         card.innerHTML = `
      //   <img src="${p.image}" alt="${
      //           p.title || "Project"
      //         }" loading="lazy" decoding="async">
      //   <div class="card-body">
      //     <h3 class="card-title">${p.title || ""}</h3>
      //     <p class="card-text">${p.description || ""}</p>
      //     ${linkHTML}
      //     <div class="card-tags">${(p.tags || [])
      //       .map((t) => `<span>${t}</span>`)
      //       .join("")}</div>
      //   </div>
      // `;
      //         projectsGrid.appendChild(card);
      //       });

      //       // Attach event listeners to dynamically created buttons
      //       projectsGrid.querySelectorAll(".read-more").forEach((btn) => {
      //         btn.addEventListener("click", (e) => {
      //           e.preventDefault();
      //           const index = Number(e.currentTarget.getAttribute("data-index"));
      //           const project = profile.projects[index];
      //           if (project) openModal(project);
      //         });
      //       });

      //       // Open Modal
      //       document.querySelectorAll(".read-more").forEach((btn) => {
      //         btn.addEventListener("click", (e) => {
      //           const index = e.target.getAttribute("data-index");
      //           const project = profile.projects[index];

      //           modalTitle.textContent = project.title;
      //           modalDesc.textContent =
      //             project.longDescription || project.description;

      //           // Build carousel
      //           carouselImages.innerHTML = "";
      //           (project.gallery || [project.image]).forEach((img, i) => {
      //             const imageEl = document.createElement("img");
      //             imageEl.src = img;
      //             if (i === 0) imageEl.classList.add("active");
      //             carouselImages.appendChild(imageEl);
      //           });
      //           currentSlide = 0;

      //           modal.style.display = "flex";
      //           startAutoCarousel();
      //         });
      //       });

      //       carouselImages.addEventListener("mouseenter", stopAutoCarousel);
      //       carouselImages.addEventListener("mouseleave", startAutoCarousel);

      //       modal.addEventListener("click", (e) => {
      //         if (e.target === modal) {
      //           modal.style.display = "none";
      //           stopAutoCarousel();
      //           document.body.classList.remove("modal-open");
      //         }
      //       });
      //       // Close modal
      //       closeModal.addEventListener("click", () => {
      //         modal.style.display = "none";
      //         stopAutoCarousel();
      //       });

      //       // Next/Prev carousel
      //       document
      //         .querySelector(".carousel-btn.next")
      //         .addEventListener("click", () => {
      //           changeSlide(1);
      //         });
      //       document
      //         .querySelector(".carousel-btn.prev")
      //         .addEventListener("click", () => {
      //           changeSlide(-1);
      //         });

      //       function changeSlide(step) {
      //         const slides = carouselImages.querySelectorAll("img");
      //         slides[currentSlide].classList.remove("active");
      //         currentSlide = (currentSlide + step + slides.length) % slides.length;
      //         slides[currentSlide].classList.add("active");
      //       }

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

      // Achievements & Certifications
      const achievementsList = document.getElementById("achievements-list");
      profile.achievements.forEach((a) => {
        const div = document.createElement("div");
        div.className = "achievement-item";
        div.innerHTML = `
            <h4>${a.title}</h4>
            <div class="issuer">${a.issuer}</div>
            <p>${a.description}</p>
            <a class="a-link" href="${a.link}" target="_blank">View Certificate</a>`;
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
