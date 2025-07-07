document.addEventListener("DOMContentLoaded", () => {
  // Grab the footer link specifically for Change Log
  const changeLogTrigger = document.querySelector('.link-container img[alt*="Change"]')?.parentElement;
  
  if (!changeLogTrigger) {
    console.warn('Change Log link not found in footer.');
    return;
  }

  changeLogTrigger.addEventListener("click", () => {
    // Check if modal already exists in DOM
    const existingModal = document.getElementById("change-log-modal");
    if (existingModal) {
      existingModal.classList.remove("hidden");
      setupModalListeners(existingModal);
      loadCommits(existingModal);
      return;
    }

    // Otherwise fetch the HTML partial
    fetch('./change-log-modal.html')
      .then(res => res.text())
      .then(html => {
        const container = document.getElementById("change-log-container");
        container.innerHTML = html;

        const modal = document.getElementById("change-log-modal");
        setupModalListeners(modal);
        modal.classList.remove("hidden");

        loadCommits(modal);
      })
      .catch(err => {
        console.error('Error loading change-log-modal.html:', err);
      });
  });


  function setupModalListeners(modal) {
    const closeBtn = modal.querySelector(".about-me-close-button");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    }

    // Make sure *clicks inside the content* don't close the modal
    const content = modal.querySelector('.about-me-image-container');
    if (content) {
      content.addEventListener("click", (e) => e.stopPropagation());
    }

    // Add listener to overlay itself
    modal.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }


  function loadCommits(modal) {
    const contentArea = modal.querySelector(".commit-container");
    if (!contentArea) {
      console.warn('No .commit-container found in modal.');
      return;
    }

    contentArea.innerHTML = "<p class='handwritten'>Loading commits...</p>";

    fetch("https://api.github.com/repos/oliveprice/innerworldsinc/commits")
      .then(res => res.json())
      .then(data => {
        contentArea.innerHTML = ""; // clear after loading

        const cutoff = new Date("2025-04-23");

        const recentCommits = data.filter(commit => {
          return new Date(commit.commit.author.date) >= cutoff;
        });

        if (recentCommits.length === 0) {
          contentArea.innerHTML = "<p class='handwritten'>No recent commits found.</p>";
          return;
        }

        recentCommits.forEach(commit => {
          const msg = commit.commit.message;
          const author = commit.commit.author.name;
          const date = new Date(commit.commit.author.date).toLocaleString();

          const el = document.createElement("div");
          el.classList.add("commit-item");
          el.innerHTML = `
            <p class="handwritten"><strong>${msg}</strong></p>
            <p class="handwritten small">by ${author} on ${date}</p>
          `;
          contentArea.appendChild(el);
        });
      })
      .catch(err => {
        contentArea.innerHTML = "<p class='handwritten'>Failed to load commits.</p>";
        console.error(err);
      });
  }
});
