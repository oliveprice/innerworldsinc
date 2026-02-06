(function () {
  const ROUTES = {
    "home.html": "Home",
    "projects.html": "Projects",
    "portfolio.html": "Portfolio",
    "series.html": "Series",
    "writings.html": "Writings",
    "html-to-hiccup-converter.html": "Converter",
    "power-through-transmutation.html": "Transmutation"
  };

  const HOME_FILE = "home.html";
  const PROJECTS_FILE = "projects.html";
  const PORTFOLIO_FILE = "portfolio.html";
  const SERIES_FILE = "series.html";
  const WRITINGS_FILE = "writings.html";
  const STORAGE_KEY = "IW_open_tabs_v1";

  const toPath = (url) => {
    try { return new URL(url, location.href).pathname; }
    catch { return location.pathname; }
  };
  const basename = (pathname) => {
    const name = (pathname || "").split("?")[0].split("#")[0].split("/").pop();
    return name || HOME_FILE;
  };
  const currentKey = basename(toPath(location.href));

  function readTabs() {
    try {
      const arr = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function writeTabs(tabs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  }

  function labelFor(fileKey, docTitle) {
    if (ROUTES[fileKey]) return ROUTES[fileKey];
    if (docTitle && docTitle.trim()) return docTitle.trim();
    return fileKey
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function ensureTabs(tabs) {
    const seen = new Set();
    const deduped = [];
    for (const t of tabs) {
      if (!seen.has(t)) { seen.add(t); deduped.push(t); }
    }

    const defaults = [HOME_FILE, PROJECTS_FILE, PORTFOLIO_FILE, SERIES_FILE, WRITINGS_FILE];
    defaults.forEach((file, idx) => {
      if (!deduped.includes(file)) deduped.splice(idx, 0, file);
    });

    return deduped;
  }

  function ensureCurrentOpen(tabs) {
    if (!tabs.includes(currentKey)) tabs.push(currentKey);
    return tabs;
  }

  function closeTab(tabs, keyToClose) {
    if ([HOME_FILE, PROJECTS_FILE, PORTFOLIO_FILE, SERIES_FILE, WRITINGS_FILE].includes(keyToClose))
      return tabs;

    const idx = tabs.indexOf(keyToClose);
    if (idx === -1) return tabs;
    tabs.splice(idx, 1);
    return tabs;
  }

  function navigateAfterClose(originalTabs, closedKey) {
    const tabs = readTabs();
    if (closedKey !== currentKey) return;

    const oldIdx = originalTabs.indexOf(closedKey);
    let target = null;

    if (oldIdx > 0) target = originalTabs[oldIdx - 1];
    if ((!target || !tabs.includes(target)) && oldIdx < originalTabs.length - 1)
      target = originalTabs[oldIdx + 1];
    if (!target) target = HOME_FILE;

    if (target !== currentKey) window.location.href = target;
  }

  function render() {
    const host = document.getElementById("site-tabs");
    if (!host) return;

    let tabs = readTabs();
    tabs = ensureTabs(tabs);
    tabs = ensureCurrentOpen(tabs);
    writeTabs(tabs);

    host.innerHTML = "";
    host.setAttribute("role", "tablist");

    tabs.forEach((key) => {
      const li = document.createElement("li");
      li.className = "tab" + (key === currentKey ? " active" : "");
      li.title = key;
      li.setAttribute("role", "tab");
      li.setAttribute("tabindex", "0");
      li.setAttribute("aria-selected", key === currentKey ? "true" : "false");

      const label = document.createElement("span");
      label.textContent = labelFor(key, key === currentKey ? document.title || "" : "");
      li.appendChild(label);

      li.addEventListener("click", () => {
        if (key !== currentKey) window.location.href = key;
      });

      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (key !== currentKey) window.location.href = key;
        }
      });

      li.addEventListener("focus", () => {
        li.style.outline = "2px solid var(--primary)";
        li.style.outlineOffset = "2px";
      });
      li.addEventListener("blur", () => {
        li.style.outline = "";
      });

      if (![HOME_FILE, PROJECTS_FILE, PORTFOLIO_FILE, SERIES_FILE, WRITINGS_FILE].includes(key)) {
        const closeBtn = document.createElement("button");
        closeBtn.className = "tab-close";
        closeBtn.type = "button";
        closeBtn.textContent = "×";
        closeBtn.setAttribute("aria-label", `Close ${label.textContent} tab`);

        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const before = readTabs().slice();
          const updated = closeTab(readTabs(), key);
          writeTabs(ensureTabs(updated));
          navigateAfterClose(before, key);
          if (key !== currentKey) render();
        });

        li.appendChild(closeBtn);
      }

      host.appendChild(li);
    });

    const allTabs = host.querySelectorAll(".tab");
    host.addEventListener("keydown", (e) => {
      const focused = document.activeElement;
      if (!focused.classList.contains("tab")) return;

      let idx = Array.from(allTabs).indexOf(focused);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        idx = (idx + 1) % allTabs.length;
        allTabs[idx].focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        idx = (idx - 1 + allTabs.length) % allTabs.length;
        allTabs[idx].focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

function addSafeClick(target, onClick) {
  let downX = 0, downY = 0, armed = false;

  target.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    armed = true;
    downX = e.clientX;
    downY = e.clientY;
    target.setPointerCapture(e.pointerId);
  });

  target.addEventListener("pointerup", (e) => {
    if (!armed) return;
    armed = false;
    target.releasePointerCapture?.(e.pointerId);
    const dx = Math.abs(e.clientX - downX);
    const dy = Math.abs(e.clientY - downY);
    if (dx <= 4 && dy <= 4) onClick(e);
  });

  target.addEventListener("pointercancel", () => { armed = false; });
}
