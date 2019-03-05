
var notes = [];
var noteSquares = [];
var startNote = 16;

var lastClicked;

var matchSpeed = 750;

var infiniteMode = false;

var numDone = 0;
var numSquares = 12;

var currentPattern = [];

var clickIndex = 0;

var clickedPattern = [];

var cancelNote = 1;
var noteTimeout = null;
var noteTimeout2 = null;

function shuffleSquares(ul) {
    for (var i = ul.children.length; i >= 0; i--) {
        ul.appendChild(ul.children[Math.random() * i | 0]);
    }
}

function updateNumDone(n) {
    numDone = n;
    $("#num-bar").empty();
    for(var i = 0; i < n; i++) {
        var el = document.createElement("img");
        el.src = "bulb_on.svg";
        el.classList.add("bulb");
        $("#num-bar")[0].appendChild(el);
    }
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function stopPlayingSound() {
    $( noteSquares[cancelNote] ).removeClass("brighten-square");
    notes[cancelNote].pause();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function playNote(n, doLightUp, specialTime)
{
    clearInterval(noteTimeout);
    clearInterval(noteTimeout2);
    if(n < 0)
        return;
    stopPlayingSound();
    
    cancelNote = n;
    if(doLightUp)
        $( noteSquares[n] ).addClass("brighten-square");
    notes[n].currentTime = 0;
    notes[n].play();
    noteTimeout = setTimeout(stopPlayingSound, 1000);
    if(doLightUp) {
        var time;
        if(specialTime === undefined)
            time = 500;
        else
            time = 3 * specialTime / 4;
        noteTimeout2 = setTimeout(function() {
            $( noteSquares[cancelNote] ).removeClass("brighten-square");
        }, time);
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var theSong = [ 16, -1, 20, -1, 23, -1, 25, -1, 26, 25, -1, 23, -1,  20, -1, 16 ];

var wrongSong = [ 20, 19, 18, 17, 16];



var endSong = [
    
    /* Theme A: Intro */
    16, 18, 20, 21, 23, -1, 23, -1,
    25, 28, 27, 25, 23, -1, -1, -1,
    21, 23, 21, 23, 20, -1, 20, -1,
    18, 20, 18, 20, 16, -1, -1, -1,
    
    /* Theme B: Refrain */
    23, 21, 20, 18, 20, -1, 23, -1,
    28, 27, 25, 27, 23, -1, -1, -1,
    21, 23, 21, 23, 20, -1, 23, -1,
    18, 20, 18, 20, 23, -1, -1, -1,
    
    /* Theme C: Finale */
    28, 27, 25, 27, 28, -1, 23, -1,
    28, 27, 25, 27, 28, -1, -1,
    20, 20, 18, 16, 20, 20, 18, 16,
    18, -1, 16, -1, 15, -1, 18, -1, 16, -1, -1, -1
];

async function playSong(song, doLightUp, speed, callback) {
    $(".color-square").addClass("noclick");
    await sleep(1000);
    for(var i = 0; i < song.length; i++) {
        playNote(song[i], doLightUp, speed);
        await sleep(speed);
    }
    await sleep(1000);
    $(".color-square").removeClass("noclick");
    if(callback !== undefined && callback !== null)
        callback();
}

function randomInt(min,max) // min and max included
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function addToPattern(actuallyAdd) {
    if(actuallyAdd === undefined)
        actuallyAdd = true;
    if(actuallyAdd)
        currentPattern[currentPattern.length] = randomInt(16, 16 + numSquares - 1);
    $("#header").text("Listen...");
    playSong(currentPattern, true, matchSpeed, function() {
        $("#header").text("Repeat it!");
    });
    
}

function startGame() {
    infiniteMode = $("#infinite-checkbox:checked").length > 0;
    console.log(infiniteMode);
    shuffleSquares($("#memory-board")[0]);
    $(".color-square").removeClass("noclick");
    addToPattern();
    updateNumDone(0);
}
$(function() {
    $( "#infinite-checkbox" ).checkboxradio();
    
    $("#helpDialog").dialog({
        maxHeight: $(window).height() - 50,
        modal: true,
        width: "90%"
    });
    $("#helpDialog").css({overflow:"auto"});
    var j = 0;
    /* Initialize the audio */
    for(var i = 1; i <= 52; i++) {
        notes[i] = new Audio("notes/note" + pad(i, 2) + ".mp3");
        if(i >= 16 && j < numSquares) {
            noteSquares[i] = $("#memory-board").children()[j];
            j++;
        }
    }
    $(".color-square").click(function() {
        
        if(lastClicked !== undefined)
            noteSquares[lastClicked].classList.remove("brighten-square");
        
        var noteNum = 16 + parseInt($(this)[0].getAttribute("data-num"));
        noteSquares[noteNum].classList.add("brighten-square");
        console.log(noteNum);
        lastClicked = noteNum;
        
        playNote(noteNum, true);
        clickedPattern[clickIndex] = noteNum;
        
        if(clickedPattern[clickIndex] !== currentPattern[clickIndex])
        {
            
            if(infiniteMode) {
                /* Start the whole pattern over again */
                updateNumDone(0);
                currentPattern = [];
                clickedPattern = [];
                clickIndex = 0;
            } else if(numDone > 0) {
                updateNumDone(numDone-1);
                /* Get rid of the newest element and play it again */
                if(currentPattern.length > 0) {
                    currentPattern.pop();
                    
                }
                clickedPattern = [];
                clickIndex = 0;
            }
            $("#header").text("Oops!");
            $("#memory-board").effect("shake");
            playSong(wrongSong, false, 250, function() {
                /* If infiniteMode, actually add to pattern, otherwise just play it*/
                addToPattern(infiniteMode);
                return;
            });
            return;
        }
        clickIndex++;
        if(clickedPattern.length === currentPattern.length) {
            
            updateNumDone(numDone + 1);
            if(infiniteMode || numDone < 5) {
                $("#header").text("Good job!");
                
                setTimeout(function() {
                    addToPattern();
                    clickIndex = 0;
                }, 2000); 
            } else if(!infiniteMode) {
                $("#header").text("5 In a Row! Great!");
                
                
                playSong(endSong, true, 300, function() {
                    $("#playAgainDialog").dialog({
                        height: 100,
                    });
                });
                $(".color-square").addClass("noclick");
            }
        }
    });
    
});