// ==========================================
// СӨЙЛЕУ ӘЛЕМІНЕ САЯХАТ
// Негізгі JavaScript бағдарламасы
// ==========================================


// 1. ДЫБЫСТАР ТІЗІМІ

const soundList = [
    { key: "R", symbol: "Р", title: "Р дыбысы әлемі", icon: "🤖" },
    { key: "L", symbol: "Л", title: "Л дыбысы әлемі", icon: "🌸" },
    { key: "G", symbol: "Г", title: "Г дыбысы әлемі", icon: "🌳" },
    { key: "GH", symbol: "Ғ", title: "Ғ дыбысы әлемі", icon: "🏰" },
    { key: "K", symbol: "К", title: "К дыбысы әлемі", icon: "🚀" },
    { key: "Q", symbol: "Қ", title: "Қ дыбысы әлемі", icon: "💎" },
    { key: "SH", symbol: "Ш", title: "Ш дыбысы әлемі", icon: "🌲" },
    { key: "ZH", symbol: "Ж", title: "Ж дыбысы әлемі", icon: "🦋" },
    { key: "Z", symbol: "З", title: "З дыбысы әлемі", icon: "⚡" },
    { key: "S", symbol: "С", title: "С дыбысы әлемі", icon: "🦅" }
];


// 2. КЕЗЕҢДЕР ТУРАЛЫ АҚПАРАТ

const stageInformation = [
    {
        name: "Дайындық кезеңі",
        icon: "🌱",
        description: "Артикуляциялық жаттығулар мен тыныс алу жаттығулары арқылы сөйлеу мүшелерін дыбыс айтуға дайындаймыз."
    },
    {
        name: "Дыбысты қою кезеңі",
        icon: "🎯",
        description: "Дыбыстың дұрыс артикуляциялық қалпын меңгеріп, жеке дыбысты және буындарды айтуға жаттығамыз."
    },
    {
        name: "Автоматтандыру кезеңі",
        icon: "🚀",
        description: "Дыбысты буында, сөзде, сөз тіркесінде, сөйлемде және байланыстырып сөйлеуде бекітеміз."
    },
    {
        name: "Дифференциация кезеңі",
        icon: "💎",
        description: "Ұқсас дыбыстарды есту арқылы ажыратып, дұрыс дыбысты сөйлеу барысында қолданамыз."
    }
];


// 3. НЕГІЗГІ АЙНЫМАЛЫЛАР

let selectedSoundKey = null;
let selectedStageIndex = 0;
let currentTaskIndex = 0;

let cameraStream = null;
let microphoneStream = null;
let audioContext = null;
let microphoneAnimation = null;


// 4. ОРЫНДАЛҒАН ТАПСЫРМАЛАРДЫ САҚТАУ

let completedTasks = [];

try {
    const savedTasks = localStorage.getItem("soileuCompletedTasks");

    if (savedTasks) {
        completedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(completedTasks)) {
            completedTasks = [];
        }
    }
} catch (error) {
    completedTasks = [];
}


function saveProgress() {
    try {
        localStorage.setItem(
            "soileuCompletedTasks",
            JSON.stringify(completedTasks)
        );
    } catch (error) {
        console.log("Прогресті сақтау мүмкін болмады:", error);
    }
}


// 5. БЕТТЕРДІ АУЫСТЫРУ

function showPage(pageId) {
    const pages = [
        "homePage",
        "soundSection",
        "stagePage",
        "taskPage",
        "diplomaPage"
    ];

    pages.forEach(id => {
        const page = document.getElementById(id);

        if (page) {
            page.classList.add("hidden");
        }
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// 6. САЯХАТТЫ БАСТАУ

function startJourney() {
    stopCamera();
    stopMicrophone();

    createSoundMenu();

    showPage("soundSection");
}


// 7. ДЫБЫСТАР МӘЗІРІН ЖАСАУ

function createSoundMenu() {
    const menu = document.getElementById("soundMenu");

    if (!menu) return;

    menu.innerHTML = "";

    soundList.forEach(sound => {

        const soundData = speechTasks[sound.key];

        if (!soundData) {
            console.warn("Дыбыс деректері табылмады:", sound.key);
            return;
        }

        const button = document.createElement("button");

        button.className = "sound-button";

        const totalTasks = soundData.stages.reduce(
            (sum, stage) => sum + stage.tasks.length,
            0
        );

        const completedCount = getSoundCompletedCount(sound.key);

        button.innerHTML = `
            <span class="sound-icon">${sound.icon}</span>
            <span class="sound-symbol">${sound.symbol}</span>
            <span class="sound-title">${sound.title}</span>
            <span class="sound-progress">
                ${completedCount}/${totalTasks} тапсырма
            </span>
        `;

        button.addEventListener("click", () => {
            selectSound(sound.key);
        });

        menu.appendChild(button);
    });
}


// 8. ДЫБЫС БОЙЫНША ОРЫНДАЛҒАН ТАПСЫРМАЛАР

function getSoundCompletedCount(soundKey) {
    const soundData = speechTasks[soundKey];

    if (!soundData) return 0;

    let count = 0;

    soundData.stages.forEach(stage => {
        stage.tasks.forEach(task => {
            const taskKey = `${soundKey}_${task.id}`;

            if (completedTasks.includes(taskKey)) {
                count++;
            }
        });
    });

    return count;
}


// 9. ДЫБЫСТЫ ТАҢДАУ

function selectSound(key) {
    if (!speechTasks[key]) {
        alert("Бұл дыбыс бойынша тапсырмалар табылмады.");
        return;
    }

    stopCamera();
    stopMicrophone();

    selectedSoundKey = key;

    const sound = speechTasks[key];

    const title = document.getElementById("soundTitle");

    if (title) {
        title.textContent = sound.title;
    }

    createStageMenu();

    showPage("stagePage");
}


// 10. КЕЗЕҢДЕР МӘЗІРІ

function createStageMenu() {
    const menu = document.getElementById("stageMenu");

    if (!menu || !selectedSoundKey) return;

    menu.innerHTML = "";

    const soundData = speechTasks[selectedSoundKey];

    soundData.stages.forEach((stage, index) => {

        const completedCount = getStageCompletedCount(
            selectedSoundKey,
            index
        );

        const totalTasks = stage.tasks.length;

        const percentage = totalTasks
            ? Math.round(completedCount / totalTasks * 100)
            : 0;

        const info = stageInformation[index];

        const button = document.createElement("button");

        button.className = "stage-button";

        button.innerHTML = `
            <span class="stage-icon">${info.icon}</span>

            <strong>${info.name}</strong>

            <span class="stage-description">
                ${info.description}
            </span>

            <span class="stage-task-count">
                ${completedCount}/${totalTasks} тапсырма
            </span>

            <span class="stage-progress">
                <span style="width:${percentage}%"></span>
            </span>

            <span class="stage-percent">
                ${percentage}% орындалды
            </span>
        `;

        button.addEventListener("click", () => {
            selectStage(index);
        });

        menu.appendChild(button);
    });
}


// 11. КЕЗЕҢДЕГІ ПРОГРЕСТІ ЕСЕПТЕУ

function getStageCompletedCount(soundKey, stageIndex) {
    const soundData = speechTasks[soundKey];

    if (!soundData || !soundData.stages[stageIndex]) {
        return 0;
    }

    const tasks = soundData.stages[stageIndex].tasks;

    return tasks.filter(task => {
        return completedTasks.includes(
            `${soundKey}_${task.id}`
        );
    }).length;
}


// 12. КЕЗЕҢДІ ТАҢДАУ

function selectStage(index) {
    const soundData = speechTasks[selectedSoundKey];

    if (!soundData || !soundData.stages[index]) {
        return;
    }

    stopCamera();
    stopMicrophone();

    selectedStageIndex = index;
    currentTaskIndex = 0;

    const stage = soundData.stages[index];

    const title = document.getElementById("stageTitle");
    const description = document.getElementById("stageDescription");

    if (title) {
        title.textContent = stage.name;
    }

    if (description) {
        description.textContent = stage.description;
    }

    showPage("taskPage");

    displayTask();
}


// 13. АҒЫМДАҒЫ ТАПСЫРМАНЫ АЛУ

function getCurrentTask() {
    if (!selectedSoundKey) return null;

    const soundData = speechTasks[selectedSoundKey];

    if (!soundData) return null;

    const stage = soundData.stages[selectedStageIndex];

    if (!stage) return null;

    return stage.tasks[currentTaskIndex] || null;
}


// 14. ТАПСЫРМАНЫ ЭКРАНҒА ШЫҒАРУ

function displayTask() {
    const soundData = speechTasks[selectedSoundKey];

    if (!soundData) return;

    const stage = soundData.stages[selectedStageIndex];

    const task = getCurrentTask();

    if (!task) return;

    stopCamera();
    stopMicrophone();

    const setText = (id, value) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value || "";
        }
    };

    setText("stageTitle", stage.name);

    setText(
        "stageDescription",
        stage.description
    );

    setText(
        "taskNumber",
        `ТАПСЫРМА ${currentTaskIndex + 1}`
    );

    setText("taskName", task.title);

    setText("taskCategory", task.category);

    setText("taskGoal", task.goal);

    setText("taskInstruction", task.instruction);

    setText("taskExample", task.example);

    setText("taskVisual", task.visual);

    setText("taskCheck", task.check);

    setText("taskHint", task.help);


    // Тапсырма прогресі

    const total = stage.tasks.length;

    const completed = getStageCompletedCount(
        selectedSoundKey,
        selectedStageIndex
    );

    const percentage = Math.round(
        completed / total * 100
    );

    const progressText = document.getElementById("progressText");

    const progressBar = document.getElementById("progressBar");

    if (progressText) {
        progressText.textContent =
            `${completed}/${total} тапсырма · ${percentage}%`;
    }

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }


    // Ағымдағы тапсырма нөмірі

    const taskCounter = document.getElementById("taskCounter");

    if (taskCounter) {
        taskCounter.textContent =
            `${currentTaskIndex + 1} / ${total}`;
    }


    // Тапсырманың орындалу жағдайы

    const taskKey = `${selectedSoundKey}_${task.id}`;

    const completeButton = document.getElementById("completeButton");

    if (completeButton) {
        if (completedTasks.includes(taskKey)) {
            completeButton.textContent = "✓ Орындалды";
            completeButton.classList.add("completed");
        } else {
            completeButton.textContent = "Тапсырманы орындадым";
            completeButton.classList.remove("completed");
        }
    }


    // Алдыңғы және келесі батырмалар

    const previousButton = document.getElementById("previousButton");

    const nextButton = document.getElementById("nextButton");

    if (previousButton) {
        previousButton.disabled = currentTaskIndex === 0;
    }

    if (nextButton) {
        nextButton.disabled =
            currentTaskIndex === total - 1;
    }
}


// 15. ТАПСЫРМАНЫ ОРЫНДАЛДЫ ДЕП БЕЛГІЛЕУ

function completeTask() {
    const task = getCurrentTask();

    if (!task) return;

    const taskKey = `${selectedSoundKey}_${task.id}`;

    if (!completedTasks.includes(taskKey)) {
        completedTasks.push(taskKey);
    }

    saveProgress();

    displayTask();

    checkAllProgress();

    // Соңғы тапсырмадан кейін кезең мәзіріне өту

    const soundData = speechTasks[selectedSoundKey];

    const stage = soundData.stages[selectedStageIndex];

    if (currentTaskIndex === stage.tasks.length - 1) {

        setTimeout(() => {

            createStageMenu();

            showPage("stagePage");

            alert(
                "Жарайсың! 🎉 Кезеңдегі тапсырмаларды аяқтадың!"
            );

        }, 300);

    } else {

        setTimeout(() => {
            nextTask();
        }, 400);

    }
}


// 16. КЕЛЕСІ ТАПСЫРМА

function nextTask() {
    const soundData = speechTasks[selectedSoundKey];

    if (!soundData) return;

    const stage = soundData.stages[selectedStageIndex];

    if (currentTaskIndex < stage.tasks.length - 1) {
        currentTaskIndex++;

        displayTask();
    }
}


// 17. АЛДЫҢҒЫ ТАПСЫРМА

function previousTask() {
    if (currentTaskIndex > 0) {
        currentTaskIndex--;

        displayTask();
    }
}


// 18. КЕЗЕҢДЕРГЕ ҚАЙТУ

function goStages() {
    stopCamera();
    stopMicrophone();

    createStageMenu();

    showPage("stagePage");
}


// 19. БАСТЫ БЕТКЕ ҚАЙТУ

function goHome() {
    stopCamera();
    stopMicrophone();

    showPage("homePage");
}


// 20. БАРЛЫҚ ТАПСЫРМАНЫҢ ПРОГРЕСІ

function checkAllProgress() {
    let totalTasks = 0;

    let completedCount = 0;

    Object.keys(speechTasks).forEach(soundKey => {

        speechTasks[soundKey].stages.forEach(stage => {

            stage.tasks.forEach(task => {

                totalTasks++;

                const taskKey = `${soundKey}_${task.id}`;

                if (completedTasks.includes(taskKey)) {
                    completedCount++;
                }

            });

        });

    });

    if (completedCount >= totalTasks && totalTasks > 0) {
        showDiploma();
    }
}


// 21. ДИПЛОМ ШЫҒАРУ

function showDiploma() {
    stopCamera();
    stopMicrophone();

    const diplomaPage = document.getElementById("diplomaPage");

    if (!diplomaPage) return;

    const percentage = Math.round(
        completedTasks.length / 400 * 100
    );

    diplomaPage.innerHTML = `
        <div class="diploma-card">

            <div class="diploma-icon">🏆</div>

            <h1>ҚҰТТЫҚТАЙМЫЗ!</h1>

            <h2>ДЫБЫСТАР ШЕБЕРІ</h2>

            <p>
                Сен «Сөйлеу әлеміне саяхат»
                бағдарламасындағы барлық тапсырманы
                орындадың!
            </p>

            <div class="diploma-progress">
                ${percentage}%
            </div>

            <h3>400 тапсырма аяқталды!</h3>

            <p>
                Еңбегің мен талпынысың үшін
                алғыс білдіреміз!
            </p>

            <div class="diploma-stars">⭐ ⭐ ⭐ ⭐ ⭐</div>

            <button onclick="goHome()">
                Басты бетке оралу
            </button>

            <button onclick="window.print()">
                🖨️ Дипломды басып шығару
            </button>

        </div>
    `;

    showPage("diplomaPage");
}


// 22. КАМЕРАНЫ ҚОСУ

async function startCamera() {
    const video = document.getElementById("cameraVideo");

    const cameraSection = document.getElementById("cameraSection");

    if (!video) return;

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        alert(
            "Бұл браузерде камераны қосу мүмкін емес. HTTPS арқылы ашып көр."
        );

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

        video.setAttribute("playsinline", "");

        video.muted = true;

        await video.play();

        if (cameraSection) {
            cameraSection.classList.remove("hidden");
        }

    } catch (error) {

        console.error("Камера қатесі:", error);

        alert(
            "Камераға рұқсат берілмеді. Браузер баптауларынан камераға рұқсат бер."
        );

    }
}


// 23. КАМЕРАНЫ ӨШІРУ

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


// 24. МИКРОФОНДЫ ҚОСУ

async function startMicrophone() {

    const status = document.getElementById("microphoneStatus");

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        if (status) {
            status.textContent =
                "Микрофон бұл браузерде қолжетімсіз.";
        }

        return;
    }

    try {

        stopMicrophone();

        microphoneStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            throw new Error("AudioContext қолжетімсіз");
        }

        audioContext = new AudioContextClass();

        await audioContext.resume();

        const source =
            audioContext.createMediaStreamSource(microphoneStream);

        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;

        source.connect(analyser);

        const dataArray = new Uint8Array(
            analyser.frequencyBinCount
        );

        function measureVolume() {

            if (!audioContext || !microphoneStream) {
                return;
            }

            analyser.getByteFrequencyData(dataArray);

            let sum = 0;

            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }

            const average = sum / dataArray.length;

            let message = "";

            if (average < 10) {
                message = "🔈 Дыбыс әлсіз";
            } else if (average < 35) {
                message = "🔉 Дыбыс орташа";
            } else {
                message = "🔊 Дыбыс деңгейі жоғары";
            }

            if (status) {
                status.textContent = message;
            }

            microphoneAnimation =
                requestAnimationFrame(measureVolume);
        }

        measureVolume();

    } catch (error) {

        console.error("Микрофон қатесі:", error);

        if (status) {
            status.textContent =
                "Микрофонға рұқсат берілмеді.";
        }

    }
}


// 25. МИКРОФОНДЫ ӨШІРУ

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

    if (audioContext) {

        audioContext.close().catch(error => {
            console.log(error);
        });

        audioContext = null;
    }

    const status = document.getElementById("microphoneStatus");

    if (status) {
        status.textContent = "Микрофон өшірулі";
    }
}


// 26. БАҒДАРЛАМА ІСКЕ ҚОСЫЛҒАНДА

document.addEventListener("DOMContentLoaded", function () {

    showPage("homePage");

    checkAllProgress();

    console.log("Сөйлеу әлеміне саяхат іске қосылды!");

    console.log("10 дыбыс тексерілді:");

    console.log(Object.keys(speechTasks));

});


// ==========================================
// БАҒДАРЛАМА СОҢЫ
// ==========================================
