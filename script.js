// Definizione delle variabili globali per gestire lo stato del quiz
let currentQuestion = 0;
const totalQuestions = 20; // Numero totale di domande che vuoi mostrare
let score = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let unanswered = totalQuestions;
let questions = [];
let answersState = []; // Array per tenere traccia dello stato delle risposte

// Funzione per caricare le domande dal file JSON caricato dall'utente
function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const jsonContent = event.target.result;
            let parsedData = JSON.parse(jsonContent);
            
            // Estrai casualmente 20 domande dal JSON completo
            questions = getRandomQuestions(parsedData.questions, totalQuestions);

            // Mescola le risposte di ciascuna domanda
            questions.forEach((question) => {
                question.answers = shuffleArray(question.answers);
            });

            // Inizializza lo stato delle risposte
            answersState = new Array(totalQuestions).fill(null);

            currentQuestion = 0; // Resetta l'indice delle domande
            displayQuestion();  // Dopo aver caricato le domande, visualizza la prima domanda
        } catch (error) {
            console.error('Errore nel parsing del file JSON:', error);
        }
    };

    reader.readAsText(file);
}

// Funzione per estrarre casualmente un numero specificato di domande da un array
function getRandomQuestions(allQuestions, numQuestions) {
    // Clona l'array delle domande per non modificarlo direttamente
    let clonedQuestions = [...allQuestions];

    // Mescola l'array delle domande
    clonedQuestions = shuffleArray(clonedQuestions);

    // Limita l'array alle prime numQuestions domande mescolate
    return clonedQuestions.slice(0, numQuestions);
}

// Funzione per mescolare un array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Funzione per visualizzare la domanda corrente
function displayQuestion() {
    if (currentQuestion >= questions.length) {
        showResult();  // Se tutte le domande sono state mostrate, mostra il risultato finale
        return;
    }
    
    // Seleziona gli elementi DOM necessari
    const questionContainer = document.getElementById('question-container');
    const answersContainer = document.getElementById('answers-container');
    const feedbackContainer = document.getElementById('feedback-container');

    // Ottiene la domanda corrente dal array delle domande
    const currentQ = questions[currentQuestion];
    
    // Costruisce l'HTML per la domanda corrente
    questionContainer.innerHTML = `<p>${currentQ.question}</p>`;

    // Costruisce l'HTML per le risposte possibili (già mescolate casualmente)
    let answersHtml = '';
    currentQ.answers.forEach((answer, index) => {
        answersHtml += `<button onclick="checkAnswer(${index})">${answer}</button>`;
    });
    answersContainer.innerHTML = answersHtml;

    // Svuota il feedback container
    feedbackContainer.innerHTML = '';
}

// Funzione per verificare la risposta data dall'utente
function checkAnswer(index) {
    const selectedQuestion = questions[currentQuestion];
    const selectedAnswer = selectedQuestion.answers[index];
    const previousAnswer = answersState[currentQuestion];

    // Controlla se la risposta è corretta
    if (selectedAnswer === selectedQuestion.correctAnswer) {
        if (previousAnswer !== 'correct') {
            if (previousAnswer === 'incorrect') {
                score += 1.25; // Correct answer now, was previously incorrect
                wrongAnswers -= 1;
            } else if (previousAnswer === null) {
                score += 1; // Correct answer now, was previously unanswered
                unanswered -= 1;
            }
            correctAnswers += 1;
            showFeedback('Corretto!', 'correct');
            answersState[currentQuestion] = 'correct';
        }
    } else {
        if (previousAnswer !== 'incorrect') {
            if (previousAnswer === 'correct') {
                score -= 1.25; // Incorrect answer now, was previously correct
                correctAnswers -= 1;
            } else if (previousAnswer === null) {
                score -= 0.25; // Incorrect answer now, was previously unanswered
                unanswered -= 1;
            }
            wrongAnswers += 1;
            showFeedback(`Sbagliato! La risposta corretta è: ${selectedQuestion.correctAnswer}`, 'incorrect');
            answersState[currentQuestion] = 'incorrect';
        }
    }

    // Passa alla domanda successiva dopo un breve periodo di tempo
    setTimeout(() => {
        currentQuestion += 1;
        displayQuestion();
    }, 2000); // Passa alla domanda successiva dopo 2 secondi
}

// Funzione per mostrare il feedback sulla risposta
function showFeedback(message, className) {
    const feedbackContainer = document.getElementById('feedback-container');
    feedbackContainer.innerHTML = `<p class="${className}">${message}</p>`;
}

// Funzione per mostrare il risultato finale del quiz
function showResult() {
    const resultContainer = document.getElementById('result-container');

    // Calcola il punteggio totale
    const totalScore = score;

    resultContainer.innerHTML = `
        <h2>Risultato del Quiz</h2>
        <p>Risposte corrette: ${correctAnswers}</p>
        <p>Risposte sbagliate: ${wrongAnswers}</p>
        <p>Risposte non date: ${unanswered}</p>
        <p>Punteggio totale: ${totalScore.toFixed(2)}</p>
    `;

    // Nasconde i pulsanti di navigazione alla fine del quiz
    const navigationContainer = document.getElementById('navigation-container');
    navigationContainer.style.display = 'none';
}

// Funzione per tornare alla domanda precedente
function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion -= 1;
        displayQuestion();

        // Svuota il feedback container quando si passa alla domanda precedente
        const feedbackContainer = document.getElementById('feedback-container');
        feedbackContainer.innerHTML = '';
    }
}

// Funzione per passare alla domanda successiva
function nextQuestion() {
    if (currentQuestion < questions.length) {
        currentQuestion += 1;
        displayQuestion();

        // Svuota il feedback container quando si passa alla domanda successiva
        const feedbackContainer = document.getElementById('feedback-container');
        feedbackContainer.innerHTML = '';
    }
}

// Aggiungi un event listener per gestire il caricamento del file
document.getElementById('file-input').addEventListener('change', handleFileUpload);
