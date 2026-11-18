(() => {
  'use strict';

  /* ---------- Config ---------- */
  const BGS = [
    'itec_bg.png', 'itec_bg2.png', 'itec_bg3.png', 'itec_bg4.png', 'itec_bg5.png', 'itec_bg6.png',
    'itec_bg7.png', 'itec_bg9.png', 'itec_bg10.png', 'itec_bg11.png', 'itec_bg12.png', 'itec_bg13.png'
  ];

  // Paleta oficial do projeto: #047579 #E9AC63 #CCD5CC #003237 #3C3C3C
  // As marcas existem em 4 cores (arquivos), então cada uma usa a cor da paleta mais próxima.
  const COLORS = [
    { id: 'azul', label: 'Azul', hex: '#047579' },
    { id: 'branco', label: 'Claro', hex: '#CCD5CC' },
    { id: 'dourado', label: 'Dourado', hex: '#E9AC63' },
    { id: 'preto', label: 'Azul escuro', hex: '#003237' }
  ];

  const TEXT_COLORS = [
    { id: '#047579', label: 'Azul', hex: '#047579' },
    { id: '#E9AC63', label: 'Dourado', hex: '#E9AC63' },
    { id: '#CCD5CC', label: 'Claro', hex: '#CCD5CC' },
    { id: '#003237', label: 'Azul escuro', hex: '#003237' },
    { id: '#3C3C3C', label: 'Cinza escuro', hex: '#3C3C3C' }
  ];

  const KINDS = [
    ['none', 'Sem marca'],
    ['logotipo', 'Logotipo ITEC'],
    ['logo', 'Logo (brasão)'],
    ['giro', 'Logo girando (vídeo MP4)']
  ];

  const POS_LOGO = [
    ['corners', 'Nos cantos'],
    ['center', 'Grande, atrás'],
    ['left', 'Grande, esquerda'],
    ['right', 'Grande, direita'],
    ['farleft', 'Mais à esquerda (30% fora)'],
    ['farright', 'Mais à direita (30% fora)']
  ];
  const POSITIONS = {
    logotipo: [['corners', 'Nos cantos'], ['center', 'Grande, atrás']],
    logo: POS_LOGO,
    giro: POS_LOGO
  };

  const CORNERS = [['tl', 'Sup. esquerdo'], ['tr', 'Sup. direito'], ['bl', 'Inf. esquerdo'], ['br', 'Inf. direito']];

  // Padrões gerados por código (usam Cor 1 e Cor 2; 'two' = usa as duas cores)
  const GENS = [
    { id: 'solid', label: 'Cor sólida', two: false },
    { id: 'linear', label: 'Degradê', two: true },
    { id: 'radial', label: 'Degradê radial', two: true },
    { id: 'halftone', label: 'Meio-tom', two: true },
    { id: 'halftoneRadial', label: 'Meio-tom radial', two: true },
    { id: 'dots', label: 'Bolinhas', two: true },
    { id: 'stripes', label: 'Listras', two: true },
    { id: 'grid', label: 'Grade', two: true },
    { id: 'checker', label: 'Xadrez', two: true },
    { id: 'rings', label: 'Círculos', two: true },
    { id: 'waves', label: 'Ondas', two: true }
  ];

  const BG_PALETTE = ['#047579', '#E9AC63', '#CCD5CC', '#003237', '#3C3C3C', '#FFFFFF'];

  function markSrc(kind, color) {
    if (color === 'custom') color = 'branco'; // só o canal alfa importa; a cor é aplicada por cima
    if (kind === 'logotipo') return `logotipo-${color}.png`;
    if (kind === 'giro') return `giro_logo_${color}.gif`;
    return color === 'dourado' ? 'logo-dourado.png' : `logo_${color}.png`;
  }

  const state = {
    bgType: 'img', // 'img' = imagem pronta, 'gen' = padrão gerado
    bg: BGS[0],
    gen: 'linear',
    bgA: '#003237',
    bgB: '#047579',
    kind: 'none',
    color: 'branco', // id de COLORS ou 'custom'
    customHex: '#c2410c',
    pos: 'corners',
    corners: { tl: false, tr: false, bl: true, br: true },
    opacity: 0.18,
    text: '',
    textColor: '#E9AC63',
    textScale: 1
  };

  /* ---------- Elements ---------- */
  const $ = (id) => document.getElementById(id);
  const baseCanvas = $('baseCanvas');
  const textCanvas = $('textCanvas');
  const giroLayer = $('giroLayer');
  const btnPng = $('btnPng');
  const btnGif = $('btnGif'); // botão do MP4

  if (location.protocol === 'file:') $('fileWarning').hidden = false;

  /* ---------- Image cache ---------- */
  const cache = new Map();
  function loadImg(src) {
    if (!cache.has(src)) {
      cache.set(src, new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Não consegui carregar ' + src));
        img.src = src;
      }));
    }
    return cache.get(src);
  }

  /* ---------- Layout ---------- */
  function markRects(s, aspect, W, H) {
    const out = [];
    if (s.kind === 'none') return out;

    if (s.pos === 'corners') {
      const m = H * 0.04;
      const h = s.kind === 'logotipo' ? H * 0.075 : H * 0.14;
      const w = h * aspect;
      const c = s.corners;
      if (c.tl) out.push({ x: m, y: m, w, h, alpha: 1 });
      if (c.tr) out.push({ x: W - m - w, y: m, w, h, alpha: 1 });
      if (c.bl) out.push({ x: m, y: H - m - h, w, h, alpha: 1 });
      if (c.br) out.push({ x: W - m - w, y: H - m - h, w, h, alpha: 1 });
      return out;
    }

    let w, h, x, y;
    if (s.kind === 'logotipo') {
      w = W * 0.8; h = w / aspect;
      if (h > H * 0.9) { h = H * 0.9; w = h * aspect; }
      x = (W - w) / 2; y = (H - h) / 2;
    } else {
      h = s.pos.startsWith('far') ? H * 1.15 : H * 0.9;
      w = h * aspect;
      y = (H - h) / 2;
      const gap = W * 0.04;
      x = {
        center: (W - w) / 2,
        left: gap,
        right: W - gap - w,
        farleft: -0.3 * w,
        farright: W - 0.7 * w
      }[s.pos];
    }
    out.push({ x, y, w, h, alpha: s.opacity });
    return out;
  }

  /* ---------- Fundos gerados ---------- */
  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mixHex(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
  }

  // Desenha o padrão em qualquer resolução (tudo é proporcional à altura).
  function drawGenerated(ctx, W, H, id, a, b) {
    const u = H / 720;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, W, H);

    switch (id) {
      case 'linear': {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, a); g.addColorStop(1, b);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        break;
      }
      case 'radial': {
        const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2);
        g.addColorStop(0, a); g.addColorStop(1, b);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        break;
      }
      case 'halftone':
      case 'halftoneRadial': {
        const s = 28 * u;
        const rows = Math.ceil(H / (s / 2)) + 1;
        const cols = Math.ceil(W / s) + 1;
        const maxD = Math.hypot(W / 2, H / 2);
        ctx.fillStyle = b;
        for (let j = 0; j < rows; j++) {
          const y = j * s / 2;
          for (let i = 0; i < cols; i++) {
            const x = i * s + (j % 2) * s / 2;
            const t = id === 'halftone'
              ? (x / W + y / H) / 2
              : Math.min(1, Math.hypot(x - W / 2, y - H / 2) / maxD);
            const r = s * 0.44 * Math.max(0, Math.min(1, t));
            if (r < 0.4 * u) continue;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case 'dots': {
        const s = 44 * u;
        ctx.fillStyle = b;
        for (let j = 0; j * s < H + s; j++) {
          for (let i = 0; i * s < W + s; i++) {
            const x = i * s + (j % 2) * s / 2, y = j * s;
            ctx.beginPath();
            ctx.arc(x, y, s * 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case 'stripes': {
        const D = Math.hypot(W, H), sw = 36 * u;
        ctx.translate(W / 2, H / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = b;
        for (let x = -D; x < D; x += sw * 2) ctx.fillRect(x, -D, sw, D * 2);
        break;
      }
      case 'grid': {
        const s = 60 * u;
        ctx.strokeStyle = b;
        ctx.lineWidth = Math.max(1, 2 * u);
        ctx.beginPath();
        for (let x = 0; x <= W; x += s) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        for (let y = 0; y <= H; y += s) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
        ctx.stroke();
        break;
      }
      case 'checker': {
        const s = 72 * u;
        ctx.fillStyle = b;
        for (let j = 0; j * s < H; j++) {
          for (let i = 0; i * s < W; i++) {
            if ((i + j) % 2) ctx.fillRect(i * s, j * s, s, s);
          }
        }
        break;
      }
      case 'rings': {
        const rw = 60 * u;
        const n = Math.ceil(Math.hypot(W, H) / 2 / rw) + 1;
        for (let k = n; k >= 0; k--) {
          ctx.fillStyle = k % 2 ? b : a;
          ctx.beginPath();
          ctx.arc(W / 2, H / 2, k * rw, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'waves': {
        const n = 8, amp = H * 0.05, freq = (Math.PI * 2) / (W * 0.55);
        for (let i = 0; i < n; i++) {
          const base = H * (0.12 + i * 0.115), phase = i * 0.9;
          ctx.fillStyle = mixHex(a, b, i / (n - 1));
          ctx.beginPath();
          ctx.moveTo(0, H);
          for (let x = 0; x <= W + 6; x += 6) ctx.lineTo(x, base + amp * Math.sin(x * freq + phase));
          ctx.lineTo(W, H);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
      default: break; // 'solid': só a Cor 1
    }
    ctx.restore();
  }

  function getBgImg() {
    return state.bgType === 'gen' ? Promise.resolve(null) : loadImg(state.bg);
  }

  /* ---------- Cor personalizada da marca ---------- */
  // Usa a transparência da imagem como molde e preenche com a cor escolhida.
  function tint(img, hex) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.naturalWidth = c.width; c.naturalHeight = c.height; // para o cálculo de proporção
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = hex;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /* ---------- Drawing ---------- */
  function drawBase(ctx, W, H, bgImg, markImg) {
    ctx.clearRect(0, 0, W, H);
    if (state.bgType === 'gen') drawGenerated(ctx, W, H, state.gen, state.bgA, state.bgB);
    else ctx.drawImage(bgImg, 0, 0, W, H);
    if (markImg && state.kind !== 'none' && state.kind !== 'giro') {
      const aspect = markImg.naturalWidth / markImg.naturalHeight;
      for (const r of markRects(state, aspect, W, H)) {
        ctx.globalAlpha = r.alpha;
        ctx.drawImage(markImg, r.x, r.y, r.w, r.h);
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawGiroStatic(ctx, W, H, source, aspect) {
    for (const r of markRects(state, aspect, W, H)) {
      ctx.globalAlpha = r.alpha;
      ctx.drawImage(source, r.x, r.y, r.w, r.h);
    }
    ctx.globalAlpha = 1;
  }

  function drawText(ctx, W, H) {
    ctx.clearRect(0, 0, W, H);
    const t = state.text.trim();
    if (!t) return;
    const size = H * 0.054 * state.textScale;
    ctx.font = `400 ${size}px Pavilion, Georgia, "Times New Roman", serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = state.textColor;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${(-0.012 * size).toFixed(2)}px`;
    ctx.fillText(t, W * 0.0146, H * 0.013);
  }

  /* ---------- Preview ---------- */
  let token = 0;
  async function renderPreview() {
    const my = ++token;
    try { await document.fonts.load('40px Pavilion'); } catch (_) { /* usa fallback */ }

    const needsMark = state.kind !== 'none';
    const [bgImg, markImg] = await Promise.all([
      getBgImg(),
      needsMark ? loadImg(markSrc(state.kind, state.color)) : Promise.resolve(null)
    ]).catch((e) => { console.error(e); return [null, null]; });
    if (my !== token || (state.bgType === 'img' && !bgImg)) return;

    const W = baseCanvas.width, H = baseCanvas.height;
    const drawable = markImg && state.color === 'custom' ? tint(markImg, state.customHex) : markImg;
    drawBase(baseCanvas.getContext('2d'), W, H, bgImg, drawable);
    drawText(textCanvas.getContext('2d'), textCanvas.width, textCanvas.height);

    giroLayer.replaceChildren();
    if (state.kind === 'giro' && markImg) {
      const aspect = markImg.naturalWidth / markImg.naturalHeight;
      const HH = 100 * (H / W);
      for (const r of markRects(state, aspect, 100, HH)) {
        let img;
        if (state.color === 'custom') {
          // o GIF continua animado: vira molde (mask-image) de um bloco colorido
          img = document.createElement('div');
          img.className = 'tinted';
          img.style.backgroundColor = state.customHex;
          const m = `url("${markImg.src}")`;
          img.style.webkitMaskImage = m;
          img.style.maskImage = m;
        } else {
          img = document.createElement('img');
          img.src = markImg.src;
          img.alt = '';
        }
        img.style.left = r.x + '%';
        img.style.top = (r.y / HH * 100) + '%';
        img.style.width = r.w + '%';
        img.style.height = (r.h / HH * 100) + '%';
        img.style.opacity = r.alpha;
        giroLayer.appendChild(img);
      }
    }
  }

  /* ---------- UI builders ---------- */
  function buildThumbs() {
    const box = $('thumbs');
    BGS.forEach((src, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'thumb';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', `Fundo ${i + 1}`);
      b.dataset.src = src;
      b.setAttribute('aria-checked', String(state.bgType === 'img' && src === state.bg));
      b.innerHTML = `<img src="${src}" alt="" loading="lazy" decoding="async">`;
      b.addEventListener('click', () => {
        state.bgType = 'img';
        state.bg = src;
        syncBgUI();
        renderPreview();
      });
      box.appendChild(b);
    });
  }

  function buildGenThumbs() {
    const box = $('genThumbs');
    box.replaceChildren();
    GENS.forEach((g) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'thumb';
      b.dataset.gen = g.id;
      b.title = g.label;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', g.label);
      b.setAttribute('aria-checked', 'false');
      const c = document.createElement('canvas');
      c.width = 320; c.height = 180;
      b.appendChild(c);
      b.addEventListener('click', () => {
        state.bgType = 'gen';
        state.gen = g.id;
        syncBgUI();
        renderPreview();
      });
      box.appendChild(b);
    });
    refreshGenThumbs();
  }

  function refreshGenThumbs() {
    [...$('genThumbs').children].forEach((b) => {
      const c = b.firstChild;
      drawGenerated(c.getContext('2d'), c.width, c.height, b.dataset.gen, state.bgA, state.bgB);
    });
  }

  function syncBgUI() {
    const gen = state.bgType === 'gen';
    [...$('thumbs').children].forEach((c) => c.setAttribute('aria-checked', String(!gen && c.dataset.src === state.bg)));
    [...$('genThumbs').children].forEach((c) => c.setAttribute('aria-checked', String(gen && c.dataset.gen === state.gen)));
    $('genColors').hidden = !gen;
    const g = GENS.find((x) => x.id === state.gen);
    $('bgBField').hidden = !gen || !g.two;
  }

  // Bolinha com anel de arco-íris: abre o seletor de cor nativo do navegador.
  function makeCustomSwatch(hex, onPick) {
    const el = document.createElement('label');
    el.className = 'swatch custom';
    el.title = 'Cor personalizada';
    const core = document.createElement('span');
    core.className = 'core';
    core.style.background = hex;
    const input = document.createElement('input');
    input.type = 'color';
    input.value = hex;
    input.setAttribute('aria-label', 'Cor personalizada');
    const handle = () => { core.style.background = input.value; onPick(input.value); };
    input.addEventListener('click', handle);
    input.addEventListener('input', handle);
    el.append(core, input);
    return { el, setSelected: (on) => el.classList.toggle('is-selected', on) };
  }

  // Paleta + cor personalizada, para valores hex (fundos e texto).
  function hexPicker(box, palette, get, set) {
    box.replaceChildren();
    const btns = palette.map((hex) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.style.background = hex;
      b.title = hex;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', hex);
      b.addEventListener('click', () => { set(hex); sync(); });
      box.appendChild(b);
      return { b, hex };
    });
    const custom = makeCustomSwatch(get(), (hex) => { set(hex); sync(); });
    box.appendChild(custom.el);
    function sync() {
      const cur = get().toLowerCase();
      let match = false;
      btns.forEach(({ b, hex }) => {
        const on = hex.toLowerCase() === cur;
        if (on) match = true;
        b.setAttribute('aria-checked', String(on));
      });
      custom.setSelected(!match);
    }
    sync();
  }

  // Cores da marca: as 4 originais (com sombreado) + cor personalizada (cor única).
  function buildMarkColors() {
    const box = $('colorChips');
    box.replaceChildren();
    const btns = COLORS.map((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.style.background = c.hex;
      b.title = c.label;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', c.label);
      b.addEventListener('click', () => { state.color = c.id; sync(); renderPreview(); });
      box.appendChild(b);
      return { b, id: c.id };
    });
    const custom = makeCustomSwatch(state.customHex, (hex) => {
      state.color = 'custom';
      state.customHex = hex;
      sync();
      renderPreview();
    });
    box.appendChild(custom.el);
    function sync() {
      btns.forEach(({ b, id }) => b.setAttribute('aria-checked', String(state.color === id)));
      custom.setSelected(state.color === 'custom');
    }
    sync();
  }

  function radioGroup(box, items, getValue, onPick, kind) {
    box.replaceChildren();
    items.forEach((item) => {
      const [id, label] = Array.isArray(item) ? item : [item.id, item.label];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = kind === 'swatch' ? 'swatch' : 'chip';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', label);
      b.setAttribute('aria-checked', String(getValue() === id));
      if (kind === 'swatch') {
        b.style.background = item.hex;
        b.title = label;
      } else {
        b.textContent = label;
      }
      b.addEventListener('click', () => {
        onPick(id);
        [...box.children].forEach((c, i) => {
          const itemId = Array.isArray(items[i]) ? items[i][0] : items[i].id;
          c.setAttribute('aria-checked', String(itemId === getValue()));
        });
      });
      box.appendChild(b);
    });
  }

  function buildKinds() {
    radioGroup($('kindChips'), KINDS, () => state.kind, (id) => {
      state.kind = id;
      if (id !== 'none' && !POSITIONS[id].some(([p]) => p === state.pos)) state.pos = 'corners';
      syncMarkUI();
      renderPreview();
    });
  }

  function buildPositions() {
    const list = POSITIONS[state.kind] || [];
    radioGroup($('posChips'), list, () => state.pos, (id) => {
      state.pos = id;
      syncMarkUI(true);
      renderPreview();
    });
  }

  function buildCorners() {
    const box = $('cornerChips');
    box.replaceChildren();
    CORNERS.forEach(([id, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = label;
      b.setAttribute('aria-pressed', String(state.corners[id]));
      b.addEventListener('click', () => {
        state.corners[id] = !state.corners[id];
        b.setAttribute('aria-pressed', String(state.corners[id]));
        renderPreview();
      });
      box.appendChild(b);
    });
  }

  function syncMarkUI(skipRebuildPos) {
    const none = state.kind === 'none';
    $('markOptions').hidden = none;
    if (!none && !skipRebuildPos) buildPositions();
    $('cornerField').hidden = none || state.pos !== 'corners';
    $('opacityField').hidden = none || state.pos === 'corners';
    btnGif.disabled = state.kind !== 'giro';
    $('gifHint').hidden = state.kind === 'giro';
  }

  /* ---------- Controls ---------- */
  buildThumbs();
  buildGenThumbs();
  syncBgUI();
  buildKinds();
  buildCorners();
  buildMarkColors();
  const onBgColor = () => { refreshGenThumbs(); renderPreview(); };
  hexPicker($('bgAChips'), BG_PALETTE, () => state.bgA, (h) => { state.bgA = h; onBgColor(); });
  hexPicker($('bgBChips'), BG_PALETTE, () => state.bgB, (h) => { state.bgB = h; onBgColor(); });
  hexPicker($('textColorChips'), [...TEXT_COLORS.map((c) => c.hex), '#FFFFFF'], () => state.textColor, (h) => { state.textColor = h; renderPreview(); });

  $('opacity').addEventListener('input', (e) => {
    state.opacity = e.target.value / 100;
    $('opacityOut').textContent = e.target.value + '%';
    renderPreview();
  });
  $('textSize').addEventListener('input', (e) => {
    state.textScale = e.target.value / 100;
    $('textSizeOut').textContent = e.target.value + '%';
    renderPreview();
  });
  $('nameText').addEventListener('input', (e) => {
    state.text = e.target.value;
    renderPreview();
  });

  /* ---------- Export ---------- */
  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  function canvasBlob(canvas, type) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob falhou'))), type);
      } catch (e) { reject(e); }
    });
  }

  function fileSlug() {
    const n = state.text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return 'itec-scholars-bg' + (n ? '-' + n : '');
  }

  function showError(e) {
    console.error(e);
    const msg = location.protocol === 'file:'
      ? 'Para exportar, abra o site pelo servidor local (start.bat).'
      : 'Não consegui exportar: ' + e.message;
    alert(msg);
  }

  btnPng.addEventListener('click', async () => {
    try {
      try { await document.fonts.load('40px Pavilion'); } catch (_) {}
      const bgImg = await getBgImg();
      const markImg = state.kind === 'none' ? null : await loadImg(markSrc(state.kind, state.color));
      const drawable = markImg && state.color === 'custom' ? tint(markImg, state.customHex) : markImg;
      const W = 1920, H = 1080;
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      drawBase(ctx, W, H, bgImg, drawable);
      if (state.kind === 'giro' && markImg) {
        drawGiroStatic(ctx, W, H, drawable, markImg.naturalWidth / markImg.naturalHeight);
      }
      const t = document.createElement('canvas');
      t.width = W; t.height = H;
      drawText(t.getContext('2d'), W, H);
      ctx.drawImage(t, 0, 0);
      download(await canvasBlob(c, 'image/png'), fileSlug() + '.png');
    } catch (e) { showError(e); }
  });

  const progress = $('progress');
  function setProgress(p, label) {
    progress.hidden = false;
    $('progressFill').style.width = Math.round(p * 100) + '%';
    $('progressLabel').textContent = label;
  }

  /* ---------- Empacotador MP4 mínimo (H.264, sem dependências) ---------- */
  function buildMp4(samples, avcC, W, H, fps) {
    const TS = 90000;
    const delta = Math.round(TS / fps);
    const N = samples.length;
    const dur = N * delta;

    const u32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
    const u16 = (n) => [(n >>> 8) & 255, n & 255];
    const ascii = (s) => Array.from(s, (c) => c.charCodeAt(0));
    const zeros = (n) => new Array(n).fill(0);
    const bytes = (a) => (a instanceof Uint8Array ? a : Uint8Array.from(a));
    const box = (type, ...kids) => {
      const parts = kids.map(bytes);
      const size = 8 + parts.reduce((a, p) => a + p.length, 0);
      const out = new Uint8Array(size);
      out.set(bytes(u32(size)), 0);
      out.set(bytes(ascii(type)), 4);
      let o = 8;
      for (const p of parts) { out.set(p, o); o += p.length; }
      return out;
    };

    const matrix = [0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000].flatMap(u32);

    const ftyp = box('ftyp', [...ascii('isom'), ...u32(512), ...ascii('isom'), ...ascii('iso2'), ...ascii('avc1'), ...ascii('mp41')]);

    const keys = [];
    samples.forEach((s, i) => { if (s.key) keys.push(i + 1); });

    const moovFor = (offset) => {
      const mvhd = box('mvhd', [
        ...u32(0), ...u32(0), ...u32(0), ...u32(TS), ...u32(dur), ...u32(0x10000), ...u16(0x0100),
        ...zeros(2), ...zeros(8), ...matrix, ...zeros(24), ...u32(2)
      ]);
      const tkhd = box('tkhd', [
        ...u32(3), ...u32(0), ...u32(0), ...u32(1), ...u32(0), ...u32(dur), ...zeros(8),
        ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...matrix, ...u32(W * 65536), ...u32(H * 65536)
      ]);
      const mdhd = box('mdhd', [...u32(0), ...u32(0), ...u32(0), ...u32(TS), ...u32(dur), ...u16(0x55c4), ...u16(0)]);
      const hdlr = box('hdlr', [...u32(0), ...u32(0), ...ascii('vide'), ...zeros(12), ...ascii('VideoHandler'), 0]);
      const vmhd = box('vmhd', [0, 0, 0, 1, ...zeros(8)]);
      const dinf = box('dinf', box('dref', [...u32(0), ...u32(1)], box('url ', [0, 0, 0, 1])));
      const avc1 = box('avc1', [
        ...zeros(6), ...u16(1), ...u16(0), ...u16(0), ...zeros(12), ...u16(W), ...u16(H),
        ...u32(0x480000), ...u32(0x480000), ...u32(0), ...u16(1), ...zeros(32), ...u16(0x18), ...u16(0xffff)
      ], box('avcC', avcC));
      const stsd = box('stsd', [...u32(0), ...u32(1)], avc1);
      const stts = box('stts', [...u32(0), ...u32(1), ...u32(N), ...u32(delta)]);
      const stss = box('stss', [...u32(0), ...u32(keys.length), ...keys.flatMap(u32)]);
      const stsc = box('stsc', [...u32(0), ...u32(1), ...u32(1), ...u32(N), ...u32(1)]);
      const stsz = box('stsz', [...u32(0), ...u32(0), ...u32(N), ...samples.flatMap((s) => u32(s.data.length))]);
      const stco = box('stco', [...u32(0), ...u32(1), ...u32(offset)]);
      const stbl = box('stbl', stsd, stts, stss, stsc, stsz, stco);
      const minf = box('minf', vmhd, dinf, stbl);
      const mdia = box('mdia', mdhd, hdlr, minf);
      const trak = box('trak', tkhd, mdia);
      return box('moov', mvhd, trak);
    };

    const moovLen = moovFor(0).length;
    const moov = moovFor(ftyp.length + moovLen + 8);
    const mdat = box('mdat', ...samples.map((s) => s.data));
    return new Blob([ftyp, moov, mdat], { type: 'video/mp4' });
  }

  /* ---------- Exportar MP4 (logo girando) ---------- */
  btnGif.addEventListener('click', async () => {
    if (state.kind !== 'giro') return;
    btnGif.disabled = true; btnPng.disabled = true;
    let decoder = null, encoder = null;
    try {
      if (!('VideoEncoder' in window) || !('ImageDecoder' in window)) {
        throw new Error('Seu navegador não exporta MP4. Use o Chrome ou o Edge atualizado.');
      }
      try { await document.fonts.load('40px Pavilion'); } catch (_) {}

      const W = 1920, H = 1080, FPS = 30;
      const frameDur = 1000 / FPS;
      setProgress(0, 'Lendo o GIF…');

      const buf = await (await fetch(markSrc('giro', state.color))).arrayBuffer();
      decoder = new ImageDecoder({ data: buf, type: 'image/gif' });
      await decoder.tracks.ready;
      const n = decoder.tracks.selectedTrack.frameCount;

      const encConfig = {
        codec: 'avc1.640028', width: W, height: H, bitrate: 6_000_000, framerate: FPS,
        avc: { format: 'avc' }
      };
      const support = await VideoEncoder.isConfigSupported(encConfig);
      if (!support.supported) throw new Error('Seu navegador não tem encoder H.264. Use o Chrome ou o Edge atualizado.');

      const samples = [];
      let avcC = null, encErr = null;
      encoder = new VideoEncoder({
        output: (chunk, meta) => {
          if (!avcC && meta && meta.decoderConfig && meta.decoderConfig.description) {
            avcC = new Uint8Array(meta.decoderConfig.description.slice
              ? meta.decoderConfig.description.slice(0)
              : meta.decoderConfig.description);
          }
          const data = new Uint8Array(chunk.byteLength);
          chunk.copyTo(data);
          samples.push({ data, key: chunk.type === 'key' });
        },
        error: (e) => { encErr = e; }
      });
      encoder.configure(encConfig);

      // camada estática: fundo (+ texto por cima do GIF)
      const bgImg = await getBgImg();
      const baseC = document.createElement('canvas');
      baseC.width = W; baseC.height = H;
      drawBase(baseC.getContext('2d'), W, H, bgImg, null);
      const textC = document.createElement('canvas');
      textC.width = W; textC.height = H;
      drawText(textC.getContext('2d'), W, H);

      const out = document.createElement('canvas');
      out.width = W; out.height = H;
      const octx = out.getContext('2d');

      let rects = null;
      let tintC = null; // buffer para recolorir cada quadro do GIF
      let nextT = 0, tStart = 0, outIndex = 0;

      for (let i = 0; i < n; i++) {
        const { image } = await decoder.decode({ frameIndex: i });
        if (!rects) rects = markRects(state, image.displayWidth / image.displayHeight, W, H);
        let frameSrc = image;
        if (state.color === 'custom') {
          if (!tintC) {
            tintC = document.createElement('canvas');
            tintC.width = image.displayWidth;
            tintC.height = image.displayHeight;
          }
          const tx = tintC.getContext('2d');
          tx.globalCompositeOperation = 'source-over';
          tx.clearRect(0, 0, tintC.width, tintC.height);
          tx.drawImage(image, 0, 0);
          tx.globalCompositeOperation = 'source-in';
          tx.fillStyle = state.customHex;
          tx.fillRect(0, 0, tintC.width, tintC.height);
          tx.globalCompositeOperation = 'source-over';
          frameSrc = tintC;
        }
        const tEnd = tStart + Math.max(20, (image.duration || 40000) / 1000);

        while (nextT < tEnd) {
          octx.globalAlpha = 1;
          octx.drawImage(baseC, 0, 0);
          for (const r of rects) {
            octx.globalAlpha = r.alpha;
            octx.drawImage(frameSrc, r.x, r.y, r.w, r.h);
          }
          octx.globalAlpha = 1;
          octx.drawImage(textC, 0, 0);
          const vf = new VideoFrame(out, { timestamp: Math.round(nextT * 1000), duration: Math.round(frameDur * 1000) });
          encoder.encode(vf, { keyFrame: outIndex % 60 === 0 });
          vf.close();
          outIndex++;
          nextT += frameDur;
          if (encErr) throw encErr;
          while (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 5));
        }
        image.close();
        tStart = tEnd;
        setProgress(Math.min(0.95, (i + 1) / n), 'Gerando o vídeo…');
        await new Promise((r) => setTimeout(r));
      }

      await encoder.flush();
      if (encErr) throw encErr;
      if (!avcC || !samples.length) throw new Error('O encoder não devolveu vídeo.');

      const blob = buildMp4(samples, avcC, W, H, FPS);
      setProgress(1, 'Pronto!');
      download(blob, fileSlug() + '.mp4');
      setTimeout(() => { progress.hidden = true; }, 2500);
    } catch (e) {
      progress.hidden = true;
      showError(e);
    } finally {
      try { decoder && decoder.close(); } catch (_) {}
      try { encoder && encoder.state !== 'closed' && encoder.close(); } catch (_) {}
      btnPng.disabled = false;
      btnGif.disabled = state.kind !== 'giro';
    }
  });

  /* ---------- Init ---------- */
  syncMarkUI();
  renderPreview();
})();
