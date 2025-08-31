(() => {
  if (window.__projectsCards_flowTip) return;
  window.__projectsCards_flowTip = true;

  // ------ config ------
  const DUR = 0.8;
  const EASE = "power2.inOut";
  const TARGET_W = 770;
  const DEFAULT_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
  const INFO_EASE_IN = "power2.out";
  const INFO_EASE_OUT = "power1.in";

  // ------ utils ------
  const slug = (t) => (t||"").toLowerCase().trim().replace(/\s+/g,"-").replace(/[^a-z0-9.-]+/g,"");
  const keyFromTitle = (root) => slug(root?.querySelector("h4")?.textContent || "");

  function toCssContentBox(el, contentW, contentH){
    const cs = getComputedStyle(el);
    const borderBox = cs.boxSizing === "border-box";
    const padX = (parseFloat(cs.paddingLeft)||0) + (parseFloat(cs.paddingRight)||0);
    const padY = (parseFloat(cs.paddingTop)||0)  + (parseFloat(cs.paddingBottom)||0);
    const borderX = (parseFloat(cs.borderLeftWidth)||0) + (parseFloat(cs.borderRightWidth)||0);
    const borderY = (parseFloat(cs.borderTopWidth)||0)  + (parseFloat(cs.borderBottomWidth)||0);
    let w = contentW, h = contentH;
    if (borderBox) { w += padX + borderX; h += padY + borderY; }
    return { widthCSS: Math.round(w)+"px", heightCSS: Math.round(h)+"px" };
  }

  function measureVideoSize(src, targetW){
    let done = false;
    return new Promise((resolve)=>{
      const fallback = ()=>{ if(!done){ done=true; resolve({targetW, targetH: Math.round(targetW*9/16)}) } };
      const v = document.createElement("video");
      v.preload="metadata"; v.src=src;
      v.addEventListener("loadedmetadata", ()=>{ if(done) return; done=true;
        const r = v.videoHeight/Math.max(1,v.videoWidth);
        resolve({targetW, targetH: Math.round(targetW*r)});
      }, {once:true});
      v.addEventListener("error", fallback, {once:true});
      setTimeout(fallback, 140);
    });
  }

  function disableTilt(el){
    if (el.dataset.prevTransform === undefined) el.dataset.prevTransform = el.style.transform || '';
    el.style.transform = 'none';
    el.style.setProperty('--rx','0deg'); el.style.setProperty('--ry','0deg');
  }
  function enableTilt(el){
    if (!el.classList.contains('open')) el.style.transform = el.dataset.prevTransform || '';
    delete el.dataset.prevTransform;
    el.style.removeProperty('--rx'); el.style.removeProperty('--ry');
  }

  // ------ index pieces & infos ------
  const pieceMap = new Map();
  const infoMap  = new Map();

  function indexProjects(){
    pieceMap.clear(); infoMap.clear();

    document.querySelectorAll(".gallery .piece").forEach(p=>{
      const k = p.dataset.key || keyFromTitle(p);
      if(!k) return;
      p.dataset.key = k;
      if (!p.dataset.video) p.dataset.video = DEFAULT_VIDEO;
      pieceMap.set(k,p);
    });

    document.querySelectorAll(".gallery .project-info").forEach(info=>{
      const k = info.dataset.key || keyFromTitle(info);
      if(!k) return;
      info.dataset.key = k;
      infoMap.set(k, info);
      // baseline: totally removed from layout
      info.style.display = "none";
      info.style.overflow = "hidden";
      info.style.opacity = "0";
      info.style.transform = "translateY(8px)";
    });
  }
  indexProjects();

  // ------ tooltip show/hide as a normal flex item ------
  function placeInfoAbove(piece){
    const key = piece.dataset.key || keyFromTitle(piece);
    const info = key && infoMap.get(key);
    if (!info) return null;

    // Put it immediately before the piece in the UL so it appears *above* it
    const ul = piece.parentNode;
    if (info.nextSibling !== piece) ul.insertBefore(info, piece);
    return info;
  }
function showProjectInfoFor(piece){
  const info = placeInfoAbove(piece);
  if (!info) return Promise.resolve(null);

  // hide others
  document.querySelectorAll(".gallery .project-info").forEach(el=>{
    if (el !== info && el.style.display !== "none") hideProjectInfo(el);
  });

  // measure natural height
  info.style.display = "block";
  info.style.height = "auto";
  const targetH = info.offsetHeight;

  // animate 0 -> target
  info.style.height = "0px";
  info.style.opacity = "0";
  info.style.transform = "translateY(8px)";

  gsap.killTweensOf(info);
  return new Promise(resolve => {
    gsap.to(info, {
      duration: 0.28,
      ease: INFO_EASE_IN,
      height: targetH,
      opacity: 1,
      y: 0,
      onComplete: () => {
        info.style.height = "auto";
        info.classList.add("is-visible");
        resolve(info); // <-- tell caller we're done changing layout
      }
    });
  });
}


  function hideProjectInfo(info){
    if (!info || info.style.display === "none") return;
    gsap.killTweensOf(info);

    // lock current height then animate to 0 and remove from layout
    const currentH = info.offsetHeight || 0;
    info.style.height = currentH + "px";

    gsap.to(info, {
      duration: 0.2,
      ease: INFO_EASE_OUT,
      height: 0,
      opacity: 0,
      y: -6,
      onComplete: () => {
        info.classList.remove("is-visible");
        info.style.display = "none";   // <-- removes flex gap
        info.style.transform = "translateY(8px)";
      }
    });
  }

  function hideProjectInfoFor(piece){
    const key = piece.dataset.key || keyFromTitle(piece);
    const info = key && infoMap.get(key);
    if (info) hideProjectInfo(info);
  }

  // ------ open/close pieces ------
  document.addEventListener('click', async (e) => {
    const piece = e.target.closest('.piece');
    if (!piece) return;

    document.querySelectorAll('.piece.open').forEach(p => p !== piece && closePiece(p));

    piece.classList.contains('open') ? closePiece(piece) : await openPiece(piece);
  });

// Center an element vertically in the viewport (Smooth Scrollbar aware)
function centerOpenPiece(el, duration = 700) {
  if (!el) return;
  const scrollerEl = document.querySelector('#my-scrollbar');
  const sb = (window.Scrollbar && scrollerEl) ? Scrollbar.get(scrollerEl) : null;

  try {
    if (sb && typeof sb.scrollIntoView === 'function') {
      const vh = sb.size.container.height;
      const r  = el.getBoundingClientRect();
      const offsetTop = -Math.round((vh - r.height) / 2); // center vertically
      sb.scrollIntoView(el, {
        alignToTop: false,
        onlyScrollIfNeeded: false,
        offsetTop,
        duration
      });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch (_) {}
}


async function openPiece(piece){
  disableTilt(piece);

  const src = piece.dataset.video || DEFAULT_VIDEO;
  if (!piece.dataset.closedHtml) piece.dataset.closedHtml = piece.innerHTML;

  // (A) Show the info above and WAIT so its height is baked into layout
  await showProjectInfoFor(piece);

  // (B) Lock current size (after info is in place)
  const r = piece.getBoundingClientRect();
  piece.style.width  = r.width + 'px';
  piece.style.height = r.height + 'px';

  // (C) Prepare content (clear + mark open)
  piece.innerHTML = '';
  piece.classList.add('open');

  // (D) Create the video now so it preloads, but keep it hidden
  const vid = document.createElement('video');
  vid.className = 'teaser';
  vid.autoplay = true; vid.muted = true; vid.playsInline = true; vid.loop = true; vid.preload = 'auto';
  vid.style.cssText = 'display:block;width:100%;height:100%;opacity:0.001;';
  const srcEl = document.createElement('source'); srcEl.src = src; srcEl.type = 'video/mp4';
  vid.appendChild(srcEl);
  piece.appendChild(vid);
  vid.play().catch(()=>{});

  // (E) Measure the actual video ratio FIRST so we only grow once
  const { targetH } = await measureVideoSize(src, TARGET_W);
  const dims = toCssContentBox(piece, TARGET_W, targetH);

  // (F) Animate the card to its final size ONCE
  await gsap.to(piece, {
    duration: DUR,
    ease: EASE,
    width: dims.widthCSS,
    height: dims.heightCSS
  });

  // (G) Reveal video quickly
  gsap.to(vid, { opacity: 1, duration: 0.24, ease: 'power1.out' });

  // (H) ONE scroll after the final size is applied
  centerOpenPiece(piece, 700);
}



  function closePiece(piece){
    disableTilt(piece);

    // hide this piece's info
    hideProjectInfoFor(piece);

    // lock size
    const r = piece.getBoundingClientRect();
    piece.style.width  = r.width + 'px';
    piece.style.height = r.height + 'px';

    // measure closed natural size
    const closedHTML = piece.dataset.closedHtml || '';
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;visibility:hidden;';
    probe.className = Array.from(piece.classList).filter(c => c !== 'open').join(' ');
    probe.innerHTML = closedHTML;
    document.body.appendChild(probe);
    const targetW = probe.scrollWidth;
    const targetH = probe.scrollHeight;
    document.body.removeChild(probe);

    piece.classList.remove('open');

    const dims = toCssContentBox(piece, targetW, targetH);
    const vid = piece.querySelector('video');

    gsap.to(piece, {
      duration: DUR,
      ease: EASE,
      width: dims.widthCSS,
      height: dims.heightCSS,
      onComplete: () => {
        if (vid) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
        piece.innerHTML = closedHTML;
        piece.style.width = '';
        piece.style.height = '';
        enableTilt(piece);
      }
    });
  }
})();