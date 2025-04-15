// creates board with level X level size
var level;
// used while iterating over tiles
var max;
// board 
var board;
// counting moves made
var count = 0;

// timer variable, it is global because we are setting it from one function, and stopping from another
// so it should be available for both of them
var timer;

// audio files
var errorAudio = new Audio('assets/audio/error.mp3');
var completedLevelAudio = new Audio('assets/audio/complete.mp3');

//  DOM elements of the timer
var secondsEl = document.getElementById('seconds');
var minutesEl = document.getElementById('minutes');
var hoursEl = document.getElementById('hours');

// form at the start, when clicked, starts the game
var start = document.getElementById('start');

// menu that is shown at the beginning, allows player to choose game level to start from
var menu = document.getElementById('menu');

// shown when a level is completed
var completedLevel = document.getElementById('completedLevel');

// next is a button shown when a level is completed, when clicked, takes game to the next level
var next = document.getElementById('next');

// showing how many moves did player make
var counter = document.getElementById('count');

// notifies player that he has completed the game, shown when no more levels left
var gameOver = document.getElementById('gameOver');

// button for tiles shuffling
var shuffleButton = document.getElementById('shuffle');

// 
shuffleButton.addEventListener('click', function() {
  if(board) {
    for(var i = 0; i < (200 * level); i++) {
      shuffle();
    }
  }
})
// starting timer
function startTimer() {
  var hours = 0, minutes = 0; seconds = 0;

  // updates timer display
  function updateTimer(s, m, h) {
    updateElement(secondsEl, s);
    updateElement(minutesEl, m);
    updateElement(hoursEl, h);
  }
  // creating timer
  timer = setInterval(function() {
    
    seconds++;
    
    if(seconds >= 60) {
      seconds = seconds % 60;
      minutes++;
      
    }

    if(minutes >= 60) {
      minutes = minutes % 60;
      hours++;
    }

    updateTimer(seconds, minutes, hours);
  }, 1000);

}


// stops the timer
function stopTimer() {
  clearTimeout(timer);
}


// updating element, used in timer to update seconds, minutes, hours on the DOM
function updateElement(el, value) {
  el.textContent = value < 10 ? '0' + value : value;
}



// start the game
start.addEventListener('submit', function(e) {
  e.preventDefault();
  level = Number(document.getElementById('levelInput').value);
  max = Math.pow(level, 2) - 1;
  menu.style.display = "none";
  startTimer();
  updateCount();
  draw();
})


// proceed to next level
next.addEventListener('click', function() {
  completedLevel.style.display = "none";
  level++;
  max = Math.pow(level, 2) - 1;
  startTimer();
  restartCount();
  draw();
})


// creating the board
function draw() {
  board = document.createElement('div');
  board.classList.add('board')
  board.style.height = level * 110 + 'px';
  board.style.width = level * 110 + 'px';
  for(i = max; i >= 0; i--) {
    // adding tiles, one by one to the board
    addTile(board);
  }
  document.body.appendChild(board);
}


// update count of moves
function updateCount() {
  counter.textContent = count++;
}


// restarts count of moves on next level
function restartCount() {
  count = 0;
  updateCount();
}


// called when tile has been clicked
function play() {
  var empty = document.querySelector('.empty');
  move.call(this, Number(this.textContent), empty);
  // check if player won
  if(checkWin()) {
    if(level < 8) {
      completedLevel.style.display = "block";
      // if there are no any levels left, notify the user about it
    } else {
      gameOver.style.display = "block";
    }
    completedLevelAudio.play();
    document.body.removeChild(board);
    stopTimer();
  }
}


// swapping 2 node elements
function swap(el1, el2) {
  var tmp = el1.cloneNode(true);
  el1.parentNode.replaceChild(tmp, el1);
  el2.parentNode.replaceChild(el1, el2);
  tmp.parentNode.replaceChild(el2, tmp);
}


// creating tile for the board
function addTile(parent) {
  var tile = document.createElement('div');
    tile.textContent = i;
    tile.classList.add('tile');
    tile.addEventListener('click', play);
    parent.appendChild(tile);
    // if level is even number, end tiles should be 3 1 2, not 3 2 1 at the start
    // otherwise the game would be impossible to solve
    if(level % 2 === 0) {
      if(i === 1) {
        tile.textContent = 2;
        tile.previousSibling.textContent = 1;
      }
    }
    // adding empty class for 0 tile, visibility set to hidden
    if(i === 0) {
      tile.classList.add('empty');
    }
    parent.appendChild(tile);
}

// checks if tile can be moved to empty space
// accepts array of tiles and targets tile textcontent as number
function isMovePossible(arr, tile) {
  
  for(var i = 0; i < arr.length; i++) {
    if(Number(arr[i].textContent) === tile) {
        // check if moving up possible
      if((arr[i - level] && arr[i - level].textContent == 0) || 
        // check if moving down possible
        ((arr[i + level]) && arr[i + level].textContent == 0) ||
        // check if moving left possible
        ((i % level) && arr[i - 1].textContent == 0) || 
        // check if moving right possible
        (((i + 1) % level) && arr[i + 1].textContent == 0)
        ) {
        return true;
        } else {
        return false;
      }
    }
  }
}

// moving tiles if possible
function move(tile, target) {
  var arr = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  // check if moving up possible
  if(isMovePossible(arr, tile)) {
    swap(this, target);
    updateCount();
  } else {
    errorAudio.play();
    return false;
  }
}

// shuffling tiles
function shuffle() {
  // getting empty space
  var empty = document.querySelector('.empty');
  // array representation of tiles
  var tiles =  Array.prototype.slice.call(document.querySelectorAll('.tile'));
  // getting index of empty space
  var emptyPosition = tiles.indexOf(empty);
  // get all possible move directions around empty space
  var directions = [tiles[emptyPosition - level], tiles[emptyPosition + level], tiles[emptyPosition + 1], tiles[emptyPosition - 1]].filter(direction => direction);
  var getRandomDirection = directions[Math.floor(Math.random() * directions.length)];
  // swap random tile and empty if posible
  if(isMovePossible(tiles, Number(getRandomDirection.textContent))) {
    swap(empty, getRandomDirection);
  }
}

// checking if all tiles are sorted
function checkWin() {
  var arr = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  var index = 1;
  for(var i = 0; i < arr.length; i++) {
    if(i === max) {
      return true;
    } else {
      if(Number(arr[i].textContent) !== index) {
        return false;
      }
    }
    index++;
  }
  return true;
}