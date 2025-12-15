// Elementos principais
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const modeSelect = document.getElementById('modeSelect');
const typeSelect = document.getElementById('typeSelect');
const postTypeHeader = document.getElementById('post-type');
const postTypeInline = document.getElementById('postTypeInline');
const postTextEl = document.getElementById('postText');
const tweetTextEl = document.getElementById('tweetText');

const mediaInput = document.getElementById('mediaInput');
const imageEl = document.getElementById('imageEl');
const videoEl = document.getElementById('videoEl');

const zoomInput = document.getElementById('zoom');
const posXInput = document.getElementById('posX');
const posYInput = document.getElementById('posY');

const wmInput = document.getElementById('wmInput');
const wmEl = document.getElementById('wmEl');
const wmPos = document.getElementById('wmPos');
const wmOpacity = document.getElementById('wmOpacity');
const wmScale = document.getElementById('wmScale');

const profileInput = document.getElementById('profileInput');
const profilePicHeader = document.getElementById('profilePicHeader');
const profilePicInline = document.getElementById('profilePicInline');

const frame = document.getElementById('frame');
const exportBtn = document.getElementById('exportBtn');
const exportCanvas = document.getElementById('exportCanvas');

let currentMode = 'feed'; // 'feed' or 'reels'
let imgLoaded = false;
let dragState = { dragging: false, startX: 0, startY: 0, imgX: 0, imgY: 0 };

// Tema claro/escuro
themeBtn.addEventListener('click', () => {
  if (body.classList.contains('light')) {
    body.classList.remove('light'); body.classList.add('dark');
  } else {
    body.classList.remove('dark'); body.classList.add('light');
  }
});

// Troca de modo Feed/Reels
modeSelect.addEventListener('change', () => {
  currentMode = modeSelect.value;
  frame.classList.toggle('reels', currentMode === 'reels');

  // Ajusta canvas de exportação
  if (currentMode === 'feed') {
    exportCanvas.width = 1080; exportCanvas.height = 1080;
  } else {
    exportCanvas.width = 1080; exportCanvas.height = 1920;
  }
  // Reset de posicionamento
  posXInput.value = 0; posYInput.value = 0; zoomInput.value = 100;
  applyImageTransform();
});

// Categoria
typeSelect.addEventListener('change', () => {
  const label = `[${typeSelect.value}]`;
  postTypeHeader.textContent = label;
  postTypeInline.textContent = label;
});

// Texto
postTextEl.addEventListener('input', () => {
  tweetTextEl.textContent = postTextEl.value || '';
});

// Upload de mídia
mediaInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  if (file.type.startsWith('image')) {
    videoEl.style.display = 'none';
    imageEl.style.display = 'block';
    imageEl.src = url;
    imgLoaded = true;
    zoomInput.value = 100; posXInput.value = 0; posYInput.value = 0;
    applyImageTransform();
  } else if (file.type.startsWith('video')) {
    imageEl.style.display = 'none';
    videoEl.style.display = 'block';
    videoEl.src = url;
    imgLoaded = false;
  }
});

// Arrastar imagem para reposicionar
imageEl.addEventListener('mousedown', (e) => startDrag(e));
imageEl.addEventListener('touchstart', (e) => startDrag(e.touches[0]));
window.addEventListener('mousemove', (e) => onDrag(e));
window.addEventListener('touchmove', (e) => onDrag(e.touches[0]));
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function startDrag(e) {
  if (imageEl.style.display !== 'block') return;
  dragState.dragging = true;
  dragState.startX = e.clientX;
  dragState.startY = e.clientY;
  dragState.imgX = parseFloat(posXInput.value);
  dragState.imgY = parseFloat(posYInput.value);
}
function onDrag(e) {
  if (!dragState.dragging) return;
  const dx = e.clientX - dragState.startX;
  const dy = e.clientY - dragState.startY;
  posXInput.value = dragState.imgX + dx;
  posYInput.value = dragState.imgY + dy;
  applyImageTransform();
}
function endDrag() { dragState.dragging = false; }

// Sliders de corte
[zoomInput, posXInput, posYInput].forEach(inp => inp.addEventListener('input', applyImageTransform));

function applyImageTransform() {
  if (imageEl.style.display !== 'block') return;
  const scale = parseFloat(zoomInput.value) / 100;
  const x = parseFloat(posXInput.value);
  const y = parseFloat(posYInput.value);
  imageEl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
}

// Marca d’água
wmInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) { wmEl.style.display = 'none'; return; }
  const url = URL.createObjectURL(file);
  wmEl.src = url;
  wmEl.style.display = 'block';
  updateWatermark();
});
[wmPos, wmOpacity, wmScale].forEach(el => el.addEventListener('input', updateWatermark));

function updateWatermark() {
  wmEl.style.opacity = (parseInt(wmOpacity.value, 10) / 100).toString();
  wmEl.style.width = `${parseInt(wmScale.value, 10)}px`;
  const pad = 16;
  const w = parseInt(wmScale.value, 10);
  const h = w;

  switch (wmPos.value) {
    case 'bottom-right':
      wmEl.style.left = `calc(100% - ${w + pad}px)`; wmEl.style.top = `calc(100% - ${h + pad}px)`; break;
    case 'bottom-left':
      wmEl.style.left = `${pad}px`; wmEl.style.top = `calc(100% - ${h + pad}px)`; break;
    case 'top-right':
      wmEl.style.left = `calc(100% - ${w + pad}px)`; wmEl.style.top = `${pad}px`; break;
    case 'top-left':
      wmEl.style.left = `${pad}px`; wmEl.style.top = `${pad}px`; break;
    case 'center':
      wmEl.style.left = `calc(50% - ${w/2}px)`; wmEl.style.top = `calc(50% - ${h/2}px)`; break;
  }
}

// Foto de perfil fixa (só muda se você trocar)
profileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  profilePicHeader.src = url;
  profilePicInline.src = url;
});

// Exportar imagem final
exportBtn.addEventListener('click', () => {
  // Ajusta tamanho do canvas
  if (currentMode === 'feed') {
    exportCanvas.width = 1080; exportCanvas.height = 1080;
  } else {
    exportCanvas.width = 1080; exportCanvas.height = 1920;
  }

  const ctx = exportCanvas.getContext('2d');
  const W = exportCanvas.width;
  const H = exportCanvas.height;

  // Fundo
  ctx.fillStyle = body.classList.contains('dark') ? '#0d1117' : '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Área interna (padding)
  const pad = Math.round(W * 0.02);
  const innerX = pad, innerY = pad;
  const innerW = W - pad*2, innerH = H - pad*2;

  // Cabeçalho
  // Renderiza avatar
  drawRoundedImage(ctx, profilePicInline.src || 'perfil.png', innerX, innerY, Math.round(W*0.05));

  // Nome, handle, categoria
  ctx.fillStyle = body.classList.contains('dark') ? '#c9d1d9' : '#0f1419';
  ctx.font = `${Math.round(W*0.028)}px Arial`; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  ctx.fillText('sobreitapevi', innerX + Math.round(W*0.06), innerY);
  ctx.fillStyle = body.classList.contains('dark') ? '#8b949e' : '#6b7280';
  ctx.font = `${Math.round(W*0.022)}px Arial`;
  ctx.fillText('@sobreitapevi', innerX + Math.round(W*0.06), innerY + Math.round(W*0.03));

  // Categoria semi-transparente ao lado do nome
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = body.classList.contains('dark') ? '#c9d1d9' : '#0f1419';
  ctx.font = `${Math.round(W*0.022)}px Arial`;
  ctx.fillText(postTypeInline.textContent, innerX + Math.round(W*0.30), innerY);
  ctx.globalAlpha = 1.0;

  // Timestamp
  ctx.fillStyle = body.classList.contains('dark') ? '#8b949e' : '#6b7280';
  ctx.textAlign = 'right';
  ctx.fillText('1:14 PM · 26 Fev 2022', innerX + innerW, innerY);

  // Texto
  ctx.textAlign = 'left';
  ctx.fillStyle = body.classList.contains('dark') ? '#c9d1d9' : '#0f1419';
  ctx.font = `${Math.round(W*0.024)}px Arial`;
  const textTop = innerY + Math.round(W*0.07);
  wrapText(ctx, tweetTextEl.textContent || '', innerX, textTop, innerW, Math.round(W*0.032));

  // Mídia (área com cantos arredondados)
  const mediaTop = innerY + Math.round(W*0.18);
  const mediaH = currentMode === 'feed' ? innerH - Math.round(W*0.20) : innerH - Math.round(W*0.22);
  const mediaW = innerW;

  // Máscara
  ctx.save();
  roundRect(ctx, innerX, mediaTop, mediaW, mediaH, Math.round(W*0.015), false, true);
  // Fundo preto da mídia
  ctx.fillStyle = '#000000'; ctx.fillRect(innerX, mediaTop, mediaW, mediaH);

  if (imageEl.style.display === 'block' && imageEl.src) {
    const scale = parseFloat(zoomInput.value) / 100;
    const x = parseFloat(posXInput.value);
    const y = parseFloat(posYInput.value);

    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.onload = () => {
      const drawW = tempImg.width * scale;
      const drawH = tempImg.height * scale;
      const centerX = innerX + mediaW/2 + x;
      const centerY = mediaTop + mediaH/2 + y;
      ctx.drawImage(tempImg, centerX - drawW/2, centerY - drawH/2, drawW, drawH);
      ctx.restore();
      drawWatermark(ctx, innerX, mediaTop, mediaW, mediaH, W);
      downloadCanvas();
    };
    tempImg.src = imageEl.src;
  } else {
    // Se for vídeo ou não tiver imagem
    ctx.restore();
    drawWatermark(ctx, innerX, mediaTop, mediaW, mediaH, W);
    downloadCanvas();
  }
});

// Utilidades
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = (text || '').split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function roundRect(ctx, x, y, w, h, r, fill, clip) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  if (clip) ctx.clip();
  if (fill) ctx.fill();
  ctx.closePath();
}

function drawWatermark(ctx, x, y, w, h, W) {
  if (!wmEl.src || wmEl.style.display === 'none') return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const alpha = parseInt(wmOpacity.value, 10) / 100;
    ctx.globalAlpha = alpha;
    const size = parseInt(wmScale.value, 10) * (W / 540); // proporcional ao export
    let drawX = x + w - size - 16;
    let drawY = y + h - size - 16;
    if (wmPos.value === 'bottom-left') { drawX = x + 16; drawY = y + h - size - 16; }
    if (wmPos.value === 'top-right')   { drawX = x + w - size - 16; drawY = y + 16; }
    if (wmPos.value === 'top-left')    { drawX = x + 16; drawY = y + 16; }
    if (wmPos.value === 'center')      { drawX = x + w/2 - size/2; drawY = y + h/2 - size/2; }
    ctx.drawImage(img, drawX, drawY, size, size);
    ctx.globalAlpha = 1.0;
  };
  img.src = wmEl.src;
}

function downloadCanvas() {
  const link = document.createElement('a');
  const filename = currentMode === 'feed' ? 'sobreitapevi-feed.png' : 'sobreitapevi-reels.png';
  link.download = filename;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

function drawRoundedImage(ctx, src, x, y, size) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  };
  img.src = src;
}

// Inicialização
(function init() {
  // Dimensão inicial do canvas (Feed)
  exportCanvas.width = 1080; exportCanvas.height = 1080;
  // Texto padrão do preview
  tweetTextEl.textContent = '';
})();

