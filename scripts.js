const gameBoard = document.getElementById("game-board");
const startButton = document.getElementById("start-game");
const resetButton = document.getElementById("reset-game");
const previewButton = document.getElementById("preview-game");
const playerNameInput = document.getElementById("player-name");
const timerDisplay = document.getElementById("timer");
const movesDisplay = document.getElementById("moves");
const highScoresDisplay = document.getElementById("high-scores");
const difficultySelector = document.getElementById("difficulty");
const symbolsSelector = document.getElementById("symbols");

const symbolSets = {
    animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐷", "🐸", "🐵", "🦄", "🐧", "🐢", "🐙"],
    symbols: ["⚽", "🏀", "🏈", "🎾", "⚾", "🏐", "🏉", "🥎", "🏸", "🏓", "🎱", "🪀", "🎯", "🎲", "🎮", "🕹️", "🎤", "🎧"],
    places: ["🏠", "🏢", "🏫", "🏥", "🏦", "🏛️", "⛪", "🕌", "🛕", "🎪", "🏖️", "🏜️", "🗼", "🏰", "🗽", "🏯", "🏝️", "🛶"],
    distinctCharacters: [
        "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
        "⚽", "🏀", "🏈", "🎾", "⚾", "🏐", "🏉", "🥎",
        "🏠", "🏢", "🏫", "🏥", "🏦", "🏛️", "⛪", "🕌",
        "🦄", "🐧", "🐢", "🐙", "🎮", "🎯", "🎤", "🎧"
    ]
};

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer;
let seconds = 0;
let isPlaying = false;
let cardFlippingLocked = false;

function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

function createBoard() {
    const gridSize = parseInt(difficultySelector.value);
    const symbolSet = gridSize === 8 ? 'distinctCharacters' : symbolsSelector.value;
    const selectedSymbols = symbolSets[symbolSet];
    const totalCards = (gridSize * gridSize) / 2;

    if (selectedSymbols.length < totalCards) {
        alert("Not enough symbols for the selected grid size. Please choose a smaller grid or a different symbol set.");
        return;
    }

    const gameSymbols = selectedSymbols.sort(() => 0.5 - Math.random()).slice(0, totalCards);

    cards = [...gameSymbols, ...gameSymbols].sort(() => 0.5 - Math.random());

    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    gameBoard.innerHTML = "";

    cards.forEach((symbol, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.index = index;
        card.addEventListener("click", flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (!isPlaying || cardFlippingLocked || this.classList.contains("flipped") || flippedCards.length === 2) return;

    const selectedCard = this;
    selectedCard.classList.add("flipped");
    selectedCard.textContent = cards[selectedCard.dataset.index];
    flippedCards.push(selectedCard);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = `Moves: ${moves}`;
        cardFlippingLocked = true;
        setTimeout(checkMatch, 700);
    }
    if (moves > 0) {
        previewButton.disabled = true;
    }
}

function checkMatch() {
    if (flippedCards.length !== 2) return;

    const [card1, card2] = flippedCards;

    if (card1.textContent === card2.textContent) {
        card1.classList.add("matched");
        card2.classList.add("matched");

        setTimeout(() => {
            card1.style.visibility = "hidden";
            card2.style.visibility = "hidden";
            cardFlippingLocked = false;
        }, 500); 
        card1.removeEventListener("click", flipCard);
        card2.removeEventListener("click", flipCard);
        matchedPairs++;

        if (matchedPairs === cards.length / 2) {
            setTimeout(() => {
                endGame();
            }, 700);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            card1.textContent = "";
            card2.textContent = "";
            cardFlippingLocked = false;
        }, 700);
    }

    flippedCards = [];
}

function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    highScoresDisplay.innerHTML = highScores.length
        ? "<h2>High Scores</h2>" + highScores.map((score, index) => `<p>${index + 1}. ${score.name}: ${score.score}</p>`).join("")
        : "<h2>No High Scores Yet</h2>";
}

function startGame() {
    if (isPlaying) {
        if (!confirm("A game is already in progress. Do you want to start a new game?")) {
            return;
        }
        resetGame();
    }

    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Please enter a valid name to start the game.");
        return;
    }

    isPlaying = true;
    matchedPairs = 0;
    moves = 0;
    seconds = 0;

    createBoard();
    startTimer();
    startButton.disabled = true;
    playerNameInput.readOnly = true;

    movesDisplay.textContent = "Moves: 0";
    timerDisplay.textContent = "Time: 0s";

    previewButton.disabled = false; 
}

function resetGame() {
    isPlaying = false;
    clearInterval(timer);
    startButton.disabled = false;
    playerNameInput.readOnly = false;

    timerDisplay.textContent = "Time: 0s";
    movesDisplay.textContent = "Moves: 0";

    createBoard();
}

function startTimer() {
    timer = setInterval(() => {
        seconds++;
        timerDisplay.textContent = `Time: ${seconds}s`;
    }, 1000);
}

function previewCards() {
    if (!cards.length) {
        alert("The board has not been initialized. Start a game first.");
        return;
    }
    const allCards = Array.from(gameBoard.children);
    allCards.forEach(card => {
        const index = card.dataset.index;
        card.textContent = cards[index];
        card.classList.add("preview");
    });

    setTimeout(() => {
        allCards.forEach(card => {
            if (!card.classList.contains("matched")) {
                card.textContent = "";
                card.classList.remove("preview");
            }
        });
    }, 3000);
}

function endGame() {
    isPlaying = false;
    clearInterval(timer);

    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Player name is required to record a score.");
        return;
    }

    const difficultyMultiplier = parseInt(difficultySelector.value) / 4;
    const timeMoves = seconds + moves || 1; 
    const finalScore = Math.round((50000 / timeMoves * 0.9) * difficultyMultiplier);

    alert(`Congratulations, ${playerName}! You completed the game in ${seconds} seconds with ${moves} moves.`);

    const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    highScores.push({ name: playerName, score: finalScore });
    highScores.sort((a, b) => b.score - a.score); 
    localStorage.setItem("highScores", JSON.stringify(highScores.slice(0, 10)));

    displayHighScores();

    setTimeout(() => resetGame(), 1000);
}

function initializeGame() {
    handleDifficultyChange();
    displayHighScores();
    document.getElementById("game-form").addEventListener("submit", handleFormSubmit);
    previewButton.disabled = true; 
}

function handleFormSubmit(event) {
    event.preventDefault();
    startGame();
}

function handleDifficultyChange() {
    const gridSize = parseInt(difficultySelector.value);
    symbolsSelector.disabled = gridSize === 8;
    resetGame();
    createBoard();
}

difficultySelector.addEventListener('change', handleDifficultyChange);
symbolsSelector.addEventListener('change', createBoard);
startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
previewButton.addEventListener("click", previewCards);

window.onload = initializeGame;
