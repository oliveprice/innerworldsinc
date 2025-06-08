document.addEventListener("DOMContentLoaded", () => {
  const colophonLink = document.querySelectorAll(".footer-link")[2]; // third one is Colophon

  colophonLink?.addEventListener("click", () => {
    // Already loaded? Just show it
    if (document.getElementById("colophon-modal")) {
      document.getElementById("colophon-modal").classList.remove("hidden");
      return;
    }

    // Load modal HTML dynamically
    fetch('./colophon-modal.html')
      .then(res => res.text())
      .then(html => {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        document.body.appendChild(temp.firstElementChild);

        const modal = document.getElementById("colophon-modal");
        const closeBtn = modal.querySelector(".close-button");

        closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

        window.addEventListener("click", (e) => {
          if (e.target === modal) modal.classList.add("hidden");
        });
      });
  });
});
