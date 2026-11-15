"use strict";

/* =========================================
   1. БАҒДАРЛАМАНЫҢ НЕГІЗГІ ДЕРЕКТЕРІ
========================================= */

const STORAGE_KEY = "soileuSayahatyProgress";

let currentSound = null;
let currentStage = 0;
let currentTask = 0;

let selectedScore = null;

let progressData = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "{}"
);

let cameraStream = null;
let microphoneStream = null;
let microphoneAnimation = null;


/* =========================================
   2. КӨМЕКШІ ФУНКЦИЯЛАР
========================================= */

function getElement(id) {
  return document.getElementById(id);
}

function saveProgress() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(progressData)
  );
}

function getSoundData(soundKey) {
  return speechTasks[soundKey];
}

function getCurrentTaskData() {
  const sound = getSoundData(currentSound);

  if (!sound || !sound.stages[currentStage]) {
    return null;
  }

  return sound.stages[currentStage].tasks[currentTask];
}

function getTaskKey(sound, stage, task) {
  return `${sound}_${stage}_${task}`;
}

function getTaskRecord(sound, stage, task) {
  const key = getTaskKey(sound, stage, task);

  return progressData[key] || {
    completed: false,
    score: null
  };
}

function setTaskRecord(sound, stage, task, record) {
  const key = getTaskKey(sound, stage, task);

  progressData[key] = record;

  saveProgress();
}

function countCompletedTasks(soundKey, stageIndex) {
  const sound = getSoundData(soundKey);

  if (!sound) return 0;

  let count = 0;

  sound.stages[stageIndex].tasks.forEach((task, index) => {
    const record = getTaskRecord(
      soundKey,
      stageIndex,
      index
    );

    if (record.completed) count++;
  });

  return count;
}

function countSoundCompleted(soundKey) {
  const sound = getSoundData(soundKey);

  if (!sound) return 0;

  let count = 0;

  sound.stages.forEach((stage, stageIndex) => {
    stage.tasks.forEach((task, taskIndex) => {
      const record = getTaskRecord(
        soundKey,
        stageIndex,
        taskIndex
      );

      if (record.completed) count++;
    });
  });

  return count;
}

function countAllCompleted() {
  let total = 0;

  SOUND_ORDER.forEach(soundKey => {
    total += countSoundCompleted(soundKey);
  });

  return total;
}


/* =========================================
   3. БЕТТЕРДІ АУЫСТЫРУ
========================================= */

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const target = getElement(pageId);

  if (target) {
    target.classList.add("active");
    target.classList.remove("hidden");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function toggleMenu() {
  const menu = getElement("mainMenu");

  if (menu) {
    menu.classList.toggle("hidden");
  }
}


/* =========================================
   4. БАСТЫ БЕТТЕН ДЫБЫСТАРҒА ӨТУ
========================================= */

function startJourney() {
  renderSoundMenu();
  showPage("soundPage");
}


/* =========================================
   5. ДЫБЫСТАР МӘЗІРІ
========================================= */

function renderSoundMenu() {
  const page = getElement("soundPage");

  if (!page) return;

  let container = getElement("soundGrid");

  if (!container) {
    container = document.createElement("div");
    container.id = "soundGrid";
    container.className = "sound-grid";
    page.appendChild(container);
  }

  container.innerHTML = "";

  SOUND_ORDER.forEach(soundKey => {
    const sound = getSoundData(soundKey);

    if (!sound) return;

    const completed = countSoundCompleted(soundKey);
    const percent = Math.round((completed / 40) * 100);

    const card = document.createElement("button");

    card.className = "sound-card";
    card.type = "button";

    card.innerHTML = `
      <span class="sound-letter">${sound.sound}</span>
      <span class="sound-name">${sound.title}</span>
      <span class="sound-progress">${percent}%</span>
      <span class="sound-count">${completed}/40 тапсырма</span>
    `;

    card.addEventListener("click", () => {
      openSound(soundKey);
    });

    container.appendChild(card);
  });
}


/* =========================================
   6. ТАҢДАЛҒАН ДЫБЫСТЫ АШУ
========================================= */

function openSound(soundKey) {
  const sound = getSoundData(soundKey);

  if (!sound) {
    alert("Бұл дыбыс деректерден табылмады.");
    return;
  }

  currentSound = soundKey;

  renderStages();

  showPage("stagePage");
}


/* =========================================
   7. КЕЗЕҢДЕРДІ КӨРСЕТУ
========================================= */

function renderStages() {
  const sound = getSoundData(currentSound);

  if (!sound) return;

  const page = getElement("stagePage");

  if (!page) return;

  let container = getElement("stageGrid");

  if (!container) {
    container = document.createElement("div");
    container.id = "stageGrid";
    container.className = "stage-grid";
    page.appendChild(container);
  }

  container.innerHTML = "";

  const title = getElement("stageSoundTitle");

  if (title) {
    title.textContent = sound.title;
  }

  sound.stages.forEach((stage, index) => {
    const completed = countCompletedTasks(
      currentSound,
      index
    );

    const percent = completed * 10;

    const card = document.createElement("button");

    card.className = "stage-card";
    card.type = "button";

    card.innerHTML = `
      <span class="stage-number">${index + 1}</span>
      <span class="stage-name">${stage.name}</span>
      <span class="stage-progress">${percent}%</span>
      <span class="stage-count">${completed}/10 тапсырма</span>
      <span class="stage-bar">
        <span style="width:${percent}%"></span>
      </span>
    `;

    card.addEventListener("click", () => {
      openStage(index);
    });

    container.appendChild(card);
  });
}


/* =========================================
   8. КЕЗЕҢДІ АШУ
========================================= */

function openStage(stageIndex) {
  const sound = getSoundData(currentSound);

  if (!sound || !sound.stages[stageIndex]) return;

  currentStage = stageIndex;
  currentTask = 0;

  openTask();
}


/* =========================================
   9. ТАПСЫРМАНЫ КӨРСЕТУ
========================================= */

function openTask() {
  const sound = getSoundData(currentSound);

  if (!sound) return;

  const stage = sound.stages[currentStage];

  if (!stage) return;

  const task = stage.tasks[currentTask];

  if (!task) return;

  selectedScore = null;

  const record = getTaskRecord(
    currentSound,
    currentStage,
    currentTask
  );

  if (record.completed) {
    selectedScore = record.score;
  }

  showPage("taskPage");

  setText("taskCounter",
    `Тапсырма ${currentTask + 1} / 10`
  );

  setText("stageTitle", stage.name);
  setText("taskCategory", task.category || "");
  setText("taskName", task.title || "");
  setText("taskGoal", task.goal || "");
  setText("taskMaterials", task.materials || "");
  setText("taskExercise", task.exercise || "");
  setText("taskExample", task.example || "");
  setText("taskHint", task.help || "");
  setText("taskEvaluation", task.evaluation || "");

  setText(
    "taskInstruction",
    Array.isArray(task.instruction)
      ? task.instruction.join("\n")
      : task.instruction || ""
  );

  setText("taskVisual", task.visual || "");

  renderTaskProgress();
  renderTaskScore();
  renderTaskExtras(task);
}

function setText(id, value) {
  const element = getElement(id);

  if (element) {
    element.textContent = value;
  }
}


/* =========================================
   10. ТАПСЫРМА ПРОГРЕСІ
========================================= */

function renderTaskProgress() {
  const completed = countCompletedTasks(
    currentSound,
    currentStage
  );

  const percent = completed * 10;

  const bar = getElement("progressBar");

  if (bar) {
    bar.style.width = `${percent}%`;
  }

  setText("progressText", `${percent}%`);
}


/* =========================================
   11. БАҒАЛАУ ШКАЛАСЫ
========================================= */

function setTaskScore(score) {
  if (![0, 1, 2, 3].includes(score)) return;

  selectedScore = score;

  document.querySelectorAll("[data-score]").forEach(button => {
    button.classList.remove("selected");

    if (Number(button.dataset.score) === score) {
      button.classList.add("selected");
    }
  });

  const messages = {
    3: "Өздігінен орындады ⭐⭐⭐",
    2: "Аздаған көмекпен орындады ⭐⭐",
    1: "Көп көмекті қажет етті ⭐",
    0: "Қайталап орындау қажет"
  };

  setText("scoreMessage", messages[score]);
}

function renderTaskScore() {
  document.querySelectorAll("[data-score]").forEach(button => {
    button.classList.remove("selected");

    if (
      selectedScore !== null &&
      Number(button.dataset.score) === selectedScore
    ) {
      button.classList.add("selected");
    }
  });
}


/* =========================================
   12. ТАПСЫРМАНЫ АЯҚТАУ
========================================= */

function completeTask() {
  if (selectedScore === null) {
    alert("Алдымен бағалау шкаласынан ұпай таңда.");
    return;
  }

  setTaskRecord(
    currentSound,
    currentStage,
    currentTask,
    {
      completed: true,
      score: selectedScore
    }
  );

  renderTaskProgress();

  const sound = getSoundData(currentSound);
  const stage = sound.stages[currentStage];

  if (currentTask < stage.tasks.length - 1) {
    currentTask++;
    openTask();
  } else {
    renderStages();

    alert(
      "Кезеңдегі 10 тапсырма аяқталды! Жарайсың!"
    );

    showPage("stagePage");
  }
}


/* =========================================
   13. АЛДЫҢҒЫ ЖӘНЕ КЕЛЕСІ ТАПСЫРМА
========================================= */

function nextTask() {
  const sound = getSoundData(currentSound);

  if (!sound) return;

  const stage = sound.stages[currentStage];

  if (currentTask < stage.tasks.length - 1) {
    currentTask++;
    openTask();
  }
}

function previousTask() {
  if (currentTask > 0) {
    currentTask--;
    openTask();
  }
}


/* =========================================
   14. БАҒАЛАУ БЕТІ
========================================= */

function openAssessment() {
  renderAssessment();
  showPage("assessmentPage");
}

function renderAssessment() {
  const total = countAllCompleted();

  const percent = Math.round((total / 400) * 100);

  setText("totalCompleted", `${total}/400`);
  setText("totalScore", `${percent}%`);
  setText("totalProgress", `${percent}%`);

  const bar = getElement("totalProgressBar");

  if (bar) {
    bar.style.width = `${percent}%`;
  }

  const results = getElement("soundResults");

  if (!results) return;

  results.innerHTML = "";

  SOUND_ORDER.forEach(soundKey => {
    const sound = getSoundData(soundKey);

    if (!sound) return;

    const completed = countSoundCompleted(soundKey);
    const percent = Math.round((completed / 40) * 100);

    const row = document.createElement("div");

    row.className = "result-row";

    row.innerHTML = `
      <strong>${sound.sound}</strong>
      <span>${completed}/40</span>
      <span>${percent}%</span>
    `;

    results.appendChild(row);
  });
}


/* =========================================
   15. ДИПЛОМ
========================================= */

function openDiploma() {
  const completed = countAllCompleted();

  const percent = Math.round((completed / 400) * 100);

  setText("diplomaProgress", `${percent}%`);

  const date = new Date().toLocaleDateString("kk-KZ");

  setText("diplomaDate", date);

  showPage("diplomaPage");
}

function printDiploma() {
  window.print();
}


/* =========================================
   16. ҚОСЫМША БЕТТЕР
========================================= */

function openRelaxation() {
  showPage("relaxationPage");
}

function openMotorSkills() {
  showPage("motorPage");
}

function openRelaxationCategory(category) {
  const menu = getElement("relaxationMenu");
  const game = getElement("relaxationGame");

  if (menu) menu.classList.add("hidden");
  if (game) game.classList.remove("hidden");

  const titles = {
    dance: "Би сергіту сәті",
    sing: "Ән айту сәті",
    movement: "Қимылды ойын",
    animals: "Жануарларға еліктеу"
  };

  setText("relaxationTitle", titles[category] || "Сергіту сәті");

  setText(
    "relaxationInstruction",
    "Қимылды асықпай орында. Қажет болса, үзіліс жаса."
  );
}

function nextRelaxationActivity() {
  setText(
    "relaxationInstruction",
    "Келесі сергіту жаттығуына өт!"
  );
}


/* =========================================
   17. БЕТКЕ ҚАЙТУ
========================================= */

function backToSounds() {
  renderSoundMenu();
  showPage("soundPage");
}

function backToStages() {
  renderStages();
  showPage("stagePage");
}
// ==========================================
// 2-БӨЛІМ. АРТИКУЛЯЦИЯ, КАМЕРА, МИКРОФОН
// ==========================================


// Қосымша бөлімдерді көрсету немесе жасыру
function setSectionVisible(id, visible) {
    const section = document.getElementById(id);

    if (section) {
        section.style.display = visible ? "block" : "none";
    }
}


// Мәтінді қауіпсіз шығару
function setOptionalText(id, value, fallback = "") {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value || fallback;
    }
}


// Тапсырмаға қосымша материалдарды шығару
function renderTaskExtras(task) {

    // Алдыңғы камераны тоқтату
    stopCamera();

    // Алдыңғы микрофонды тоқтату
    stopMicrophone();

    // Барлық қосымша бөлімдерді бастапқыда жасыру
    [
        "articulationSection",
        "cameraSection",
        "audioSection",
        "microphoneSection",
        "breathingSection"
    ].forEach(id => setSectionVisible(id, false));


    // 1. Артикуляциялық үлгі
    if (task.articulation) {

        setSectionVisible("articulationSection", true);

        setOptionalText(
            "articulationDescription",
            task.articulation,
            "Айна алдында логопедтің нұсқауын орында."
        );

        setOptionalText(
            "articulationVisual",
            task.visual,
            "Артикуляциялық қалыпты мұқият бақыла."
        );

        setOptionalText(
            "cameraArticulationModel",
            task.help,
            "Ерін мен тілдің қалпын айна арқылы бақыла."
        );
    }


    // 2. Камера
    if (
        task.type === "camera" ||
        task.type === "articulation" ||
        task.articulation
    ) {
        setSectionVisible("cameraSection", true);
    }


    // 3. Аудио үлгі
    setSectionVisible("audioSection", true);

    const audioElement = document.getElementById("speechAudio");

    if (audioElement) {
        audioElement.pause();
        audioElement.removeAttribute("src");
        audioElement.load();
    }

    const audioUrl = task.audio || task.audioUrl || "";

    if (audioUrl && audioElement) {
        audioElement.src = audioUrl;

        setOptionalText(
            "audioStatus",
            "Аудио үлгі дайын. Тыңдау батырмасын бас."
        );

        const sampleButton = document.getElementById("speechSample");

        if (sampleButton) {
            sampleButton.onclick = () => {
                audioElement.play().catch(() => {
                    setOptionalText(
                        "audioStatus",
                        "Аудионы ойнату мүмкін болмады. Қайта көр."
                    );
                });
            };
        }

    } else {
        setOptionalText(
            "audioStatus",
            "Бұл тапсырмаға жеке аудио үлгі тіркелмеген. Логопедтің дыбыстау үлгісін пайдалан."
        );
    }


    // 4. Микрофон
    if (
        task.type === "microphone" ||
        task.type === "breathing" ||
        task.type === "voice"
    ) {
        setSectionVisible("microphoneSection", true);
    }


    // 5. Тыныс алу жаттығуы
    if (
        task.type === "breathing" ||
        task.breathing
    ) {
        setSectionVisible("breathingSection", true);

        setOptionalText(
            "blowMessage",
            task.breathing || "Мұрынмен дем алып, ауыз арқылы баяу дем шығар."
        );
    }


    // Бағалау батырмаларын бастапқы күйге келтіру
    selectedScore = null;

    document.querySelectorAll("[data-score]").forEach(button => {
        button.classList.remove("selected");
    });
}



// ==========================================
// КАМЕРА
// ==========================================

async function startCamera() {

    const video = document.getElementById("cameraVideo");
    const status = document.getElementById("cameraStatus");

    if (!video) {
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {

        if (status) {
            status.textContent =
                "Камера бұл браузерде қолжетімді емес. HTTPS арқылы ашып көр.";
        }

        return;
    }

    try {

        stopCamera();

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: false
        });

        video.srcObject = cameraStream;

        video.muted = true;
        video.playsInline = true;

        await video.play();

        if (status) {
            status.textContent =
                "Камера қосылды. Айнадан ерін мен тілдің қалпын бақыла.";
        }

    } catch (error) {

        console.error("Камера қатесі:", error);

        if (status) {
            status.textContent =
                "Камераға рұқсат берілмеді. Браузер баптауынан камераға рұқсат бер.";
        }
    }
}


function stopCamera() {

    if (cameraStream) {

        cameraStream.getTracks().forEach(track => {
            track.stop();
        });

        cameraStream = null;
    }

    const video = document.getElementById("cameraVideo");

    if (video) {
        video.pause();
        video.srcObject = null;
    }
}



// ==========================================
// МИКРОФОН
// ==========================================

let audioContext = null;
let microphoneAnalyser = null;
let microphoneSource = null;


async function startMicrophone() {

    const status = document.getElementById("microphoneStatus");
    const message = document.getElementById("microphoneMessage");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {

        setOptionalText(
            "microphoneStatus",
            "Микрофон бұл браузерде қолжетімді емес."
        );

        return;
    }

    try {

        stopMicrophone();

        microphoneStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            throw new Error("AudioContext қолжетімсіз");
        }

        audioContext = new AudioContextClass();

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        microphoneAnalyser = audioContext.createAnalyser();
        microphoneAnalyser.fftSize = 256;

        microphoneSource =
            audioContext.createMediaStreamSource(microphoneStream);

        microphoneSource.connect(microphoneAnalyser);

        if (status) {
            status.textContent = "Микрофон қосылды.";
        }

        if (message) {
            message.textContent =
                "Микрофон тек дыбыс деңгейін көрсетеді. Дыбыстың дұрыс айтылғанын өзі анықтамайды.";
        }

        updateMicrophoneLevel();

    } catch (error) {

        console.error("Микрофон қатесі:", error);

        if (status) {
            status.textContent =
                "Микрофонға рұқсат берілмеді. Браузер баптауын тексер.";
        }
    }
}


function updateMicrophoneLevel() {

    if (!microphoneAnalyser) {
        return;
    }

    const data = new Uint8Array(
        microphoneAnalyser.frequencyBinCount
    );

    microphoneAnalyser.getByteFrequencyData(data);

    let total = 0;

    for (let i = 0; i < data.length; i++) {
        total += data[i];
    }

    const average = total / data.length;

    const percentage = Math.min(
        100,
        Math.round(average * 1.8)
    );

    const volumeBar = document.getElementById("volumeBar");

    if (volumeBar) {
        volumeBar.style.width = percentage + "%";
    }

    const status = document.getElementById("microphoneStatus");

    if (status) {

        if (percentage < 10) {
            status.textContent = "Дыбыс деңгейі төмен.";
        } else if (percentage < 45) {
            status.textContent = "Дыбыс деңгейі орташа.";
        } else {
            status.textContent = "Дыбыс деңгейі жоғары.";
        }
    }

    microphoneAnimation =
        requestAnimationFrame(updateMicrophoneLevel);
}


function stopMicrophone() {

    if (microphoneAnimation) {
        cancelAnimationFrame(microphoneAnimation);
        microphoneAnimation = null;
    }

    if (microphoneStream) {

        microphoneStream.getTracks().forEach(track => {
            track.stop();
        });

        microphoneStream = null;
    }

    if (microphoneSource) {
        microphoneSource.disconnect();
        microphoneSource = null;
    }

    if (audioContext) {
        audioContext.close().catch(() => {});
        audioContext = null;
    }

    microphoneAnalyser = null;

    const volumeBar = document.getElementById("volumeBar");

    if (volumeBar) {
        volumeBar.style.width = "0%";
    }
}



// ==========================================
// ТЫНЫС АЛУ ЖАТТЫҒУЫ
// ==========================================

let breathingTimer = null;


function startBreathingExercise() {

    const cotton = document.getElementById("cotton");
    const progress = document.getElementById("blowProgress");
    const message = document.getElementById("blowMessage");

    if (!cotton) {
        return;
    }

    clearInterval(breathingTimer);

    let position = 0;
    let direction = 1;

    if (message) {
        message.textContent =
            "Мұрынмен дем ал. Енді ауыз арқылы баяу дем шығар.";
    }

    breathingTimer = setInterval(() => {

        position += direction * 3;

        if (position >= 180) {
            direction = -1;
        }

        if (position <= 0) {
            direction = 1;
        }

        cotton.style.transform =
            `translateX(${position}px)`;

        if (progress) {
            progress.style.width =
                Math.round((position / 180) * 100) + "%";
        }

    }, 50);
}


function stopBreathingExercise() {

    clearInterval(breathingTimer);
    breathingTimer = null;

    const cotton = document.getElementById("cotton");
    const progress = document.getElementById("blowProgress");

    if (cotton) {
        cotton.style.transform = "translateX(0)";
    }

    if (progress) {
        progress.style.width = "0%";
    }
}



// ==========================================
// ҚОСЫМША ҚҰРАЛДАРДЫ ТОҚТАТУ
// ==========================================

function stopAllMedia() {

    stopCamera();
    stopMicrophone();
    stopBreathingExercise();
}
