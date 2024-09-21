var buttonColours = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var userClickedPattern = [];
var start = false;
var level = 0;
var captchaCorrect = true;
var captchaPending = false;

function generateCaptcha() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 200;
  canvas.height = 100;

  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let captchaString = "";
  for (let i = 0; i < 6; i++) {
    captchaString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "30px Arial";
  ctx.fillStyle = "#333";
  for (let i = 0; i < captchaString.length; i++) {
    ctx.save();
    ctx.translate(30 * i + 15, 50);
    ctx.rotate((Math.random() - 0.5) * 0.4);
    ctx.fillText(captchaString[i], 0, 0);
    ctx.restore();
  }

  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${
      Math.random() * 255
    },0.5)`;
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      2,
      2
    );
  }

  return { image: canvas.toDataURL(), text: captchaString };
}

function showCaptcha() {
  captchaPending = true;
  const captcha = generateCaptcha();
  const captchaHTML = `
    <div id="captcha-container" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.5); text-align: center;">
      <h2>Please enter the text you see below:</h2>
      <img src="${captcha.image}" alt="CAPTCHA">
      <input type="text" id="captcha-input" style="display: block; margin: 10px auto; padding: 5px;">
      <button onclick="verifyCaptcha('${captcha.text}')">Submit</button>
    </div>
  `;
  $("body").append(captchaHTML);
  captchaCorrect = false;
}

function verifyCaptcha(correctText) {
  const userInput = $("#captcha-input").val().trim();
  if (userInput.toLowerCase() === correctText.toLowerCase()) {
    $("#captcha-container").remove();
    captchaCorrect = true;
    captchaPending = false;
    resumeGameAfterCaptcha();
  } else {
    alert("Incorrect CAPTCHA. Please try again.");
    $("#captcha-input").val("");
    showCaptcha();
  }
}

function resumeGame() {
  if (level === 0) {
    nextSequence();
  } else {
    playPattern();
  }
}

function resumeGameAfterCaptcha() {
  $("#level-title").text("Level " + level);
  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  $("#" + randomChosenColour)
    .fadeIn(100)
    .fadeOut(100)
    .fadeIn(100);
  playSound(randomChosenColour);
}

function playPattern() {
  var i = 0;
  var interval = setInterval(function () {
    if (i >= gamePattern.length) {
      clearInterval(interval);
      return;
    }
    var color = gamePattern[i];
    $("#" + color)
      .fadeIn(100)
      .fadeOut(100)
      .fadeIn(100);
    playSound(color);
    i++;
  }, 1000);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function randomizeBtnPositions() {
  var btnElements = $(".btn").toArray();
  var originalColors = buttonColours.slice();

  shuffleArray(btnElements);

  btnElements.forEach((btn, index) => {
    var $btn = $(btn);
    var originalColor = $btn.attr("id");
    var newColor = originalColors[index];

    $btn.removeClass(originalColor).addClass(newColor).attr("id", newColor);
  });

  buttonColours = btnElements.map((btn) => $(btn).attr("id"));
}

function slightlyMoveButtons() {
  $(".btn").each(function () {
    var $btn = $(this);
    var randomX = Math.floor(Math.random() * 96) - 10;
    var randomY = Math.floor(Math.random() * 96) - 10;

    $btn.css({
      transform: `translate(${randomX}px, ${randomY}px)`,
      transition: "transform 0.3s",
    });
  });
}

function nextSequence() {
  if (captchaPending) return;

  userClickedPattern = [];
  level++;
  $("#level-title").text("Level " + level);

  if (level % 4 === 0 && level !== 0) {
    slightlyMoveButtons();
  }

  if (level % 9 === 0 && level !== 0) {
    showCaptcha();
    return;
  }

  if (level % 20 === 0 && level !== 0) {
    randomizeBtnPositions();
  }

  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  $("#" + randomChosenColour)
    .fadeIn(100)
    .fadeOut(100)
    .fadeIn(100);
  playSound(randomChosenColour);
}

function playSound(name) {
  var audio = new Audio("sounds/" + name + ".mp3");
  audio.play();
}

function animatePress(currentColor) {
  $("#" + currentColor).addClass("pressed");
  setTimeout(function () {
    $("#" + currentColor).removeClass("pressed");
  }, 100);
}

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      setTimeout(function () {
        nextSequence();
      }, 1000);
    }
  } else {
    console.log("Wrong");
    playSound("wrong");
    $("body").addClass("game-over");
    setTimeout(function () {
      $("body").removeClass("game-over");
    }, 200);
    $("#level-title").text("Game Over, Press Any Key to Restart");
    startOver();
  }
}

function resetButtonPositions() {
  buttonColours = ["green", "red", "yellow", "blue"];
  $(".btn").each(function (index) {
    $(this)
      .removeClass()
      .addClass("btn " + buttonColours[index])
      .attr("id", buttonColours[index]);
  });
  $(".btn").css({
    transform: "translate(0, 0)",
    transition: "transform 0.3s",
  });
}

function startOver() {
  level = 0;
  gamePattern = [];
  start = false;
  resetButtonPositions();
  captchaCorrect = true;
  captchaPending = false;
}

$(".btn").click(function () {
  if (!start || captchaPending) return;

  var userChosenColour = $(this).attr("id");
  userClickedPattern.push(userChosenColour);
  playSound(userChosenColour);
  animatePress(userChosenColour);
  checkAnswer(userClickedPattern.length - 1);
});

$(document).keypress(function () {
  if (!start) {
    $("#level-title").text("Level " + level);
    nextSequence();
    start = true;
  }
});
