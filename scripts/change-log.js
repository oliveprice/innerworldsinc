fetch('./change-log-modal.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById("modal-container").innerHTML = html;

    const modal = document.getElementById("modal");
    const openTrigger = document.querySelectorAll(".footer-link")[1]; // change log
    const closeButton = document.querySelector(".close-button");
    const contentArea = document.querySelector(".commit-container");

    openTrigger.addEventListener("click", () => {
      modal.classList.remove("hidden");

  
      fetch("https://api.github.com/repos/oliveprice/innerworldsinc/commits")
        .then(res => res.json())
        .then(data => {
          contentArea.innerHTML = ""; // clear it first

          data.slice(0, 10).forEach(commit => {
            const msg = commit.commit.message;
            const author = commit.commit.author.name;
            const date = new Date(commit.commit.author.date).toLocaleString();

            const el = document.createElement("div");
            el.classList.add("commit-item");
            el.innerHTML = `
              <p class="handwritten"><strong>${msg}</strong></p>
              <p class="handwritten small margin-bottom-plus-3">by ${author} on ${date}</p>
            `;
            contentArea.appendChild(el);
          });
        })
        .catch(err => {
          contentArea.innerHTML = "<p>Failed to load commits.</p>";
          console.error(err);
        });
    });

    closeButton.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });
  });
