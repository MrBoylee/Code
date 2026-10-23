(function () {
  'use strict';

  /* ==================== CONFIGURATION ====================
     1. Deploy Apps Script as Web App → copy the URL ending in /exec
     2. Paste it between the quotes below. ONLY line to edit.       */
  var CONFIG = {
    endpointUrl: 'https://script.google.com/macros/s/AKfycbwgEeo5kHEuOw_c6wRuq8szfQuE7nY2mrrYxVP5WFnRgqU1Eyjt0VGs2fsiI3UPpATaUQ/exec',
    perPage: 12
  };

  var state = {
    outfits: [], filtered: [], categories: [],
    query: '', category: 'All', page: 1,
    loading: true, error: null,
    modalOutfit: null, images: [], slide: 0
  };

  function el(id) { return document.getElementById(id); }
  function isSafeUrl(u) { return /^https?:\/\//i.test(u); }
  function safeUrl(u) { return isSafeUrl(u) ? u : ''; }

  function loadOutfits() {
    state.loading = true; state.error = null; render();
    fetch(CONFIG.endpointUrl, { method: 'GET', redirect: 'follow' })
      .then(function (res) {
        if (!res.ok) throw new Error('Endpoint returned HTTP ' + res.status + '.');
        return res.json();
      })
      .then(function (data) {
        if (!data || data.ok !== true || !Array.isArray(data.outfits)) {
          throw new Error((data && data.error) || 'Unexpected data received from the endpoint.');
        }
        state.outfits = data.outfits.map(normalize)
          .filter(function (o) { return o.name && o.mainImage; });
        var cats = {};
        state.outfits.forEach(function (o) { if (o.category) cats[o.category] = true; });
        state.categories = Object.keys(cats).sort();
        state.loading = false; state.page = 1;
        render();
      })
      .catch(function (err) {
        state.loading = false;
        state.error = (err && err.message) || 'Network error while loading outfits.';
        render();
      });
  }

  function normalize(rec) {
    return {
      id: String(rec.id || ''),
      name: String(rec.name || '').trim(),
      category: String(rec.category || '').trim(),
      description: String(rec.description || '').trim(),
      mainImage: safeUrl(String(rec.mainImage || '').trim()),
      gallery: Array.isArray(rec.gallery)
        ? rec.gallery.map(function (g) { return safeUrl(String(g).trim()); }).filter(Boolean)
        : [],
      buyUrl: safeUrl(String(rec.buyUrl || '').trim()),
      tags: String(rec.tags || '').toLowerCase()
    };
  }

  function applyFilters() {
    var q = state.query.trim().toLowerCase();
    state.filtered = state.outfits.filter(function (o) {
      if (state.category !== 'All' && o.category !== state.category) return false;
      if (!q) return true;
      return (o.name + ' ' + o.description + ' ' + o.tags).toLowerCase().indexOf(q) !== -1;
    });
  }

  function render() {
    applyFilters();
    if (state.page > pageCount()) state.page = pageCount();
    renderCats(); renderStatus(); renderGrid(); renderPages();
  }

  function renderCats() {
    var wrap = el('bd-cats'); wrap.innerHTML = '';
    ['All'].concat(state.categories).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bd-chip' + (state.category === c ? ' is-active' : '');
      b.textContent = c;
      b.setAttribute('aria-pressed', state.category === c ? 'true' : 'false');
      b.addEventListener('click', function () { state.category = c; state.page = 1; render(); });
      wrap.appendChild(b);
    });
  }

  function renderStatus() {
    var s = el('bd-status');
    s.className = 'bd-status'; s.innerHTML = '';
    if (state.loading) { s.textContent = 'Loading outfits…'; return; }
    if (state.error) {
      s.classList.add('is-error');
      var span = document.createElement('span');
      span.textContent = 'Could not load outfits: ' + state.error;
      var btn = document.createElement('button');
      btn.className = 'bd-retry'; btn.type = 'button'; btn.textContent = 'Try again';
      btn.addEventListener('click', loadOutfits);
      s.appendChild(span); s.appendChild(btn);
      return;
    }
    if (!state.filtered.length) {
      s.textContent = 'No outfits match your search. Try a different keyword or category.';
    }
  }

  function renderGrid() {
    var grid = el('bd-grid'); grid.innerHTML = '';
    if (state.loading || state.error || !state.filtered.length) return;
    var start = (state.page - 1) * CONFIG.perPage;
    state.filtered.slice(start, start + CONFIG.perPage).forEach(function (o) {
      grid.appendChild(makeCard(o));
    });
  }

  function makeCard(o) {
    var card = document.createElement('article'); card.className = 'bd-card';

    var img = document.createElement('img');
    img.className = 'bd-card-img'; img.loading = 'lazy'; img.src = o.mainImage; img.alt = o.name;
    img.addEventListener('click', function () { openModal(o); });

    var body = document.createElement('div'); body.className = 'bd-card-body';
    var h = document.createElement('h3'); h.className = 'bd-card-name'; h.textContent = o.name;
    body.appendChild(h);
    if (o.category) {
      var c = document.createElement('p'); c.className = 'bd-card-cat'; c.textContent = o.category;
      body.appendChild(c);
    }
    if (o.description) {
      var d = document.createElement('p'); d.className = 'bd-card-desc'; d.textContent = o.description;
      body.appendChild(d);
    }
    var buy = document.createElement('button');
    buy.type = 'button'; buy.className = 'bd-buy'; buy.textContent = 'Buy Outfit →';
    buy.addEventListener('click', function () { openModal(o); });
    body.appendChild(buy);

    card.appendChild(img); card.appendChild(body);
    return card;
  }

  function pageCount() {
    return Math.max(1, Math.ceil(state.filtered.length / CONFIG.perPage));
  }

  function renderPages() {
    var nav = el('bd-pages'); nav.innerHTML = '';
    var total = pageCount();
    if (state.loading || state.error || state.filtered.length === 0 || total <= 1) return;

    function mk(label, page, active) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'bd-page' + (active ? ' is-active' : '');
      b.textContent = label;
      if (!active) {
        b.addEventListener('click', function () {
          state.page = page; render();
          el('bd-storefront').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      nav.appendChild(b);
    }
    if (state.page > 1) mk('‹ Prev', state.page - 1, false);
    for (var p = 1; p <= total; p++) mk(String(p), p, p === state.page);
    if (state.page < total) mk('Next ›', state.page + 1, false);
  }

  /* ---------- overlay: now toggles the is-hidden CLASS ---------- */
  function openModal(o) {
    state.modalOutfit = o;
    state.images = [o.mainImage].concat(o.gallery);
    state.slide = 0;
    el('bd-m-title').textContent = o.name;
    el('bd-m-desc').textContent = o.description || '';
    var buy = el('bd-m-buy');
    if (o.buyUrl) { buy.href = o.buyUrl; buy.style.display = ''; }
    else { buy.removeAttribute('href'); buy.style.display = 'none'; }
    showSlide(0);
    el('bd-overlay').classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';
    el('bd-close').focus();
  }

  function closeModal() {
    el('bd-overlay').classList.add('is-hidden');
    document.body.style.overflow = '';
    state.modalOutfit = null; state.images = [];
  }

  function showSlide(i) {
    if (!state.images.length) return;
    state.slide = (i + state.images.length) % state.images.length;
    var img = el('bd-m-img');
    img.src = state.images[state.slide];
    img.alt = state.modalOutfit.name +
      (state.images.length > 1 ? ' — image ' + (state.slide + 1) + ' of ' + state.images.length : '');
    el('bd-counter').textContent =
      state.images.length > 1 ? (state.slide + 1) + ' / ' + state.images.length : '';
  }

  var debounce;
  el('bd-search').addEventListener('input', function (e) {
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      state.query = e.target.value; state.page = 1; render();
    }, 200);
  });

  el('bd-close').addEventListener('click', closeModal);
  el('bd-prev').addEventListener('click', function () { showSlide(state.slide - 1); });
  el('bd-next').addEventListener('click', function () { showSlide(state.slide + 1); });

  el('bd-overlay').addEventListener('click', function (e) {
    if (e.target === el('bd-overlay')) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (el('bd-overlay').classList.contains('is-hidden')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') showSlide(state.slide - 1);
    if (e.key === 'ArrowRight') showSlide(state.slide + 1);
    if (e.key === 'Tab') {
      var items = el('bd-overlay').querySelectorAll('button, a[href]');
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- init ---------- */
  el('bd-overlay').classList.add('is-hidden');
  if (CONFIG.endpointUrl.indexOf('PASTE_YOUR') !== -1) {
    state.loading = false;
    state.error = 'The Apps Script endpoint URL has not been configured yet.';
  }
  render();
  loadOutfits();
})();