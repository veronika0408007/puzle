/* ===== PUZZLE MODULE ===== */
const puzzleModule = {
  /* Configuration */
  presets: [
    { 
      id: 'p1', 
      title: 'Mountain', 
      url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop' 
    },
    { 
      id: 'p2', 
      title: 'City', 
      url: 'https://www.latvia.travel/sites/default/files/styles/mobile_promo/public/media_image/37315458162_8e53834697_k.jpg?itok=E_xOti-8' 
    },
    { 
      id: 'p3', 
      title: 'Animals', 
      url: 'https://ae01.alicdn.com/kf/Sed9c41c14c834c4883a0faefbc53c9b5C.jpg' 
    },
    { 
      id: 'p4', 
      title: 'Friends', 
      url: 'https://static01.nyt.com/images/2020/02/21/multimedia/21xp-friends/21xp-friends-articleLarge.jpg' 
    }
  ],

  /* State */
  selectedPreset: null,
  uploadedURL: '',
  imageURL: '',
  currentImageName: 'custom',
  cols: 5,
  rows: 6,
  pieceWidth: 100,
  pieceHeight: 100,
  cells: [],
  started: false,
  startTime: null,
  timer: null,
  pieceIdCounter: 0,
  solvedAlready: false,
  selectedPiece: null,
  hintsUsed: 0,
  isLoggedIn: false,
  touchDrag: { piece: null, srcCell: null, currentTargetCell: null },

  /* DOM Elements */
  elements: {
    menuToggleBtn: document.getElementById('menuToggleBtn'),
    menuOverlay: document.getElementById('menuOverlay'),
    menuClose: document.getElementById('menuClose'),
    presetList: document.getElementById('presetList'),
    menuUpload: document.getElementById('menuUpload'),
    menuCols: document.getElementById('menuCols'),
    menuRows: document.getElementById('menuRows'),
    menuCreate: document.getElementById('menuCreate'),
    menuUseUploaded: document.getElementById('menuUseUploaded'),
    presetSizes: document.getElementById('presetSizes'),
    
    imageUpload: document.getElementById('imageUpload'),
    puzzle: document.getElementById('puzzle'),
    previewBtn: document.getElementById('previewBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    enableCheckEl: document.getElementById('enableCheck'),
    
    previewContainer: document.getElementById('previewContainer'),
    previewPuzzle: document.getElementById('previewPuzzle'),
    
    message: document.getElementById('message'),
    timerDisplay: document.getElementById('timer'),
    hintsCountDisplay: document.getElementById('hintsCount'),
    
    overlayComplete: document.getElementById('overlayComplete'),
    overlayTime: document.getElementById('overlayTime'),
    overlayHints: document.getElementById('overlayHints'),
    overlayImageName: document.getElementById('overlayImageName'),
    overlayShuffle: document.getElementById('overlayShuffle'),
    overlaySave: document.getElementById('overlaySave'),
    overlayNew: document.getElementById('overlayNew'),
    overlayClose: document.getElementById('overlayClose'),
    saveSection: document.getElementById('saveSection'),
    
    loginLink: document.getElementById('loginLink'),
    logoutBtn: document.getElementById('logoutBtn'),
    userInfo: document.getElementById('userInfo'),
  },

  /* Initialize */
  init() {
    this.selectedPreset = this.presets[0];
    this.imageURL = this.selectedPreset.url;
    this.currentImageName = this.selectedPreset.title;
    
    this.buildPresets();
    this.attachEventListeners();
    this.checkAuthStatus();
  },

  /* Check Auth Status */
  checkAuthStatus() {
    const token = sessionStorage.getItem('userToken');
    const userData = sessionStorage.getItem('userData');
    
    if (token && userData) {
      this.isLoggedIn = true;
      const user = JSON.parse(userData);
      this.updateUserUI(user);
      this.elements.saveSection.style.display = 'block';
    } else {
      this.isLoggedIn = false;
      this.elements.userInfo.textContent = '';
      this.elements.loginLink.style.display = 'inline-block';
      this.elements.logoutBtn.style.display = 'none';
      this.elements.saveSection.style.display = 'none';
    }
  },

  /* Update User UI */
  updateUserUI(user) {
    this.elements.userInfo.textContent = `Welcome, ${user.fullName}`;
    this.elements.loginLink.style.display = 'none';
    this.elements.logoutBtn.style.display = 'inline-block';
  },

  /* Build Preset Thumbnails */
  buildPresets() {
    this.presets.forEach(p => {
      const el = document.createElement('div');
      el.className = 'presetItem';
      el.dataset.id = p.id;
      el.innerHTML = `
        <img src="${p.url}" alt="${p.title}">
        <div>${p.title}</div>
      `;
      el.addEventListener('click', () => this.selectPreset(p, el));
      this.elements.presetList.appendChild(el);
    });
    
    if (this.elements.presetList.firstChild) {
      this.elements.presetList.firstChild.classList.add('selected');
    }
  },

  /* Select Preset */
  selectPreset(preset, element) {
    document.querySelectorAll('.presetItem').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    this.selectedPreset = preset;
    this.imageURL = preset.url;
    this.currentImageName = preset.title;
  },

  /* Attach Event Listeners */
  attachEventListeners() {
    /* Menu */
    this.elements.menuToggleBtn.addEventListener('click', () => this.toggleMenu());
    this.elements.menuClose.addEventListener('click', () => this.closeMenu());
    this.elements.menuOverlay.addEventListener('click', (e) => {
      if (e.target === this.elements.menuOverlay) this.closeMenu();
    });
    
    /* Auth */
    this.elements.loginLink.addEventListener('click', () => this.redirectToAuth());
    this.elements.logoutBtn.addEventListener('click', () => this.logout());
    
    /* Image Upload */
    this.elements.imageUpload.addEventListener('change', (e) => this.handleQuickUpload(e));
    this.elements.menuUpload.addEventListener('change', (e) => this.handleMenuUpload(e));
    
    /* Menu Controls */
    this.elements.presetSizes.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => this.selectSize(btn));
    });
    
    this.elements.menuCreate.addEventListener('click', () => this.createPuzzleFromMenu());
    this.elements.menuUseUploaded.addEventListener('click', () => this.useUploadedImage());
    
    /* Puzzle Controls */
    this.elements.previewBtn.addEventListener('click', () => this.togglePreview());
    this.elements.shuffleBtn.addEventListener('click', () => this.handleShuffle());
    this.elements.enableCheckEl.addEventListener('change', () => this.handleCheckToggle());
    
    /* Completion Overlay */
    this.elements.overlayShuffle.addEventListener('click', () => this.handleShuffle());
    this.elements.overlayNew.addEventListener('click', () => this.openMenu());
    this.elements.overlayClose.addEventListener('click', () => this.hideComplete());
    this.elements.overlaySave.addEventListener('click', () => this.savePuzzleResult());
    
    /* Keyboard */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.elements.menuOverlay.classList.contains('active')) this.closeMenu();
        if (this.elements.overlayComplete.classList.contains('active')) this.hideComplete();
      }
    });
  },

  /* Auth Functions */
  redirectToAuth() {
    window.location.href = '../auth/index.html';
  },

  logout() {
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userData');
    this.isLoggedIn = false;
    this.checkAuthStatus();
    this.updateMessage('You have been signed out');
  },

  /* Menu Functions */
  toggleMenu() {
    if (this.elements.menuOverlay.classList.contains('active')) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  },

  openMenu() {
    this.elements.menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeMenu() {
    this.elements.menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  },

  /* Upload Handlers */
  handleQuickUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (this.uploadedURL) URL.revokeObjectURL(this.uploadedURL);
    this.uploadedURL = URL.createObjectURL(file);
    this.imageURL = this.uploadedURL;
    this.currentImageName = file.name;
    
    this.updateMessage('📁 A custom image has been uploaded. Open the menu and click "Create Puzzle."');
  },

  handleMenuUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (this.uploadedURL) URL.revokeObjectURL(this.uploadedURL);
    this.uploadedURL = URL.createObjectURL(file);
    this.imageURL = this.uploadedURL;
    this.currentImageName = file.name;
    
    document.querySelectorAll('.presetItem').forEach(el => el.classList.remove('selected'));
    this.selectedPreset = null;
  },

  /* Size Selection */
  selectSize(button) {
    this.elements.presetSizes.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    this.elements.menuCols.value = button.dataset.cols;
    this.elements.menuRows.value = button.dataset.rows;
  },

  /* Create Puzzle */
  createPuzzleFromMenu() {
    const cols = Math.max(1, Math.min(30, +this.elements.menuCols.value || 1));
    const rows = Math.max(1, Math.min(30, +this.elements.menuRows.value || 1));
    
    if (!this.imageURL) {
      alert('Select or upload an image from the menu.');
      return;
    }
    
    this.createPuzzle(this.imageURL, cols, rows);
    this.closeMenu();
  },

  useUploadedImage() {
    if (!this.uploadedURL) {
      alert('First, upload your image to the menu (file).');
      return;
    }
    
    this.imageURL = this.uploadedURL;
    this.selectedPreset = null;
    document.querySelectorAll('.presetItem').forEach(el => el.classList.remove('selected'));
    this.updateMessage('✓ The uploaded image is used. Click "Create Puzzle."');
  },

  /* Main Puzzle Creation */
  createPuzzle(imgSrc, cols, rows) {
    this.cols = cols;
    this.rows = rows;
    
    const canvasSize = 500;
    this.pieceWidth = Math.floor(canvasSize / cols);
    this.pieceHeight = Math.floor(canvasSize / rows);

    /* Reset state */
    this.elements.puzzle.innerHTML = '';
    this.cells = [];
    this.pieceIdCounter = 0;
    this.solvedAlready = false;
    this.selectedPiece = null;
    this.hintsUsed = 0;
    this.updateHintsDisplay();

    /* Setup grid */
    this.elements.puzzle.style.gridTemplateColumns = `repeat(${cols}, ${this.pieceWidth}px)`;
    this.elements.puzzle.style.gridTemplateRows = `repeat(${rows}, ${this.pieceHeight}px)`;

    /* Create cells and pieces */
    for (let i = 0; i < cols * rows; i++) {
      const cell = this.createCell(i, imgSrc);
      this.cells.push(cell);
      this.elements.puzzle.appendChild(cell);
    }

    this.shuffle();
    this.elements.shuffleBtn.disabled = false;
    this.resetTimer();
    this.elements.previewContainer.style.display = 'none';
    this.elements.previewPuzzle.innerHTML = '';
    this.updateMessage('🎮 The puzzle is complete. Start solving!');
  },

  /* Create Single Cell */
  createCell(index, imgSrc) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.style.width = this.pieceWidth + 'px';
    cell.style.height = this.pieceHeight + 'px';
    cell.dataset.index = index;

    cell.addEventListener('dragover', (e) => {
      e.preventDefault();
      cell.classList.add('drop-target');
    });
    cell.addEventListener('dragleave', () => cell.classList.remove('drop-target'));
    cell.addEventListener('drop', (e) => this.onDropOnCell(e, cell));

    /* Create piece */
    const piece = document.createElement('div');
    piece.className = 'piece';
    piece.draggable = true;
    piece.id = 'piece-' + (this.pieceIdCounter++);

    const row = Math.floor(index / this.cols);
    const col = index % this.cols;
    
    piece.style.backgroundImage = `url(${imgSrc})`;
    piece.style.backgroundSize = `${this.cols * this.pieceWidth}px ${this.rows * this.pieceHeight}px`;
    piece.style.backgroundPosition = `-${col * this.pieceWidth}px -${row * this.pieceHeight}px`;
    piece.dataset.correct = index;

    /* Drag events */
    piece.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', piece.id);
      piece.classList.add('dragging');
      if (!this.started) this.startTimer();
    });
    piece.addEventListener('dragend', () => {
      piece.classList.remove('dragging');
      document.querySelectorAll('.cell.drop-target').forEach(el => el.classList.remove('drop-target'));
    });

    /* Click event */
    piece.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSelect(piece);
    });

    /* Touch events */
    piece.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    piece.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    piece.addEventListener('touchend', (e) => this.onTouchEnd(e));

    cell.appendChild(piece);
    return cell;
  },

  /* Drop Handler */
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

    /* Check after move */
    this.checkPuzzleCompletion();
  },

  /* Click Selection */
  toggleSelect(piece) {
    if (this.selectedPiece) {
      this.selectedPiece.classList.remove('selected');
    }
    
    if (this.selectedPiece === piece) {
      this.selectedPiece = null;
    } else {
      this.selectedPiece = piece;
      piece.classList.add('selected');
    }
    
    if (!this.started && this.selectedPiece) {
      this.startTimer();
    }
  },

  /* Check if Solved - RETURNS TRUE ONLY IF ALL CORRECT */
  isSolved() {
    if (!this.cells.length) return false;
    
    return this.cells.every((cell, index) => {
      const piece = cell.firstChild;
      return +piece.dataset.correct === index;
    });
  },

  /* Check Positions With Visual Feedback */
  checkPositions() {
    if (!this.cells.length) return;

    let allCorrect = true;
    this.cells.forEach((cell, index) => {
      const piece = cell.firstChild;
      if (+piece.dataset.correct === index) {
        piece.style.border = '2px solid var(--success)';
      } else {
        piece.style.border = '2px solid var(--error)';
        allCorrect = false;
      }
    });

    /* If all correct, finish puzzle */
    if (allCorrect) {
      setTimeout(() => this.finishPuzzle(), 500);
    }
  },

  /* Main Check Function After Every Move */
  checkPuzzleCompletion() {
    if (this.solvedAlready) return;

    if (this.elements.enableCheckEl.checked) {
      /* Visual check mode - show green/red borders */
      this.hintsUsed++;
      this.updateHintsDisplay();
      this.checkPositions();
      this.updateMessage('🔍 Checking positions...');
    } else {
      /* Silent mode - only notify when fully solved */
      if (this.isSolved()) {
        this.finishPuzzle();
      }
    }
  },

  /* Handle Check Toggle */
  handleCheckToggle() {
    if (this.elements.enableCheckEl.checked) {
      this.hintsUsed++;
      this.updateHintsDisplay();
      this.checkPositions();
      this.updateMessage('✓ Position checking enabled. Correct tiles = green, Incorrect = red.');
    } else {
      document.querySelectorAll('.piece').forEach(p => p.style.border = '2px solid transparent');
      this.updateMessage('✗ Position checking disabled. You will see result when puzzle is complete.');
    }
  },

  /* Update Hints Display */
  updateHintsDisplay() {
    this.elements.hintsCountDisplay.textContent = `💡 Hints used: ${this.hintsUsed}`;
  },

  /* Shuffle */
  handleShuffle() {
    this.hideComplete();
    this.shuffle();
    this.resetTimer();
    this.solvedAlready = false;
    this.hintsUsed = 0;
    this.updateHintsDisplay();
    this.updateMessage('🔀 The puzzle is shuffled');
  },

  shuffle() {
    if (!this.cells.length) return;

    const pieces = this.cells.map(cell => cell.firstChild);
    
    /* Fisher-Yates shuffle */
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }

    this.cells.forEach((cell, index) => cell.appendChild(pieces[index]));
    document.querySelectorAll('.piece').forEach(p => p.style.border = '2px solid transparent');
  },

  /* Finish Puzzle - CALLED ONLY WHEN FULLY SOLVED */
  finishPuzzle() {
    if (this.solvedAlready) return;

    this.solvedAlready = true;
    this.stopTimer();
    
    /* Update overlay with final data */
    this.elements.overlayTime.textContent = `⏱️ Time: ${this.formatElapsedTime()}`;
    this.elements.overlayHints.textContent = `💡 Hints used: ${this.hintsUsed}`;
    this.elements.overlayImageName.textContent = `📸 Image: ${this.currentImageName}`;
    
    /* Show confetti or animation effect */
    this.playCompletionAnimation();
    
    this.showComplete();
  },

  /* Play Completion Animation */
  playCompletionAnimation() {
    /* Add visual celebration effect */
    const celebrationMessage = document.createElement('div');
    celebrationMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 4rem;
      font-weight: bold;
      z-index: 2001;
      animation: bounce 0.6s ease-in-out;
      pointer-events: none;
    `;
    celebrationMessage.textContent = '🎉';
    document.body.appendChild(celebrationMessage);
    
    setTimeout(() => celebrationMessage.remove(), 600);
    
    /* Play sound if possible */
    this.playCompletionSound();
  },

  /* Play Completion Sound */
  playCompletionSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      /* Audio API not available */
    }
  },

  /* Show/Hide Complete */
  showComplete() {
    this.elements.overlayComplete.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  hideComplete() {
    this.elements.overlayComplete.classList.remove('active');
    document.body.style.overflow = '';
  },

  /* Save Result */
  savePuzzleResult() {
    if (!this.isLoggedIn) {
      alert('Please sign in to save your result');
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const result = {
      imageName: this.currentImageName,
      gridSize: `${this.cols}x${this.rows}`,
      timeElapsed: this.formatElapsedTime(),
      hintsUsed: this.hintsUsed,
      userId: userData.id,
      date: new Date().toISOString()
    };

    /* Send to auth backend */
    fetch('../auth/save-result.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        this.updateMessage(`✅ Puzzle result saved!`);
      } else {
        alert('Error saving result');
      }
      this.hideComplete();
    })
    .catch(err => {
      console.error('Save error:', err);
      alert('Error saving result');
      this.hideComplete();
    });
  },

  /* Preview */
  togglePreview() {
    if (!this.imageURL) {
      alert('Choose image from menu');
      return;
    }

    if (this.elements.previewContainer.style.display === 'block') {
      this.elements.previewContainer.style.display = 'none';
      this.elements.previewBtn.textContent = 'Preview';
      return;
    }

    this.renderPreview();
    this.elements.previewContainer.style.display = 'block';
    this.elements.previewBtn.textContent = 'Hide image';
  },

  renderPreview() {
    const canvasSize = 500;
    const pW = Math.floor(canvasSize / this.cols);
    const pH = Math.floor(canvasSize / this.rows);

    this.elements.previewPuzzle.innerHTML = '';
    this.elements.previewPuzzle.style.gridTemplateColumns = `repeat(${this.cols}, ${pW}px)`;
    this.elements.previewPuzzle.style.gridTemplateRows = `repeat(${this.rows}, ${pH}px)`;

    for (let i = 0; i < this.cols * this.rows; i++) {
      const row = Math.floor(i / this.cols);
      const col = i % this.cols;

      const preview = document.createElement('div');
      preview.className = 'previewPiece';
      preview.style.width = pW + 'px';
      preview.style.height = pH + 'px';
      preview.style.backgroundImage = `url(${this.imageURL})`;
      preview.style.backgroundSize = `${this.cols * pW}px ${this.rows * pH}px`;
      preview.style.backgroundPosition = `-${col * pW}px -${row * pH}px`;

      this.elements.previewPuzzle.appendChild(preview);
    }
  },

  /* Timer */
  startTimer() {
    if (this.started) return;

    this.started = true;
    this.startTime = performance.now();
    
    this.timer = setInterval(() => {
      const elapsed = performance.now() - this.startTime;
      const ms = Math.floor(elapsed % 1000).toString().padStart(3, '0');
      const sec = Math.floor(elapsed / 1000) % 60;
      const min = Math.floor(elapsed / 60000);
      
      this.elements.timerDisplay.textContent = 
        `⏱️ Time: ${min}:${sec.toString().padStart(2, '0')}:${ms}`;
    }, 50);
  },

  stopTimer() {
    clearInterval(this.timer);
  },

  resetTimer() {
    clearInterval(this.timer);
    this.started = false;
    this.startTime = null;
    this.elements.timerDisplay.textContent = '⏱️ Time: 0:00:000';
  },

  formatElapsedTime() {
    if (!this.startTime) return '0:00:000';

    const elapsed = performance.now() - this.startTime;
    const ms = Math.floor(elapsed % 1000).toString().padStart(3, '0');
    const sec = Math.floor(elapsed / 1000) % 60;
    const min = Math.floor(elapsed / 60000);

    return `${min}:${sec.toString().padStart(2, '0')}:${ms}`;
  },

  /* Touch Support */
  onTouchStart(e) {
    e.preventDefault();
    const piece = e.currentTarget;
    this.touchDrag.piece = piece;
    this.touchDrag.srcCell = piece.parentElement;
    piece.classList.add('dragging');
    if (!this.started) this.startTimer();
  },

  onTouchMove(e) {
    if (!this.touchDrag.piece) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = el ? el.closest('.cell') : null;

    if (cell !== this.touchDrag.currentTargetCell) {
      if (this.touchDrag.currentTargetCell) {
        this.touchDrag.currentTargetCell.classList.remove('drop-target');
      }
      this.touchDrag.currentTargetCell = cell;
      if (cell) cell.classList.add('drop-target');
    }
  },

  onTouchEnd(e) {
    if (!this.touchDrag.piece) return;

    const piece = this.touchDrag.piece;
    const targetCell = this.touchDrag.currentTargetCell;

    piece.classList.remove('dragging');

    if (targetCell && targetCell !== this.touchDrag.srcCell) {
      const targetPiece = targetCell.firstChild;
      const srcCell = this.touchDrag.srcCell;
      srcCell.appendChild(targetPiece);
      targetCell.appendChild(piece);

      /* Check after touch move */
      this.checkPuzzleCompletion();
    }

    document.querySelectorAll('.cell.drop-target').forEach(el => el.classList.remove('drop-target'));
    this.touchDrag = { piece: null, srcCell: null, currentTargetCell: null };
  },

  /* Utility */
  updateMessage(text) {
    this.elements.message.textContent = text;
  }
};

/* Add CSS for animation */
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.2); }
  }
`;
document.head.appendChild(style);

/* Initialize puzzle */
document.addEventListener('DOMContentLoaded', () => {
  puzzleModule.init();
});



























