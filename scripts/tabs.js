(function () {
  // Nice labels for known pages (fallback to filename if missing)
  const ROUTES = {
    "home.html": "Home",
    "projects.html": "Projects",
    "html-to-hiccup-converter.html": "Converter",
    "power-through-transmutation.html": "Transmutation"
  };

  const HOME_FILE = "home.html";
  const PROJECTS_FILE = "projects.html"; // ✅ added
  const STORAGE_KEY = "IW_open_tabs_v1";

  // --- helpers
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

  function ensureHomeAndProjects(tabs) {
    // de-dupe
    const seen = new Set();
    const deduped = [];
    for (const t of tabs) {
      if (!seen.has(t)) { seen.add(t); deduped.push(t); }
    }

    // ensure Home + Projects exist and are ordered first
    if (!deduped.includes(HOME_FILE)) deduped.unshift(HOME_FILE);
    if (!deduped.includes(PROJECTS_FILE)) deduped.splice(1, 0, PROJECTS_FILE);

    // force correct ordering (Home first, Projects second)
    const homeIdx = deduped.indexOf(HOME_FILE);
    if (homeIdx > 0) deduped.unshift(deduped.splice(homeIdx, 1)[0]);
    const projIdx = deduped.indexOf(PROJECTS_FILE);
    if (projIdx > 1) deduped.splice(1, 0, deduped.splice(projIdx, 1)[0]);

    return deduped;
  }

  function ensureCurrentOpen(tabs) {
    if (!tabs.includes(currentKey)) tabs.push(currentKey);
    return tabs;
  }

  function closeTab(tabs, keyToClose) {
    // can't close Home or Projects
    if (keyToClose === HOME_FILE || keyToClose === PROJECTS_FILE) return tabs;
    const idx = tabs.indexOf(keyToClose);
    if (idx === -1) return tabs;
    tabs.splice(idx, 1);
    return tabs;
  }

  function navigateAfterClose(originalTabs, closedKey) {
    const tabs = readTabs();
    if (closedKey !== currentKey) return; // only act if closing the active tab

    const oldIdx = originalTabs.indexOf(closedKey);
    let target = null;

    // left neighbor
    if (oldIdx > 0) {
      target = originalTabs[oldIdx - 1];
      if (!tabs.includes(target)) target = null;
    }

    // right neighbor
    if (!target && oldIdx >= 0 && oldIdx < originalTabs.length - 1) {
      const right = originalTabs[oldIdx + 1];
      if (tabs.includes(right)) target = right;
    }

    // fallback to Home
    if (!target) target = HOME_FILE;

    if (target !== currentKey) window.location.href = target;
  }

  function render() {
    const host = document.getElementById("site-tabs");
    if (!host) return;

    // state: read → ensure Home+Projects+current → write → render
    let tabs = readTabs();
    tabs = ensureHomeAndProjects(tabs);
    tabs = ensureCurrentOpen(tabs);
    tabs = ensureHomeAndProjects(tabs);
    writeTabs(tabs);

    host.innerHTML = "";
    tabs.forEach((key) => {
      const li = document.createElement("li");
      li.className = "tab" + (key === currentKey ? " active" : "");
      li.title = key;

      // clicking navigates
      li.addEventListener("click", () => {
        if (key !== currentKey) window.location.href = key;
      });

      const label = document.createElement("span");
      label.textContent = labelFor(key, key === currentKey ? document.title || "" : "");
      li.appendChild(label);

      // show close button for everything EXCEPT Home + Projects
      if (key !== HOME_FILE && key !== PROJECTS_FILE) {
        const closeBtn = document.createElement("button");
        closeBtn.className = "tab-close";
        closeBtn.type = "button";
        closeBtn.textContent = "×";
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const before = readTabs().slice();
          const updated = closeTab(readTabs(), key);
          writeTabs(ensureHomeAndProjects(updated));

          navigateAfterClose(before, key);

          if (key !== currentKey) render();
        });
        li.appendChild(closeBtn);
      }

      host.appendChild(li);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

