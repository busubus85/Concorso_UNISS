let currentQuestion = 0;
const totalQuestions = 60;

let correctAnswers = 0;
let wrongAnswers = 0;

let questions = [];
let answersState = [];

// Avvia il test solo dopo il click sul pulsante
function startTest() {
    const startButton = document.getElementById('start-button');

    startButton.disabled = true;
    startButton.textContent = 'Caricamento...';

    loadDefaultJson();
}

// Carica automaticamente C.json
function loadDefaultJson() {
    fetch("C.json")
        .then(response => response.json())
        .then(parsedData => {

            const selectedSet = document.getElementById('question-set').value;
            const [start, end] = selectedSet.split('-').map(Number);

            const filteredQuestions = parsedData.questions.slice(start - 1, end);

            if (filteredQuestions.length === 0) {
                alert("Nessuna domanda trovata per questa materia.");
                resetStartButton();
                return;
            }

            questions = getRandomQuestions(filteredQuestions, totalQuestions);

            questions.forEach(q => {
                q.answers = shuffleArray([...q.answers]);
            });

            answersState = new Array(questions.length).fill(null);

            currentQuestion = 0;
            correctAnswers = 0;
            wrongAnswers = 0;

            // Nasconde menu e tasto di avvio
            document.getElementById('start-menu').classList.add('hidden');

            // Mostra quiz solo ora
            document.getElementById('quiz-area').classList.remove('hidden');

            document.getElementById('navigation-container').style.display = 'flex';
            document.getElementById('result-container').innerHTML = '';

            createNavBar();
            displayQuestion();
            updateCounters();

            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(error => {
            console.error(error);
            alert("Errore nel caricamento di C.json. Controlla che il file sia nella stessa cartella di index.html.");
            resetStartButton();
        });
}

function resetStartButton() {
    const startButton = document.getElementById('start-button');
    startButton.disabled = false;
    startButton.textContent = 'Inizia il test';
}

// Estrae domande casuali
function getRandomQuestions(allQuestions, numQuestions) {
    let cloned = [...allQuestions];
    return shuffleArray(cloned).slice(0, Math.min(numQuestions, cloned.length));
}

// Mischia array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

// Mostra domanda corrente
function displayQuestion() {
    if (currentQuestion >= questions.length) {
        showResult();
        return;
    }

    const q = questions[currentQuestion];

    document.getElementById('question-progress').textContent =
        `Domanda ${currentQuestion + 1}/${questions.length}`;

    document.getElementById('question-container').innerHTML =
        `<p>${q.question}</p>`;

    let html = '';

    q.answers.forEach((answer, index) => {
        let extraClass = "";

        if (answersState[currentQuestion] !== null) {
            if (answer === q.correctAnswer) {
                extraClass = "answer-correct";
            } else if (answersState[currentQuestion].selected === answer) {
                extraClass = "answer-wrong";
            }
        }

        html += `
            <button class="answer-btn ${extraClass}" onclick="checkAnswer(${index})">
                ${answer}
            </button>
        `;
    });

    document.getElementById('answers-container').innerHTML = html;

    if (answersState[currentQuestion] === null) {
        document.getElementById('feedback-container').innerHTML = '';
    } else {
        const state = answersState[currentQuestion];

        if (state.status === 'correct') {
            showFeedback('✅ Corretto!', 'correct');
        } else {
            showFeedback(`❌ Sbagliato! Risposta corretta: ${q.correctAnswer}`, 'incorrect');
        }
    }

    updateNavBar();
}

// Controlla risposta
function checkAnswer(index) {
    if (answersState[currentQuestion] !== null) return;

    const q = questions[currentQuestion];
    const selected = q.answers[index];

    if (selected === q.correctAnswer) {
        correctAnswers++;

        answersState[currentQuestion] = {
            status: 'correct',
            selected: selected
        };

        showFeedback('✅ Corretto!', 'correct');
    } else {
        wrongAnswers++;

        answersState[currentQuestion] = {
            status: 'incorrect',
            selected: selected
        };

        showFeedback(`❌ Sbagliato! Risposta corretta: ${q.correctAnswer}`, 'incorrect');
    }

    updateCounters();
    displayQuestion();
}

// Feedback
function showFeedback(message, className) {
    document.getElementById('feedback-container').innerHTML =
        `<p class="${className}">${message}</p>`;
}

// Crea barra domande
function createNavBar() {
    const nav = document.getElementById('nav-bar');
    nav.innerHTML = '';

    for (let i = 0; i < questions.length; i++) {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.innerText = i + 1;

        btn.onclick = () => {
            currentQuestion = i;
            displayQuestion();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        nav.appendChild(btn);
    }

    updateNavBar();
}

// Aggiorna colori barra
function updateNavBar() {
    const buttons = document.querySelectorAll('#nav-bar button');

    buttons.forEach((btn, i) => {
        btn.classList.remove('answered', 'current', 'correct-nav', 'wrong-nav');

        if (answersState[i] !== null) {
            btn.classList.add('answered');

            if (answersState[i].status === 'correct') {
                btn.classList.add('correct-nav');
            }

            if (answersState[i].status === 'incorrect') {
                btn.classList.add('wrong-nav');
            }
        }

        if (i === currentQuestion) {
            btn.classList.add('current');
        }
    });
}

// Aggiorna contatori
function updateCounters() {
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('wrong-count').textContent = wrongAnswers;
    document.getElementById('total-score').textContent = correctAnswers;
    document.getElementById('score-mini').textContent = `Punteggio: ${correctAnswers}`;
}

// Mostra risultato finale
function showResult() {
    const total = questions.length;
    const score = correctAnswers;
    const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : "0.00";

    document.getElementById('result-container').innerHTML = `
        <div class="report">
            <h2>Report finale</h2>
            <p>✅ Corrette: ${correctAnswers}</p>
            <p>❌ Sbagliate: ${wrongAnswers}</p>
            <hr>
            <p><strong>Punteggio: ${score} / ${total}</strong></p>
            <p>Percentuale: ${percentage}%</p>
            <button onclick="restartTest()" class="restart-btn">Ricomincia</button>
        </div>
    `;

    document.getElementById('question-container').innerHTML = '';
    document.getElementById('answers-container').innerHTML = '';
    document.getElementById('feedback-container').innerHTML = '';
    document.getElementById('navigation-container').style.display = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Avanti
function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        showResult();
    }
}

// Indietro
function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Ricomincia
function restartTest() {
    currentQuestion = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    questions = [];
    answersState = [];

    document.getElementById('quiz-area').classList.add('hidden');
    document.getElementById('start-menu').classList.remove('hidden');

    document.getElementById('result-container').innerHTML = '';
    document.getElementById('question-container').innerHTML = '';
    document.getElementById('answers-container').innerHTML = '';
    document.getElementById('feedback-container').innerHTML = '';
    document.getElementById('nav-bar').innerHTML = '';

    document.getElementById('navigation-container').style.display = 'flex';

    resetStartButton();
    updateCounters();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
