const menuScreen = document.querySelector("#menuScreen");
const gameScreen = document.querySelector("#gameScreen");
const practiceButton = document.querySelector("#practiceButton");
const competitionButton = document.querySelector("#competitionButton");
const menuMessage = document.querySelector("#menuMessage");
const pads = Array.from(document.querySelectorAll(".pad"));
const statusMessage = document.querySelector("#statusMessage");
const homeButton = document.querySelector("#homeButton");
const restartButton = document.querySelector("#restartButton");
const lastTimeEl = document.querySelector("#lastTime");
const averageTimeEl = document.querySelector("#averageTime");
const bestTimeEl = document.querySelector("#bestTime");

const validKeys = ["w", "e", "s", "d"];
const startDelay = 1000;
const matchDuration = 30000;

let activeKey = null;
let activeStartedAt = 0;
let reactionTimes = [];
let startTimer = null;
let startDelayStartedAt = 0;
let currentStartDelay = 0;
let remainingStartDelay = 0;
let audioContext = null;
let gameIsRunning = false;
let isPaused = false;
let pausedAt = 0;
let currentMode = "practice";
let correctCount = 0;
let incorrectCount = 0;
let matchTimer = null;
let matchEndsAt = 0;
let remainingMatchTime = matchDuration;

function randomKey() {
  return validKeys[Math.floor(Math.random() * validKeys.length)];
}

function formatTime(time) {
  return Number.isFinite(time) ? `${Math.round(time)} ms` : "-- ms";
}

function setStatus(message, isWarning = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("warning", isWarning);
}

function setStatLabels(first, second, third) {
  lastTimeEl.previousElementSibling.textContent = first;
  averageTimeEl.previousElementSibling.textContent = second;
  bestTimeEl.previousElementSibling.textContent = third;
}

function resetActivePad() {
  activeKey = null;
  activeStartedAt = 0;
  pads.forEach((pad) => pad.classList.remove("active"));
}

function updateStats() {
  const last = reactionTimes.at(-1);
  const total = reactionTimes.reduce((sum, time) => sum + time, 0);
  const average = reactionTimes.length ? total / reactionTimes.length : NaN;
  const best = reactionTimes.length ? Math.min(...reactionTimes) : NaN;

  lastTimeEl.textContent = formatTime(last);
  averageTimeEl.textContent = formatTime(average);
  bestTimeEl.textContent = formatTime(best);
}

function updateCompetitionStats() {
  lastTimeEl.textContent = `${Math.ceil(remainingMatchTime / 1000)}s`;
  averageTimeEl.textContent = correctCount;
  bestTimeEl.textContent = incorrectCount;
}

function playTone(frequency, duration, type = "sine") {
  // Web Audio starts only after user interaction in some browsers.
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.08, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function activatePad() {
  if (currentMode === "competition" && remainingMatchTime <= 0) {
    return;
  }

  const key = randomKey();
  const pad = pads.find((button) => button.dataset.key === key);

  resetActivePad();
  startTimer = null;
  startDelayStartedAt = 0;
  currentStartDelay = 0;
  remainingStartDelay = 0;
  activeKey = key;
  activeStartedAt = performance.now();
  pad.classList.add("active");
  setStatus("Hit the lit button");

  if (currentMode === "competition" && !matchTimer) {
    startMatchTimer();
  }
}

function handleCorrectInput() {
  const reactionTime = performance.now() - activeStartedAt;

  if (currentMode === "practice") {
    reactionTimes.push(reactionTime);
    updateStats();
  } else {
    correctCount += 1;
    updateCompetitionStats();
  }

  resetActivePad();
  setStatus(`Reaction time: ${formatTime(reactionTime)}`);
  playTone(760, 0.08, "triangle");
  activatePad();
}

function scheduleFirstPad(delay = startDelay) {
  clearTimeout(startTimer);
  startDelayStartedAt = performance.now();
  currentStartDelay = delay;
  remainingStartDelay = delay;
  setStatus("Get ready...");
  startTimer = setTimeout(activatePad, delay);
}

function startMatchTimer() {
  clearInterval(matchTimer);
  remainingMatchTime = matchDuration;
  matchEndsAt = performance.now() + matchDuration;
  updateCompetitionStats();

  matchTimer = setInterval(() => {
    remainingMatchTime = Math.max(0, matchEndsAt - performance.now());
    updateCompetitionStats();

    if (remainingMatchTime <= 0) {
      endCompetition();
    }
  }, 100);
}

function countIncorrectInput(message) {
  if (currentMode === "competition" && matchTimer) {
    incorrectCount += 1;
    updateCompetitionStats();
  }

  setStatus(message, true);
  playTone(220, 0.12, "square");
}

function handleKeyDown(event) {
  if (!gameIsRunning) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === " ") {
    event.preventDefault();
    togglePause();
    return;
  }

  if (!validKeys.includes(key)) {
    return;
  }

  event.preventDefault();

  if (isPaused) {
    return;
  }

  if (!activeKey) {
    countIncorrectInput("Too early");
    return;
  }

  if (key !== activeKey) {
    countIncorrectInput("Wrong key");
    return;
  }

  handleCorrectInput();
}

function startGame() {
  gameIsRunning = true;
  isPaused = false;
  pausedAt = 0;
  clearTimeout(startTimer);
  clearInterval(matchTimer);
  matchTimer = null;
  resetActivePad();
  reactionTimes = [];
  correctCount = 0;
  incorrectCount = 0;

  if (currentMode === "practice") {
    setStatLabels("Last", "Average", "Best");
    updateStats();
  } else {
    setStatLabels("Time", "Correct", "Incorrect");
    remainingMatchTime = matchDuration;
    updateCompetitionStats();
  }

  scheduleFirstPad();
}

function pauseGame() {
  isPaused = true;
  pausedAt = performance.now();

  if (startTimer) {
    clearTimeout(startTimer);
    remainingStartDelay = Math.max(0, currentStartDelay - (pausedAt - startDelayStartedAt));
  }

  if (matchTimer) {
    clearInterval(matchTimer);
    matchTimer = null;
    remainingMatchTime = Math.max(0, matchEndsAt - pausedAt);
  }

  setStatus("Paused");
}

function resumeGame() {
  const pausedDuration = performance.now() - pausedAt;

  isPaused = false;

  if (activeKey) {
    activeStartedAt += pausedDuration;
    if (currentMode === "competition") {
      matchEndsAt += pausedDuration;
      startMatchTimerFromRemaining();
    }
    setStatus("Hit the lit button");
  } else {
    scheduleFirstPad(remainingStartDelay);
  }
}

function togglePause() {
  if (isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

function showPracticeMode() {
  currentMode = "practice";
  menuScreen.classList.add("is-hidden");
  gameScreen.classList.remove("is-hidden");
  startGame();
}

function showCompetitionMode() {
  currentMode = "competition";
  menuScreen.classList.add("is-hidden");
  gameScreen.classList.remove("is-hidden");
  startGame();
}

function startMatchTimerFromRemaining() {
  clearInterval(matchTimer);
  matchEndsAt = performance.now() + remainingMatchTime;
  updateCompetitionStats();

  matchTimer = setInterval(() => {
    remainingMatchTime = Math.max(0, matchEndsAt - performance.now());
    updateCompetitionStats();

    if (remainingMatchTime <= 0) {
      endCompetition();
    }
  }, 100);
}

function endCompetition() {
  clearInterval(matchTimer);
  matchTimer = null;
  clearTimeout(startTimer);
  gameIsRunning = false;
  isPaused = false;
  remainingMatchTime = 0;
  resetActivePad();
  updateCompetitionStats();
  setStatus(`Time up: ${correctCount} correct, ${incorrectCount} incorrect`);
  playTone(140, 0.18, "sawtooth");
}

function returnHome() {
  clearTimeout(startTimer);
  clearInterval(matchTimer);
  startTimer = null;
  matchTimer = null;
  gameIsRunning = false;
  isPaused = false;
  resetActivePad();
  menuMessage.textContent = "";
  gameScreen.classList.add("is-hidden");
  menuScreen.classList.remove("is-hidden");
  setStatus("Get ready...");
}

document.addEventListener("keydown", handleKeyDown);
practiceButton.addEventListener("click", showPracticeMode);
competitionButton.addEventListener("click", showCompetitionMode);
homeButton.addEventListener("click", returnHome);
restartButton.addEventListener("click", startGame);
