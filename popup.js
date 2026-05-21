// listando tabs para verificar que la api funciona
async function loadCurrentTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const list = document.getElementById('tab-list');

  for (const tab of tabs) {
    const li = document.createElement('li');
    li.textContent = tab.title || tab.url;
    list.appendChild(li);
  }
}

loadCurrentTabs();