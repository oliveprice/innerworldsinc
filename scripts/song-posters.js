document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".series-card").forEach((card) => {
    const img = card.querySelector(".poster-group .poster");
    const nextBtn = card.querySelector(".next-button");
    const prevBtn = card.querySelector(".prev-button");
    const audioPlayer = card.querySelector(".audio-player");

    // Determine which folder based on the series title
    const titleText = card.querySelector(".series-header h4")?.textContent.toLowerCase() || "";
    const isBookSeries = titleText.includes("book");
    const baseFolder = isBookSeries ? "book-posters" : "posters";
    const total = isBookSeries ? 9 : 7; // 9 book posters, 7 music posters
    let currentIndex = 1;

    // ===== Music Series Only =====
    let audio, icon, fill;
    if (!isBookSeries && audioPlayer) {
      const audioBtn = audioPlayer.querySelector(".audio-btn");
      icon = audioBtn.querySelector("i");
      fill = audioPlayer.querySelector(".audio-fill");
      audio = (window._seriesAudio ||= new Audio(`./resources/songs/${currentIndex}.mp3`));

      if (!audio._wired) {
        audio.addEventListener("timeupdate", () => {
          const progress = (audio.currentTime / Math.max(audio.duration || 1, 1)) * 100;
          if (fill) fill.style.width = `${progress}%`;
        });
        audio.addEventListener("ended", () => {
          icon.classList.replace("fa-pause", "fa-play");
          if (fill) fill.style.width = "0%";
        });
        audio._wired = true;
      }

      audioBtn.addEventListener("click", () => {
        if (audio.paused) {
          audio.play();
          icon.classList.replace("fa-play", "fa-pause");
        } else {
          audio.pause();
          icon.classList.replace("fa-pause", "fa-play");
        }
      });
    }

    // ===== Poster Update =====
    function updatePosterAndSong(newIndex) {
      if (newIndex > total) newIndex = 1;
      if (newIndex < 1) newIndex = total;
      currentIndex = newIndex;

      img.src = `./resources/images/${baseFolder}/${currentIndex}.png`;

      // Only music series updates audio
      if (!isBookSeries && audioPlayer) {
        const wasPlaying = !audio.paused;
        audio.pause();
        audio.currentTime = 0;
        fill.style.width = "0%";
        audio.src = `./resources/songs/${currentIndex}.mp3`;

        if (wasPlaying) {
          audio.play();
          icon.classList.replace("fa-play", "fa-pause");
        } else {
          icon.classList.replace("fa-pause", "fa-play");
        }
      }
    }

    // ===== Button Events =====
    nextBtn.addEventListener("click", () => updatePosterAndSong(currentIndex + 1));
    prevBtn.addEventListener("click", () => updatePosterAndSong(currentIndex - 1));
  });
});
