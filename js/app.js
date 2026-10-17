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
        .map((src, idx) => `
          <img src="${src}" alt="${escapeHtml(app.title)} スクリーンショット" class="screen-thumb" loading="lazy" style="cursor: zoom-in;" data-app-id="${app.id}" data-index="${idx}" title="クリックして拡大表示">
        `).join('');

      // Platform pills
      const platformPills = `
        <div class="platform-badges">
          <span class="platform-pill android">Android</span>
          ${app.ios_url ? '<span class="platform-pill ios">iOS</span>' : ''}
        </div>
      `;

      card.innerHTML = `
        <div class="card-top">
          <img src="${app.icon}" alt="${escapeHtml(app.title)} アイコン" class="app-icon" loading="lazy">
          <div class="card-top-content">
            <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">
              <span class="card-badge">${escapeHtml(app.badge || app.category_label)}</span>
              ${platformPills}
            </div>
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
            詳細
          </button>
          <div class="card-store-buttons">
            <a href="${app.url || app.play_url}" target="_blank" rel="noopener noreferrer" class="btn-play-store" title="Google Play で開く">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.793 12 3.61 22.186c-.347-.28-.56-.7-.56-1.186V3c0-.486.213-.906.56-1.186zM15.207 13.414l2.422 2.422-11.45 6.44 9.028-8.862zm0-2.828L6.179 1.724l11.45 6.44-2.422 2.422zm1.414 1.414l3.195-1.797c.725-.408.725-1.077 0-1.485L16.621 12l3.195 1.797c.725.408.725 1.077 0 1.485L16.621 12z"/>
              </svg>
              Play
            </a>
            ${app.ios_url ? `
            <a href="${app.ios_url}" target="_blank" rel="noopener noreferrer" class="btn-app-store" title="App Store で開く">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.03.63-2.67 1.38-.56.65-1.06 1.71-.92 2.74 1.04.08 2.07-.5 2.67-1.25z"/>
              </svg>
              iOS
            </a>
            ` : ''}
          </div>
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

  // 3. Card Events for Modal & Lightbox
  function attachCardEvents() {
    const detailButtons = document.querySelectorAll('.btn-open-modal');
    detailButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const appId = btn.dataset.appId;
        openModal(appId);
      });
    });

    const cardThumbs = document.querySelectorAll('.screen-thumb');
    cardThumbs.forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        const appId = thumb.dataset.appId;
        const index = parseInt(thumb.dataset.index, 10) || 0;
        openLightbox(appId, index);
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
    
    // Store Links in Modal
    const modalFooter = document.querySelector('.modal-footer');
    modalFooter.innerHTML = `
      <a href="${app.url || app.play_url}" target="_blank" rel="noopener noreferrer" class="btn-play-store" style="padding: 12px 24px; font-size: 0.95rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.609 1.814L13.793 12 3.61 22.186c-.347-.28-.56-.7-.56-1.186V3c0-.486.213-.906.56-1.186zM15.207 13.414l2.422 2.422-11.45 6.44 9.028-8.862zm0-2.828L6.179 1.724l11.45 6.44-2.422 2.422zm1.414 1.414l3.195-1.797c.725-.408.725-1.077 0-1.485L16.621 12l3.195 1.797c.725.408.725 1.077 0 1.485L16.621 12z"/>
        </svg>
        Google Play で入手
      </a>
      ${app.ios_url ? `
      <a href="${app.ios_url}" target="_blank" rel="noopener noreferrer" class="btn-app-store" style="padding: 12px 24px; font-size: 0.95rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.03.63-2.67 1.38-.56.65-1.06 1.71-.92 2.74 1.04.08 2.07-.5 2.67-1.25z"/>
        </svg>
        App Store で入手
      </a>
      ` : ''}
    `;

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
    const screenshots = app.screenshots || [];
    modalGallery.innerHTML = screenshots.map((src, idx) => `
      <img src="${src}" alt="${escapeHtml(app.title)} スクリーンショット" loading="lazy" style="cursor: zoom-in;" data-app-id="${app.id}" data-index="${idx}">
    `).join('');

    // Attach click events on modal gallery images to open lightbox
    modalGallery.querySelectorAll('img').forEach(img => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(img.dataset.index, 10) || 0;
        openLightbox(app.id, index);
      });
    });

    // Description in Modal
    const modalDesc = document.getElementById('modalDescription');
    modalDesc.textContent = app.description || app.summary || '説明はありません。';

    // Show
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Update hash without jumping
    history.replaceState(null, '', `#${appId}`);
  }

  // 4.5. Lightbox Modal Functions (Image Zoom & Carousel)
  const lightboxBackdrop = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  let currentLightboxApp = null;
  let currentLightboxIndex = 0;

  function openLightbox(appId, index = 0) {
    const app = appsData.find(a => a.id === appId);
    if (!app || !app.screenshots || app.screenshots.length === 0) return;

    currentLightboxApp = app;
    currentLightboxIndex = index;
    updateLightboxContent();

    lightboxBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function updateLightboxContent() {
    if (!currentLightboxApp || !currentLightboxApp.screenshots) return;
    const screens = currentLightboxApp.screenshots;
    if (screens.length === 0) return;

    if (currentLightboxIndex < 0) currentLightboxIndex = screens.length - 1;
    if (currentLightboxIndex >= screens.length) currentLightboxIndex = 0;

    lightboxImg.src = screens[currentLightboxIndex];
    lightboxCaption.textContent = `${currentLightboxApp.title} (${currentLightboxIndex + 1} / ${screens.length})`;

    // Hide or dim arrows if only 1 image
    if (screens.length <= 1) {
      lightboxPrevBtn.style.display = 'none';
      lightboxNextBtn.style.display = 'none';
    } else {
      lightboxPrevBtn.style.display = 'flex';
      lightboxNextBtn.style.display = 'flex';
    }
  }

  function closeLightbox() {
    lightboxBackdrop.classList.remove('open');
    // If main modal is not open, restore scroll
    if (!modalBackdrop.classList.contains('open')) {
      document.body.style.overflow = '';
    }
    currentLightboxApp = null;
  }

  function prevLightboxImage(e) {
    if (e) e.stopPropagation();
    if (!currentLightboxApp) return;
    currentLightboxIndex--;
    updateLightboxContent();
  }

  function nextLightboxImage(e) {
    if (e) e.stopPropagation();
    if (!currentLightboxApp) return;
    currentLightboxIndex++;
    updateLightboxContent();
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', prevLightboxImage);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', nextLightboxImage);

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', (e) => {
      // Close on background click
      if (e.target === lightboxBackdrop || e.target.classList.contains('lightbox-image-container')) {
        closeLightbox();
      }
    });
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
    // If Lightbox is open, handle keyboard
    if (lightboxBackdrop && lightboxBackdrop.classList.contains('open')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        prevLightboxImage();
      } else if (e.key === 'ArrowRight') {
        nextLightboxImage();
      }
      return;
    }

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
