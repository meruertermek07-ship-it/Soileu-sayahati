let currentSound = null;
let currentStage = null;
let currentTaskIndex = 0;

const soundNames = {
    R: "Р",
    L: "Л",
    G: "Г",
    GH: "Ғ",
    K: "К",
    Q: "Қ",
    SH: "Ш",
    ZH: "Ж",
    Z: "З",
    S: "С"
};

const stageIcons = ["🌱", "🎯", "🗣️", "🔍"];

function showPage(pageId) {
    document.querySelectorAll("main section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(pageId).classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function startJourney() {
    showPage("homePage");

    document.getElementById("soundSection").classList.remove("hidden");

    createSoundMenu();

    document.getElementById("soundSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function createSoundMenu() {
    const menu = document.getElementById("soundMenu");
    menu.innerHTML = "";

    Object.keys(soundNames).forEach(key => {
        const sound = speechTasks[key];

        if (!sound || !Array.isArray(sound.stages)) {
            return;
        }

        const button = document.createElement("button");
        button.className = "sound-button";

        button.innerHTML = `
            ${sound.sound}
            <span>${sound.title}</span>
            <span>✨ ${sound.character}</span>
        `;

        button.onclick = () => selectSound(key);

        menu.appendChild(button);
    });
}

function selectSound(key) {
    currentSound = key;

    const sound = speechTasks[key];

    if (!sound || !Array.isArray(sound.stages)) {
        alert("Бұл дыбыстың деректері табылмады!");
        return;
    }

    document.getElementById("soundTitle").textContent =
        sound.title + " " + sound.sound;

    createStageMenu();

    showPage("stagePage");
}

function createStageMenu() {
    const menu = document.getElementById("stageMenu");
    menu.innerHTML = "";

    const stages = speechTasks[currentSound].stages;

    stages.forEach((stage, index) => {
        const button = document.createElement("button");
        button.className = "stage-button";

        button.innerHTML = `
            <strong>${stageIcons[index] || "⭐"} ${index + 1}-кезең</strong>
            ${stage.name}
            <br>
            <small>${stage.tasks.length} тапсырма</small>
        `;

        button.onclick = () => selectStage(index);

        menu.appendChild(button);
    });
}

function selectStage(index) {
    currentStage = index;
    currentTaskIndex = 0;

    displayTask();
    showPage("taskPage");
}

function displayTask() {
    const stage = speechTasks[currentSound].stages[currentStage];
    const task = stage.tasks[currentTaskIndex];

    if (!task) return;

    document.getElementById("stageTitle").textContent =
        stage.name;

    document.getElementById("taskNumber").textContent =
        `${currentTaskIndex + 1} / ${stage.tasks.length}-тапсырма`;

    document.getElementById("taskName").textContent =
        task.title || task.name || "Тапсырма";

    document.getElementById("taskGoal").innerHTML =
        "<b>🎯 Мақсаты:</b> " + (task.goal || "Мақсат көрсетілмеген");

    document.getElementById("taskInstruction").innerHTML =
        "<b>📖 Нұсқаулық:</b> " + (task.instruction || "Нұсқаулық көрсетілмеген");

    document.getElementById("taskExample").innerHTML =
        "<b>💡 Үлгі:</b> " + (task.example || "Үлгі көрсетілмеген");

    document.getElementById("taskVisual").innerHTML =
        "<b>🖼️ Көрнекілік:</b> " + (task.visual || "Көрнекілік");

    document.getElementById("taskCheck").innerHTML =
        "<b>✅ Тексеру:</b> " + (task.check || "Тапсырманы логопедпен тексер");

    document.getElementById("taskHint").innerHTML =
        "<b>🌟 Көмек:</b> " + (task.help || task.hint || "Қайталап көр!");

    const completed = getCompletedTasks();
    const key = getTaskKey(task);

    document.getElementById("completeButton").textContent =
        completed.includes(key)
            ? "⭐ Тапсырма орындалды"
            : "✓ Тапсырманы орындадым";

    updateProgress();
}

function getTaskKey(task) {
    return `${currentSound}_${currentStage}_${task.id}`;
}

function getCompletedTasks() {
    return JSON.parse(localStorage.getItem("completedTasks") || "[]");
}

function completeTask() {
    const stage = speechTasks[currentSound].stages[currentStage];
    const task = stage.tasks[currentTaskIndex];

    const completed = getCompletedTasks();
    const key = getTaskKey(task);

    if (!completed.includes(key)) {
        completed.push(key);
        localStorage.setItem("completedTasks", JSON.stringify(completed));
    }

    displayTask();
}

function updateProgress() {
    const stage = speechTasks[currentSound].stages[currentStage];
    const completed = getCompletedTasks();

    let count = 0;

    stage.tasks.forEach(task => {
        if (completed.includes(getTaskKey(task))) {
            count++;
        }
    });

    const percent = Math.round(count / stage.tasks.length * 100);

    document.getElementById("progressText").textContent =
        percent + "%";

    document.getElementById("progressBar").style.width =
        percent + "%";
}

function nextTask() {
    const stage = speechTasks[currentSound].stages[currentStage];

    if (currentTaskIndex < stage.tasks.length - 1) {
        currentTaskIndex++;
        displayTask();
    } else {
        alert("Бұл кезеңдегі барлық тапсырманы қарап шықтың!");
    }
}

function previousTask() {
    if (currentTaskIndex > 0) {
        currentTaskIndex--;
        displayTask();
    }
}

function goHome() {
    showPage("homePage");
    createSoundMenu();
}

function goStages() {
    createStageMenu();
    showPage("stagePage");
}

document.addEventListener("DOMContentLoaded", function() {
    if (typeof speechTasks === "undefined") {
        alert("data.js файлы дұрыс қосылмаған!");
        return;
    }

    createSoundMenu();
});
