/**
 * bu-nyan Apps Showcase LP - Interaction Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  const appsData = window.APPS_DATA || window.BUNYAN_APPS || [];
  
  // DOM Elements
  const appsGrid = document.getElementById('appsGrid');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const appCountEl = document.getElementById('appCount');
  const modalBackdrop = document.getElementById('appModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  
  let currentCategory = 'all';

  // 1. Render App Cards
  function renderApps(category = 'all') {
    appsGrid.innerHTML = '';
    
    const filtered = category === 'all' 
      ? appsData 
      : appsData.filter(app => app.category === category);
    
    if (appCountEl) {
      appCountEl.textContent = `${filtered.length} 個のアプリを表示中`;
    }

    filtered.forEach(app => {
      const card = document.createElement('div');
      card.className = 'app-card';
      card.dataset.id = app.id;
      card.dataset.category = app.category;

      // Badges & Tags
      const tagsHtml = (app.tags || [])
        .map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`)
        .join('');

      // Highlights (top 3)
      const highlightsHtml = (app.highlights || [])
        .slice(0, 3)
        .map(h => `
          <li class="highlight-item">
            <span class="highlight-bullet">✓</span>
            <span>${escapeHtml(h)}</span>
          </li>
        `).join('');

      // Mini Screens (top 4)
      const screensHtml = (app.screenshots || [])
        .slice(0, 4)
        .map(src => `
          <img src="${src}" alt="${escapeHtml(app.title)} スクリーンショット" class="screen-thumb" loading="lazy">
        `).join('');

      card.innerHTML = `
        <div class="card-top">
          <img src="${app.icon}" alt="${escapeHtml(app.title)} アイコン" class="app-icon" loading="lazy">
          <div class="card-top-content">
            <span class="card-badge">${escapeHtml(app.badge || app.category_label)}</span>
            <h3 class="app-title">${escapeHtml(app.title)}</h3>
          </div>
        </div>

        <p class="app-catchphrase">${escapeHtml(app.catchphrase)}</p>

        <div class="app-tags">
          ${tagsHtml}
        </div>

        <ul class="app-highlights">
          ${highlightsHtml}
        </ul>

        <div class="screens-preview-row">
          ${screensHtml}
        </div>

        <div class="card-actions">
          <button class="btn-open-modal" data-app-id="${app.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            詳細を見る
          </button>
          <a href="${app.url || app.play_url}" target="_blank" rel="noopener noreferrer" class="btn-play-store">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.793 12 3.61 22.186c-.347-.28-.56-.7-.56-1.186V3c0-.486.213-.906.56-1.186zM15.207 13.414l2.422 2.422-11.45 6.44 9.028-8.862zm0-2.828L6.179 1.724l11.45 6.44-2.422 2.422zm1.414 1.414l3.195-1.797c.725-.408.725-1.077 0-1.485L16.621 12l3.195 1.797c.725.408.725 1.077 0 1.485L16.621 12z"/>
            </svg>
            Google Play
          </a>
        </div>
      `;

      appsGrid.appendChild(card);
    });

    // Attach click events to modal buttons and card clicks
    attachCardEvents();
  }

  // 2. Category Filter Switch
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      renderApps(currentCategory);
    });
  });

  // 3. Card Events for Modal
  function attachCardEvents() {
    const detailButtons = document.querySelectorAll('.btn-open-modal');
    detailButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const appId = btn.dataset.appId;
        openModal(appId);
      });
    });
  }

  // 4. Modal Functions
  function openModal(appId) {
    const app = appsData.find(a => a.id === appId);
    if (!app) return;

    // Populate Modal Content
    document.getElementById('modalIcon').src = app.icon;
    document.getElementById('modalTitle').textContent = app.title;
    document.getElementById('modalCategory').textContent = `${app.category_label} | ${app.badge || ''}`;
    document.getElementById('modalCatchphrase').textContent = app.catchphrase;
    
    // Play Store link
    const playBtn = document.getElementById('modalPlayBtn');
    playBtn.href = app.url || app.play_url;

    // Highlights in Modal
    const modalHighlights = document.getElementById('modalHighlights');
    modalHighlights.innerHTML = (app.highlights || []).map(h => `
      <li class="highlight-item" style="font-size: 0.92rem; margin-bottom: 8px;">
        <span class="highlight-bullet" style="font-size: 1.1rem;">★</span>
        <span>${escapeHtml(h)}</span>
      </li>
    `).join('');

    // Gallery in Modal
    const modalGallery = document.getElementById('modalScreens');
    modalGallery.innerHTML = (app.screenshots || []).map(src => `
      <img src="${src}" alt="スクリーンショット" loading="lazy" onclick="window.open('${src}', '_blank')">
    `).join('');

    // Description in Modal
    const modalDesc = document.getElementById('modalDescription');
    modalDesc.textContent = app.description || app.summary || '説明はありません。';

    // Show
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Update hash without jumping
    history.replaceState(null, '', `#${appId}`);
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    
    // Clear hash
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });

  // Handle deep link from hash on load
  function checkUrlHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash && appsData.some(a => a.id === hash)) {
      setTimeout(() => openModal(hash), 150);
    }
  }

  // 5. Theme Toggle (Dark / Light)
  const urlParams = new URLSearchParams(window.location.search);
  const themeParam = urlParams.get('theme');
  const currentTheme = themeParam || localStorage.getItem('bunyan_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('bunyan_theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    if (theme === 'dark') {
      themeToggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      themeToggleBtn.setAttribute('title', 'ライトモードに切り替え');
    } else {
      themeToggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
      themeToggleBtn.setAttribute('title', 'ダークモードに切り替え');
    }
  }

  // Utility: Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial render
  renderApps('all');
  checkUrlHash();
});
