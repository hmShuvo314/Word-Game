// // import { isUser } from "babel-types";
// import { words1 } from "./words-1.js";
// import { words2 } from "./words-2.js";
// import { words3 } from "./words-3.js";
// import { words4 } from "./words-4.js";
// import { words5 } from "./words-5.js";

const input = document.querySelector(".type input");
const random = document.querySelector(".random");
const answer = document.querySelector(".answer h1");
const p = document.querySelector(".answer p");
const outer = document.querySelector(".outer");
const userInput = document.querySelector(".inner input");
const userName = document.querySelector(".user p");
const wrong = document.querySelector(".user .wrong");
const correct = document.querySelector(".user .correct");
const gameOver = document.querySelector(".over");
const currentScore = document.querySelector(".over .currentscore");
const timer = document.querySelector(".timer");
const startBtn = document.querySelector(".start");
const mic = document.querySelector(".type button");
const retryBtn = document.querySelector(".gameover button");
const selectUserBtn = document.querySelector(".outer button");
const allWords = `${words1} ${words2} ${words3} ${words4} ${words5}`;

let correctWord;
let correctScore = 0;
let wrongScore = 0;
let isUserSelected = false;
let intervalTimer;
let intervalCouter;
let intervalTicker;
let timeCount = 15;
let isInterval = false;
let isGameOver;
let isMicOn = false;

const pureWords = allWords
  .toUpperCase()
  .split("")
  .map((w) => {
    if (!(w.match(/[a-z]/i) || w.match(" "))) {
      return " ";
    } else {
      return w;
    }
  })
  .join("")
  .split(" ")
  .filter((w) => w && w.length >= 4);

const uniqueWordsCount = pureWords.reduce((acc, w) => {
  acc[w] = acc[w] + 1 || 1;
  return acc;
}, {});

const sortedUniqueWordsCount = Object.entries(uniqueWordsCount)
  .sort((a, b) => b[1] - a[1])
  .reduce((obj, elm) => {
    obj[elm[0]] = elm[1];
    return obj;
  }, {});

const sortedUniqueWords = Object.keys(sortedUniqueWordsCount);
const uniqueWords = Object.keys(uniqueWordsCount);
const words = sortedUniqueWords;

function generateRandomLetters() {
  const randomWordIndex = Math.floor(Math.random() * words.length);
  const randomWord = words[randomWordIndex].split("");
  const randomWordLength = randomWord.length;
  const index = [];
  let hideLetterCount;

  randomWordLength <= 7 ? (hideLetterCount = 2) : null;
  randomWordLength <= 10 && 8 <= randomWordLength
    ? (hideLetterCount = 3)
    : null;

  randomWordLength <= 13 && 11 <= randomWordLength
    ? (hideLetterCount = 4)
    : null;
  randomWordLength >= 14 ? (hideLetterCount = 5) : null;

  while (index.length < randomWordLength - hideLetterCount) {
    const randomLetterIndex = Math.floor(Math.random() * randomWordLength);
    !index.includes(randomLetterIndex) && index.push(randomLetterIndex);
  }
  const randomLetters = randomWord.map((w, i) =>
    index.includes(i)
      ? `<div class="letter">${w}</div>`
      : `<div class="letter">${` `}</div>`
  );
  random.innerHTML = randomLetters.join("  ");
  correctWord = randomWord.join("").toUpperCase();
}

function submit() {
  if (isGameOver) return;
  p.textContent = "Last Answer";
  const inputWord = input.value.toUpperCase();
  const textContent = random.textContent.toUpperCase().split(" ").join("");
  const altPossibleCorrectWords = words.filter(
    (w) => w.length === correctWord.length
  );
  const altCorrectWord = altPossibleCorrectWords
    .filter((w) => w === inputWord)
    .join("");

  if (inputWord === correctWord) {
    answer.textContent = correctWord;
    answer.style.color = "greenyellow";
    correctScore++;
    input.value = "";
  } else if (inputWord === altCorrectWord && inputWord.includes(textContent)) {
    correctScore++;
    answer.textContent = altCorrectWord;
    answer.style.color = "greenyellow";
    input.value = "";
  } else {
    wrongScore++;
    answer.textContent = correctWord;
    answer.style.color = "darkred";
    input.value = "";
  }

  wrong.textContent = wrongScore;
  correct.textContent = correctScore;

  clearInterval(intervalTimer);
  timeCount = 16;

  intervalTimer = setInterval(() => {
    submit();
    timeCount = 15;
    timer.textContent = timeCount;
  }, 15000);

  if (wrongScore > 9) {
    isGameOver = true;
    gameOverFn();
    return;
  }
  generateRandomLetters();
}
function gameOverFn() {
  gameOver.classList.add("open");
  currentScore.textContent = `Your Score: ${correctScore}`;
  clearInterval(intervalTicker);
  clearInterval(intervalCouter);
  clearInterval(intervalTimer);
  isInterval = false;
  timer.textContent = 0;
  random.innerHTML = null;
  answer.textContent = "Correct Answer";
  p.textContent = null;
  isGameOver = true;
  console.log("gameOver");
  isMicOn ? mic.classList.remove("ripple") : null;
  isMicOn = false;
}

function selectUser() {
  if (!userInput.value) return;
  userName.textContent = userInput.value.toUpperCase();
  isUserSelected = true;
  outer.classList.add("close");
}

function start() {
  if (isInterval) return;
  isGameOver = false;
  isInterval = true;
  input.value = "";
  generateRandomLetters();

  intervalTicker = setInterval(() => {
    timer.classList.toggle("tick");
  }, 500);

  intervalTimer = setInterval(() => {
    submit();
    timeCount = 15;
    timer.textContent = timeCount;
  }, 15000);

  intervalCouter = setInterval(() => {
    timeCount--;
    timer.textContent = timeCount;
  }, 1000);
}

function retry() {
  isUserSelected = false;
  gameOver.classList.remove("open");
  correctScore = 0;
  wrongScore = 0;
  wrong.textContent = wrongScore;
  correct.textContent = correctScore;
  outer.classList.remove("close");
  timeCount = 15;
  timer.textContent = timeCount;
}

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function startSpeechReco() {
  if (!window.SpeechRecognition) {
    alert(`Sorry! Your browser does NOT support speech recignition :(`);
    return;
  }
  if (!isInterval) return;
  isMicOn ? mic.classList.remove("ripple") : mic.classList.add("ripple");
  isMicOn = !isMicOn;

  if (!isMicOn) return;
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = handleResult;
  recognition.start();
}

function handleResult(e) {
  if (!isMicOn) return;
  const words = e.results[e.results.length - 1][0].transcript;
  let word = words.toUpperCase();
  word = word.replace(/\s/g, "");
  input.value = word;
}

window.addEventListener("keyup", (e) => {
  e.preventDefault();
  if (e.key === "Enter" && isUserSelected && !isGameOver && isInterval) {
    submit();
  }
  e.key === "Enter" && !isUserSelected ? selectUser() : null;
});

startBtn.addEventListener("click", start);
mic.addEventListener("click", startSpeechReco);
retryBtn.addEventListener("click", retry);
selectUserBtn.addEventListener("click", selectUser);
