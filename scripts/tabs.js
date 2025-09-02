(function () {
  // Nice labels for known pages (fallback to filename if missing)
  const ROUTES = {
    "home.html": "Home",
    "projects.html": "Projects",
    "html-to-hiccup-converter.html": "Converter",
    "power-through-transmutation.html": "Transmutation"
  };

  const HOME_FILE = "home.html";
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

  function ensureHomeFirst(tabs) {
    // de-dupe
    const seen = new Set();
    const deduped = [];
    for (const t of tabs) {
      if (!seen.has(t)) { seen.add(t); deduped.push(t); }
    }
    // ensure Home exists
    if (!deduped.includes(HOME_FILE)) deduped.unshift(HOME_FILE);
    // move Home to front if needed
    const i = deduped.indexOf(HOME_FILE);
    if (i > 0) {
      deduped.unshift(deduped.splice(i, 1)[0]);
    }
    return deduped;
  }

  function ensureCurrentOpen(tabs) {
    if (!tabs.includes(currentKey)) tabs.push(currentKey);
    return tabs;
  }

  function closeTab(tabs, keyToClose) {
    if (keyToClose === HOME_FILE) return tabs; // can't close Home
    const idx = tabs.indexOf(keyToClose);
    if (idx === -1) return tabs;
    tabs.splice(idx, 1);
    return tabs;
  }

  function navigateAfterClose(originalTabs, closedKey) {
    // Choose neighbor like a browser: left neighbor if possible, else right, else Home
    const tabs = readTabs(); // already saved post-close
    if (closedKey !== currentKey) return; // if you closed some background tab, stay put

    // We just closed the active tab; pick a new active
    // Find where that tab *was* in the old array to choose a neighbor consistently
    const oldIdx = originalTabs.indexOf(closedKey);

    // Prefer left neighbor (oldIdx - 1), but skip if it's Home and you prefer the right neighbor—
    // We’ll still allow Home as a valid target if nothing else exists.
    let target = null;

    // left neighbor (if exists)
    if (oldIdx > 0) {
      target = originalTabs[oldIdx - 1];
      // if left was the same as closed (shouldn't happen) or no longer exists, null it
      if (!tabs.includes(target)) target = null;
    }

    // else right neighbor
    if (!target && oldIdx >= 0 && oldIdx < originalTabs.length - 1) {
      const right = originalTabs[oldIdx + 1];
      if (tabs.includes(right)) target = right;
    }

    // fallback to Home
    if (!target) target = HOME_FILE;

    // navigate
    if (target !== currentKey) window.location.href = target;
  }

  function render() {
    const host = document.getElementById("site-tabs");
    if (!host) return;

    // state: read → ensure Home + current → write → render
    let tabs = readTabs();
    tabs = ensureHomeFirst(tabs);
    tabs = ensureCurrentOpen(tabs);
    tabs = ensureHomeFirst(tabs);
    writeTabs(tabs);

    host.innerHTML = "";
    tabs.forEach((key) => {
      const li = document.createElement("li");
      li.className = "tab" + (key === currentKey ? " active" : "");
      li.title = key;

      // clicking the tab navigates there
      li.addEventListener("click", () => {
        if (key !== currentKey) window.location.href = key;
      });

      const label = document.createElement("span");
      label.textContent = labelFor(key, key === currentKey ? document.title || "" : "");
      li.appendChild(label);

      // close button (not for Home)
      if (key !== HOME_FILE) {
        const closeBtn = document.createElement("button");
        closeBtn.className = "tab-close";
        closeBtn.type = "button";
        closeBtn.textContent = "×";
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // don't trigger the tab click
          const before = readTabs().slice();
          const updated = closeTab(readTabs(), key);
          writeTabs(ensureHomeFirst(updated));

          // If we closed the active tab, choose a neighbor and navigate
          navigateAfterClose(before, key);

          // If we stayed on the same page (closed background tab), just re-render
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

