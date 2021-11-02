buttonColours = ["red" , "blue" , "green" , "yellow"];
gamePattern = [];
userClickedPattern = [];
var start = false;
var level = 0;

function nextSequence(){
  userClickedPattern = [];
  level++;
  $("#level-title").text("Level "+level);

  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);
  $("#"+randomChosenColour).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);

  playSound(randomChosenColour);
}

function playSound(name){
  var file = "sounds/" + name + ".mp3";
  var audio = new Audio(file); audio.play();
}

function animatePress(currentColour){
  $("#"+currentColour).addClass('pressed');
  setTimeout(function(){
           $("#"+currentColour).removeClass('pressed');
   }, 75);
}

function checkAnswer(currentLevel){
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]){
    console.log("Success");
    if (gamePattern.length === userClickedPattern.length){
      setTimeout(function(){
               nextSequence();
       }, 1000);
    }

  }
  else{
    console.log("Wrong");
    playSound("wrong");
    $("body").addClass("game-over");
    setTimeout(function(){
      $("body").removeClass("game-over");
    } , 200);
    $("#level-title").text("Game Over, Press Any Key to Restart");
    startOver();
  }
}

function startOver(){
  level = 0;
  gamePattern = [];
  start = false;
}

$(".btn").click(function(){
  var userChosenColour = $(this).attr('id'); // userChosenColour = this.id; also works
  userClickedPattern.push(userChosenColour);
  playSound(userChosenColour);
  animatePress(userChosenColour);
  checkAnswer(userClickedPattern.length-1);
});

$(document).keypress(function(event){
  // start = true;
  // startCnt++;
  // if (start == true && startCnt == 1){
  //   nextSequence();
  // }
  if (!start){
    $("h1").text("Level "+level);
    nextSequence();
    start = true;
  }
});
