var buttonColours = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var userClickedPattern = [];
var start = false;
var level = 0;
var captchaCorrect = true;
var captchaPending = false;
var currentCaptchaAnswer = null;
var isHardCaptcha = false;
var speedVariationEnabled = false;
var lastClickTime = 0;
var clickTimes = [];
var mouseMoveCount = 0;
var suspiciousClicks = 0;
var gameStartTime = 0;
var impossibleChallengePending = false;
var captchaTimer = null;
var challengeStartTime = 0;
var mouseTrailPoints = [];
var requiredPattern = [];
var patternIndex = 0;

function generateCaptcha(width = 200, height = 100) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let captchaString = "";
  for (let i = 0; i < 6; i++) {
    captchaString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(width / 200, height / 100);
  ctx.font = `${30 * scale}px Arial`;
  ctx.fillStyle = "#333";
  for (let i = 0; i < captchaString.length; i++) {
    ctx.save();
    const x = (width / (captchaString.length + 1)) * (i + 1);
    const y = height / 2 + (Math.random() - 0.5) * (height * 0.2);
    ctx.translate(x, y);
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
      2 * scale,
      2 * scale
    );
  }

  return { image: canvas.toDataURL(), text: captchaString };
}

function generateHardCaptcha(width = 300, height = 150) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let captchaString = "";
  for (let i = 0; i < 8; i++) {
    captchaString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#e0e0e0");
  gradient.addColorStop(0.5, "#f5f5f5");
  gradient.addColorStop(1, "#d0d0d0");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 100 + 100},${
      Math.random() * 100 + 100
    },${Math.random() * 100 + 100},0.6)`;
    ctx.lineWidth = (Math.random() * 3 + 1) * (width / 300);
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * canvas.height);
    for (let x = 0; x < canvas.width; x += 10) {
      ctx.lineTo(x, Math.random() * canvas.height);
    }
    ctx.stroke();
  }

  const fonts = ["Arial", "Times", "Courier", "Verdana", "Georgia"];
  const scale = Math.min(width / 300, height / 150);
  for (let i = 0; i < captchaString.length; i++) {
    ctx.save();

    const x = (width / (captchaString.length + 1)) * (i + 1);
    const y = height / 2 + (height / 2) * (Math.random() * 0.8) - height * 0.2;
    ctx.translate(x, y);

    ctx.rotate((Math.random() - 0.5) * 1.2);

    const fontSize = (Math.random() * 15 + 35) * scale;
    const font = fonts[Math.floor(Math.random() * fonts.length)];
    ctx.font = `${fontSize}px ${font}`;

    ctx.fillStyle = `rgb(${Math.random() * 100},${Math.random() * 100},${
      Math.random() * 100
    })`;

    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 2 * scale;
    ctx.shadowOffsetX = 1 * scale;
    ctx.shadowOffsetY = 1 * scale;

    ctx.transform(
      1,
      Math.random() * 0.3 - 0.15,
      Math.random() * 0.3 - 0.15,
      1,
      0,
      0
    );

    ctx.fillText(captchaString[i], 0, 0);
    ctx.restore();
  }

  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${
      Math.random() * 255
    },${Math.random() * 0.8})`;
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      (Math.random() * 4 + 1) * scale,
      (Math.random() * 4 + 1) * scale
    );
  }

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 150},${Math.random() * 150},${
      Math.random() * 150
    },0.7)`;
    ctx.lineWidth = (Math.random() * 2 + 1) * scale;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }

  return { image: canvas.toDataURL(), text: captchaString };
}

function generateImpossibleChallenge() {
  impossibleChallengePending = true;
  challengeStartTime = Date.now();
  mouseTrailPoints = [];
  patternIndex = 0;

  var colors = ["red", "blue", "green", "yellow"];
  var colorsForSequence = colors.slice();

  var correctColor = colorsForSequence.splice(
    Math.floor(Math.random() * colorsForSequence.length),
    1
  )[0];

  var sequence = colorsForSequence.slice();

  for (var i = 0; i < 2; i++) {
    var randomColor =
      colorsForSequence[Math.floor(Math.random() * colorsForSequence.length)];
    sequence.push(randomColor);
  }

  shuffleArray(sequence);

  var missingIndex = Math.floor(Math.random() * 6);
  sequence.splice(missingIndex, 0, "?");

  requiredPattern = [
    { x: 50, y: 50, tolerance: 30 },
    { x: 450, y: 50, tolerance: 30 },
    { x: 450, y: 350, tolerance: 30 },
    { x: 50, y: 350, tolerance: 30 },
    { x: 50, y: 50, tolerance: 30 },
  ];

  var challengeHTML = `
    <div id="impossible-challenge" style="position: fixed; top: 5%; left: 5%; width: 90%; height: 90%; background: white; border: 5px solid #000; z-index: 9999; padding: 20px; overflow-y: auto;">
      <h1 style="color: red; text-align: center;">LOL</h1>
      <p style="text-align: center; font-size: 16px;">Complete ALL steps within 45 seconds or game terminates</p>
      <div style="margin: 20px 0; padding: 15px; border: 2px solid #333;">
                 <h3>Step 1: Pattern Recognition</h3>
         <p>What color should replace the ? to complete the pattern?</p>
        <div style="font-size: 24px; letter-spacing: 10px; margin: 10px 0;">${sequence.join(
          " "
        )}</div>
        <div id="color-options" style="margin: 10px 0;">
          <button onclick="selectColor('red')" style="background: red; color: white; margin: 5px; padding: 10px;">Red</button>
          <button onclick="selectColor('blue')" style="background: blue; color: white; margin: 5px; padding: 10px;">Blue</button>
          <button onclick="selectColor('green')" style="background: green; color: white; margin: 5px; padding: 10px;">Green</button>
          <button onclick="selectColor('yellow')" style="background: yellow; color: black; margin: 5px; padding: 10px;">Yellow</button>
        </div>
        <div id="step1-status">Select the missing color</div>
      </div>
      <div style="margin: 20px 0; padding: 15px; border: 2px solid #333;">
        <h3>Step 2: Mouse Movement Verification</h3>
        <p>Draw a rectangle by moving your mouse through these points in order:</p>
        <canvas id="mouse-canvas" width="500" height="450" style="border: 1px solid #000; background: #f0f0f0; cursor: crosshair;"></canvas>
        <div id="step2-status">Move mouse to start point (top-left corner)</div>
      </div>
      <div id="timer" style="position: absolute; top: 10px; right: 20px; font-size: 20px; color: red;">45s</div>
    </div>
  `;

  $("body").append(challengeHTML);

  window.selectedColor = correctColor;
  window.step1Complete = false;
  window.step2Complete = false;

  startChallengeTimer();
  setupMouseTracking();
}

function selectColor(color) {
  if (color === window.selectedColor) {
    window.step1Complete = true;
    $("#step1-status")
      .text("Correct! Now complete step 2")
      .css("color", "green");
    $("#color-options button").prop("disabled", true);
  } else {
    alert("Incorrect! Game terminated.");
    failChallenge();
  }
}

function setupMouseTracking() {
  var canvas = document.getElementById("mouse-canvas");
  var ctx = canvas.getContext("2d");

  drawCanvasPoints(ctx);

  $("#mouse-canvas").mousemove(function (e) {
    if (!impossibleChallengePending || !window.step1Complete) return;

    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    mouseTrailPoints.push({ x: x, y: y, time: Date.now() });

    if (mouseTrailPoints.length > 100) {
      mouseTrailPoints.shift();
    }

    checkPatternProgress(x, y);
    drawMouseTrail(ctx);
  });
}

function checkPatternProgress(x, y) {
  if (patternIndex >= requiredPattern.length) return;

  var target = requiredPattern[patternIndex];
  var distance = Math.sqrt(
    Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
  );

  if (distance <= target.tolerance) {
    patternIndex++;
    $("#step2-status").text(
      `Point ${patternIndex}/${requiredPattern.length} reached`
    );

    if (patternIndex >= requiredPattern.length) {
      window.step2Complete = true;
      $("#step2-status").text("Pattern complete!").css("color", "green");

      if (validateMouseMovement()) {
        completeChallenge();
      } else {
        alert("Unnatural mouse movement detected! Game terminated.");
        failChallenge();
      }
    }
  }
}

function drawCanvasPoints(ctx) {
  ctx.font = "12px Arial";

  ctx.fillStyle = "blue";
  ctx.fillRect(44, 44, 12, 12);
  ctx.fillStyle = "black";
  ctx.fillText("START", 15, 50);

  ctx.fillStyle = "red";
  ctx.fillRect(444, 44, 12, 12);
  ctx.fillStyle = "black";
  ctx.fillText("1", 460, 50);

  ctx.fillStyle = "red";
  ctx.fillRect(444, 344, 12, 12);
  ctx.fillStyle = "black";
  ctx.fillText("2", 460, 350);

  ctx.fillStyle = "red";
  ctx.fillRect(44, 344, 12, 12);
  ctx.fillStyle = "black";
  ctx.fillText("3", 20, 350);

  ctx.fillStyle = "red";
  ctx.fillRect(44, 44, 12, 12);
  ctx.fillStyle = "black";
  ctx.fillText("4", 20, 40);
}

function drawMouseTrail(ctx) {
  ctx.clearRect(0, 0, 500, 450);
  drawCanvasPoints(ctx);

  if (mouseTrailPoints.length > 1) {
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mouseTrailPoints[0].x, mouseTrailPoints[0].y);
    for (var i = 1; i < mouseTrailPoints.length; i++) {
      ctx.lineTo(mouseTrailPoints[i].x, mouseTrailPoints[i].y);
    }
    ctx.stroke();
  }
}

function validateMouseMovement() {
  if (mouseTrailPoints.length < 20) return false;

  var speeds = [];
  for (var i = 1; i < mouseTrailPoints.length; i++) {
    var timeDiff = mouseTrailPoints[i].time - mouseTrailPoints[i - 1].time;
    var distance = Math.sqrt(
      Math.pow(mouseTrailPoints[i].x - mouseTrailPoints[i - 1].x, 2) +
        Math.pow(mouseTrailPoints[i].y - mouseTrailPoints[i - 1].y, 2)
    );
    if (timeDiff > 0) {
      speeds.push(distance / timeDiff);
    }
  }

  if (speeds.length === 0) return false;

  var avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  var variance =
    speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) /
    speeds.length;

  return variance > 0.01 && avgSpeed > 0.1 && avgSpeed < 5;
}

function startChallengeTimer() {
  var timeLeft = 45;
  window.challengeTimer = setInterval(function () {
    timeLeft--;
    $("#timer").text(timeLeft + "s");

    if (timeLeft <= 0) {
      clearInterval(window.challengeTimer);
      alert("Time expired! Game terminated.");
      failChallenge();
    }

    if (window.step1Complete && window.step2Complete) {
      clearInterval(window.challengeTimer);
    }
  }, 1000);
}

function completeChallenge() {
  if (window.challengeTimer) {
    clearInterval(window.challengeTimer);
  }
  $("#impossible-challenge").remove();
  impossibleChallengePending = false;
  alert("Verification complete! You are human.");
  nextSequence();
}

function failChallenge() {
  if (window.challengeTimer) {
    clearInterval(window.challengeTimer);
  }
  $("#impossible-challenge").remove();
  impossibleChallengePending = false;
  alert("Verification failed. Game terminated.");
  startOver();
  setTimeout(function () {
    $("#level-title").text("Press Any Key to Start");
    start = false;
  }, 100);
}

function showCaptcha() {
  captchaPending = true;
  isHardCaptcha = false;

  const captchaWidth = Math.floor(Math.random() * 50) + 180; // 180-230
  const captchaHeight = Math.floor(Math.random() * 30) + 90; // 90-120
  const captcha = generateCaptcha(captchaWidth, captchaHeight);
  currentCaptchaAnswer = captcha.text;

  var randomX = Math.random() * 30 + 10;
  var randomY = Math.random() * 30 + 10;

  var headers = [
    "Please enter the text you see below:",
    "Verification Required",
    "Security Check",
    "Confirm You Are Not a Robot",
  ];
  var buttons = ["Submit", "Verify", "Confirm", "Proceed"];

  var header = headers[Math.floor(Math.random() * headers.length)];
  var button = buttons[Math.floor(Math.random() * buttons.length)];

  const captchaHTML = `
    <div id="captcha-container" style="position: fixed; top: ${randomY}%; left: ${randomX}%; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.5); text-align: center;">
      <h2>${header}</h2>
      <img src="${captcha.image}" alt="CAPTCHA">
      <input type="text" id="captcha-input" style="display: block; margin: 10px auto; padding: 5px;">
      <button onclick="verifyCaptcha()">${button}</button>
    </div>
  `;
  $("body").append(captchaHTML);
  captchaCorrect = false;
}

function showHardCaptcha() {
  captchaPending = true;
  isHardCaptcha = true;

  const captchaWidth = Math.floor(Math.random() * 60) + 280; // 280-340
  const captchaHeight = Math.floor(Math.random() * 40) + 140; // 140-180
  const captcha = generateHardCaptcha(captchaWidth, captchaHeight);
  currentCaptchaAnswer = captcha.text;

  var randomX = Math.random() * 20 + 15;
  var randomY = Math.random() * 20 + 15;

  const timeLimit = Math.max(15, 25 - (level / 10 - 1) * 5);

  var headers = [
    "HARD CAPTCHA CHALLENGE",
    "ADVANCED VERIFICATION",
    "FINAL SECURITY CHECK",
    "PROVE YOUR HUMANITY",
  ];
  var buttons = ["Submit Challenge", "Verify Identity", "Confirm Action"];

  var header = headers[Math.floor(Math.random() * headers.length)];
  var button = buttons[Math.floor(Math.random() * buttons.length)];

  const captchaHTML = `
    <div id="captcha-container" style="position: fixed; top: ${randomY}%; left: ${randomX}%; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 0 20px rgba(0,0,0,0.7); text-align: center; border: 3px solid #ff6b6b;">
      <div id="captcha-timer" style="position: absolute; top: 10px; right: 15px; font-size: 18px; color: #d63031; font-weight: bold;">${timeLimit}s</div>
      <h2 style="color: #d63031; font-weight: bold;">${header}</h2>
      <p style="color: #666; font-size: 14px;">Enter the 8 characters you see below (case-sensitive):</p>
      <img src="${captcha.image}" alt="HARD CAPTCHA" style="border: 2px solid #ddd; border-radius: 5px;">
      <input type="text" id="captcha-input" style="display: block; margin: 15px auto; padding: 10px; font-size: 16px; width: 200px; border: 2px solid #ff6b6b; border-radius: 5px;" maxlength="8" placeholder="8 characters">
      <button onclick="verifyCaptcha()" style="background: #d63031; color: white; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">${button}</button>
      <p style="color: #999; font-size: 12px; margin-top: 10px;">Anti-bot security active</p>
    </div>
  `;
  $("body").append(captchaHTML);
  captchaCorrect = false;

  if (window.captchaTimer) {
    clearInterval(window.captchaTimer);
  }

  var timeLeft = timeLimit;
  window.captchaTimer = setInterval(function () {
    timeLeft--;
    $("#captcha-timer").text(timeLeft + "s");

    if (timeLeft <= 0) {
      clearInterval(window.captchaTimer);
      alert("Time expired! Game terminated.");
      $("#captcha-container").remove();
      startOver();
    }
  }, 1000);
}

function verifyCaptcha() {
  const userInput = $("#captcha-input").val().trim();
  if (userInput.toLowerCase() === currentCaptchaAnswer.toLowerCase()) {
    clearInterval(window.captchaTimer);
    $("#captcha-container").remove();
    captchaCorrect = true;
    captchaPending = false;
    currentCaptchaAnswer = null;
    isHardCaptcha = false;
    resumeGameAfterCaptcha();
  } else {
    alert("Incorrect CAPTCHA. Please try again.");
    $("#captcha-input").val("");
    if (isHardCaptcha) {
      showHardCaptcha();
    } else {
      showCaptcha();
    }
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

  setTimeout(
    function () {
      $("#" + randomChosenColour)
        .fadeIn(100)
        .fadeOut(100)
        .fadeIn(100);
      playSound(randomChosenColour);
    },
    speedVariationEnabled ? Math.random() * 500 + 200 : 200
  );
}

function playPattern() {
  var i = 0;
  var baseDelay = speedVariationEnabled ? 800 + Math.random() * 400 : 1000;

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
  }, baseDelay);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function randomizeButtonColors() {
  var btnElements = $(".btn").toArray();
  var originalColors = ["green", "red", "blue", "yellow"];
  var shuffledColors = originalColors.slice();

  shuffleArray(shuffledColors);

  btnElements.forEach((btn, index) => {
    var $btn = $(btn);
    var newColor = shuffledColors[index];

    $btn
      .removeClass()
      .addClass("btn " + newColor)
      .attr("id", newColor);

    $btn.css("background-color", "");
  });

  buttonColours = shuffledColors.slice();
}

function detectBotBehavior() {
  if (clickTimes.length >= 3) {
    var avgTime = clickTimes.reduce((a, b) => a + b, 0) / clickTimes.length;
    var minTime = Math.min(...clickTimes);

    if (avgTime < 200) {
      suspiciousClicks++;
    }

    if (minTime < 150) {
      suspiciousClicks += 2;
    }

    var variance =
      clickTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) /
      clickTimes.length;
    if (variance < 80 && clickTimes.length >= 5) {
      suspiciousClicks++;
    }
  }

  var gameTime = Date.now() - gameStartTime;
  if (gameTime > 10000 && mouseMoveCount < 20) {
    suspiciousClicks++;
  }

  if (suspiciousClicks >= 2) {
    alert("Bot activity detected. Game terminated.");
    startOver();
    setTimeout(function () {
      $("#level-title").text("Press Any Key to Start");
      start = false;
    }, 100);
    return true;
  }

  return false;
}

function randomizeBtnPositions() {
  var btnElements = $(".btn").toArray();
  var originalColors = buttonColours.slice();

  shuffleArray(btnElements);

  btnElements.forEach((btn, index) => {
    var $btn = $(btn);
    var originalColor = $btn.attr("id");
    var newColor = originalColors[index];

    var randomTop = Math.random() * 300 + 150;
    var randomLeft = Math.random() * 400 + 100;

    $btn.removeClass(originalColor).addClass(newColor).attr("id", newColor);
    $btn.css({
      position: "absolute",
      top: randomTop + "px",
      left: randomLeft + "px",
      transition: "all 0.5s ease",
    });
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

  speedVariationEnabled = false;

  var levelText = "Level " + level;

  if (level >= 5) {
    speedVariationEnabled = true;
  }

  if (level === 45) {
    generateImpossibleChallenge();
    return;
  }

  if (level % 10 === 0 && level !== 0) {
    showHardCaptcha();
    return;
  }

  if (level % 5 === 0 && level !== 0) {
    showCaptcha();
    return;
  }

  if (level % 15 === 0 && level !== 0) {
    randomizeButtonColors();
    levelText += " - LAYOUT SHUFFLED!";
  }

  if (level % 12 === 0 && level !== 0) {
    slightlyMoveButtons();
    levelText += " - BUTTONS MOVED!";
  }

  if (level % 25 === 0 && level !== 0) {
    randomizeBtnPositions();
    levelText += " - LAYOUT SCRAMBLED!";
  }

  $("#level-title").text(levelText);

  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  setTimeout(
    function () {
      $("#" + randomChosenColour)
        .fadeIn(100)
        .fadeOut(100)
        .fadeIn(100);
      playSound(randomChosenColour);
    },
    speedVariationEnabled ? Math.random() * 500 + 200 : 200
  );
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
    "background-color": "",
    position: "",
    top: "",
    left: "",
  });
}

function startOver() {
  level = 0;
  gamePattern = [];
  start = false;
  resetButtonPositions();
  captchaCorrect = true;
  captchaPending = false;
  speedVariationEnabled = false;
  clickTimes = [];
  mouseMoveCount = 0;
  suspiciousClicks = 0;
  gameStartTime = Date.now();
  impossibleChallengePending = false;
  mouseTrailPoints = [];
  patternIndex = 0;
  $("#trap-button").remove();
  $("#impossible-challenge").remove();
  if (window.captchaTimer) {
    clearInterval(window.captchaTimer);
  }
}

$(".btn").click(function () {
  if (!start || captchaPending || impossibleChallengePending) return;

  var currentTime = Date.now();
  if (lastClickTime > 0) {
    var timeDiff = currentTime - lastClickTime;
    clickTimes.push(timeDiff);
    if (clickTimes.length > 10) clickTimes.shift();
  }
  lastClickTime = currentTime;

  if (detectBotBehavior()) return;

  var userChosenColour = $(this).attr("id");
  userClickedPattern.push(userChosenColour);
  playSound(userChosenColour);
  animatePress(userChosenColour);
  checkAnswer(userClickedPattern.length - 1);
});

$(document).mousemove(function () {
  mouseMoveCount++;
});

$(document).keypress(function () {
  if (!start) {
    $("#level-title").text("Level " + level);
    gameStartTime = Date.now();
    nextSequence();
    start = true;
  }
});
