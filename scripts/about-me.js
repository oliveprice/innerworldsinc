document.addEventListener("DOMContentLoaded", () => {
  const aboutLink = document.querySelector('.link-container img[alt*="About"]')?.parentElement;

  aboutLink?.addEventListener("click", () => {
    openAboutMeModal();
  });
});

function openAboutMeModal() {
  const existing = document.getElementById("about-me-modal");
  if (existing) {
    existing.classList.remove("hidden");
    setupAboutMeListeners(existing);
    return;
  }

  fetch('./about-me-modal.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById("about-me-container").innerHTML = html;
      const modal = document.getElementById("about-me-modal");
      setupAboutMeListeners(modal);
      modal.classList.remove("hidden");
    });
}

function setupAboutMeListeners(modal) {
  modal.querySelector(".about-me-close-button")?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.querySelector('.about-me-image-container')?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  modal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // ✅ The fix: Wire up the inline colophon link INSIDE the loaded modal
  modal.querySelector('#inline-colophon-link')?.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("hidden");
    openColophonModal();
  });
}

function openColophonModal() {
  const existingColophon = document.getElementById("colophon-modal");
  if (existingColophon) {
    existingColophon.classList.remove("hidden");
    setupColophonListeners(existingColophon);
    return;
  }

  fetch('./colophon-modal.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById("colophon-container").innerHTML = html;
      const modal = document.getElementById("colophon-modal");
      setupColophonListeners(modal);
      modal.classList.remove("hidden");
    });
}

function setupColophonListeners(modal) {
  modal.querySelector(".about-me-close-button")?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.querySelector('.about-me-image-container')?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  modal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}
