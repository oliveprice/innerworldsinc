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


  modal.querySelector('#inline-colophon-link')?.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("hidden");
    openColophonModal();
  });

  const form = modal.querySelector("#contactForm");
  if (form) {
    const status = modal.querySelector("#form-status");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      status.textContent = "Sending...";

      const data = new FormData(form);

      try {
        const response = await fetch("https://formspree.io/f/movkbvbp", {
          method: "POST",
          body: data,
          headers: { "Accept": "application/json" },
        });

        if (response.ok) {
          status.textContent = "Message sent! I'll get back to you soon.";
          form.reset();
        } else {
          status.textContent = "Oops, something went wrong. Try again later.";
        }
      } catch (error) {
        status.textContent = "Network error — please try again.";
      }
    });
  }
}
