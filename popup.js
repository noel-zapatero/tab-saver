const STORAGE_KEY = 'tabsaver_sessions';

function getSessions() {
    const rawLS = localStorage.getItem(STORAGE_KEY);
    if (!rawLS) return {};
    try {
        return JSON.parse(rawLS);
    } catch {
        return {};
    }
}

function saveSessions(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

async function getCurrentTabs() {
    return chrome.tabs.query({ currentWindow: true });
}

async function loadCurrentTabs() {
    const tabs = await getCurrentTabs();
    const list = document.getElementById('tab-list');
    list.innerHTML = '';

    for (const tab of tabs) {
        const li = document.createElement('li');
        li.textContent = tab.title || tab.url;
        list.appendChild(li);
    }
}

async function saveSession() {
    const nameInput = document.getElementById('session-name');
    const name = nameInput.value.trim();
    if (!name) return;

    const tabs = await getCurrentTabs();
    const sessions = getSessions();

    sessions[name] = {
        name,
        savedAt: Date.now(),
        tabs: tabs.map(t => ({ title: t.title, url: t.url })),
    };

    saveSessions(sessions);
    nameInput.value = '';

    // TODO: actualizar la lista de sesiones despues de guardar
    alert(`sesión "${name}" guardada con ${tabs.length} pestañas`);
}

document.getElementById('save-btn').addEventListener('click', saveSession);

document.getElementById('session-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveSession();
});

loadCurrentTabs();