/* ===== PUZZLE GAME MODULE ===== */
const game = {
  // Configuration
  presets: [
    { id: 'p1', title: 'Mountain', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop' },
    { id: 'p2', title: 'City', url: 'https://www.latvia.travel/sites/default/files/styles/mobile_promo/public/media_image/37315458162_8e53834697_k.jpg?itok=E_xOti-8' },
    { id: 'p3', title: 'Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop' },
    { id: 'p4', title: 'Ocean', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1200&auto=format&fit=crop' }
  ],

  // State
  state: {
    selectedPreset: null,
    uploadedURL: '',
    imageURL: '',
    currentImageName: 'Custom',
    cols: 5,
    rows: 6,
    pieceWidth: 100,
    pieceHeight: 100,
    cells: [],
    started: false,
    startTime: null,
    timer: null,
    solvedAlready: false,
    selectedPiece: null,
    hintsUsed: 0,
    isLoggedIn: false,
    touchDrag: { piece: null, srcCell: null, currentTargetCell: null }
  },

  // DOM Elements
  elements: {
    setupOverlay: document.getElementById('setupOverlay'),
    setupCreate: document.getElementById('setupCreate'),
    presetList: document.getElementById('presetList'),
    menuUpload: document.getElementById('menuUpload'),
    presetSizes: document.getElementById('presetSizes'),
    menuCols: document.getElementById('menuCols'),
    menuRows: document.getElementById('menuRows'),
    
    puzzle: document.getElementById('puzzle'),
    newPuzzleBtn: document.getElementById('newPuzzleBtn'),
    previewBtn: document.getElementById('previewBtn'),
    checkBtn: document.getElementById('checkBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    
    previewContainer: document.getElementById('previewContainer'),
    previewPuzzle: document.getElementById('previewPuzzle'),
    fullPreviewPuzzle: document.getElementById('fullPreviewPuzzle'),
    previewOverlay: document.getElementById('previewOverlay'),
    
    gameHeader: document.getElementById('gameHeader'),
    message: document.getElementById('message'),
    timer: document.getElementById('timer'),
    hintsCount: document.getElementById('hintsCount'),
    gridSize: document.getElementById('gridSize'),
    
    completionOverlay: document.getElementById('completionOverlay'),
    resultTime: document.getElementById('resultTime'),
    resultHints: document.getElementById('resultHints'),
    resultDifficulty: document.getElementById('resultDifficulty'),
    resultImageName: document.getElementById('resultImageName'),
    authPrompt: document.getElementById('authPrompt'),
    resultSignup: document.getElementById('resultSignup'),
    resultSave: document.getElementById('resultSave'),
    resultNew: document.getElementById('resultNew'),
    resultClose: document.getElementById('resultClose'),
    saveSection: document.getElementById('saveSection'),
    
    loginLink: document.getElementById('loginLink'),
    logoutBtn: document.getElementById('logoutBtn'),
    userInfo: document.getElementById('userInfo'),
  },

  // Initialize
  init() {
    this.state.selectedPreset = this.presets[0];
    this.state.imageURL = this.state.selectedPreset.url;
    this.state.currentImageName = this.state.selectedPreset.title;
    
    this.buildPresets();
    this.attachEventListeners();
    this.checkAuthStatus();
    
    console.log('🎮 Puzzle game initialized');
  },

  // Auth
  checkAuthStatus() {
    const token = sessionStorage.getItem('userToken');
    const userData = sessionStorage.getItem('userData');
    
    if (token && userData) {
      this.state.isLoggedIn = true;
      const user = JSON.parse(userData);
      this.updateUserUI(user);
      this.elements.authPrompt.style.display = 'none';
      this.elements.saveSection.style.display = 'block';
    } else {
      this.state.isLoggedIn = false;
      this.elements.userInfo.textContent = '';
      this.elements.loginLink.style.display = 'inline-block';
      this.elements.logoutBtn.style.display = 'none';
      this.elements.authPrompt.style.display = 'block';
      this.elements.saveSection.style.display = 'none';
    }
  },

  updateUserUI(user) {
    this.elements.userInfo.textContent = `👤 ${user.fullName}`;
    this.elements.loginLink.style.display = 'none';
    this.elements.logoutBtn.style.display = 'inline-block';
  },

  logout() {
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userData');
    this.state.isLoggedIn = false;
    this.checkAuthStatus();
    this.updateMessage('👋 Signed out');
  },

  // Build Presets
  buildPresets() {
    this.presets.forEach(p => {
      const el = document.createElement('div');
      el.className = 'presetItem';
      el.dataset.id = p.id;
      el.innerHTML = `
        <img src="${p.url}" alt="${p.title}">
        <div class="presetItem-name">${p.title}</div>
      `;
      el.addEventListener('click', () => this.selectPreset(p, el));
      this.elements.presetList.appendChild(el);
    });
    
    if (this.elements.presetList.firstChild) {
      this.elements.presetList.firstChild.classList.add('selected');
    }
  },

  selectPreset(preset, element) {
    document.querySelectorAll('.presetItem').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    this.state.selectedPreset = preset;
    this.state.imageURL = preset.url;
    this.state.currentImageName = preset.title;
  },

  // Event Listeners
  attachEventListeners() {
    // Setup
    this.elements.setupCreate.addEventListener('click', () => this.createFromSetup());
    
    // Presets
    this.elements.presetSizes.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => this.selectSize(btn));
    });
    
    // Upload
    this.elements.menuUpload.addEventListener('change', (e) => this.handleMenuUpload(e));
    
    // Game Controls
    this.elements.newPuzzleBtn.addEventListener('click', () => this.openSetup());
    this.elements.previewBtn.addEventListener('click', () => this.togglePreview());
    this.elements.checkBtn.addEventListener('click', () => this.checkPositionsManual());
    this.elements.shuffleBtn.addEventListener('click', () => this.handleShuffle());
    
    // Auth
    this.elements.loginLink.addEventListener('click', () => window.location.href = '../auth/index.html');
    this.elements.logoutBtn.addEventListener('click', () => this.logout());
    
    // Completion
    this.elements.resultNew.addEventListener('click', () => this.closeCompletion());
    this.elements.resultClose.addEventListener('click', () => this.closeCompletion());
    this.elements.resultSignup.addEventListener('click', () => window.location.href = '../auth/index.html');
    this.elements.resultSave.addEventListener('click', () => this.savePuzzleResult());
    
    // Preview
    this.elements.previewOverlay.addEventListener('click', () => this.closePreview());
    
    // Completion overlay - click outside to close
    this.elements.completionOverlay.addEventListener('click', (e) => {
      if (e.target === this.elements.completionOverlay) {
        this.closeCompletion();
      }
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePreview();
        this.closeCompletion();
      }
    });
  },

  // Setup
  openSetup() {
    this.elements.setupOverlay.classList.add('active');
  },

  closeSetup() {
    this.elements.setupOverlay.classList.remove('active');
  },

  selectSize(button) {
    this.elements.presetSizes.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    this.elements.menuCols.value = button.dataset.cols;
    this.elements.menuRows.value = button.dataset.rows;
  },

  handleMenuUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (this.state.uploadedURL) URL.revokeObjectURL(this.state.uploadedURL);
    this.state.uploadedURL = URL.createObjectURL(file);
    this.state.imageURL = this.state.uploadedURL;
    this.state.currentImageName = file.name;
    
    document.querySelectorAll('.presetItem').forEach(el => el.classList.remove('selected'));
  },

  createFromSetup() {
    const cols = Math.max(1, Math.min(20, +this.elements.menuCols.value || 5));
    const rows = Math.max(1, Math.min(20, +this.elements.menuRows.value || 6));
    
    if (!this.state.imageURL) {
      alert('Please select or upload an image');
      return;
    }
    
    this.createPuzzle(this.state.imageURL, cols, rows);
    this.closeSetup();
  },

  // Create Puzzle
  createPuzzle(imgSrc, cols, rows) {
    this.state.cols = cols;
    this.state.rows = rows;
    
    const canvasSize = Math.min(600, window.innerWidth - 40);
    this.state.pieceWidth = Math.floor(canvasSize / cols);
    this.state.pieceHeight = Math.floor(canvasSize / rows);

    // Reset
    this.elements.puzzle.innerHTML = '';
    this.state.cells = [];
    this.state.solvedAlready = false;
    this.state.selectedPiece = null;
    this.state.hintsUsed = 0;
    this.updateHintsDisplay();
    this.updateGridSize();

    // Setup grid
    this.elements.puzzle.style.gridTemplateColumns = `repeat(${cols}, ${this.state.pieceWidth}px)`;
    this.elements.puzzle.style.gridTemplateRows = `repeat(${rows}, ${this.state.pieceHeight}px)`;

    // Create pieces
    for (let i = 0; i < cols * rows; i++) {
      const cell = this.createCell(i, imgSrc);
      this.state.cells.push(cell);
      this.elements.puzzle.appendChild(cell);
    }

    this.shuffle();
    this.elements.shuffleBtn.disabled = false;
    this.resetTimer();
    this.elements.previewContainer.style.display = 'none';
    this.elements.previewPuzzle.innerHTML = '';
    this.updateMessage('🎮 Drag pieces to solve the puzzle!');
  },

  createCell(index, imgSrc) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.style.width = this.state.pieceWidth + 'px';
    cell.style.height = this.state.pieceHeight + 'px';
    cell.dataset.index = index;

    cell.addEventListener('dragover', (e) => {
      e.preventDefault();
      cell.classList.add('drop-target');
    });
    cell.addEventListener('dragleave', () => cell.classList.remove('drop-target'));
    cell.addEventListener('drop', (e) => this.onDropOnCell(e, cell));

    const piece = document.createElement('div');
    piece.className = 'piece';
    piece.draggable = true;
    piece.id = 'piece-' + index;

    const row = Math.floor(index / this.state.cols);
    const col = index % this.state.cols;
    
    piece.style.backgroundImage = `url(${imgSrc})`;
    piece.style.backgroundSize = `${this.state.cols * this.state.pieceWidth}px ${this.state.rows * this.state.pieceHeight}px`;
    piece.style.backgroundPosition = `-${col * this.state.pieceWidth}px -${row * this.state.pieceHeight}px`;
    piece.dataset.correct = index;

    piece.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', piece.id);
      piece.classList.add('dragging');
      if (!this.state.started) this.startTimer();
    });
    piece.addEventListener('dragend', () => {
      piece.classList.remove('dragging');
      document.querySelectorAll('.cell.drop-target').forEach(el => el.classList.remove('drop-target'));
    });
    piece.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSelect(piece);
    });

    piece.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    piece.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    piece.addEventListener('touchend', (e) => this.onTouchEnd(e));

    cell.appendChild(piece);
    return cell;
  },

  onDropOnCell(e, cell) {
    e.preventDefault();
    cell.classList.remove('drop-target');
    
    const draggedId = e.dataTransfer.getData('text/plain');
    const dragged = document.getElementById(draggedId);
    if (!dragged) return;

    const targetPiece = cell.firstChild;
    const sourceCell = dragged.parentElement;
    if (sourceCell === cell) return;

    sourceCell.appendChild(targetPiece);
    cell.appendChild(dragged);
    dragged.classList.remove('selected', 'dragging');

    this.checkPuzzleCompletion();
  },

  toggleSelect(piece) {
    if (this.state.selectedPiece) {
      this.state.selectedPiece.classList.remove('selected');
    }
    
    if (this.state.selectedPiece === piece) {
      this.state.selectedPiece = null;
    } else {
      this.state.selectedPiece = piece;
      piece.classList.add('selected');
    }
    
    if (!this.state.started && this.state.selectedPiece) {
      this.startTimer();
    }
  },

  checkPuzzleCompletion() {
    if (this.state.solvedAlready) return;

    if (this.isSolved()) {
      this.finishPuzzle();
    }
  },

  isSolved() {
    if (!this.state.cells.length) return false;
    
    return this.state.cells.every((cell, index) => {
      const piece = cell.firstChild;
      return +piece.dataset.correct === index;
    });
  },

  checkPositionsManual() {
    if (!this.state.cells.length) return;

    this.state.hintsUsed++;
    this.updateHintsDisplay();

    let solved = true;
    this.state.cells.forEach((cell, index) => {
      const piece = cell.firstChild;
      if (+piece.dataset.correct === index) {
        piece.style.border = '2px solid var(--success)';
      } else {
        piece.style.border = '2px solid var(--error)';
        solved = false;
      }
    });

    if (solved) {
      setTimeout(() => this.finishPuzzle(), 500);
    }
  },

  // Shuffle
  handleShuffle() {
    this.shuffle();
    this.resetTimer();
    this.state.solvedAlready = false;
    this.state.hintsUsed = 0;
    this.updateHintsDisplay();
    this.updateMessage('🔀 Puzzle shuffled!');
  },

  shuffle() {
    if (!this.state.cells.length) return;

    const pieces = this.state.cells.map(cell => cell.firstChild);
    
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }

    this.state.cells.forEach((cell, index) => cell.appendChild(pieces[index]));
    document.querySelectorAll('.piece').forEach(p => p.style.border = '2px solid transparent');
  },

  // Completion
  finishPuzzle() {
    if (this.state.solvedAlready) return;

    this.state.solvedAlready = true;
    this.stopTimer();
    
    this.playCompletionAnimation();
    this.showCompletion();
  },

  showCompletion() {
    this.elements.resultTime.textContent = this.formatElapsedTime();
    this.elements.resultHints.textContent = this.state.hintsUsed;
    this.elements.resultDifficulty.textContent = this.getDifficulty();
    this.elements.resultImageName.textContent = `📸 ${this.state.currentImageName}`;
    
    this.elements.completionOverlay.classList.add('active');
  },

  closeCompletion() {
    this.elements.completionOverlay.classList.remove('active');
    this.openSetup();
  },

  getDifficulty() {
    const total = this.state.cols * this.state.rows;
    if (total <= 9) return '🟢 Easy';
    if (total <= 30) return '🟡 Medium';
    if (total <= 48) return '🔴 Hard';
    return '⚫ Expert';
  },

  savePuzzleResult() {
    if (!this.state.isLoggedIn) {
      alert('Please sign in to save results');
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const result = {
      imageName: this.state.currentImageName,
      gridSize: `${this.state.cols}x${this.state.rows}`,
      timeElapsed: this.formatElapsedTime(),
      hintsUsed: this.state.hintsUsed,
      userId: userData.id,
      date: new Date().toISOString()
    };

    fetch('../auth/save-result.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        this.updateMessage('✅ Result saved!');
        setTimeout(() => this.closeCompletion(), 1500);
      }
    })
    .catch(err => console.error('Save error:', err));
  },

  playCompletionAnimation() {
    const celebMsg = document.createElement('div');
    celebMsg.className = 'celebration-emoji';
    celebMsg.textContent = '🎉';
    celebMsg.style.left = '50%';
    celebMsg.style.top = '50%';
    document.body.appendChild(celebMsg);
    
    setTimeout(() => celebMsg.remove(), 800);
    
    this.createConfetti();
    this.playSound();
  },

  createConfetti() {
    const emojis = ['🎉', '🎊', '⭐', '✨', '🌟'];
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'celebration-emoji';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        const x = Math.random() * window.innerWidth;
        const tx = (Math.random() - 0.5) * 200;
        
        el.style.left = x + 'px';
        el.style.top = '-50px';
        el.style.setProperty('--tx', tx + 'px');
        
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
      }, i * 30);
    }
  },

  playSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [
        { freq: 523.25, duration: 0.1 },
        { freq: 659.25, duration: 0.1 },
        { freq: 783.99, duration: 0.2 }
      ];
      
      let currentTime = audioContext.currentTime;
      notes.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = note.freq;
        gain.gain.setValueAtTime(0.3, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
        
        osc.start(currentTime);
        osc.stop(currentTime + note.duration);
        
        currentTime += note.duration;
      });
    } catch (e) {
      // Silent mode
    }
  },

  // Preview
  togglePreview() {
    if (this.elements.previewOverlay.classList.contains('active')) {
      this.closePreview();
    } else {
      this.renderFullPreview();
      this.elements.previewOverlay.classList.add('active');
    }
  },

  closePreview() {
    this.elements.previewOverlay.classList.remove('active');
  },

  renderFullPreview() {
    const canvasSize = Math.min(500, window.innerWidth - 60);
    const pW = Math.floor(canvasSize / this.state.cols);
    const pH = Math.floor(canvasSize / this.state.rows);

    this.elements.fullPreviewPuzzle.innerHTML = '';
    this.elements.fullPreviewPuzzle.style.gridTemplateColumns = `repeat(${this.state.cols}, ${pW}px)`;
    this.elements.fullPreviewPuzzle.style.gridTemplateRows = `repeat(${this.state.rows}, ${pH}px)`;

    for (let i = 0; i < this.state.cols * this.state.rows; i++) {
      const row = Math.floor(i / this.state.cols);
      const col = i % this.state.cols;

      const preview = document.createElement('div');
      preview.style.width = pW + 'px';
      preview.style.height = pH + 'px';
      preview.style.backgroundImage = `url(${this.state.imageURL})`;
      preview.style.backgroundSize = `${this.state.cols * pW}px ${this.state.rows * pH}px`;
      preview.style.backgroundPosition = `-${col * pW}px -${row * pH}px`;

      this.elements.fullPreviewPuzzle.appendChild(preview);
    }
  },

  // Timer
  startTimer() {
    if (this.state.started) return;

    this.state.started = true;
    this.state.startTime = performance.now();
    
    this.state.timer = setInterval(() => {
      const elapsed = performance.now() - this.state.startTime;
      this.elements.timer.textContent = this.formatTime(elapsed);
    }, 50);
  },

  stopTimer() {
    clearInterval(this.state.timer);
  },

  resetTimer() {
    clearInterval(this.state.timer);
    this.state.started = false;
    this.state.startTime = null;
    this.elements.timer.textContent = '0:00:000';
  },

  formatTime(ms) {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const secs = sec % 60;
    const ms_disp = Math.floor(ms % 1000);
    
    return `${min}:${secs.toString().padStart(2, '0')}:${ms_disp.toString().padStart(3, '0')}`;
  },

  formatElapsedTime() {
    if (!this.state.startTime) return '0:00:000';
    const elapsed = performance.now() - this.state.startTime;
    return this.formatTime(elapsed);
  },

  updateHintsDisplay() {
    this.elements.hintsCount.textContent = this.state.hintsUsed;
  },

  updateGridSize() {
    this.elements.gridSize.textContent = `${this.state.cols}×${this.state.rows}`;
  },

  updateMessage(text) {
    this.elements.message.textContent = text;
  },

  // Touch Support
  onTouchStart(e) {
    e.preventDefault();
    const piece = e.currentTarget;
    this.state.touchDrag.piece = piece;
    this.state.touchDrag.srcCell = piece.parentElement;
    piece.classList.add('dragging');
    if (!this.state.started) this.startTimer();
  },

  onTouchMove(e) {
    if (!this.state.touchDrag.piece) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = el ? el.closest('.cell') : null;

    if (cell !== this.state.touchDrag.currentTargetCell) {
      if (this.state.touchDrag.currentTargetCell) {
        this.state.touchDrag.currentTargetCell.classList.remove('drop-target');
      }
      this.state.touchDrag.currentTargetCell = cell;
      if (cell) cell.classList.add('drop-target');
    }
  },

  onTouchEnd(e) {
    if (!this.state.touchDrag.piece) return;

    const piece = this.state.touchDrag.piece;
    const targetCell = this.state.touchDrag.currentTargetCell;

    piece.classList.remove('dragging');

    if (targetCell && targetCell !== this.state.touchDrag.srcCell) {
      const targetPiece = targetCell.firstChild;
      const srcCell = this.state.touchDrag.srcCell;
      srcCell.appendChild(targetPiece);
      targetCell.appendChild(piece);
      this.checkPuzzleCompletion();
    }

    document.querySelectorAll('.cell.drop-target').forEach(el => el.classList.remove('drop-target'));
    this.state.touchDrag = { piece: null, srcCell: null, currentTargetCell: null };
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  game.init();
});
