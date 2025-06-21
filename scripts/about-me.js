document.addEventListener("DOMContentLoaded", () => {
  const linkContainers = document.querySelectorAll(".link-container");
  const aboutContainer = linkContainers[0]; // "About Me" is first

  aboutContainer?.addEventListener("click", () => {
    // If it's already loaded, show it immediately
    const existing = document.getElementById("about-me-modal");
    if (existing) {
      existing.classList.remove("hidden");
      return;
    }

    // Otherwise, fetch and inject, THEN show it
    fetch('./about-me-modal.html')
      .then(res => res.text())
      .then(html => {
        const container = document.getElementById("about-me-container");
        container.innerHTML = html;

        const modal = document.getElementById("about-me-modal");
        const closeBtn = modal.querySelector(".close-button");

        // Attach listeners
        closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
        window.addEventListener("click", (e) => {
          if (e.target === modal) modal.classList.add("hidden");
        });

        // ✅ Now show it after loading + setup
        modal.classList.remove("hidden");
      });
  });
});
