let currentQuestion = 0;
const totalQuestions = 60;

let correctAnswers = 0;
let wrongAnswers = 0;

let questions = [];
let answersState = [];

// ✅ CARICAMENTO AUTOMATICO JSON
function loadDefaultJson() {

    fetch("C.json")
        .then(res => res.json())
        .then(parsedData => {

            const selectedSet = document.getElementById('question-set').value;
            const [start, end] = selectedSet.split('-').map(Number);

            const filteredQuestions = parsedData.questions.slice(start - 1, end);

            questions = getRandomQuestions(filteredQuestions, totalQuestions);

            questions.forEach(q => {
                q.answers = shuffleArray(q.answers);
            });

            answersState = new Array(totalQuestions).fill(null);
            currentQuestion = 0;

            correctAnswers = 0;
            wrongAnswers = 0;

            displayQuestion();
            createNavBar();
            updateCounters();
        });
}

// ✅ RANDOM
function getRandomQuestions(allQuestions, numQuestions) {
    let cloned = [...allQuestions];
    return shuffleArray(cloned).slice(0, numQuestions);
}

// ✅ SHUFFLE
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ✅ MOSTRA DOMANDA
function displayQuestion() {

    if (currentQuestion >= questions.length) {
        showResult();
        return;
    }

    const q = questions[currentQuestion];

    document.getElementById('question-container').innerHTML =
        `<p>${currentQuestion + 1}/60 - ${q.question}</p>`;

    let html = '';

    q.answers.forEach((ans, index) => {
        html += `<button onclick="checkAnswer(${index})">${ans}</button>`;
    });

    document.getElementById('answers-container').innerHTML = html;
    document.getElementById('feedback-container').innerHTML = '';

    updateNavBar();
}

// ✅ RISPOSTA
function checkAnswer(index) {

    if (answersState[currentQuestion] !== null) return;

    const q = questions[currentQuestion];
    const selected = q.answers[index];

    if (selected === q.correctAnswer) {
        correctAnswers++;
        answersState[currentQuestion] = 'correct';
        showFeedback('✅ Corretto!', 'correct');
    } else {
        wrongAnswers++;
        answersState[currentQuestion] = 'incorrect';
        showFeedback(`❌ Sbagliato! Risposta corretta: ${q.correctAnswer}`, 'incorrect');
    }

    updateCounters();
    updateNavBar();
}

// ✅ FEEDBACK
function showFeedback(msg, cls) {
    document.getElementById('feedback-container').innerHTML =
        `<p class="${cls}">${msg}</p>`;
}

// ✅ NAVBAR
function createNavBar() {
    const nav = document.getElementById('nav-bar');
    nav.innerHTML = '';

    for (let i = 0; i < totalQuestions; i++) {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.innerText = i + 1;

        btn.onclick = () => {
            currentQuestion = i;
            displayQuestion();
        };

        nav.appendChild(btn);
    }
}

// ✅ AGGIORNA COLORI NAVBAR
function updateNavBar() {

    const buttons = document.querySelectorAll('#nav-bar button');

    buttons.forEach((btn, i) => {

        btn.classList.remove('answered', 'current');

        if (answersState[i] !== null) {
            btn.classList.add('answered');
        }

        if (i === currentQuestion) {
            btn.classList.add('current');
        }
    });
}

// ✅ CONTATORI
function updateCounters() {
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('wrong-count').textContent = wrongAnswers;
    document.getElementById('total-score').textContent = correctAnswers;
}

// ✅ RISULTATO FINALE
function showResult() {

    const total = totalQuestions;
    const score = correctAnswers;

    document.getElementById('result-container').innerHTML = `
        <h2>Report finale</h2>
        <p>✅ Corrette: ${correctAnswers}</p>
        <p>❌ Sbagliate: ${wrongAnswers}</p>
        <hr>
        <p><strong>Punteggio: ${score} / ${total}</strong></p>
        <p>Percentuale: ${((score / total) * 100).toFixed(2)}%</p>
    `;
}

// ✅ NAVIGAZIONE
function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
    } else {
        showResult();
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

// ✅ AVVIO AUTOMATICO
window.onload = function () {
    loadDefaultJson();
};
