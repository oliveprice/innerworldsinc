(function () {
  if (window.__PRELOAD_ONLY__) return;

  const modal = document.getElementById('notice-modal');
  if (!modal) return;

  const STORAGE_KEY = 'IW_notice_seen_v1';
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
  } catch (_) {}

  const closeBtn = modal.querySelector('.notice-close');

  function close() {
    modal.classList.add('hidden');
    document.removeEventListener('keydown', onKey);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  closeBtn.addEventListener('click', close);
  modal.querySelector('.notice-ok')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', onKey);

  modal.classList.remove('hidden');
  closeBtn.focus();
})();
