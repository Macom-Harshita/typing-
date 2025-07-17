let sentence = '';
let startTime = null;
let ended = false;
let currentLength = 50;

const dummyParagraphs = {
    50: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.',
    100: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Etiam porta sem malesuada magna mollis euismod.'
};

const sentenceContainer = document.getElementById('sentence');
const userInput = document.getElementById('user-input');
const resultsDiv = document.getElementById('results');
const restartBtn = document.getElementById('restart-btn');
const optionBtns = document.querySelectorAll('.option-btn');
const textScrollContainer = document.getElementById('text-scroll-container');

function renderSentence() {
    sentenceContainer.innerHTML = '';
    for (let i = 0; i < sentence.length; i++) {
        const span = document.createElement('span');
        span.textContent = sentence[i];
        span.classList.add('letter');
        sentenceContainer.appendChild(span);
    }
}

function updateDisplay() {
    const input = userInput.value;
    const letters = sentenceContainer.querySelectorAll('.letter');
    let correct = 0;
    let cursorIndex = input.length;
    for (let i = 0; i < letters.length; i++) {
        letters[i].classList.remove('correct', 'incorrect', 'current');
        if (i < input.length) {
            if (input[i] === sentence[i]) {
                letters[i].classList.add('correct');
                correct++;
            } else {
                letters[i].classList.add('incorrect');
            }
        } else if (i === input.length && !ended) {
            letters[i].classList.add('current');
        }
    }
    // Scroll logic: if cursor is near the bottom, scroll to keep it in view
    if (letters[cursorIndex]) {
        const letterElem = letters[cursorIndex];
        const containerRect = textScrollContainer.getBoundingClientRect();
        const letterRect = letterElem.getBoundingClientRect();
        if (letterRect.bottom > containerRect.bottom - 10) {
            letterElem.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
        } else if (letterRect.top < containerRect.top + 10) {
            letterElem.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
        }
    }
}

function finishTest() {
    ended = true;
    userInput.disabled = true;
    const totalTime = (Date.now() - startTime) / 1000;
    const input = userInput.value;
    let correct = 0;
    for (let i = 0; i < Math.min(input.length, sentence.length); i++) {
        if (input[i] === sentence[i]) correct++;
    }
    const accuracy = sentence.length ? Math.round((correct / sentence.length) * 100) : 0;
    const wpm = Math.round((input.length / 5) / (totalTime / 60));
    resultsDiv.innerHTML = `Time: <b>${totalTime.toFixed(1)}s</b> &nbsp; Accuracy: <b>${accuracy}%</b> &nbsp; WPM: <b>${wpm}</b>`;
    resultsDiv.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
    setTimeout(() => { resultsDiv.scrollIntoView({behavior: 'smooth', block: 'center'}); }, 100);
}

userInput.addEventListener('input', () => {
    if (!startTime && userInput.value.length > 0) {
        startTime = Date.now();
    }
    updateDisplay();
});

userInput.addEventListener('keydown', (e) => {
    if (!ended && e.key === 'Enter') {
        finishTest();
    }
});

restartBtn.addEventListener('click', () => {
    fetchAndStart(currentLength);
});

optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        optionBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentLength = parseInt(btn.getAttribute('data-length'));
        fetchAndStart(currentLength);
    });
});

function fetchAndStart(length) {
    // For now, use dummy data
    sentence = dummyParagraphs[length || 50];
    startTime = null;
    ended = false;
    userInput.value = '';
    userInput.disabled = false;
    resultsDiv.classList.add('hidden');
    restartBtn.classList.add('hidden');
    renderSentence();
    updateDisplay();
    userInput.focus();
    textScrollContainer.scrollTop = 0;
}

document.addEventListener('DOMContentLoaded', () => fetchAndStart(currentLength)); 