// NAPRAWIONA REJESTRACJA SERVICE WORKERA DLA GITHUB PAGES
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js', { 
    scope: './' 
  }).then(reg => {
    console.log('Service Worker zarejestrowany!');
  }).catch(err => {
    console.log('Błąd Service Workera:', err);
  });
}

const STORAGE_KEY = 'shopping-lists-v1';

let state = {
  lists: {},      // { listId: { name: 'Dom', items: [ {name, bought} ] } }
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
    // domyślna lista na start
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
    toggleBtn.addEventListener('click', () => {
      item.bought = !item.bought;
      saveState();
      renderItems();
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '🗑️';
    removeBtn.addEventListener('click', () => {
      list.items.splice(index, 1);
      saveState();
      renderItems();
    });

    li.appendChild(span);
    li.appendChild(toggleBtn);
    li.appendChild(removeBtn);
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

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  const newListInput = document.getElementById('new-list-name');
  const addListBtn = document.getElementById('add-list-btn');
  const listsSelect = document.getElementById('lists-select');
  const addItemForm = document.getElementById('add-item-form');
  const itemNameInput = document.getElementById('item-name');

  addListBtn.addEventListener('click', () => {
    const name = newListInput.value.trim();
    if (!name) return;
    addList(name);
    newListInput.value = '';
  });

  listsSelect.addEventListener('change', () => {
    state.currentListId = listsSelect.value;
    saveState();
    renderCurrentListTitle();
    renderItems();
  });

  addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = itemNameInput.value.trim();
    if (!name) return;
    addItemToCurrentList(name);
    itemNameInput.value = '';
    itemNameInput.focus();
  });

  renderListsSelect();
});

