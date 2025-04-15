const moves = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const playAgainButton = document.getElementById("play-again");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
const howToPlayBtn = document.getElementById("how-to-play");
const howToPlayModal = document.getElementById("how-to-play-modal");
const closeModalBtn = document.getElementById("close-modal");
const startOverBtn = document.getElementById("start-over");

let cards;
let interval;
let firstCard = false;
let secondCard = false;
let isFirstClick = true;
let gameStarted = false;

// Items array with mental health themed emojis
const items = [
    { 
        name: "brain", 
        icon: '<i class="fas fa-brain fa-2x" style="color: #7B68EE;"></i>'
    },
    { 
        name: "heart", 
        icon: '<i class="fas fa-heart fa-2x" style="color: #FF69B4;"></i>'
    },
    { 
        name: "star", 
        icon: '<i class="fas fa-star fa-2x" style="color: #FFD700;"></i>'
    },
    { 
        name: "peace", 
        icon: '<i class="fas fa-peace fa-2x" style="color: #98FB98;"></i>'
    },
    { 
        name: "meditation", 
        icon: '<i class="fas fa-spa fa-2x" style="color: #87CEEB;"></i>'
    },
    { 
        name: "smile", 
        icon: '<i class="fas fa-smile-beam fa-2x" style="color: #FFA500;"></i>'
    },
    { 
        name: "lotus", 
        icon: '<i class="fas fa-seedling fa-2x" style="color: #3CB371;"></i>'
    },
    { 
        name: "infinity", 
        icon: '<i class="fas fa-infinity fa-2x" style="color: #9370DB;"></i>'
    }
];

// Alternative set if you want variety
const alternativeItems = [
    { name: "mindfulness", icon: "🧘‍♂️" },  // Person in lotus position
    { name: "growth", icon: "🌱" },        // Seedling (growth)
    { name: "butterfly", icon: "🦋" },     // Butterfly (transformation)
    { name: "sparkle", icon: "✨" },       // Sparkles (hope)
    { name: "rainbow", icon: "🌈" },       // Rainbow (positivity)
    { name: "sun", icon: "☀️" },          // Sun (brightness)
    { name: "dove", icon: "🕊️" },         // Dove (peace)
    { name: "balance", icon: "☯️" },       // Yin yang
    { name: "nature", icon: "🌸" },        // Cherry blossom
    { name: "strength", icon: "💪" },      // Flexed biceps (strength)
];

// Initial Time
let seconds = 0;
let minutes = 0;

// Initial moves and win count
let movesCount = 0;
let winCount = 0;

// Timer
const timeGenerator = () => {
    seconds += 1;
    if (seconds >= 60) {
        minutes += 1;
        seconds = 0;
    }
    
    // Format time before displaying
    let secondsValue = seconds < 10 ? `0${seconds}` : seconds;
    let minutesValue = minutes < 10 ? `0${minutes}` : minutes;
    timeValue.innerHTML = `Time: ${minutesValue}:${secondsValue}`;
};

// Calculate moves
const movesCounter = () => {
    movesCount += 1;
    moves.innerHTML = `Moves: ${movesCount}`;
};

// Generate random cards
const generateRandom = (size = 4) => {
    let tempArray = [...items];
    let cardValues = [];
    size = (size * size) / 2;
    for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(Math.random() * tempArray.length);
        cardValues.push(tempArray[randomIndex]);
        tempArray.splice(randomIndex, 1);
    }
    return cardValues;
};

const matrixGenerator = (cardValues, size = 4) => {
    gameContainer.innerHTML = "";
    cardValues = [...cardValues, ...cardValues];
    cardValues.sort(() => Math.random() - 0.5);
    
    gameContainer.style.gridTemplateColumns = `repeat(${size}, auto)`;

    cardValues.forEach((item) => {
        gameContainer.innerHTML += `
            <div class="card-container" data-card-value="${item.name}">
                <div class="card-before">?</div>
                <div class="card-after">${item.icon}</div>
            </div>
        `;
    });

    gameContainer.style.display = "grid";
    gameContainer.style.gap = "1em";

    cards = document.querySelectorAll(".card-container");
    cards.forEach((card) => {
        card.addEventListener("click", () => handleCardClick(card));
    });
};

// Modify the window.onload or add it if not present
window.onload = () => {
    // Initialize game variables
    movesCount = 0;
    seconds = 0;
    minutes = 0;
    
    // Update displays
    moves.innerHTML = `Moves: ${movesCount}`;
    timeValue.innerHTML = `Time: 00:00`;
    
    // Show Start Over button
    startOverBtn.classList.remove("hide");
    
    // Hide controls container immediately
    controls.classList.add("hide");
    
    // Initialize game
    isFirstClick = true;
    gameStarted = false;
    initializer();
};

// Play Again
playAgainButton.addEventListener("click", () => {
    // Reload the current page to restart the game
    window.location.reload();
});

// Initialize game
const initializer = () => {
    winCount = 0;
    let cardValues = generateRandom();
    matrixGenerator(cardValues);
};

// Stop game function
const stopGame = () => {
    clearInterval(interval);
    gameStarted = false;
    isFirstClick = true;
    controls.classList.remove("hide");
    playAgainButton.classList.remove("hide");
    document.getElementById("exit").classList.remove("hide");
    startOverBtn.classList.add("hide");
};

// How to Play Modal
howToPlayBtn.addEventListener("click", () => {
    howToPlayModal.classList.remove("hide");
});

closeModalBtn.addEventListener("click", () => {
    howToPlayModal.classList.add("hide");
});

// Close modal if clicked outside
howToPlayModal.addEventListener("click", (e) => {
    if (e.target === howToPlayModal) {
        howToPlayModal.classList.add("hide");
    }
});

// Start Over button
startOverBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to start over? Your current progress will be lost.")) {
        // Clear the existing timer
        clearInterval(interval);
        
        // Reset all game variables
        movesCount = 0;
        seconds = 0;
        minutes = 0;
        winCount = 0;
        firstCard = false;
        secondCard = false;
        isFirstClick = true;
        gameStarted = false;
        
        // Update displays
        moves.innerHTML = `Moves: ${movesCount}`;
        timeValue.innerHTML = `Time: 00:00`;
        
        // Reset and initialize the game
        initializer();
        
        // Keep the Start Over button visible
        startOverBtn.classList.remove("hide");
    }
});

// Update the Exit button functionality
document.getElementById("exit").addEventListener("click", () => {
    // Redirect to quizandgame page
    window.location.href = "/quizandgame";
});

// Update the card click handler to prevent navigation issues
const handleCardClick = (card) => {
    // Start timer on first click
    if (isFirstClick && !gameStarted) {
        interval = setInterval(timeGenerator, 1000);
        gameStarted = true;
        isFirstClick = false;
    }

    if (!card.classList.contains("matched") && !card.classList.contains("flipped")) {
        card.classList.add("flipped");
        if (!firstCard) {
            firstCard = card;
            firstCardValue = card.getAttribute("data-card-value");
        } else {
            movesCounter();
            secondCard = card;
            let secondCardValue = card.getAttribute("data-card-value");
            if (firstCardValue === secondCardValue) {
                firstCard.classList.add("matched");
                secondCard.classList.add("matched");
                firstCard = false;
                winCount += 1;
                if (winCount === 8) {
                    clearInterval(interval);
                    const finalTime = timeValue.innerHTML.split(': ')[1];
                    result.innerHTML = `
                        <h2>Congratulations! 🎉</h2>
                        <p>Moves: ${movesCount}</p>
                        <p>Time: ${finalTime}</p>
                    `;
                    controls.style.display = "flex";
                    stopGame();
                }
            } else {
                let [tempFirst, tempSecond] = [firstCard, secondCard];
                firstCard = false;
                secondCard = false;
                setTimeout(() => {
                    tempFirst.classList.remove("flipped");
                    tempSecond.classList.remove("flipped");
                }, 900);
            }
        }
    }
}; 