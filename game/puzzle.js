// ===== PRESETS =====
const presets = [
  { id: 'p1', title: 'Mountain', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p2', title: 'City', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p3', title: 'Animals', url: 'https://images.unsplash.com/photo-1446816653964-521218a8d1c4?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p4', title: 'Friends', url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop' }
];

// ===== DOM ELEMENTS =====
const menuToggleBtn = document.getElementById('menuToggleBtn');
const menuOverlay = document.getElementById('menuOverlay');
const presetList = document.getElementById('presetList');
const presetSizes = document.getElementById('presetSizes');
const menuCols = document.getElementById('menuCols');
const menuRows = document.getElementById('menuRows');
const menuCreate = document.getElementById('menuCreate');
const menuUseUploaded = document.getElementById('menuUseUploaded');
const menuClose = document.getElementById('menuClose');
const menuUpload = document.getElementById('menuUpload');

const imageUpload = document.getElementById('imageUpload');
const previewBtn = document.getElementById('previewBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const enableCheckEl = document.getElementById('enableCheck');
const puzzle = document.getElementById('puzzle');
const previewContainer = document.getElementById('previewContainer');
const previewPuzzle = document.getElementById('previewPuzzle');
const message = document.getElementById('message');
const timerDisplay = document.getElementById('timer');

const overlayComplete = document.getElementById('overlayComplete');
const overlayTime = document.getElementById('overlayTime');
const overlayShuffle = document.getElementById('overlayShuffle');
const overlayNew = document.getElementById('overlayNew');
const overlayClose = document.getElementById('overlayClose');

// ===== STATE =====
let selectedPreset = presets[0];
let uploadedURL = '';
let imageURL = selectedPreset.url;
let cols = 5, rows = 6;
let pieceWidth = 100, pieceHeight = 100;
let cells = [];
let started = false;
let startTime = null;
let timer = null;
let pieceIdCounter = 0;
let solvedAlready = false;
let selectedPiece = null;

// ===== BUILD PRESETS =====
presets.forEach(p => {
  const el = document.createElement('div');
  el.className = 'presetItem';
  el.dataset.id = p.id;
  el.innerHTML = `<img src="${p.url}" alt="${p.title}"><div>${p.title}</div>`;
  el.addEventListener('click', () => {
    document.querySelectorAll('.presetItem').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    selectedPreset = p;
    imageURL = p.url;
  });
  presetList.appendChild(el);
});
if (presetList.firstChild) presetList.firstChild.classList.add('selected');

// ===== MENU TOGGLE =====
function openMenu() {
  menuOverlay.style.display = 'flex';
  menuOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  menuOverlay.style.display = 'none';
  menuOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

menuToggleBtn.addEventListener('click', () => {
  if (menuOverlay.style.display === 'flex') closeMenu();
  else openMenu();
});

menuClose.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', (e) => {
  if (e.target === menuOverlay) closeMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (menuOverlay.style.display === 'flex') closeMenu();
    if (overlayComplete.style.display === 'flex') hideComplete();
  }
});

// ===== MENU UPLOAD =====
menuUpload.addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  if (uploadedURL) URL.revokeObjectURL(uploadedURL);
  uploadedURL = URL.createObjectURL(f);
  imageURL = uploadedURL;
  document.querySelectorAll('.presetItem').forEach(i => i.classList.remove('selected'));
  selectedPreset = null;
});

// ===== QUICK UPLOAD =====
imageUpload.addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  if (uploadedURL) URL.revokeObjectURL(uploadedURL);
  uploadedURL = URL.createObjectURL(f);
  imageURL = uploadedURL;
  message.textContent = '✅ Custom image uploaded. Open the menu and click "Start Puzzle."';
});

// ===== PRESET SIZES =====
presetSizes.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    presetSizes.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    menuCols.value = btn.dataset.cols;
    menuRows.value = btn.dataset.rows;
  });
});

// ===== USE UPLOADED =====
menuUseUploaded.addEventListener('click', () => {
  if (!uploadedURL) return alert('First, upload your image to the menu.');
  imageURL = uploadedURL;
  selectedPreset = null;
  document.querySelectorAll('.presetItem').forEach(i => i.classList.remove('selected'));
  message.textContent = '✅ Uploaded image is ready. Click "Start Puzzle."';
});

// ===== CREATE PUZZLE =====
menuCreate.addEventListener('click', () => {
  const c = Math.max(1, Math.min(30, +menuCols.value || 1));
  const r = Math.max(1, Math.min(30, +menuRows.value || 1));
  if (!imageURL) return alert('Select or upload an image from the menu.');
  createPuzzle(imageURL, c, r);
  closeMenu();
});

function createPuzzle(imgSrc, c, r) {
  cols = c;
  rows = r;
  const canvasSize = 500;
  pieceWidth = Math.floor(canvasSize / cols);
  pieceHeight = Math.floor(canvasSize / rows);

  puzzle.innerHTML = '';
  cells = [];
  pieceIdCounter = 0;
  solvedAlready = false;
  selectedPiece = null;

  puzzle.style.gridTemplateColumns = `repeat(${cols}, ${pieceWidth}px)`;
  puzzle.style.gridTemplateRows = `repeat(${rows}, ${pieceHeight}px)`;

  for (let i = 0; i < cols * rows; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.style.width = pieceWidth + 'px';
    cell.style.height = pieceHeight + 'px';
    cell.dataset.index = i;

    cell.addEventListener('dragover', e => { e.preventDefault(); cell.classList.add('drop-target'); });
    cell.addEventListener('dragleave', () => cell.classList.remove('drop-target'));
    cell.addEventListener('drop', onDropOnCell);

    const piece = document.createElement('div');
    piece.className = 'piece';
    piece.draggable = true;
    piece.id = 'piece-' + (pieceIdCounter++);

    const rr = Math.floor(i / cols), cc = i % cols;
    piece.style.backgroundImage = `url(${imgSrc})`;
    piece.style.backgroundSize = `${cols * pieceWidth}px ${rows * pieceHeight}px`;
    piece.style.backgroundPosition = `-${cc * pieceWidth}px -${rr * pieceHeight}px`;
    piece.dataset.correct = i;

    piece.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', piece.id);
      piece.classList.add('dragging');
      if (!started) startTimer();
    });
    piece.addEventListener('dragend', () => {
      piece.classList.remove('dragging');
      document.querySelectorAll('.cell.drop-target').forEach(el => el.classList.remove('drop-target'));
    });
    piece.addEventListener('click', e => { e.stopPropagation(); toggleSelect(piece); });

    piece.addEventListener('touchstart', onTouchStart, { passive: false });
    piece.addEventListener('touchmove', onTouchMove, { passive: false });
    piece.addEventListener('touchend', onTouchEnd);

    cell.appendChild(piece);
    cells.push(cell);
    puzzle.appendChild(cell);
  }

  shuffle();
  shuffleBtn.disabled = false;
  resetTimer();
  previewContainer.style.display = 'none';
  previewPuzzle.innerHTML = '';
  message.textContent = '🎮 The puzzle is ready. Start solving!';
}

// ===== SHUFFLE =====
shuffleBtn.addEventListener('click', () => {
  shuffle();
  solvedAlready = false;
  hideComplete();
  resetTimer();
  message.textContent = '🔀 The puzzle is shuffled!';
});

function shuffle() {
  if (!cells.length) return;
  const pieces = cells.map(c => c.firstChild);
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  cells.forEach((cell, i) => cell.appendChild(pieces[i]));
  document.querySelectorAll('.piece').forEach(p => p.style.border = '2px solid transparent');
}

// ===== DROP HANDLER =====
function onDropOnCell(e) {
  e.preventDefault();
  this.classList.remove('drop-target');
  const draggedId = e.dataTransfer.getData('text/plain');
  const dragged = document.getElementById(draggedId);
  if (!dragged) return;
  const targetPiece = this.firstChild;
  const sourceCell = dragged.parentElement;
  if (sourceCell === this) return;
  sourceCell.appendChild(targetPiece);
  this.appendChild(dragged);
  dragged.classList.remove('selected', 'dragging');
  if (enableCheckEl.checked) checkPositions();
  else if (isSolved()) finishPuzzle();
}

// ===== SELECTION =====
function toggleSelect(piece) {
  if (selectedPiece) selectedPiece.classList.remove('selected');
  if (selectedPiece === piece) selectedPiece = null;
  else {
    selectedPiece = piece;
    piece.classList.add('selected');
  }
  if (!started && selectedPiece) startTimer();
}

puzzle.addEventListener('click', e => {
  const cell = e.target.closest('.cell');
  if (!cell || !selectedPiece) return;
  const targetPiece = cell.firstChild;
  const sourceCell = selectedPiece.parentElement;
  if (targetPiece === selectedPiece) return;
  sourceCell.appendChild(targetPiece);
  cell.appendChild(selectedPiece);
  selectedPiece.classList.remove('selected');
  selectedPiece = null;
  if (enableCheckEl.checked) checkPositions();
  else if (isSolved()) finishPuzzle();
});

// ===== CHECK POSITIONS =====
function checkPositions() {
  if (!cells.length) return;
  let solved = true;
  cells.forEach((cell, i) => {
    const piece = cell.firstChild;
    if (+piece.dataset.correct === i) piece.style.border = '2px solid #4caf50';
    else {
      piece.style.border = '2px solid #f44336';
      solved = false;
    }
  });
  if (solved) finishPuzzle();
}

function isSolved() {
  return cells.length && cells.every((cell, i) => +cell.firstChild.dataset.correct === i);
}

// ===== CHECK TOGGLE =====
enableCheckEl.addEventListener('change', () => {
  if (enableCheckEl.checked) {
    checkPositions();
    message.textContent = '✓ Position checking enabled. Green = correct, Red = wrong.';
  } else {
    document.querySelectorAll('.piece').forEach(p => p.style.border = '2px solid transparent');
    message.textContent = '✗ Position checking disabled. Puzzle solves when all tiles are correct.';
  }
});

// ===== FINISH =====
function finishPuzzle() {
  if (solvedAlready) return;
  solvedAlready = true;
  stopTimer();
  message.textContent = '🎉 Puzzle complete!';
  overlayTime.textContent = `⏱️ Time: ${formatElapsedTime()}`;
  showComplete();
}

function showComplete() {
  overlayComplete.style.display = 'flex';
  overlayComplete.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function hideComplete() {
  overlayComplete.style.display = 'none';
  overlayComplete.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

overlayShuffle.addEventListener('click', () => {
  hideComplete();
  shuffle();
  resetTimer();
  solvedAlready = false;
  message.textContent = '🔀 The puzzle is shuffled!';
});

overlayNew.addEventListener('click', () => {
  hideComplete();
  openMenu();
});

overlayClose.addEventListener('click', hideComplete);

// ===== TIMER =====
function startTimer() {
  if (started) return;
  started = true;
  startTime = performance.now();
  timer = setInterval(() => {
    const t = performance.now() - startTime;
    const ms = Math.floor(t % 1000).toString().padStart(3, '0');
    const sec = Math.floor(t / 1000) % 60;
    const min = Math.floor(t / 60000);
    timerDisplay.textContent = `⏱️ Time: ${min}:${sec.toString().padStart(2, '0')}:${ms}`;
  }, 50);
}

function stopTimer() {
  clearInterval(timer);
}

function resetTimer() {
  clearInterval(timer);
  started = false;
  startTime = null;
  timerDisplay.textContent = '⏱️ Time: 0:00:000';
}

function formatElapsedTime() {
  if (!startTime) return '0:00:000';
  const t = performance.now() - startTime;
  const ms = Math.floor(t % 1000).toString().padStart(3, '0');
  const sec = Math.floor(t / 1000) % 60;
  const min = Math.floor(t / 60000);
  return `${min}:${sec.toString().padStart(2, '0')}:${ms}`;
}

// ===== PREVIEW =====
previewBtn.addEventListener('click', () => {
  if (!imageURL) return alert('Choose image from menu');
  if (previewContainer.style.display === 'block') {
    previewContainer.style.display = 'none';
    previewContainer.setAttribute('aria-hidden', 'true');
    previewBtn.textContent = '👁️ Preview';
    return;
  }
  const canvasSize = 500;
  const pW = Math.floor(canvasSize / cols);
  const pH = Math.floor(canvasSize / rows);
  previewPuzzle.innerHTML = '';
  previewPuzzle.style.gridTemplateColumns = `repeat(${cols}, ${pW}px)`;
  previewPuzzle.style.gridTemplateRows = `repeat(${rows}, ${pH}px)`;
  for (let i = 0; i < cols * rows; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const pp = document.createElement('div');
    pp.style.width = pW + 'px';
    pp.style.height = pH + 'px';
    pp.style.backgroundImage = `url(${imageURL})`;
    pp.style.backgroundSize = `${cols * pW}px ${rows * pH}px`;
    pp.style.backgroundPosition = `-${c * pW}px -${r * pH}px`;
    previewPuzzle.appendChild(pp);
  }
  previewContainer.style.display = 'block';
  previewContainer.setAttribute('aria-hidden', 'false');
  previewBtn.textContent = '✕ Hide';
});

// ===== TOUCH SUPPORT =====
let touchDrag = { piece: null, srcCell: null, currentTargetCell: null };

function onTouchStart(e) {
  e.preventDefault();
  const piece = e.currentTarget;
  touchDrag.piece = piece;
  touchDrag.srcCell = piece.parentElement;
  piece.classList.add('dragging');
  if (!started) startTimer();
}

function onTouchMove(e) {
  if (!touchDrag.piece) return;
  e.preventDefault();
  const touch = e.changedTouches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  const cell = el ? el.closest('.cell') : null;
  if (cell !== touchDrag.currentTargetCell) {
    if (touchDrag.currentTargetCell) touchDrag.currentTargetCell.classList.remove('drop-target');
    touchDrag.currentTargetCell = cell;
    if (cell) cell.classList.add('drop-target');
  }
}

function onTouchEnd(e) {
  if (!touchDrag.piece) return;
  const piece = touchDrag.piece;
  const targetCell = touchDrag.currentTargetCell;
  piece.classList.remove('dragging');
  if (targetCell && targetCell !== touchDrag.srcCell) {
    const targetPiece = targetCell.firstChild;
    const srcCell = touchDrag.srcCell;
    srcCell.appendChild(targetPiece);
    targetCell.appendChild(piece);
    if (enableCheckEl.checked) checkPositions();
    else if (isSolved()) finishPuzzle();
  }
  document.querySelectorAll('.cell.drop-target').forEach(el => el.classList.remove('drop-target'));
  touchDrag = { piece: null, srcCell: null, currentTargetCell: null };
}

// ===== INIT =====
message.textContent = 'Click "Menu" to select an image and size. "Check positions" can be toggled on/off.';
