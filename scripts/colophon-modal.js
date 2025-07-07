document.addEventListener("DOMContentLoaded", () => {
  const colophonLink = document.querySelector('.link-container img[alt*="Colophon"]')?.parentElement;

  colophonLink?.addEventListener("click", () => {
    loadColophonModal();
  });
});

function loadColophonModal() {
  const existing = document.getElementById("colophon-modal");
  if (existing) {
    existing.classList.remove("hidden");
    setupModalListeners(existing);
    return;
  }

  fetch('./colophon-modal.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById("colophon-container").innerHTML = html;
      const modal = document.getElementById("colophon-modal");
      setupModalListeners(modal);
      modal.classList.remove("hidden");
    });
}

function setupModalListeners(modal) {
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
