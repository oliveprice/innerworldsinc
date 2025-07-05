document.addEventListener("DOMContentLoaded", () => {
  const linkContainers = document.querySelectorAll(".link-container");
  const aboutContainer = linkContainers[0]; // "About Me" is first

  aboutContainer?.addEventListener("click", () => {
    const existing = document.getElementById("about-me-modal");

    if (existing) {
      existing.classList.remove("hidden");
      
      // ✅ Ensure click-outside and close button still work
      setupAboutMeListeners(existing);
      
      return;
    }

    fetch('./about-me-modal.html')
      .then(res => res.text())
      .then(html => {
        const container = document.getElementById("about-me-container");
        container.innerHTML = html;

        const modal = document.getElementById("about-me-modal");

        // ✅ Attach listeners
        setupAboutMeListeners(modal);

        modal.classList.remove("hidden");
      });
  });

  function setupAboutMeListeners(modal) {
    const closeBtn = modal.querySelector(".about-me-close-button");
    
    // Avoid multiple bindings
    closeBtn.onclick = () => modal.classList.add("hidden");

    modal.onclick = (e) => {
      if (!modal.querySelector('.about-me-image-container').contains(e.target)) {
        modal.classList.add("hidden");
      }
    };
  }
});
