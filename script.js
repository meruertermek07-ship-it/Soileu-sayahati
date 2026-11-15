// ==================================================
// СӨЙЛЕУ ӘЛЕМІНЕ САЯХАТ
// НЕГІЗГІ БАСҚАРУ ЖҮЙЕСІ
// ==================================================


// 1. ДЫБЫСТАР ТІЗІМІ

const soundList = [
    { key: "R", symbol: "Р", name: "Р дыбысы", icon: "🚀" },
    { key: "L", symbol: "Л", name: "Л дыбысы", icon: "🌸" },
    { key: "G", symbol: "Г", name: "Г дыбысы", icon: "🎈" },
    { key: "GH", symbol: "Ғ", name: "Ғ дыбысы", icon: "🌳" },
    { key: "K", symbol: "К", name: "К дыбысы", icon: "🔑" },
    { key: "Q", symbol: "Қ", name: "Қ дыбысы", icon: "🏰" },
    { key: "SH", symbol: "Ш", name: "Ш дыбысы", icon: "🦋" },
    { key: "ZH", symbol: "Ж", name: "Ж дыбысы", icon: "☀️" },
    { key: "Z", symbol: "З", name: "З дыбысы", icon: "🐝" },
    { key: "S", symbol: "С", name: "С дыбысы", icon: "⭐" }
];


// 2. КЕЗЕҢДЕР ТУРАЛЫ АҚПАРАТ

const stageInformation = [
    {
        key: "preparation",
        title: "Дайындық кезеңі",
        icon: "👄",
        description: "Артикуляциялық жаттығулар мен тыныс алуды дамыту",
        count: 10
    },
    {
        key: "production",
        title: "Дыбысты қою кезеңі",
        icon: "🎯",
        description: "Дұрыс дыбыстауды қалыптастыру",
        count: 10
    },
    {
        key: "automation",
        title: "Автоматтандыру кезеңі",
        icon: "🗣️",
        description: "Дыбысты буында, сөзде және сөйлемде бекіту",
        count: 10
    },
    {
        key: "differentiation",
        title: "Дифференциация кезеңі",
        icon: "🧠",
        description: "Ұқсас дыбыстарды ажырату",
        count: 10
    }
];


// 3. ЖҰМЫС ЖАҒДАЙЫ

let currentSound = null;
let currentStageIndex = 0;
let currentTaskIndex = 0;

let currentTasks = [];

let completedTasks = JSON.parse(
    localStorage.getItem("soileuCompletedTasks") || "[]"
);


// 4. HTML ЭЛЕМЕНТТЕРІН АЛУ

function getElement(id) {
    return document.getElementById(id);
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
        const page = getElement(id);

        if (page) {
            page.classList.add("hidden");
        }
    });

    const selectedPage = getElement(pageId);

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

    if (typeof speechTasks === "undefined") {
        alert("Қате! data.js файлы жүктелмеген. Файлдардың ретін тексеріңіз.");
        return;
    }

    showPage("soundSection");

    createSoundMenu();
}


// 7. ДЫБЫСТАР МӘЗІРІН ҚҰРУ

function createSoundMenu() {

    const menu = getElement("soundMenu");

    if (!menu) {
        console.error("soundMenu табылмады!");
        return;
    }

    menu.innerHTML = "";

    soundList.forEach(sound => {

        if (!speechTasks[sound.key]) {
            console.error("Дерек табылмады:", sound.key);
            return;
        }

        const button = document.createElement("button");

        button.className = "sound-button";

        const soundCompleted = completedTasks.filter(id =>
            getAllTasksForSound(sound.key).some(task =>
                String(task.id) === String(id)
            )
        ).length;

        button.innerHTML = `
            <span class="sound-icon">${sound.icon}</span>

            <span class="sound-symbol">${sound.symbol}</span>

            <span class="sound-title">${sound.name}</span>

            <span class="sound-progress">
                ${soundCompleted}/40 тапсырма
            </span>
        `;

        button.addEventListener("click", () => {
            selectSound(sound.key);
        });

        menu.appendChild(button);
    });
}


// 8. БІР ДЫБЫСТЫҢ БАРЛЫҚ ТАПСЫРМАЛАРЫН АЛУ

function getAllTasksForSound(soundKey) {

    const soundData = speechTasks[soundKey];

    if (!soundData || !soundData.stages) {
        return [];
    }

    const stages = Object.values(soundData.stages);

    let allTasks = [];

    stages.forEach(stage => {

        if (Array.isArray(stage)) {
            allTasks = allTasks.concat(stage);
        }

        else if (stage && Array.isArray(stage.tasks)) {
            allTasks = allTasks.concat(stage.tasks);
        }
    });

    return allTasks;
}


// 9. ДЫБЫСТЫ ТАҢДАУ

function selectSound(soundKey) {

    if (!speechTasks[soundKey]) {
        alert("Бұл дыбыстың тапсырмалары табылмады!");
        return;
    }

    currentSound = soundKey;

    currentStageIndex = 0;
    currentTaskIndex = 0;

    showPage("stagePage");

    createStageMenu();
}


// 10. КЕЗЕҢ ТАПСЫРМАЛАРЫН АЛУ

function getStageTasks(stageIndex) {

    if (!currentSound) {
        return [];
    }

    const soundData = speechTasks[currentSound];

    if (!soundData || !soundData.stages) {
        return [];
    }

    const stages = Object.values(soundData.stages);

    const selectedStage = stages[stageIndex];

    if (!selectedStage) {
        return [];
    }

    if (Array.isArray(selectedStage)) {
        return selectedStage;
    }

    if (Array.isArray(selectedStage.tasks)) {
        return selectedStage.tasks;
    }

    return [];
}


// 11. КЕЗЕҢ МӘЗІРІН ҚҰРУ

function createStageMenu() {

    const menu = getElement("stageMenu");

    if (!menu) {
        console.error("stageMenu табылмады!");
        return;
    }

    menu.innerHTML = "";

    const sound = soundList.find(item =>
        item.key === currentSound
    );

    if (sound) {
        const title = getElement("soundTitle");

        if (title) {
            title.textContent = sound.name;
        }
    }

    stageInformation.forEach((stage, index) => {

        const tasks = getStageTasks(index);

        const done = tasks.filter(task =>
            completedTasks.includes(String(task.id))
        ).length;

        const button = document.createElement("button");

        button.className = "stage-button";

        button.innerHTML = `
            <span class="stage-icon">${stage.icon}</span>

            <strong>${stage.title}</strong>

            <span class="stage-description">
                ${stage.description}
            </span>

            <span class="stage-task-count">
                ${tasks.length} тапсырма
            </span>

            <span class="stage-progress">
                ${done}/${tasks.length}
            </span>

            <span class="stage-percent">
                ${tasks.length ? Math.round(done / tasks.length * 100) : 0}%
            </span>
        `;

        button.addEventListener("click", () => {
            selectStage(index);
        });

        menu.appendChild(button);
    });
}


// 12. КЕЗЕҢДІ ТАҢДАУ

function selectStage(stageIndex) {

    currentStageIndex = Number(stageIndex);

    currentTasks = getStageTasks(currentStageIndex);

    if (!currentTasks.length) {
        alert("Бұл кезеңнің тапсырмалары табылмады. data.js құрылымын тексеріңіз.");
        return;
    }

    currentTaskIndex = 0;

    displayTask();
}


// 13. ТАПСЫРМАНЫ ЭКРАНҒА ШЫҒАРУ

function displayTask() {

    if (!currentTasks.length) {
        return;
    }

    if (currentTaskIndex < 0 ||
        currentTaskIndex >= currentTasks.length) {
        return;
    }

    const task = currentTasks[currentTaskIndex];

    showPage("taskPage");

    const stage = stageInformation[currentStageIndex];

    const sound = soundList.find(item =>
        item.key === currentSound
    );

    setText("stageTitle", stage.title);

    setText("stageDescription", stage.description);

    setText("taskCounter",
        `${currentTaskIndex + 1}/${currentTasks.length}`
    );

    setText("taskNumber",
        `Тапсырма ${currentTaskIndex + 1}`
    );

    setText("taskName", task.title);

    setText("taskCategory", task.category);

    setText("taskGoal", task.goal);

    setText("taskInstruction", task.instruction);

    setText("taskExample", task.example);

    setText("taskVisual", task.visual);

    setText("taskCheck", task.check);

    setText("taskHint", task.help);

    updateProgress();

    updateNavigationButtons();

    const completeButton = getElement("completeButton");

    if (completeButton) {

        const alreadyCompleted = completedTasks.includes(
            String(task.id)
        );

        completeButton.textContent = alreadyCompleted
            ? "✓ Орындалды"
            : "Тапсырманы орындадым";

        completeButton.disabled = alreadyCompleted;
    }

    stopCamera();
    stopMicrophone();

    const taskSound = getElement("taskSound");

    if (taskSound && sound) {
        taskSound.textContent = sound.symbol;
    }
}


// 14. МӘТІНДІ ҚАУІПСІЗ ОРНАТУ

function setText(id, value) {

    const element = getElement(id);

    if (!element) return;

    element.textContent =
        value === undefined || value === null
            ? ""
            : value;
}


// 15. ПРОГРЕСТІ ЖАҢАРТУ

function updateProgress() {

    const tasks = currentTasks;

    const done = tasks.filter(task =>
        completedTasks.includes(String(task.id))
    ).length;

    const percent = tasks.length
        ? Math.round(done / tasks.length * 100)
        : 0;

    setText("progressText", `${percent}%`);

    const bar = getElement("progressBar");

    if (bar) {
        bar.style.width = `${percent}%`;
    }
}


// 16. ТАПСЫРМАНЫ ОРЫНДАЛДЫ ДЕП БЕЛГІЛЕУ

function completeTask() {

    const task = currentTasks[currentTaskIndex];

    if (!task) return;

    const taskId = String(task.id);

    if (!completedTasks.includes(taskId)) {

        completedTasks.push(taskId);

        localStorage.setItem(
            "soileuCompletedTasks",
            JSON.stringify(completedTasks)
        );
    }

    const button = getElement("completeButton");

    if (button) {
        button.textContent = "✓ Орындалды";
        button.disabled = true;
    }

    updateProgress();

    setTimeout(() => {

        if (currentTaskIndex < currentTasks.length - 1) {

            currentTaskIndex++;

            displayTask();

        } else {

            alert("Керемет! Кезеңдегі барлық тапсырманы аяқтадың!");

            showPage("stagePage");

            createStageMenu();
        }

    }, 500);
}


// 17. КЕЛЕСІ ТАПСЫРМА

function nextTask() {

    if (currentTaskIndex < currentTasks.length - 1) {

        currentTaskIndex++;

        displayTask();
    }
}


// 18. АЛДЫҢҒЫ ТАПСЫРМА

function previousTask() {

    if (currentTaskIndex > 0) {

        currentTaskIndex--;

        displayTask();
    }
}


// 19. НАВИГАЦИЯ БАТЫРМАЛАРЫ

function updateNavigationButtons() {

    const previous = getElement("previousButton");
    const next = getElement("nextButton");

    if (previous) {
        previous.disabled = currentTaskIndex === 0;
    }

    if (next) {
        next.disabled =
            currentTaskIndex === currentTasks.length - 1;
    }
}


// 20. КЕЗЕҢДЕРГЕ ҚАЙТУ

function goStages() {

    stopCamera();
    stopMicrophone();

    showPage("stagePage");

    createStageMenu();
}


// 21. БАСТЫ БЕТКЕ ҚАЙТУ

function goHome() {

    stopCamera();
    stopMicrophone();

    currentSound = null;

    showPage("homePage");
}


// 22. КАМЕРАНЫ ҚОСУ

let cameraStream = null;

async function startCamera() {

    const video = getElement("cameraVideo");

    const section = getElement("cameraSection");

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        alert("Бұл браузер камераны қолдамайды.");
        return;
    }

    try {

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: false
        });

        if (video) {
            video.srcObject = cameraStream;
            video.style.transform = "scaleX(-1)";
            await video.play();
        }

        if (section) {
            section.classList.remove("hidden");
        }

    } catch (error) {

        console.error("Камера қатесі:", error);

        alert("Камераға рұқсат беріңіз немесе браузер баптауларын тексеріңіз.");
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

    const video = getElement("cameraVideo");

    if (video) {
        video.srcObject = null;
    }
}


// 24. МИКРОФОНДЫ ҚОСУ

let microphoneStream = null;
let audioContext = null;
let microphoneAnimation = null;

async function startMicrophone() {

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        alert("Бұл браузер микрофонды қолдамайды.");
        return;
    }

    try {

        microphoneStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        audioContext = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

        const source = audioContext.createMediaStreamSource(
            microphoneStream
        );

        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;

        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        const status = getElement("microphoneStatus");

        function measureVolume() {

            analyser.getByteFrequencyData(data);

            let total = 0;

            for (let i = 0; i < data.length; i++) {
                total += data[i];
            }

            const average = total / data.length;

            if (status) {

                if (average < 10) {
                    status.textContent = "Дыбыс деңгейі: төмен";
                }

                else if (average < 35) {
                    status.textContent = "Дыбыс деңгейі: орташа";
                }

                else {
                    status.textContent = "Дыбыс деңгейі: жоғары";
                }
            }

            microphoneAnimation =
                requestAnimationFrame(measureVolume);
        }

        measureVolume();

    } catch (error) {

        console.error("Микрофон қатесі:", error);

        alert("Микрофонға рұқсат беріңіз.");
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

        audioContext.close();

        audioContext = null;
    }

    setText("microphoneStatus", "Микрофон өшірулі");
}


// 26. БАРЛЫҚ ТАПСЫРМАЛАРДЫҢ ОРЫНДАЛУЫН ТЕКСЕРУ

function checkAllProgress() {

    let total = 0;
    let done = 0;

    soundList.forEach(sound => {

        const tasks = getAllTasksForSound(sound.key);

        total += tasks.length;

        done += tasks.filter(task =>
            completedTasks.includes(String(task.id))
        ).length;
    });

    return {
        total,
        done,
        percent: total
            ? Math.round(done / total * 100)
            : 0
    };
}


// 27. ДИПЛОМДЫ КӨРСЕТУ

function showDiploma() {

    const progress = checkAllProgress();

    if (progress.done < 400) {

        alert(
            `Диплом алу үшін барлық тапсырманы орындау қажет.\nОрындалғаны: ${progress.done}/400`
        );

        return;
    }

    showPage("diplomaPage");

    const diploma = getElement("diplomaPage");

    if (!diploma) return;

    diploma.innerHTML = `
        <div class="diploma-card">

            <div class="diploma-icon">🏆</div>

            <h1>ҚҰТТЫҚТАЙМЫЗ!</h1>

            <h2>ДЫБЫСТАР ШЕБЕРІ</h2>

            <p>
                «Сөйлеу әлеміне саяхат» бағдарламасындағы
                барлық 400 тапсырманы сәтті аяқтадың!
            </p>

            <div class="diploma-stars">⭐ ⭐ ⭐ ⭐ ⭐</div>

            <h3>Жарайсың!</h3>

            <p>Сен нағыз дыбыстар шеберісің!</p>

            <button onclick="goHome()">
                Басты бетке оралу
            </button>

        </div>
    `;
}


// 28. БАҒДАРЛАМАНЫ ІСКЕ ҚОСУ

document.addEventListener("DOMContentLoaded", function() {

    console.log("Сөйлеу әлеміне саяхат іске қосылды!");

    if (typeof speechTasks === "undefined") {

        console.error("ҚАТЕ: speechTasks табылмады!");

        return;
    }

    console.log("Дыбыстар саны:", soundList.length);

    soundList.forEach(sound => {

        const tasks = getAllTasksForSound(sound.key);

        console.log(
            sound.symbol + " дыбысы:",
            tasks.length,
            "тапсырма"
        );
    });

});


// 29. HTML-ДЕН ШАҚЫРЫЛАТЫН ФУНКЦИЯЛАР

window.startJourney = startJourney;
window.createSoundMenu = createSoundMenu;
window.selectSound = selectSound;
window.selectStage = selectStage;
window.displayTask = displayTask;
window.completeTask = completeTask;
window.nextTask = nextTask;
window.previousTask = previousTask;
window.goStages = goStages;
window.goHome = goHome;
window.startCamera = startCamera;
window.stopCamera = stopCamera;
window.startMicrophone = startMicrophone;
window.stopMicrophone = stopMicrophone;
window.showDiploma = showDiploma;
