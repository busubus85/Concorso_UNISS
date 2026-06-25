let currentQuestion = 0;
const totalQuestions = 60;

let correctAnswers = 0;
let wrongAnswers = 0;

let questions = [];
let answersState = [];
let skippedQuestions = new Set();

// ✅ collega bottone start
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-button')
        .addEventListener('click', startTest);
});

// ✅ AVVIO TEST
function startTest() {

    const btn = document.getElementById('start-button');

    btn.disabled = true;
    btn.textContent = 'Caricamento...';

    loadDefaultJson();
}

// ✅ CARICA JSON
function loadDefaultJson() {

    fetch("C.json")
        .then(res => res.json())
        .then(data => {

            const selectedSet = document.getElementById('question-set').value;
            const [start, end] = selectedSet.split('-').map(Number);

            const filtered = data.questions.slice(start - 1, end);

            if (filtered.length === 0) {
                alert("Nessuna domanda trovata");
                resetStartButton();
                return;
            }

            questions = shuffleArray([...filtered]).slice(0, totalQuestions);

            questions.forEach(q => {
                q.answers = shuffleArray([...q.answers]);
            });

            answersState = new Array(questions.length).fill(null);
            skippedQuestions = new Set();

            currentQuestion = 0;
            correctAnswers = 0;
            wrongAnswers = 0;

            // UI
            document.getElementById('start-menu').classList.add('hidden');
            document.getElementById('quiz-area').classList.remove('hidden');

            createNavBar();
            displayQuestion();
            updateCounters();
            updateSkippedBox();

            window.scrollTo({ top: 0 });
        })
        .catch(err => {
            console.error("Errore JSON:", err);
            resetStartButton();
        });
}

function resetStartButton() {
    const btn = document.getElementById('start-button');
    btn.disabled = false;
    btn.textContent = "Inizia il test";
}

// ✅ DOMANDA
function displayQuestion() {

    const q = questions[currentQuestion];

    document.getElementById('question-progress').textContent =
        `Domanda ${currentQuestion + 1}/${questions.length}`;

    document.getElementById('question-container').innerHTML =
        `<p>${q.question}</p>`;

    let html = '';

    q.answers.forEach((ans, i) => {

        let cls = "";

        if (answersState[currentQuestion] !== null) {
            if (ans === q.correctAnswer) cls = "answer-correct";
            else if (answersState[currentQuestion].selected === ans)
                cls = "answer-wrong";
        }

        html += `<button class="answer-btn ${cls}" onclick="checkAnswer(${i})">${ans}</button>`;
    });

    document.getElementById('answers-container').innerHTML = html;

    updateNavBar();
    updateSkippedBox();
}

// ✅ RISPOSTA
function checkAnswer(i) {

    if (answersState[currentQuestion] !== null) return;

    const q = questions[currentQuestion];
    const selected = q.answers[i];

    if (selected === q.correctAnswer) {
        correctAnswers++;
        answersState[currentQuestion] = { status: 'correct', selected };
    } else {
        wrongAnswers++;
        answersState[currentQuestion] = { status: 'incorrect', selected };
    }

    // ✅ rimuove dalla lista saltate
    skippedQuestions.delete(currentQuestion);

    updateCounters();
    displayQuestion();
}

// ✅ NAVIGAZIONE
function nextQuestion() {

    // ✅ aggiunge SOLO se non risposta e NON già presente
    if (answersState[currentQuestion] === null
        && !skippedQuestions.has(currentQuestion)) {

        skippedQuestions.add(currentQuestion);
    }

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

// ✅ NAVBAR
function createNavBar() {

    const nav = document.getElementById('nav-bar');
    nav.innerHTML = '';

    for (let i = 0; i < questions.length; i++) {
        const b = document.createElement('button');
        b.className = "nav-btn";
        b.innerText = i + 1;

        b.onclick = () => {
            currentQuestion = i;
            displayQuestion();
        };

        nav.appendChild(b);
    }
}

function updateNavBar() {

    const btns = document.querySelectorAll('#nav-bar button');

    btns.forEach((b, i) => {

        b.className = "nav-btn";

        if (answersState[i]) {
            if (answersState[i].status === 'correct')
                b.classList.add("correct-nav");
            else
                b.classList.add("wrong-nav");
        }

        if (skippedQuestions.has(i) && answersState[i] === null)
            b.classList.add("skipped-nav");

        if (i === currentQuestion)
            b.classList.add("current");
    });
}

// ✅ BOX SALTATE (solo quelle realmente non risposte)
function updateSkippedBox() {

    const c = document.getElementById("skipped-container");

    const arr = Array.from(skippedQuestions)
        .filter(i => answersState[i] === null)
        .sort((a, b) => a - b);

    if (arr.length === 0) {
        c.innerHTML = "";
        return;
    }

    let html = `<div class="skipped-box"><b>Domande da riprendere:</b><br>`;

    arr.forEach(i => {
        html += `<button class="skipped-btn" onclick="goToSkipped(${i})">${i + 1}</button>`;
    });

    html += `</div>`;

    c.innerHTML = html;
}

// ✅ TORNA ALLA DOMANDA
function goToSkipped(i) {
    currentQuestion = i;
    displayQuestion();
}

// ✅ CONTATORI
function updateCounters() {
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('wrong-count').textContent = wrongAnswers;
    document.getElementById('total-score').textContent = correctAnswers;
}

// ✅ RISULTATO
function showResult() {
    document.getElementById('result-container').innerHTML = `
        <h2>Risultato finale</h2>
        <p>✅ Corrette: ${correctAnswers}</p>
        <p>❌ Sbagliate: ${wrongAnswers}</p>
    `;
}

// ✅ SHUFFLE
function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
