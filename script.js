/* ========================================
   QUIZ SCRIPT
   ======================================== */

let allQuestions = [];
let questions = [];
let current = 0;
let correct = 0;
let wrong = 0;
let answered = false;
let selectedTheme = "girl_power";

// History: speichert den Zustand jeder beantworteten Frage
let history = [];

/* ========================================
   THEME HANDLING
   ======================================== */
function previewTheme(theme) {
    selectedTheme = theme;
    document.body.className = theme === "girl_power" ? "" : theme;

    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.classList.toggle("active-theme", btn.dataset.theme === theme);
    });

    const preview = document.getElementById("themePreview");
    preview.classList.add("visible");
}

/* ========================================
   SEITEN-NAVIGATION
   ======================================== */
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function goToStart() {
    showPage("startPage");
}

/* ========================================
   QUIZ STARTEN
   ======================================== */
function startQuiz() {
    document.body.className = selectedTheme === "girl_power" ? "" : selectedTheme;

    current = 0;
    correct = 0;
    wrong = 0;
    answered = false;
    history = []; 

    showPage("quizPage");
    loadQuestion();
}

/* ========================================
   FRAGEN LADEN
   ======================================== */
function loadQuestion() {
    if (current >= questions.length) {
        showResult();
        return;
    }

    let q = questions[current];
    let savedState = history[current];

    document.getElementById("question").innerText = cleanQuestionText(q.question);
    document.getElementById("feedback").className = "";
    document.getElementById("feedback").innerHTML = "";
    document.getElementById("feedback").style.display = "none"; 
    document.getElementById("textAnswer").value = "";

    clearAnswerButtons();

    let answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    if (savedState) {
        answered = true;
        renderQuestionWithState(q, savedState);
    } else {
        answered = false;
        renderQuestion(q);
    }

    updateProgress();
    updateNavButtons();
}

function renderQuestion(q) {
    let answersDiv = document.getElementById("answers");

    if (q.type === "mc") {
        q.options.forEach(opt => {
            let btn = document.createElement("button");
            btn.innerText = opt;
            btn.className = "answer-btn";
            btn.onclick = () => checkAnswer(opt.trim().charAt(0));
            answersDiv.appendChild(btn);
        });
        document.getElementById("textAnswer").style.display = "none";
    } else if (q.type === "text") {
        document.getElementById("textAnswer").style.display = "block";
    } else if (q.type === "copy") {
        q.options.forEach(opt => {
            let btn = document.createElement("button");
            btn.innerText = opt;
            btn.className = "answer-btn";
            btn.onclick = () => {
                document.getElementById("textAnswer").value = opt;
                checkAnswer(opt);
            };
            answersDiv.appendChild(btn);
        });
        document.getElementById("textAnswer").style.display = "block";
    }
}

function renderQuestionWithState(q, state) {
    let answersDiv = document.getElementById("answers");

    let tag = document.createElement("div");
    tag.className = "reviewed-tag";
    tag.innerText = state.wasCorrect ? "✔ Richtig beantwortet" : "✖ Falsch beantwortet";
    answersDiv.appendChild(tag);

    if (q.type === "mc") {
        q.options.forEach(opt => {
            let letter = opt.trim().charAt(0);
            let btn = document.createElement("button");
            btn.innerText = opt;
            btn.className = "answer-btn";
            btn.disabled = true;

            let correctLetter = q.answer?.trim().toUpperCase();
            let userLetter = state.userAnswer?.trim().toUpperCase();

            if (letter.toUpperCase() === correctLetter) {
                btn.classList.add("btn-correct");
            } else if (letter.toUpperCase() === userLetter && !state.wasCorrect) {
                btn.classList.add("btn-wrong");
            } else {
                btn.style.opacity = "0.45";
            }
            answersDiv.appendChild(btn);
        });
        document.getElementById("textAnswer").style.display = "none";
    } else if (q.type === "text" || q.type === "copy") {
        let inputEl = document.getElementById("textAnswer");
        inputEl.style.display = "block";
        inputEl.value = state.userAnswer;
        inputEl.disabled = true;
        if (q.type === "copy" && q.options) {
            q.options.forEach(opt => {
                let btn = document.createElement("button");
                btn.innerText = opt;
                btn.className = "answer-btn";
                btn.disabled = true;
                if (opt === q.answer) btn.classList.add("btn-correct");
                else btn.style.opacity = "0.45";
                answersDiv.appendChild(btn);
            });
        }
    }

    let feedback = document.getElementById("feedback");
    if (state.wasCorrect) {
        feedback.className = "correct";
        feedback.innerHTML = `<b>Richtig!</b><br>${q.explanation}<br><br><b>Antwort:</b> ${q.answer}`;
    } else {
        feedback.className = "wrong";
        feedback.innerHTML = `<b>Falsch!</b><br>Richtige Antwort:<br><b>${q.answer}</b><br><br>${q.explanation}`;
    }
}

/* ========================================
   ANTWORT PRÜFEN
   ======================================= */
function checkAnswer(value) {
    if (answered) return;
    answered = true;

    let q = questions[current];
    let feedback = document.getElementById("feedback");

    document.querySelectorAll(".answer-btn").forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
    });

    let userAnswer = value?.trim().toLowerCase();
    let correctAnswer = q.answer?.trim().toLowerCase();
    let wasCorrect = userAnswer === correctAnswer;

    if (q.type === "mc") {
        document.querySelectorAll(".answer-btn").forEach(btn => {
            let letter = btn.innerText.trim().charAt(0).toLowerCase();
            if (letter === correctAnswer) {
                btn.classList.add("btn-correct");
                btn.style.opacity = "1";
            } else if (letter === userAnswer && !wasCorrect) {
                btn.classList.add("btn-wrong");
                btn.style.opacity = "1";
            }
        });
    }

    if (wasCorrect) {
        correct++;
        feedback.className = "correct";
        feedback.innerHTML = `<b>Richtig!</b><br>${q.explanation}<br><br><b>Antwort:</b> ${q.answer}`;
    } else {
        wrong++;
        feedback.className = "wrong";
        feedback.innerHTML = `<b>Falsch!</b><br>Richtige Antwort:<br><b>${q.answer}</b><br><br>${q.explanation}`;
    }

    feedback.style.display = "block"; 

    history[current] = {
        answered: true,
        userAnswer: value,
        wasCorrect: wasCorrect
    };

    updateProgress();
    updateNavButtons();
}

/* ========================================
   NAVIGATION
   ======================================== */
function nextQuestion() {
    let q = questions[current];

    if (!answered) {
        if (q.type === "text" || q.type === "copy") {
            let value = document.getElementById("textAnswer").value;
            if (!value.trim()) {
                let fb = document.getElementById("feedback");
                fb.className = "wrong";
                fb.innerHTML = "Bitte gib zuerst eine Antwort ein.";
                return;
            }
            checkAnswer(value);
            return;
        }
        let fb = document.getElementById("feedback");
        fb.className = "wrong";
        fb.innerHTML = "Bitte wähle zuerst eine Antwort aus.";
        return;
    }

    current++;
    if (current < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function prevQuestion() {
    if (current > 0) {
        current--;
        loadQuestion();
    }
}

function updateNavButtons() {
    let prevBtn = document.getElementById("prevBtn");
    let nextBtn = document.getElementById("nextBtn");

    prevBtn.style.display = (current > 0 && history[current - 1]) ? "block" : "none";
    nextBtn.style.display = "block";

    if (current >= questions.length - 1 && answered) {
        nextBtn.innerText = "Auswertung →";
    } else {
        nextBtn.innerText = "Weiter →";
    }
}

/* ========================================
   FORTSCHRITT
   ======================================== */
function updateProgress() {
    if (current >= questions.length) return;

    let answeredCount = history.filter(h => h !== null).length;

    document.getElementById("progressText").innerText =
        `Frage ${current + 1} / ${questions.length}`;
    document.getElementById("scoreText").innerText =
        `✔ ${correct} | ✖ ${wrong}`;
    document.getElementById("percentText").innerText =
        answeredCount > 0
            ? `(${Math.round((correct / answeredCount) * 100)}%)`
            : "";
    document.getElementById("progressFill").style.width =
        ((current + 1) / questions.length) * 100 + "%";
}

/* ========================================
   ERGEBNIS (IHK-SCHLÜSSEL)
   ======================================== */
function showResult() {
    let total = questions.length;
    let percent = total > 0 ? (correct / total) * 100 : 0;
    let grade = getGrade(percent);

    let gradeLabel = grade <= 2 ? "🎉" : grade <= 4 ? "👍" : "📚";

    document.getElementById("resultContent").innerHTML = `
    <div class="grade-badge">${grade}</div>
    <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px;">IHK-Note (1 = beste)</p>
    <p style="font-size:1.1rem; margin-bottom:6px;">
      ${gradeLabel} ${percent.toFixed(1)}% erreicht
    </p>
    <p style="color:var(--text-muted); margin-bottom:4px;">
      ✔ ${correct} richtige &nbsp;|&nbsp; ✖ ${wrong} falsche Antworten
    </p>
    <p style="color:var(--text-muted); font-size:0.85rem;">von ${total} Fragen</p>
  `;

    showPage("resultPage");
}

function getGrade(p) {
    if (p >= 92) return 1; 
    if (p >= 81) return 2; 
    if (p >= 67) return 3; 
    if (p >= 50) return 4; 
    if (p >= 30) return 5; 
    return 6;              
}

/* ========================================
   SHUFFLE & NEUSTART
   ======================================== */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function shuffleAndRestart() {
    questions = shuffleArray([...allQuestions]);
    current = 0;
    correct = 0;
    wrong = 0;
    answered = false;
    history = []; 
    showPage("quizPage");
    loadQuestion();
}

/* ========================================
   HELPER
   ======================================== */
function cleanQuestionText(text) {
    if (!text) return "";
    return text
        .split("\nA)")[0]
        .split("\nAntwort:")[0]
        .split("\nErklärung:")[0]
        .trim();
}

function clearAnswerButtons() {
    document.querySelectorAll(".answer-btn").forEach(btn => btn.remove());
}

/* ========================================
   ENTER-TASTE für Texteingabe
   ======================================== */
document.getElementById("textAnswer").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        let value = e.target.value;
        if (value.trim()) checkAnswer(value);
    }
});

/* ========================================
   DATEN LADEN
   ======================================== */
fetch("questions.json")
    .then(res => res.json())
    .then(data => {
        allQuestions = data;
        questions = [...allQuestions];
        showPage("startPage");
        const defaultBtn = document.querySelector('[data-theme="girl_power"]');
        if (defaultBtn) defaultBtn.classList.add("active-theme");
    })
    .catch(err => {
        console.error("Fehler beim Laden der Fragen:", err);
        document.body.innerHTML =
            "<p style='color:red;padding:20px;'>Fehler: questions.json konnte nicht geladen werden.</p>";
    });

    
/* ========================================
   TOTENKOPF-STEUERUNG (ROLLEN, AUGEN & KLICK-EFFEKT)
   ======================================== */
const skull = document.getElementById("skull");
const humanEyes = document.querySelectorAll(".human-eye");
const irises = document.querySelectorAll(".iris");
const toggleBtn = document.getElementById("skullToggleBtn") || document.getElementById("lizardToggleBtn");

let skullActive = true;
let isLaunching = false; // Sperre, während der Schädel wegfliegt

let sPosX = window.innerWidth / 2; 
let sPosY = window.innerHeight / 2;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let sAngle = 0;
let eyeTimer = 0;
let eyesAreVisible = false;
let orbitAngle = 0; 

// Mausbewegung global tracken
window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Button-Steuerung zum Ein- und Ausschalten
if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Verhindert, dass der Klick den Schädel-Effekt triggert
        skullActive = !skullActive;
        if (!skullActive) {
            toggleBtn.innerText = "💀 Ein";
            toggleBtn.classList.add("disabled");
            if (skull) skull.classList.add("skull-hidden");
        } else {
            toggleBtn.innerText = "💀 Aus";
            toggleBtn.classList.remove("disabled");
            if (skull) skull.classList.remove("skull-hidden");
            sPosX = mouseX;
            sPosY = mouseY;
        }
    });
}

// Initialisierung: Totenkopf anzeigen
if (skull) skull.classList.remove("skull-hidden");

/* ========================================
   NEU: DER KLICK-EFFEKT (WEGROLLEN)
   ======================================== */
if (skull) {
    skull.addEventListener("click", () => {
        // Wenn er schon fliegt oder deaktiviert ist, tu nichts
        if (isLaunching || !skullActive) return; 
        
        isLaunching = true;

        // Aktuelle Position als CSS-Variablen speichern, damit die Animation weich von hier startet
        skull.style.setProperty('--startX', `${sPosX}px`);
        skull.style.setProperty('--startY', `${sPosY}px`);
        skull.style.setProperty('--startAngle', `${sAngle}rad`);

        // Animations-Klasse hinzufügen
        skull.classList.add("skull-launching");

        // Nach 5 Sekunden (5000ms) kommt er wieder zurück
        setTimeout(() => {
            // Animation zurücksetzen
            skull.classList.remove("skull-launching");
            
            // Sofort auf die aktuelle Mausposition setzen, damit er nicht fliegt
            sPosX = mouseX;
            sPosY = mouseY;
            sAngle = 0;
            
            isLaunching = false;
        }, 5000);
    });
}

function updateSkullBehavior() {
    // Wenn deaktiviert oder gerade im Klick-Flug, wird die normale Cursor-Verfolgung pausiert
    if (!skullActive || isLaunching) {
        requestAnimationFrame(updateSkullBehavior);
        return;
    }

    if (!skull) {
        requestAnimationFrame(updateSkullBehavior);
        return;
    }

    // 1. ZIELBERECHNUNG: Langsame Kreisbewegung hinter dem Cursor her
    orbitAngle += 0.02; 
    const orbitRadius = 40; 
    
    const sTargetX = mouseX + Math.cos(orbitAngle) * orbitRadius - 30; 
    const sTargetY = mouseY + Math.sin(orbitAngle) * orbitRadius - 35; 

    const delay = 25; 
    const dx = sTargetX - sPosX;
    const dy = sTargetY - sPosY;
    
    sPosX += dx / delay;
    sPosY += dy / delay;

    // 2. ROLL-EFFEKT (Rotation basierend auf der X-Achse)
    if (Math.abs(dx) > 0.5) {
        sAngle += (dx / delay) * 0.05; 
    }

    // Nur transformieren, wenn er nicht fliegt (CSS übernimmt während des Flugs)
    skull.style.transform = `translate(${sPosX}px, ${sPosY}px) rotate(${sAngle}rad)`;

    // 3. AUGEN-LOGIK (Zufälliges Erscheinen / Verschwinden)
    eyeTimer++;
    if (eyeTimer > 150) { 
        eyeTimer = 0;
        if (Math.random() > 0.4) {
            eyesAreVisible = !eyesAreVisible;
            humanEyes.forEach(eye => {
                eye.classList.toggle("visible", eyesAreVisible);
            });
        }
    }

    // Wenn die Augen sichtbar sind, rollen die Iris-Elemente im Schädel
    if (eyesAreVisible) {
        const irisX = Math.cos(orbitAngle * 3) * 3; 
        const irisY = Math.sin(orbitAngle * 3) * 3;
        irises.forEach(iris => {
            iris.style.transform = `translate(${irisX}px, ${irisY}px)`;
        });
    }

    requestAnimationFrame(updateSkullBehavior);
}

// Startet die Animationsschleife für den Totenkopf
requestAnimationFrame(updateSkullBehavior);