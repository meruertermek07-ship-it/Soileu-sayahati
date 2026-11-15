// =================================
// СӨЙЛЕУ ӘЛЕМІНЕ САЯХАТ
// НЕГІЗГІ БАСҚАРУ ЖҮЙЕСІ
// =================================

let currentSound = null;
let currentStage = 0;
let currentTask = 0;

let completedTasks = JSON.parse(
    localStorage.getItem("completedTasks") || "{}"
);

const stageNames = [
    "1-кезең: Дайындық",
    "2-кезең: Дыбысты қою",
    "3-кезең: Автоматтандыру",
    "4-кезең: Дифференциация"
];

const soundMenu = document.getElementById("soundMenu");


// =================================
// БЕТТЕРДІ АУЫСТЫРУ
// =================================

function showPage(pageId) {

    document.querySelectorAll("main section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(pageId).classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =================================
// ДЫБЫСТАР МӘЗІРІ
// =================================

function createSoundMenu() {

    soundMenu.innerHTML = "";

    Object.keys(speechTasks).forEach(key => {

        const sound = speechTasks[key];

        const button = document.createElement("button");

        button.className = "sound-button";

        button.innerHTML = `
            <div>${sound.sound}</div>
            <small>${sound.title || "Дыбыс әлемі"}</small>
        `;

        button.onclick = function () {
            selectSound(key);
        };

        soundMenu.appendChild(button);

    });

}


// =================================
// ДЫБЫСТЫ ТАҢДАУ
// =================================

function selectSound(key) {

    currentSound = key;

    const sound = speechTasks[key];

    document.getElementById("soundTitle").textContent =
        sound.title || sound.sound + " дыбысы әлемі";

    createStageMenu();

    showPage("stagePage");

}


// =================================
// КЕЗЕҢДЕР МӘЗІРІ
// =================================

function createStageMenu() {

    const menu = document.getElementById("stageMenu");

    menu.innerHTML = "";

    const stages = speechTasks[currentSound].stages;

    stages.forEach((stage, index) => {

        const button = document.createElement("button");

        button.className = "stage-button";

        const progress = getStageProgress(index);

        button.innerHTML = `
            <div style="font-size:30px">⭐</div>
            <div>${stageNames[index]}</div>
            <small>${progress}% орындалды</small>
        `;

        button.onclick = function () {
            selectStage(index);
        };

        menu.appendChild(button);

    });

}


// =================================
// КЕЗЕҢДІ ТАҢДАУ
// =================================

function selectStage(index) {

    currentStage = index;

    currentTask = 0;

    showPage("taskPage");

    displayTask();

}


// =================================
// АҒЫМДАҒЫ ТАПСЫРМАЛАР
// =================================

function getTasks() {

    return speechTasks[currentSound]
        .stages[currentStage]
        .tasks;

}


// =================================
// ТАПСЫРМА КІЛТІ
// =================================

function getTaskKey(task) {

    return currentSound + "_" +
        currentStage + "_" +
        task.id;

}


// =================================
// ТАПСЫРМАНЫ КӨРСЕТУ
// =================================

function displayTask() {

    const tasks = getTasks();

    const task = tasks[currentTask];

    if (!task) return;

    document.getElementById("stageTitle").textContent =
        stageNames[currentStage];

    document.getElementById("taskNumber").textContent =
        `${currentTask + 1} / ${tasks.length} тапсырма`;

    document.getElementById("taskName").textContent =
        task.title || task.name || "Тапсырма";

    document.getElementById("taskGoal").innerHTML =
        `<b>🎯 Мақсаты:</b><br>${task.goal || "Мақсаты көрсетілмеген"}`;

    document.getElementById("taskInstruction").innerHTML =
        `<b>📖 Нұсқаулық:</b><br>${task.instruction || "Нұсқаулық көрсетілмеген"}`;

    document.getElementById("taskExample").innerHTML =
        `<b>💡 Үлгі:</b><br>${task.example || "Үлгі көрсетілмеген"}`;

    document.getElementById("taskVisual").innerHTML =
        `<b>🖼️ Көрнекілік:</b><br>${task.visual || "Көрнекілік көрсетілмеген"}`;

    document.getElementById("taskCheck").innerHTML =
        `<b>✅ Тексеру:</b><br>${task.check || "Тексеру критерийі көрсетілмеген"}`;

    document.getElementById("taskHint").innerHTML =
        `<b>🌟 Көмек:</b><br>${task.hint || "Қосымша көмек жоқ"}`;

    const button = document.getElementById("completeButton");

    if (completedTasks[getTaskKey(task)]) {

        button.textContent = "✓ Орындалды";

    } else {

        button.textContent = "✓ Тапсырманы орындадым";

    }

    updateProgress();

}


// =================================
// ТАПСЫРМАНЫ ОРЫНДАЛДЫ ДЕП БЕЛГІЛЕУ
// =================================

function completeTask() {

    const task = getTasks()[currentTask];

    completedTasks[getTaskKey(task)] = true;

    localStorage.setItem(
        "completedTasks",
        JSON.stringify(completedTasks)
    );

    displayTask();

}


// =================================
// ПРОГРЕСТІ ЕСЕПТЕУ
// =================================

function updateProgress() {

    const tasks = getTasks();

    const completed = tasks.filter(task => {

        return completedTasks[getTaskKey(task)];

    }).length;

    const percent = Math.round(
        completed / tasks.length * 100
    );

    document.getElementById("progressBar").style.width =
        percent + "%";

    document.getElementById("progressText").textContent =
        percent + "% орындалды";

}


// =================================
// КЕЗЕҢ ПРОГРЕСІ
// =================================

function getStageProgress(stageIndex) {

    const tasks = speechTasks[currentSound]
        .stages[stageIndex].tasks;

    const completed = tasks.filter(task => {

        const key = currentSound + "_" +
            stageIndex + "_" + task.id;

        return completedTasks[key];

    }).length;

    return Math.round(
        completed / tasks.length * 100
    );

}


// =================================
// КЕЛЕСІ ТАПСЫРМА
// =================================

function nextTask() {

    const tasks = getTasks();

    if (currentTask < tasks.length - 1) {

        currentTask++;

        displayTask();

    } else {

        alert("🎉 Бұл кезеңдегі тапсырмалар аяқталды!");

        createStageMenu();

        showPage("stagePage");

    }

}


// =================================
// АЛДЫҢҒЫ ТАПСЫРМА
// =================================

function previousTask() {

    if (currentTask > 0) {

        currentTask--;

        displayTask();

    }

}


// =================================
// БАСТЫ БЕТКЕ ОРАЛУ
// =================================

function goHome() {

    currentSound = null;

    createSoundMenu();

    showPage("homePage");

}


// =================================
// КЕЗЕҢДЕРГЕ ОРАЛУ
// =================================

function goStages() {

    createStageMenu();

    showPage("stagePage");

}


// =================================
// БАСТАПҚЫ ІСКЕ ҚОСУ
// =================================

if (typeof speechTasks !== "undefined") {

    createSoundMenu();

    showPage("homePage");

} else {

    console.error(
        "Қате: data.js файлынан speechTasks табылмады!"
    );

}
