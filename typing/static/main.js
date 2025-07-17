let sentence = '';
let startTime = null;
let ended = false;

const sentenceContainer = document.getElementById('sentence');
const userInput = document.getElementById('user-input');
const resultsDiv = document.getElementById('results');
const restartBtn = document.getElementById('restart-btn');

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
    fetchAndStart();
});

function fetchAndStart() {
    fetch('/api/sentence')
        .then(res => res.json())
        .then(data => {
            sentence = data.sentence;
            startTime = null;
            ended = false;
            userInput.value = '';
            userInput.disabled = false;
            resultsDiv.classList.add('hidden');
            restartBtn.classList.add('hidden');
            renderSentence();
            updateDisplay();
            userInput.focus();
        });
}

document.addEventListener('DOMContentLoaded', fetchAndStart); 