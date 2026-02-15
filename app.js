// Pełny app.js - wersja uproszczona BEZ service workera, DZIAŁAJĄCA na pulpicie Androida

const STORAGE_KEY = 'shopping-lists-v1';

let state = {
  lists: {},
  currentListId: null
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    state = JSON.parse(saved);
  } else {
    const id = 'dom';
    state.lists[id] = { name: 'Dom', items: [] };
    state.currentListId = id;
  }
}

function renderListsSelect() {
  const select = document.getElementById('lists-select');
  select.innerHTML = '';

  Object.entries(state.lists).forEach(([id, list]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = list.name;
    if (id === state.currentListId) opt.selected = true;
    select.appendChild(opt);
  });

  renderCurrentListTitle();
  renderItems();
}

function renderCurrentListTitle() {
  const h2 = document.getElementById('current-list-title');
  const list = state.lists[state.currentListId];
  h2.textContent = list ? list.name : '';
}

function renderItems() {
  const ul = document.getElementById('items-list');
  ul.innerHTML = '';
  const list = state.lists[state.currentListId];
  if (!list) return;

  list.items.forEach((item, index) => {
    const li = document.createElement('li');
    if (item.bought) li.classList.add('bought');

    const span = document.createElement('span');
    span.textContent = item.name;

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = item.bought ? '↩️' : '✔️';
    toggleBtn.onclick = () => {
      item.bought = !item.bought;
      saveState();
      renderItems();
    };

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '🗑️';
    removeBtn.onclick = () => {
      list.items.splice(index, 1);
      saveState();
      renderItems();
    };

    li.append(span, toggleBtn, removeBtn);
    ul.appendChild(li);
  });
}

function addList(name) {
  const id = Date.now().toString();
  state.lists[id] = { name, items: [] };
  state.currentListId = id;
  saveState();
  renderListsSelect();
}

function addItemToCurrentList(name) {
  const list = state.lists[state.currentListId];
  if (!list) return;
  list.items.push({ name, bought: false });
  saveState();
  renderItems();
}

// INICJALIZACJA
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderListsSelect();

  // Event listeners
  document.getElementById('add-list-btn').onclick = () => {
    const name = document.getElementById('new-list-name').value.trim();
    if (name) {
      addList(name);
      document.getElementById('new-list-name').value = '';
    }
  };

  document.getElementById('lists-select').onchange = (e) => {
    state.currentListId = e.target.value;
    saveState();
    renderCurrentListTitle();
    renderItems();
  };

  document.getElementById('add-item-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value.trim();
    if (name) {
      addItemToCurrentList(name);
      document.getElementById('item-name').value = '';
      document.getElementById('item-name').focus();
    }
  };
  // PRZYCISK SHARE
  const shareBtn = document.createElement('button');
  shareBtn.textContent = '📱 Udostępnij listę';
  shareBtn.style.cssText = 'width:100%; margin:10px 0; background:#4caf50;';
  shareBtn.onclick = () => {
    const list = state.lists[state.currentListId];
    const url = `${window.location.href}#lista=${state.currentListId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert(`Link do listy "${list.name}"\n${url}\n\nSkopiowany! Wyślij SMS-em`);
    });
  };
  document.querySelector('.list-selector').appendChild(shareBtn);


});

