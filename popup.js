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

async function restoreSession(session) {
    const urls = session.tabs.map(t => t.url).filter(Boolean);
    if (urls.length === 0) {
        return
    }
    await chrome.windows.create({ url: urls });
}

function renderSessions() {
    const sessions = getSessions();
    const container = document.getElementById('sessions-list');
    const exportBtn = document.getElementById('export-btn');
    container.innerHTML = '';

    const keys = Object.keys(sessions).sort((a, b) => sessions[b].savedAt - sessions[a].savedAt);

    if (keys.length === 0) {
        container.innerHTML = '<p style="color:#999;font-size:11px;margin:0">Sin sesiones guardadas.</p>';
        exportBtn.disabled = true;
        return;
    }

    exportBtn.disabled = false;

    for (const key of keys) {
        const s = sessions[key];
        const row = document.createElement('div');
        row.className = 'session-row';

        const info = document.createElement('div');
        info.className = 'session-info';
        info.innerHTML = `<span class="session-name">${s.name}</span><span class="session-meta">${s.tabs.length} pestañas · ${formatDate(s.savedAt)}</span>`;

        const actions = document.createElement('div');
        actions.className = 'session-actions';

        const restoreBtn = document.createElement('button');
        restoreBtn.textContent = '↗';
        restoreBtn.className = 'icon-btn';
        restoreBtn.title = 'Restaurar en nueva ventana';
        restoreBtn.addEventListener('click', () => restoreSession(s));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.className = 'icon-btn delete-btn';
        deleteBtn.title = 'Eliminar sesión';
        deleteBtn.addEventListener('click', () => {
            const all = getSessions();
            delete all[key];
            saveSessions(all);
            renderSessions();
        });

        actions.appendChild(restoreBtn);
        actions.appendChild(deleteBtn);
        row.appendChild(info);
        row.appendChild(actions);
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

function exportSessions() {
    const sessions = getSessions();
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'tabsaver-export.json';
    a.click();

    URL.revokeObjectURL(url);
}

function importSessions(file) {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const importedRes = JSON.parse(e.target.result);

            // chequeo basico de formato
            for (const key of Object.keys(importedRes)) {
                if (!importedRes[key].name || !Array.isArray(importedRes[key].tabs)) {
                    throw new Error('formato invalido');
                }
            }

            const existing = getSessions();
            const merged = { ...existing, ...importedRes };
            saveSessions(merged);
            renderSessions();
        } catch {
            alert('error al importar: el archivo parece estar mal formado');
        }
    };
    reader.readAsText(file);
}


//----Event Listeners------//
document.getElementById('save-btn').addEventListener('click', saveSession);

document.getElementById('session-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveSession();
});

document.getElementById('export-btn').addEventListener('click', exportSessions);

document.getElementById('import-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) importSessions(file);
    e.target.value = '';
});

//-----------------------//
loadCurrentTabs();
renderSessions();