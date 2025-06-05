document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("bg");
  const splashScreen = document.getElementById("splash-screen");
  const mainOverlay = document.querySelector(".overlay"); // This is the home screen overlay

  if (!canvas) {
    console.error(
      "Canvas element with ID 'bg' not found. Ensure it exists in your HTML and the script is loaded correctly."
    );
    return;
  }
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const letters = "WORDSEARCHGUMPIS".split("");
  const tileSize = 50;
  const colors = [
    "#FFC0CB",
    "#FFA07A",
    "#FF69B4",
    "#9370DB",
    "#BA55D3",
    "#FFD700",
    "#ADD8E6",
  ];

  // === Tile Class with Glow ===
  class Tile {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 200;
      this.speed = 0.5 + Math.random() * 1.5;
      this.letter = letters[Math.floor(Math.random() * letters.length)];
      this.size = tileSize;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.angle = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 0.4;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);

      // Glowing box
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

      // Glowing letter
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.letter, 0, 0);

      ctx.restore();
    }

    update() {
      this.y -= this.speed;
      this.angle += this.rotationSpeed;
      if (this.y < -this.size) {
        this.reset();
      }
    }
  }

  // === Sparkle Particle Class ===
  class Sparkle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 200;
      this.size = Math.random() * 2 + 1;
      this.speed = 0.3 + Math.random() * 0.7;
      this.alpha = 0.5 + Math.random() * 0.5;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.y -= this.speed;
      if (this.y < -this.size) {
        this.reset();
      }
    }
  }

  // === Initialize Objects ===
  const tiles = Array.from({ length: 30 }, () => new Tile());
  const sparkles = Array.from({ length: 50 }, () => new Sparkle());

  function animate() {
    // Background gradient
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#a066e3");
    gradient.addColorStop(1, "#8a4be3");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sparkles (background layer)
    sparkles.forEach((p) => {
      p.update();
      p.draw();
    });

    // Floating letter tiles
    tiles.forEach((tile) => {
      tile.update();
      tile.draw();
    });

    requestAnimationFrame(animate);
  }

  // Function to update canvas size and button width on resize
  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Update button width if the game is currently displayed
    if (document.getElementById("gameplay-panel")?.classList.contains("show")) {
      updateEndGameButtonWidth();
    }
  }

  animate();
  window.addEventListener("resize", handleResize);

  // Splash Screen Logic
  if (splashScreen && mainOverlay) {
    mainOverlay.style.display = "none"; // Hide main home overlay initially

    setTimeout(() => {
      splashScreen.style.opacity = "0";
      // Wait for the fade-out transition to complete before hiding it
      splashScreen.addEventListener(
        "transitionend",
        () => {
          splashScreen.style.display = "none";
          mainOverlay.style.display = "flex"; // Show main home overlay
        },
        { once: true }
      ); // Ensure the event listener is removed after firing once
    }, 2500); // Adjust splash screen duration (milliseconds)
  } else {
    // Fallback if splash screen or main overlay isn't found
    if (mainOverlay && getComputedStyle(mainOverlay).display === "none") {
      mainOverlay.style.display = "flex"; // Ensure main overlay is visible if no splash
    }
    if (!splashScreen)
      console.warn("Splash screen element not found. Skipping splash.");
  }
  let timerInterval; // Declare timerInterval here to be accessible by endGame and initializeGame

  function toggleInstructions() {
    const panel = document.getElementById("instructions");
    const blur = document.getElementById("blur");
    if (panel && blur) {
      panel.classList.toggle("show");
      blur.classList.toggle("show");
    } else {
      console.error("Instructions panel or blur overlay not found.");
    }
  }

  function endGame() {
    const gameplayPanel = document.getElementById("gameplay-panel");
    const overlay = document.querySelector(".overlay");

    clearInterval(timerInterval); // Clear the game timer
    if (gameplayPanel) gameplayPanel.classList.remove("show");
    if (overlay) overlay.style.display = "flex";

    window.JioGames?.showAd(AdType.Interstitial, {
      onAdClosed: function () {
        console.log("index : Interstitial Ad closed.");
      },
      onAdFailedToLoad: function (error) {
        console.log("index : Failed to load Interstitial Ad: " + error);
      },
    });
  }

  function startGame() {
    const homeOverlay = document.querySelector(".overlay");
    const gameplayPanel = document.getElementById("gameplay-panel");
    const gameplayContent = document.getElementById("gameplay-content");

    if (homeOverlay) homeOverlay.style.display = "none";
    if (gameplayPanel) gameplayPanel.classList.add("show");

    if (gameplayContent) {
      gameplayContent.innerHTML = `
        <button id="pause-btn" class="pause-btn">⏸️</button>
        <button id="game-home-btn" class="btn" onclick="endGame()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></button>
  <div class="game-container">
    <div class="game-column-left">
      <header>
        <h1 id="level-title">Level 1</h1>
        <div class="progress-bar-wrapper">
          <div id="progress-bar"></div>
        </div>
      </header>
      <section class="words-box">
        <h2>Words to Find</h2>
        <ul id="words-list"></ul>
      </section>
    </div>

    <div class="game-column-right">
      <section id="grid" class="grid"></section>
      <div id="timer">Time: 40s</div>
    </div>
  </div>

  <!-- Popups remain outside the two-column structure but within gameplay-content -->

  <div id="level-complete-popup" class="popup hidden">
    <div class="popup-content">
      <h2>🎉 Level Completed!</h2>
      <div class="popup-buttons">
        <button id="retry-btn">Retry</button>
        <button id="next-btn">Next Level</button>
      </div>
    </div>
  </div>

  <!-- Continue Popup -->
  <div id="continue-popup" class="popup hidden">
    <div class="popup-content">
      <h2>⏰ Time's up! Continue?</h2>
      <div class="popup-buttons">
        <button id="continue-yes">Yes</button>
        <button id="continue-no">No</button>
      </div>
    </div>
  </div>

  <!-- Game Over Popup -->
  <div id="gameover-popup" class="popup hidden">
    <div class="popup-content">
      <h2>💀 Game Over</h2>
      <div class="popup-buttons">
        <button id="replay-btn">Replay</button>
        <button id="home-btn">Home</button>
      </div>
    </div>
  </div>

  <div id="all-levels-popup" class="popup hidden">
    <div class="popup-content">
      <h2>🎉 All Levels Completed!</h2>
      <button id="home-btn-final">🏠 Home</button>
    </div>
  </div>

  <div id="pause-overlay" class="overlay hidden">
    <div class="overlay-content">
      <h2>⏸️ Game Paused</h2>
    </div>
  </div>
      `;
      initializeGame();
    } else {
      console.error("Gameplay content container not found.");
    }
  }

  function initializeGame() {
    tryCache();

    let timeLeft = 40;
    let extraTimeUsed = false;
    let continueUsed = false;
    let isPaused = false;
    const pauseBtn = document.getElementById("pause-btn");
    const pauseOverlay = document.getElementById("pause-overlay");

    const levels = [
      { gridSize: 5, words: ["CAT", "DOG", "BAT"] },
      { gridSize: 6, words: ["APPLE", "BEE", "TREE", "ANT"] },
      { gridSize: 7, words: ["LION", "TIGER", "BEAR", "ZEBRA", "WOLF"] },
      {
        gridSize: 8,
        words: ["PYTHON", "MUMBAI", "JAVA", "CPLUS", "SWIFT", "GO"],
      },
      {
        gridSize: 8,
        words: [
          "ANDROID",
          "KOTLIN",
          "FLUTTER",
          "REACT",
          "ANGULAR",
          "VUE",
          "NODE",
        ],
      },
    ];

    let currentLevel = 0;
    let foundWords = new Set();

    let isDragging = false;
    let dragPath = [];

    function setupLevel(levelIndex) {
      const level = levels[levelIndex];
      const levelTitleEl = document.getElementById("level-title");
      const progressBarEl = document.getElementById("progress-bar");
      const wordsListEl = document.getElementById("words-list");

      if (levelTitleEl) levelTitleEl.innerText = `Level ${levelIndex + 1}`;
      if (progressBarEl)
        progressBarEl.style.width = `${(levelIndex / levels.length) * 100}%`;

      if (wordsListEl) {
        wordsListEl.innerHTML = "";
        level.words.forEach((word) => {
          const li = document.createElement("li");
          li.innerText = word;
          wordsListEl.appendChild(li);
        });
      }

      generateGrid(level.gridSize, level.words);
      startTimer();
      extraTimeUsed = false;
    }
    function startTimer() {
      clearInterval(timerInterval);

      const baseTime = 40 - currentLevel * 5;
      timeLeft = extraTimeUsed ? timeLeft + 10 : Math.max(10, baseTime);
      updateTimerDisplay();

      timerInterval = setInterval(() => {
        if (!isPaused) {
          timeLeft--;
          updateTimerDisplay();

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (window.JioGames.state.Rewarded.isAdReady) {
              // Simpler check
              showContinuePopup();
            } else {
              showGameOverPopup();
              window.JioGames?.showAd(AdType.Interstitial, {
                onAdClosed: () => {
                  console.log("Interstitial closed.");
                  window.JioGames.state.Interstitial.isAdReady = false;
                },
                onAdFailedToLoad: (err) =>
                  console.log("Interstitial error: " + err),
              });
              window.JioGames?.postScore?.(0);
            }
          }
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      const timerEl = document.getElementById("timer");
      if (timerEl) timerEl.innerText = `Time: ${timeLeft}s`;
    }

    function generateGrid(size, words) {
      const gridData = Array.from({ length: size }, () => Array(size).fill("")); // Renamed to avoid conflict
      const directions = [
        { x: 1, y: 0 }, // Horizontal
        { x: 0, y: 1 }, // Vertical
        { x: 1, y: 1 }, // Diagonal down-right
      ];

      function canPlace(word, row, col, dir) {
        for (let i = 0; i < word.length; i++) {
          const x = col + i * dir.x;
          const y = row + i * dir.y;
          if (x < 0 || x >= size || y < 0 || y >= size) return false;
          if (gridData[y][x] !== "" && gridData[y][x] !== word[i]) return false;
        }
        return true;
      }

      function placeWord(word) {
        const tries = 100;
        for (let t = 0; t < tries; t++) {
          const dir = directions[Math.floor(Math.random() * directions.length)];
          const row = Math.floor(Math.random() * size);
          const col = Math.floor(Math.random() * size);

          if (canPlace(word, row, col, dir)) {
            for (let i = 0; i < word.length; i++) {
              const x = col + i * dir.x;
              const y = row + i * dir.y;
              gridData[y][x] = word[i];
            }
            return true;
          }
        }
        console.warn("Couldn't place word:", word);
        return false;
      }

      words.forEach((word) => placeWord(word));

      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (gridData[y][x] === "") {
            gridData[y][x] =
              alphabet[Math.floor(Math.random() * alphabet.length)];
          }
        }
      }

      const gridContainer = document.getElementById("grid");
      if (!gridContainer) {
        console.error("Grid container not found.");
        return;
      }
      gridContainer.innerHTML = "";
      gridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      // gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`; // Already handled by aspect-ratio: 1/1 in CSS

      // Ensure the grid container is part of the layout and has dimensions
      // It should already be displayed by the time this function is called.

      const gridStyles = getComputedStyle(gridContainer);
      const gap = parseFloat(gridStyles.gap) || 0; // Get the computed gap

      // Usable width/height for cells, after accounting for the grid's own padding
      const containerPaddingHorizontal =
        parseFloat(gridStyles.paddingLeft) +
        parseFloat(gridStyles.paddingRight);
      const containerPaddingVertical =
        parseFloat(gridStyles.paddingTop) +
        parseFloat(gridStyles.paddingBottom);

      //offsetWidth/Height includes padding and border, but not margin.
      // Since .grid has box-sizing: border-box (implicitly via .game-container), offsetWidth is fine.
      const availableWidthForGridContent =
        gridContainer.offsetWidth - containerPaddingHorizontal;
      const availableHeightForGridContent =
        gridContainer.offsetHeight - containerPaddingVertical;

      // Calculate space purely for cells, after removing space taken by all gaps
      const totalGapWidth = (size - 1) * gap;
      const totalGapHeight = (size - 1) * gap;

      const spaceForCellsX = availableWidthForGridContent - totalGapWidth;
      const spaceForCellsY = availableHeightForGridContent - totalGapHeight;

      // Since the .grid container has aspect-ratio: 1/1 and we use 1fr for columns/rows,
      // cellWidthBasedOnSpace and cellHeightBasedOnSpace should be nearly identical.
      let cellSize = Math.min(spaceForCellsX / size, spaceForCellsY / size);

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const cell = document.createElement("div");
          cell.classList.add("grid-cell");
          cell.innerText = gridData[y][x];
          cell.dataset.x = x;
          cell.dataset.y = y;
          cell.dataset.letter = gridData[y][x];
          cell.style.width = `${cellSize}px`;
          cell.style.height = `${cellSize}px`;
          // Ensure font size doesn't get too tiny and has a reasonable minimum.
          // Also, ensure it's not excessively large if cellSize is big.
          const MIN_CELL_FONT_SIZE = 10; // Minimum font size in pixels
          const MAX_CELL_FONT_SIZE = 24; // Maximum font size in pixels
          const FONT_TO_CELL_RATIO = 0.6; // Font size as a ratio of cell size

          let calculatedFontSize = cellSize * FONT_TO_CELL_RATIO;
          cell.style.fontSize = `${Math.max(
            MIN_CELL_FONT_SIZE,
            Math.min(calculatedFontSize, MAX_CELL_FONT_SIZE)
          )}px`;

          cell.addEventListener("mousedown", startDrag);
          cell.addEventListener("mouseenter", dragOver);

          cell.addEventListener("touchstart", startTouch, { passive: true });
          cell.addEventListener("touchmove", dragTouch, { passive: false });

          gridContainer.appendChild(cell);
        }
      }

      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchend", endDrag);
    }

    // Function to set the End Game button width to half the grid width
    function updateEndGameButtonWidth() {
      const gridContainer = document.getElementById("grid");
      // Selector updated to the new ID, though size setting is commented out
      const endGameButton = document.getElementById("game-home-btn");
      if (gridContainer && endGameButton) {
        const gridContainerWidth = gridContainer.offsetWidth;
        // const buttonDiameter = gridContainerWidth / 2; // No longer setting size dynamically
        // endGameButton.style.width = `${buttonDiameter}px`;
        // endGameButton.style.height = `${buttonDiameter}px`;
      }
    }

    function clearSelection() {
      document
        .querySelectorAll(".grid-cell.selected")
        .forEach((cell) => cell.classList.remove("selected"));
      dragPath = [];
    }

    function startDrag(e) {
      if (isPaused || !e.target) return;
      isDragging = true;
      clearSelection();
      addToDragPath(e.target);
    }

    function dragOver(e) {
      if (isPaused || !isDragging || !e.target) return;
      addToDragPath(e.target);
    }

    function startTouch(e) {
      if (isPaused) return;
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target?.classList.contains("grid-cell")) {
        startDrag({ target });
      }
    }

    function dragTouch(e) {
      if (isPaused || !isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target?.classList.contains("grid-cell")) {
        dragOver({ target });
      }
    }

    function endDrag() {
      if (isPaused || !isDragging) return;
      if (dragPath.length >= 2) {
        checkWord();
      } else {
        clearSelection();
      }
      isDragging = false;
    }

    function addToDragPath(cell) {
      if (cell && !dragPath.includes(cell)) {
        dragPath.push(cell);
        cell.classList.add("selected");
      }
    }

    function markWordAsFoundUI(word) {
      const listItems = document.querySelectorAll("#words-list li");
      listItems.forEach((li) => {
        if (li.innerText === word) {
          // li.style.textDecoration = "line-through";
          li.classList.add("found-word");
        }
      });
    }

    function checkWord() {
      const word = dragPath.map((cell) => cell.innerText).join("");
      const reversedWord = word.split("").reverse().join("");

      const currentWords = levels[currentLevel].words;
      if (
        (currentWords.includes(word) || currentWords.includes(reversedWord)) &&
        !foundWords.has(word) &&
        !foundWords.has(reversedWord)
      ) {
        const foundActualWord = currentWords.includes(word)
          ? word
          : reversedWord;
        foundWords.add(foundActualWord);
        dragPath.forEach((cell) => {
          cell.classList.remove("selected");
          cell.classList.add("found");
        });
        markWordAsFoundUI(foundActualWord);
        dragPath = [];

        if (foundWords.size === currentWords.length) {
          clearInterval(timerInterval);
          setTimeout(() => {
            showPopup("level-complete-popup");
          }, 600);
        }
      } else {
        clearSelection();
      }
    }

    function showPopup(popupId) {
      const popupEl = document.getElementById(popupId);
      if (popupEl) popupEl.classList.remove("hidden");
      setPauseButtonEnabled(false);
      setHomeButtonEnabled(false);

      if (popupId === "level-complete-popup") {
        window.JioGames?.showAd(AdType.Interstitial, {
          onAdClosed: () => {
            console.log("Interstitial closed for level-complete-popup.");
            window.JioGames.state.Interstitial.isAdReady = false;
          },
          onAdFailedToLoad: (err) =>
            console.log("Interstitial error for level-complete-popup: " + err),
        });
      }
    }

    function hidePopup(popupId) {
      const popupEl = document.getElementById(popupId);
      if (popupEl) popupEl.classList.add("hidden");
      // Re-enable buttons only if no other popup is immediately shown.
    }

    // Attach event listeners to dynamically added buttons
    // Need to use event delegation or re-attach after innerHTML if these were outside initializeGame
    // But since they are part of the injected HTML and initializeGame runs after, direct getElementById is fine here.

    const retryBtn = document.getElementById("retry-btn");
    if (retryBtn)
      retryBtn.addEventListener("click", () => {
        hidePopup("level-complete-popup");
        if (!window.JioGames.state.Interstitial.isAdReady) {
          window.JioGames?.cacheAd(AdType.Interstitial, {
            onAdPrepared: () =>
              console.log("Interstitial Ad cached successfully."),
            onAdFailedToLoad: (error) =>
              console.log("Interstitial failed: " + error),
          });
        }
        // tryCache();
        setPauseButtonEnabled(true);
        setHomeButtonEnabled(true);
        foundWords.clear();
        setupLevel(currentLevel);
      });

    const nextBtn = document.getElementById("next-btn");
    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        hidePopup("level-complete-popup");
        if (!window.JioGames.state.Interstitial.isAdReady) {
          window.JioGames?.cacheAd(AdType.Interstitial, {
            onAdPrepared: () =>
              console.log("Interstitial Ad cached successfully."),
            onAdFailedToLoad: (error) =>
              console.log("Interstitial failed: " + error),
          });
        }
        // tryCache();
        currentLevel++;
        setPauseButtonEnabled(true);
        setHomeButtonEnabled(true);
        if (currentLevel < levels.length) {
          foundWords.clear();
          setupLevel(currentLevel);
        } else {
          showPopup("all-levels-popup");
        }
      });

    // Initial setup of the level and button width
    setupLevel(currentLevel);
    updateEndGameButtonWidth(); // Set button width after grid is generated

    function showContinuePopup() {
      if (!continueUsed) {
        showPopup("continue-popup");
        continueUsed = true;
      } else {
        showGameOverPopup();
      }
    }

    function showGameOverPopup() {
      showPopup("gameover-popup");
      window.JioGames?.showAd(AdType.Interstitial, {
        onAdClosed: () =>
          (window.JioGames.state.Interstitial.isAdReady = false),
        onAdFailedToLoad: (error) =>
          console.log("Interstitial failed: " + error),
      });
      window.JioGames?.postScore(0);
    }

    const continueYesBtn = document.getElementById("continue-yes");
    if (continueYesBtn)
      continueYesBtn.addEventListener("click", () => {
        window.JioGames?.showAd(AdType.Rewarded, {
          onAdClosed: function (isRewardUser) {
            console.log("index : Rewarded Ad closed.");
            if (isRewardUser) {
              console.log("Rewarded Ad closed. User received reward.");
              extraTimeUsed = true;
              hidePopup("continue-popup");
              setPauseButtonEnabled(true);
              setHomeButtonEnabled(true);
              startTimer();
            }
          },
          onAdFailedToLoad: function (error) {
            console.log("Failed to load Rewarded Ad: " + error);
          },
        });
      });

    const continueNoBtn = document.getElementById("continue-no");
    if (continueNoBtn)
      continueNoBtn.addEventListener("click", () => {
        hidePopup("continue-popup");
        // setHomeButtonEnabled(true) is implicitly handled by showGameOverPopup calling showPopup
        showGameOverPopup();
      });

    const replayBtn = document.getElementById("replay-btn");
    if (replayBtn)
      replayBtn.addEventListener("click", () => {
        hidePopup("gameover-popup");
        foundWords.clear();
        extraTimeUsed = false;
        continueUsed = false;
        setPauseButtonEnabled(true);
        setHomeButtonEnabled(true);
        setupLevel(currentLevel);
        updateEndGameButtonWidth(); // Update button width on replay
        tryCache();
      });

    const homeBtn = document.getElementById("home-btn");
    if (homeBtn)
      homeBtn.addEventListener("click", () => {
        hidePopup("gameover-popup");
        continueUsed = false;
        endGame();
      });

    const homeBtnFinal = document.getElementById("home-btn-final");
    if (homeBtnFinal)
      homeBtnFinal.addEventListener("click", () => {
        hidePopup("all-levels-popup");
        endGame();
      });

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        isPaused = !isPaused;
        pauseBtn.innerText = isPaused ? "▶️" : "⏸️";
        if (pauseOverlay) {
          if (isPaused) {
            pauseOverlay.classList.remove("hidden");
          } else {
            pauseOverlay.classList.add("hidden");
          }
        }
      });
    }

    function setPauseButtonEnabled(enabled) {
      if (pauseBtn) {
        if (enabled) {
          pauseBtn.classList.remove("disabled");
        } else {
          pauseBtn.classList.add("disabled");
        }
      }
    }

    function setHomeButtonEnabled(enabled) {
      const homeBtnGame = document.getElementById("game-home-btn");
      if (homeBtnGame) {
        if (enabled) {
          homeBtnGame.classList.remove("disabled");
        } else {
          homeBtnGame.classList.add("disabled");
        }
      }
    }

    function tryCache() {
      // Cache Interstitial Ad

      window.JioGames?.cacheAd(AdType.Interstitial, {
        onAdPrepared: () => console.log("Interstitial Ad cached successfully."),
        onAdFailedToLoad: (error) =>
          console.log("Interstitial failed: " + error),
      });

      // Cache Rewarded Ad

      setTimeout(() => {
        window.JioGames?.cacheAd(AdType.Rewarded, {
          onAdPrepared: () => console.log("Rewarded Ad cached successfully."),
          onAdFailedToLoad: (error) => console.log("Rewarded failed: " + error),
        });
      }, 5000);
    }
  } // end of initializeGame
  // Expose functions to the global scope for HTML onclick handlers
  window.startGame = startGame;
  window.toggleInstructions = toggleInstructions;
  window.endGame = endGame;
}); // end of DOMContentLoaded
