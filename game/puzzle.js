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
      url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1200&auto=format&fit=crop' 
    },
    { 
      id: 'p3', 
      title: 'Forest', 
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop' 
    },
    { 
      id: 'p4', 
      title: 'Ocean', 
      url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1200&auto=format&fit=crop' 
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
    authPrompt: document.getElementById('authPrompt'),
    resultSignup: document.getElementById('resultSignup'),
    
    loginLink: document.getElementById('loginLink'),
    logoutBtn: document.getElementById('logoutBtn'),
    userInfo: document.getElementById('userInfo'),
  },

  /* Initialize */
  init() {
    console.log('✅ Puzzle module initializing...');
    
    this.selectedPreset = this.presets[0];
    this.imageURL = this.selectedPreset.url;
    this.currentImageName = this.selectedPreset.title;
    
    console.log('🖼️ Default preset:', this.selectedPreset.title);
    
    this.buildPresets();
    this.attachEventListeners();
    this.checkAuthStatus();
    
    console.log('✅ Puzzle module initialized!');
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
      this.elements.authPrompt.style.display = 'none';
      console.log('✅ User logged in:', user.fullName);
    } else {
      this.isLoggedIn = false;
      this.elements.userInfo.textContent = '';
      this.elements.loginLink.style.display = 'inline-block';
      this.elements.logoutBtn.style.display = 'none';
      this.elements.saveSection.style.display = 'none';
      this.elements.authPrompt.style.display = 'block';
      console.log('❌ User not logged in');
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
    console.log('🎨 Building presets...');
    
    if (!this.elements.presetList) {
      console.error('❌ presetList element not found!');
      return;
    }
    
    this.presets.forEach(p => {
      const el = document.createElement('div');
      el.className = 'presetItem';
      el.dataset.id = p.id;
      el.innerHTML = `
        <img src="${p.url}" alt="${p.title}">
        <div style="padding:6px;font-size:12px;text-align:center;">${p.title}</div>
      `;
      el.addEventListener('click', () => this.selectPreset(p, el));
      this.elements.presetList.appendChild(el);
    });
    
    if (this.elements.presetList.firstChild) {
      this.elements.presetList.firstChild.classList.add('selected');
      console.log('✅ Presets built');
    }
  },

  /* Select Preset */
  selectPreset(preset, element) {
    console.log('📸 Selected:', preset.title);
    document.querySelectorAll('.presetItem').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    this.selectedPreset = preset;
    this.imageURL = preset.url;
    this.currentImageName = preset.title;
  },

  /* Attach Event Listeners */
  attachEventListeners() {
    console.log('🔗 Attaching event listeners...');
    
    /* Menu Toggle */
    if (this.elements.menuToggleBtn) {
      this.elements.menuToggleBtn.addEventListener('click', () => {
        console.log('📋 Menu toggle clicked');
        this.toggleMenu();
      });
    }
    
    if (this.elements.menuClose) {
      this.elements.menuClose.addEventListener('click', () => {
        console.log('📋 Menu close clicked');
        this.closeMenu();
      });
    }
    
    if (this.elements.menuOverlay) {
      this.elements.menuOverlay.addEventListener('click', (e) => {
        if (e.target === this.elements.menuOverlay) {
          console.log('📋 Overlay click - closing menu');
          this.closeMenu();
        }
      });
    }
    
    /* Auth */
    if (this.elements.loginLink) {
      this.elements.loginLink.addEventListener('click', () => {
        console.log('🔐 Login clicked');
        window.location.href = '../auth/index.html';
      });
    }
    
    if (this.elements.logoutBtn) {
      this.elements.logoutBtn.addEventListener('click', () => {
        console.log('🔐 Logout clicked');
        this.logout();
      });
    }
    
    /* Image Upload */
    if (this.elements.imageUpload) {
      this.elements.imageUpload.addEventListener('change', (e) => {
        console.log('📁 Quick upload');
        this.handleQuickUpload(e);
      });
    }
    
    if (this.elements.menuUpload) {
      this.elements.menuUpload.addEventListener('change', (e) => {
        console.log('📁 Menu upload');
        this.handleMenuUpload(e);
      });
    }
    
    /* Menu Controls */
    if (this.elements.presetSizes) {
      this.elements.presetSizes.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          console.log('📏 Size selected:', btn.dataset.cols, 'x', btn.dataset.rows);
          this.selectSize(btn);
        });
      });
    }
    
    if (this.elements.menuCreate) {
      this.elements.menuCreate.addEventListener('click', () => {
        console.log('🎮 Create puzzle clicked');
        this.createPuzzleFromMenu();
      });
    }
    
    if (this.elements.menuUseUploaded) {
      this.elements.menuUseUploaded.addEventListener('click', () => {
        console.log('📁 Use uploaded clicked');
        this.useUploadedImage();
      });
    }
    
    /* Puzzle Controls */
    if (this.elements.previewBtn) {
      this.elements.previewBtn.addEventListener('click', () => {
        console.log('👁️ Preview toggled');
        this.togglePreview();
      });
    }
    
    if (this.elements.shuffleBtn) {
      this.elements.shuffleBtn.addEventListener('click', () => {
        console.log('🔀 Shuffle clicked');
        this.handleShuffle();
      });
    }
    
    if (this.elements.enableCheckEl) {
      this.elements.enableCheckEl.addEventListener('change', () => {
        console.log('✓ Check toggle:', this.elements.enableCheckEl.checked);
        this.handleCheckToggle();
      });
    }
    
    /* Completion */
    if (this.elements.overlayShuffle) {
      this.elements.overlayShuffle.addEventListener('click', () => {
        console.log('🔀 Shuffle from completion');
        this.handleShuffle();
      });
    }
    
    if (this.elements.overlayNew) {
      this.elements.overlayNew.addEventListener('click', () => {
        console.log('➕ New puzzle from completion');
        this.openMenu();
      });
    }
    
    if (this.elements.overlayClose) {
      this.elements.overlayClose.addEventListener('click', () => {
        console.log('✕ Close completion');
        this.hideComplete();
      });
    }
    
    if (this.elements.overlaySave) {
      this.elements.overlaySave.addEventListener('click', () => {
        console.log('💾 Save result');
        this.savePuzzleResult();
      });
    }
    
    if (this.elements.resultSignup) {
      this.elements.resultSignup.addEventListener('click', () => {
        console.log('📝 Signup from completion');
        window.location.href = '../auth/index.html';
      });
    }
    
    if (this.elements.overlayComplete) {
      this.elements.overlayComplete.addEventListener('click', (e) => {
        if (e.target === this.elements.overlayComplete) {
          console.log('✕ Overlay click - closing completion');
          this.hideComplete();
        }
      });
    }
    
    /* Keyboard */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        console.log('⌨️ Escape pressed');
        if (this.elements.menuOverlay.style.display === 'flex') this.closeMenu();
        if (this.elements.overlayComplete.style.display === 'flex') this.hideComplete();
      }
    });
    
    console.log('✅ Event listeners attached');
  },

  /* Auth Functions */
  logout() {
    console.log('🔐 Logging out...');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userData');
    this.isLoggedIn = false;
    this.checkAuthStatus();
    this.updateMessage('You have been signed out');
  },

  /* Menu Functions */
  toggleMenu() {
    console.log('📋 toggleMenu called, current display:', this.elements.menuOverlay.style.display);
    if (this.elements.menuOverlay.style.display === 'flex') {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  },

  openMenu() {
    console.log('📋 Opening menu...');
    this.elements.menuOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    console.log('✅ Menu opened');
  },

  closeMenu() {
    console.log('📋 Closing menu...');
    this.elements.menuOverlay.style.display = 'none';
    document.body.style.overflow = '';
    console.log('✅ Menu closed');
  },

  /* Upload Handlers */
  handleQuickUpload(e) {
    console.log('📁 handleQuickUpload called');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    
    console.log('📁 File selected:', file.name);
    
    if (this.uploadedURL) URL.revokeObjectURL(this.uploadedURL);
    this.uploadedURL = URL.createObjectURL(file);
    this.imageURL = this.uploadedURL;
    this.currentImageName = file.name;
    
    this.updateMessage('A custom image has been uploaded. Open the menu and click "Create Puzzle."');
  },

  handleMenuUpload(e) {
    console.log('📁 handleMenuUpload called');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    
    console.log('📁 File selected:', file.name);
    
    if (this.uploadedURL) URL.revokeObjectURL(this.uploadedURL);
    this.uploadedURL = URL.createObjectURL(file);
    this.imageURL = this.uploadedURL;
    this.currentImageName = file.name;
    
    document.querySelectorAll('.presetItem').forEach(el => el.classList.remove('selected'));
    this.selectedPreset = null;
  },

  /* Size Selection */
  selectSize(button) {
    console.log('📏 selectSize called');
    this.elements.presetSizes.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    this.elements.menuCols.value = button.dataset.cols;
    this.elements.menuRows.value = button.dataset.rows;
    console.log('✅ Size set to', button.dataset.cols, 'x', button.dataset.rows);
  },

  /* Create Puzzle */
  createPuzzleFromMenu() {
    console.log('🎮 createPuzzleFromMenu called');
    
    const cols = Math.max(1, Math.min(30, +this.elements.menuCols.value || 1));
    const rows = Math.max(1, Math.min(30, +this.elements.menuRows.value || 1));
    
    console.log('📐 Dimensions:', cols, 'x', rows);
    console.log('🖼️ Image URL:', this.imageURL ? 'set' : 'NOT SET');
    
    if (!this.imageURL) {
      alert('Select or upload an image from the menu.');
      console.log('❌ No image selected');
      return;
    }
    
    console.log('✅ Creating puzzle...');
    this.createPuzzle(this.imageURL, cols, rows);
    this.closeMenu();
  },

  useUploadedImage() {
    console.log('📁 useUploadedImage called');
    if (!this.uploadedURL) {
      alert('First, upload your image to the menu (file).');
      console.log('❌ No uploaded URL');
      return;
    }
    
    this.imageURL = this.uploadedURL;
    this.selectedPreset = null;
    document.querySelectorAll('.presetItem').forEach(el => el.classList.remove('selected'));
    this.updateMessage('The uploaded image is used. Click "Create Puzzle."');
    console.log('✅ Uploaded image set');
  },

  /* Main Puzzle Creation */
  createPuzzle(imgSrc, cols, rows) {
    console.log('🧩 createPuzzle called with', cols, 'x', rows);
    
    this.cols = cols;
    this.rows = rows;
    
    const canvasSize = 500;
    this.pieceWidth = Math.floor(canvasSize / cols);
    this.pieceHeight = Math.floor(canvasSize / rows);

    console.log('📏 Piece size:', this.pieceWidth, 'x', this.pieceHeight);

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

    console.log('🎨 Creating', cols * rows, 'pieces...');

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
    this.updateMessage('The puzzle is complete. Start solving!');
    
    console.log('✅ Puzzle created! Ready to play.');
  },

  /* Create Single Cell */
  createCell(index, imgSrc) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.style.width = this.pieceWidth + 'px';
    cell.style.height = this.pieceHeight + 'px';
    cell.dataset.index = index;

    cell.addEventListener('dragover', e => { 
      e.preventDefault(); 
      cell.classList.add('drop-target'); 
    });
    
    cell.addEventListener('dragleave', () => {
      cell.classList.remove('drop-target');
    });
    
    cell.addEventListener('drop', (e) => this.onDropOnCell(e, cell));

    /* Create piece */
    const piece = document.createElement('div');
    piece.className = 'piece';
    piece.draggable = true;
    piece.id = 'piece-' + (this.pieceIdCounter++);

    const row = Math.floor(index / this.cols), col = index % this.cols;
    
    piece.style.backgroundImage = `url('${imgSrc}')`;
    piece.style.backgroundSize = `${this.cols * this.pieceWidth}px ${this.rows * this.pieceHeight}px`;
    piece.style.backgroundPosition = `-${col * this.pieceWidth}px -${row * this.pieceHeight}px`;
    piece.dataset.correct = index;

    /* Drag events */
    piece.addEventListener('dragstart', e => {
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
    piece.addEventListener('click', e => {
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

    if (this.elements.enableCheckEl.checked) {
      this.checkPositions();
    } else if (this.isSolved()) {
      this.finishPuzzle();
    }
  },

  /* Click Selection */
  toggleSelect(piece) {
    if (this.selectedPiece) this.selectedPiece.classList.remove('selected');
    
    if (this.selectedPiece === piece) { 
      this.selectedPiece = null; 
    } else { 
      this.selectedPiece = piece; 
      piece.classList.add('selected'); 
    }
    
    if (!this.started && this.selectedPiece) this.startTimer();
  },

  /* Check Positions */
  checkPositions() {
    if (!this.cells.length || !this.elements.enableCheckEl.checked) return;

    this.hintsUsed++;
    this.updateHintsDisplay();

    let solved = true;
    this.cells.forEach((cell, index) => {
      const piece = cell.firstChild;
      if (+piece.dataset.correct === index) {
        piece.style.border = '2px solid #4caf50';
      } else {
        piece.style.border = '2px solid #f44336';
        solved = false;
      }
    });

    if (solved) {
      this.finishPuzzle();
    }
  },

  /* Check if Solved */
  isSolved() {
    return this.cells.length && this.cells.every((cell, index) => 
      +cell.firstChild.dataset.correct === index
    );
  },

  /* Handle Check Toggle */
  handleCheckToggle() {
    if (this.elements.enableCheckEl.checked) {
      this.hintsUsed++;
      this.updateHintsDisplay();
      this.checkPositions();
      this.updateMessage('Position checking is enabled.');
    } else {
      document.querySelectorAll('.piece').forEach(p => p.style.border = '2px solid transparent');
      this.updateMessage('Position checking is disabled.');
    }
  },

  /* Update Hints Display */
  updateHintsDisplay() {
    this.elements.hintsCountDisplay.textContent = `Hints used: ${this.hintsUsed}`;
  },

  /* Shuffle */
  handleShuffle() {
    console.log('🔀 Shuffle called');
    this.hideComplete();
    this.shuffle();
    this.resetTimer();
    this.solvedAlready = false;
    this.hintsUsed = 0;
    this.updateHintsDisplay();
    this.updateMessage('The puzzle is shuffled');
  },

  shuffle() {
    if (!this.cells.length) return;

    const pieces = this.cells.map(cell => cell.firstChild);
    
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }

    this.cells.forEach((cell, index) => cell.appendChild(pieces[index]));
    document.querySelectorAll('.piece').forEach(p => p.style.border = '2px solid transparent');
  },

  /* Finish Puzzle */
  finishPuzzle() {
    console.log('🎉 Puzzle completed!');
    
    if (this.solvedAlready) return;

    this.solvedAlready = true;
    this.stopTimer();
    
    this.updateMessage('The puzzle is complete! 🎉');
    this.elements.overlayTime.textContent = `Time: ${this.formatElapsedTime()}`;
    this.elements.overlayHints.textContent = `Hints used: ${this.hintsUsed}`;
    this.elements.overlayImageName.textContent = `Image: ${this.currentImageName}`;
    
    this.playCompletionAnimation();
    this.showComplete();
  },

  /* Show/Hide Complete */
  showComplete() {
    console.log('✅ Showing completion overlay');
    this.elements.overlayComplete.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  hideComplete() {
    console.log('✅ Hiding completion overlay');
    this.elements.overlayComplete.style.display = 'none';
    document.body.style.overflow = '';
  },

  /* Save Result */
  savePuzzleResult() {
    console.log('💾 Saving puzzle result...');
    
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

    fetch('../auth/save-result.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Result saved');
        this.updateMessage(`✓ Puzzle result saved!`);
        setTimeout(() => this.hideComplete(), 1500);
      } else {
        console.log('❌ Save error:', data.error);
        alert('Error saving result');
      }
    })
    .catch(err => {
      console.error('Save error:', err);
      alert('Error saving result');
    });
  },

  /* Play Completion Animation */
  playCompletionAnimation() {
    console.log('🎆 Playing completion animation');
    
    const celebMsg = document.createElement('div');
    celebMsg.style.position = 'fixed';
    celebMsg.style.top = '50%';
    celebMsg.style.left = '50%';
    celebMsg.style.fontSize = '5rem';
    celebMsg.style.zIndex = '2001';
    celebMsg.style.pointerEvents = 'none';
    celebMsg.style.animation = 'bounce 0.8s ease-in-out';
    celebMsg.textContent = '🎉';
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
        el.style.position = 'fixed';
        el.style.fontSize = '3rem';
        el.style.zIndex = '2001';
        el.style.pointerEvents = 'none';
        el.style.animation = 'confetti-fall 1s ease-out forwards';
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
      console.log('🔇 Sound unavailable');
    }
  },

  /* Preview */
  togglePreview() {
    console.log('👁️ togglePreview called');
    
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
      const row = Math.floor(i / this.cols), col = i % this.cols;
      const pp = document.createElement('div');
      pp.style.width = pW + 'px';
      pp.style.height = pH + 'px';
      pp.style.backgroundImage = `url('${this.imageURL}')`;
      pp.style.backgroundSize = `${this.cols * pW}px ${this.rows * pH}px`;
      pp.style.backgroundPosition = `-${col * pW}px -${row * pH}px`;
      this.elements.previewPuzzle.appendChild(pp);
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
      
      this.elements.timerDisplay.textContent = `Time: ${min}:${sec.toString().padStart(2, '0')}:${ms}`;
    }, 50);
  },

  stopTimer() { 
    clearInterval(this.timer); 
  },

  resetTimer() {
    clearInterval(this.timer);
    this.started = false;
    this.startTime = null;
    this.elements.timerDisplay.textContent = 'Time: 0:00:000';
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

      if (this.elements.enableCheckEl.checked) {
        this.checkPositions();
      } else if (this.isSolved()) {
        this.finishPuzzle();
      }
    }

    document.querySelectorAll('.cell.drop-target').forEach(el => el.classList.remove('drop-target'));
    this.touchDrag = { piece: null, srcCell: null, currentTargetCell: null };
  },

  /* Utility */
  updateMessage(text) {
    this.elements.message.textContent = text;
  }
};

/* Initialize puzzle */
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM Content Loaded - Initializing puzzle...');
  puzzleModule.init();
});

// Также попытаемся инициализировать, если скрипт загружается после DOM
if (document.readyState !== 'loading') {
  console.log('📄 DOM already loaded - Initializing puzzle...');
  puzzleModule.init();
}
