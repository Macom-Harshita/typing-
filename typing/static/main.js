let sentence = '';
let startTime = null;
let ended = false;
let currentLength = 50;
let errorCounts = {};

const sentenceContainer = document.getElementById('sentence');
const userInput = document.getElementById('user-input');
const resultsDiv = document.getElementById('results');
const restartBtn = document.getElementById('restart-btn');
const optionBtns = document.querySelectorAll('.option-btn');
const textScrollContainer = document.getElementById('text-scroll-container');
const analyticsBtn = document.getElementById('analytics-btn');
const analyticsModal = document.getElementById('analytics-modal');
const closeAnalytics = document.getElementById('close-analytics');
const analyticsChartCanvas = document.getElementById('analytics-chart');
let analyticsChart = null;

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
                // Track error key
                const expected = sentence[i];
                const typed = input[i];
                if (expected !== ' ' && typed) {
                    errorCounts[expected] = (errorCounts[expected] || 0) + 1;
                }
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
    analyticsBtn.classList.remove('hidden');
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

analyticsBtn.addEventListener('click', () => {
    showAnalytics();
});

closeAnalytics.addEventListener('click', () => {
    analyticsModal.classList.add('hidden');
});

function fetchAndStart(length) {
    fetch(`/api/passage?length=${length || 50}`)
        .then(res => res.json())
        .then(data => {
            sentence = data.passage;
            startTime = null;
            ended = false;
            userInput.value = '';
            userInput.disabled = false;
            resultsDiv.classList.add('hidden');
            restartBtn.classList.add('hidden');
            analyticsBtn.classList.add('hidden');
            errorCounts = {};
            renderSentence();
            updateDisplay();
            userInput.focus();
            textScrollContainer.scrollTop = 0;
        });
}

function showAnalytics() {
    // Get top 5 error keys
    const sorted = Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    const labels = sorted.map(([key]) => key);
    const data = sorted.map(([, count]) => count);
    analyticsModal.classList.remove('hidden');
    // Load Chart.js if not present
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => renderChart(labels, data);
        document.body.appendChild(script);
    } else {
        renderChart(labels, data);
    }
}

function renderChart(labels, data) {
    if (analyticsChart) {
        analyticsChart.destroy();
    }
    analyticsChart = new Chart(analyticsChartCanvas, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['No errors!'],
            datasets: [{
                label: 'Mistyped Count',
                data: data.length ? data : [0],
                backgroundColor: '#ff5252',
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Key' } },
                y: { title: { display: true, text: 'Mistyped Count' }, beginAtZero: true, precision: 0 }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => fetchAndStart(currentLength)); 