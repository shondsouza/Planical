// Create a list to hold all the cards
const   icons = ["fa fa-youtube-play", "fa fa-youtube-play", "fa fa-whatsapp", "fa fa-whatsapp", "fa fa-car", "fa fa-car", "fa fa-heart", "fa fa-heart", "fa fa-plane", "fa fa-plane", "fa fa-university", "fa fa-university", "fa fa-dribbble", "fa fa-dribbble", "fa fa-usb", "fa fa-usb"];
const   cardsContainer = document.querySelector(".deck");
let     openedCards = [];
let     matchedCards = [];


// Create the variables needed for the modal
let totalStars, totalTime;


// Initializing the game, by suffling & creating the list of cards 
function init() {
    const   icons2 = shuffle(icons);
    
    for(let i = 0; i < icons.length; i++) {
        const card = document.createElement("li");
        card.classList.add("card");
        card.innerHTML = `<i class="${icons[i]}"></i>`;
        cardsContainer.appendChild(card);
    
        // Add Click Event to each Card
        click(card);
    }
}


// Instructions Modal
// https://www.w3schools.com/howto/howto_css_modals.asp

// Get the modal
let modal = document.getElementById('myModal');

// Get the button that opens the modal
let btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


// Click Event

// First Click Indicator
let isFirstClick = true;

// Click Function
function click(card) {

    // Card Click Event
    card.addEventListener("click", function() {

        // After the first click, the variable `isFirstClick` remains false until the end of the game.
        // Absence of an `else`, as the `isFirstClick` variable should remain false.
        if(isFirstClick) {
            // Start our timer
            startTimer();
            // Change First Click indicator's value
            isFirstClick = false;
        }
        
        const   currentCard = this;
        const   previousCard = openedCards[0];

        // One existing open card
        if(openedCards.length === 1) {

            card.classList.add("open", "show", "disable");
            openedCards.push(this);

            // Compare the 2 open cards
            compare(currentCard, previousCard);

        } else {
        // No open cards
            currentCard.classList.add("open", "show", "disable");
            openedCards.push(this);
        }
        
    });
}


// Compare two open cards
function compare(currentCard, previousCard) {

    // Matching condition
    if(currentCard.innerHTML === previousCard.innerHTML) {
                
        // Match
        currentCard.classList.add("match");
        previousCard.classList.add("match");

        // The matched pair is pushed to the matchedCards array
        matchedCards.push(currentCard, previousCard);

        openedCards = [];

        // Check if the game is over
        isOver();

    } else {
        
        // The two cards are turned with the face down after 500ms i.e. 0.5sec.
        setTimeout(function() {
            currentCard.classList.remove("open", "show", "disable");
            previousCard.classList.remove("open", "show", "disable");
        }, 500);

        openedCards = [];
    }

    // Increase the moves count
    addMove();
}


// Check if the game is over
function isOver() {
    if(matchedCards.length === icons.length) {

        // Stop the timer
        stopTimer();

        // Use of sweetalert for the congratulations pop-up (https://sweetalert.js.org/guides/)
        let finalLine = "Rating: " + ratingMeter + " Elapsed time: " + 
            totalSeconds + " seconds. Moves: " + (moves+1) + ". Do you want to play again?";

            swal({
                position: "top",
                title: "Congratulations! You won!",
                text: finalLine,
                type: "success",
                showCancelButton: true,
                cancelButtonText: "Nope",
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: "Of course!"
              }).then((result) => {
                if (result.value) {
                    restart();
                }
              })        
}}


// Increase the moves count
const   movesContainer = document.querySelector(".moves");
let     moves = 0;
movesContainer.innerHTML = 0;

function addMove() {
    moves++;
    movesContainer.innerHTML = moves;

    // Set the rating
    rating();
}


// Rating
const   starsContainer = document.querySelector(".stars"), 
        star = `<li><i class="fa fa-star"></i></li>`,
        starHalf = `<li><i class="fa fa-star-half-empty"></i></li>`,
        starWhite = `<li><i class="fa fa-star-o"></i></li>`;
let     ratingMeter;

starsContainer.innerHTML = star + star + star;

function rating() {
    // I liked the idea to have a progressive decrease of stars hence the use of half & white stars.
    if( moves <= 15) {
        starsContainer.innerHTML = star + star + star;
    } else if(moves > 15 && moves < 23) {
        starsContainer.innerHTML = star + star + starHalf;
    } else if(moves === 23) {
        starsContainer.innerHTML = star + star + starWhite;
    } else if(moves > 23 && moves < 30) {
        starsContainer.innerHTML = star + starHalf + starWhite;
    } else {
        starsContainer.innerHTML = star + starWhite + starWhite;
    }

    // Get the final rating according to moves. Only full stars count.
    if( moves <= 15) {
        ratingMeter = "Three stars (Excellent!) ";
    } else if(moves >= 16 && moves <= 23) {
        ratingMeter = "Two stars (Very Good!) ";
    } else {
        ratingMeter = "One star (Not bad but you can do better!) ";
    }
}


// Timer
const   timerContainer = document.querySelector(".timer");
let     liveTimer,
        totalSeconds = 0;

// Set the default value to the timer's container
timerContainer.innerHTML = totalSeconds + ' s   ';

// Starting the timer as soon as the user clicks on their first card
function startTimer() {
    liveTimer = setInterval(function() {
        // Increase the totalSeconds
        totalSeconds++;
        // Update the HTML Container with the new value of time
        timerContainer.innerHTML = totalSeconds + ' s  ';
    }, 1000);
}


// Stopping the timer - is called when the game is over
function stopTimer() {
    clearInterval(liveTimer);
}


// Restart Button
const   restartBtn = document.querySelector(".restart");

restartBtn.addEventListener("click", function() {
    restart();
});


// Restart Function
function restart() {
    // Delete ALL cards
    cardsContainer.innerHTML = "";

    // Call `init` to initialize the game
    init();

    // Reset the game
    reset();
};


// Reset All Game Variables
function reset() {
    // Empty the matchedCards array
    matchedCards = [];

    // Reset moves to 0
    moves = 0;
    movesContainer.innerHTML = moves;

    // Reset rating to three stars
    starsContainer.innerHTML = star + star + star;

    // Reset the timer
    // `isFirstClick` has to be reverted back to `true` to be able to start the timer again
    stopTimer();
    isFirstClick = true;
    totalSeconds = 0;
    timerContainer.innerHTML = totalSeconds + " s";
}


// Start the game for the first time!
init();


// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
