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

function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderSessions() {
    const sessions = getSessions();
    const container = document.getElementById('sessions-list');
    container.innerHTML = '';

    const keys = Object.keys(sessions).sort((a, b) => sessions[b].savedAt - sessions[a].savedAt);

    if (keys.length === 0) {
        container.innerHTML = '<p style="color:#999;font-size:11px;margin:0">sin sesiones guardadas</p>';
        return;
    }

    for (const key of keys) {
        const s = sessions[key];
        const row = document.createElement('div');
        row.className = 'session-row';

        const info = document.createElement('div');
        info.className = 'session-info';
        info.innerHTML = `<span class="session-name">${s.name}</span><span class="session-meta">${s.tabs.length} pestañas · ${formatDate(s.savedAt)}</span>`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'eliminar sesión';
        deleteBtn.addEventListener('click', () => {
            const all = getSessions();
            delete all[key];
            saveSessions(all);
            renderSessions();
        });

        row.appendChild(info);
        row.appendChild(deleteBtn);
        container.appendChild(row);
    }
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
    renderSessions();
}

document.getElementById('save-btn').addEventListener('click', saveSession);

document.getElementById('session-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveSession();
});

loadCurrentTabs();
renderSessions();